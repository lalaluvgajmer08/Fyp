/**
 * Seeds an admin account and a few sample news articles.
 * Run with: npm run seed
 * Safe to re-run — existing records are left untouched.
 */
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import News from '../models/News.js';
import Rate from '../models/Rate.js';
import Product from '../models/Product.js';
import logger from '../utils/logger.js';

const ADMIN = {
  name: 'Store Admin',
  email: 'admin@aureliajewels.com',
  password: 'Admin@12345',
  role: 'admin',
};

const ARTICLES = [
  {
    title: 'Gold holds near record as festive demand builds',
    summary:
      'Fine gold closed steady this week, with FENEGOSIDA holding the tola rate ahead of the festival season.',
    content:
      'Fine gold has held close to its record level for a fourth consecutive session. Dealers report that showroom footfall has begun to climb ahead of the festival season, with buyers favouring lighter, hallmark-certified pieces.\n\nThe federation continues to publish rates each morning after 11:00 AM, calculated from the London bullion price and the reference exchange rate.',
    category: 'gold_market',
    tags: ['gold', 'fenegosida'],
    coverImage:
      'https://images.unsplash.com/photo-1610375461246-83df859d849d?q=80&w=1400&auto=format&fit=crop',
    status: 'published',
    isFeatured: true,
  },
  {
    title: 'Silver eases as industrial demand softens',
    summary:
      'Silver slipped marginally on the tola rate, tracking a softer international session.',
    content:
      'Silver eased slightly this week, tracking a softer international session. Retail demand for silver remains concentrated in gift items and coins.',
    category: 'silver_market',
    tags: ['silver'],
    coverImage:
      'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?q=80&w=1400&auto=format&fit=crop',
    status: 'published',
  },
  {
    title: 'Hallmarking rules tighten for retail counters',
    summary:
      'New guidance asks retailers to display the hallmark identification number against every gold piece on show.',
    content:
      'Retail counters are being asked to display the hallmark identification number alongside every gold piece on display. Our full inventory has been re-tagged and each invoice now prints the HUID for the item sold.',
    category: 'industry',
    tags: ['hallmark', 'compliance'],
    coverImage:
      'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?q=80&w=1400&auto=format&fit=crop',
    status: 'published',
  },
];

/**
 * Two days of rates so the board has a real previous-day comparison
 * and changeAmount/changePercent are genuine rather than zero.
 */
const RATE_SETS = [
  // [category, metal, label, purityLabel, yesterday, today]
  ['FINE_GOLD_9999', 'gold', 'Fine gold', '9999 · 24K', 284000, 285000],
  ['TEJABI_GOLD', 'gold', 'Tejabi gold', 'Tejabi', 282650, 283600],
  ['HALLMARK_GOLD', 'gold', 'Hallmark gold', '916 · 22K', 260500, 261400],
  ['SILVER', 'silver', 'Silver', 'Fine silver', 3535, 3520],
];

/** Midnight local time, n days back from today. */
const dayStart = (daysAgo = 0) => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - daysAgo);
  return d;
};

/**
 * Sample stock. Prices are deliberately absent — they are computed from the
 * live rate board at request time, so only weights and charges are stored.
 */
/**
 * Catalogue photography, keyed by category.
 *
 * The shop's own pieces aren't photographed yet, so seed data points at stock
 * images to give the layout something real to render. Each entry is a verified
 * Unsplash ID; `img()` appends the sizing params so the grid gets a light file
 * and the detail page gets a larger one from the same source.
 *
 * Swap these for real photography by editing the product in the admin console —
 * nothing here is referenced outside the seed.
 */
const PHOTO_SETS = {
  ring: ['1605100804763-247f67b3557e', '1515562141207-7a88fb7ce338'],
  necklace: ['1611591437281-460bfbe1220a', '1599643478518-a784e5dc4c8f'],
  bracelet: ['1596944924616-7b38e7cfac36', '1573408301185-9146fe634ad0'],
  earring: ['1602751584552-8ba73aad10e1', '1535632066927-ab7c9ab60908'],
  pendant: ['1617038220319-276d3cfab638', '1589128777073-263566ae5e4d'],
  chain: ['1600721391689-2564bb8055de', '1587467512961-120760940315'],
  bangle: ['1620656798579-1984d9e87df7', '1608042314453-ae338d80c427'],
  set: ['1611591437281-460bfbe1220a', '1596944924616-7b38e7cfac36'],
};

const img = (id, width) =>
  `https://images.unsplash.com/photo-${id}?q=80&w=${width}&auto=format&fit=crop`;

/**
 * Attaches a cover image and a small gallery to a product based on its
 * category. Offset by index so two pieces in the same category don't lead with
 * the identical photo.
 */
function withPhotos(product, index) {
  const set = PHOTO_SETS[product.category];
  if (!set?.length) return product;

  const cover = set[index % set.length];
  return {
    ...product,
    coverImage: img(cover, 1400),
    images: set.map((id) => img(id, 600)),
  };
}

const PRODUCTS = [
  {
    name: 'Classic Hallmark Wedding Band',
    description:
      'A plain, comfortable-fit band in 22K hallmark gold. The most requested wedding ring in the shop, made to order in any size.',
    category: 'ring',
    metal: 'gold',
    purity: 'HALLMARK_GOLD',
    grossWeight: 6.2,
    netWeight: 6.2,
    makingCharge: 4500,
    sku: 'JMS-RNG-001',
    stockQuantity: 8,
    craftNotes: 'Hand-finished and polished. Sizing included.',
    status: 'available',
    isFeatured: true,
  },
  {
    name: 'Tilhari Pote Necklace',
    description:
      'Traditional Nepali tilhari with a fine gold cylinder on a green pote strand — worn by married women across the hills and Terai.',
    category: 'necklace',
    metal: 'gold',
    purity: 'TEJABI_GOLD',
    grossWeight: 24.8,
    netWeight: 22.4,
    makingCharge: 12000,
    stoneWeight: 2.4,
    stoneValue: 1800,
    sku: 'JMS-NCK-002',
    stockQuantity: 3,
    craftNotes: 'Pote strand restrung to order. Gold cylinder is solid, not filled.',
    status: 'available',
    isFeatured: true,
  },
  {
    name: 'Fine Gold Investment Chain',
    description:
      '9999 fine gold rope chain, bought as much for its weight as its look. Every gram is certified.',
    category: 'chain',
    metal: 'gold',
    purity: 'FINE_GOLD_9999',
    grossWeight: 18.5,
    netWeight: 18.5,
    makingCharge: 9000,
    sku: 'JMS-CHN-003',
    stockQuantity: 2,
    hallmarkId: 'HUID-9999-2481',
    status: 'available',
    isFeatured: true,
  },
  {
    name: 'Silver Payal Anklet Pair',
    description:
      'A matched pair of fine silver anklets with a soft ghungroo trim. Sold as a pair.',
    category: 'bracelet',
    metal: 'silver',
    purity: 'SILVER',
    grossWeight: 62.0,
    netWeight: 60.5,
    makingCharge: 2200,
    sku: 'JMS-ANK-004',
    stockQuantity: 12,
    craftNotes: 'Adjustable clasp. Weight quoted for the pair.',
    status: 'available',
  },
  {
    name: 'Hallmark Gold Jhumka Earrings',
    description:
      'Bell-shaped jhumka in 22K hallmark gold with a fine granulated dome and a secure screw back.',
    category: 'earring',
    metal: 'gold',
    purity: 'HALLMARK_GOLD',
    grossWeight: 9.4,
    netWeight: 9.4,
    makingCharge: 7500,
    sku: 'JMS-EAR-005',
    stockQuantity: 5,
    craftNotes: 'Screw backs, so they sit securely through a long day.',
    status: 'available',
    isFeatured: true,
  },
  {
    name: 'Bridal Gold Set — Necklace, Earrings and Tikka',
    description:
      'A complete bridal set in tejabi gold: collar necklace, matching jhumka and a maang tikka. Made to order over four to six weeks.',
    category: 'set',
    metal: 'gold',
    purity: 'TEJABI_GOLD',
    grossWeight: 86.5,
    netWeight: 78.2,
    makingCharge: 45000,
    stoneWeight: 8.3,
    stoneValue: 15000,
    sku: 'JMS-SET-006',
    stockQuantity: 1,
    craftNotes: 'Made to order. Design can be adapted to the bride’s preference.',
    status: 'available',
  },
  {
    name: 'Silver Kada Bangle',
    description: 'A heavy, plain fine-silver kada with a brushed finish. Unisex.',
    category: 'bangle',
    metal: 'silver',
    purity: 'SILVER',
    grossWeight: 48.0,
    netWeight: 48.0,
    makingCharge: 1800,
    sku: 'JMS-BNG-007',
    stockQuantity: 9,
    status: 'available',
  },
  {
    name: 'Gold Ganesh Pendant',
    description:
      'A small hallmark gold pendant with a relief of Ganesh, sized for daily wear on a thin chain.',
    category: 'pendant',
    metal: 'gold',
    purity: 'HALLMARK_GOLD',
    grossWeight: 3.8,
    netWeight: 3.8,
    makingCharge: 3200,
    sku: 'JMS-PND-008',
    stockQuantity: 6,
    status: 'available',
  },
  {
    name: 'Solitaire Ring with Cubic Zircon',
    description:
      'A raised six-claw setting in 22K hallmark gold holding a single cut zircon. The stone is priced separately from the metal.',
    category: 'ring',
    metal: 'gold',
    purity: 'HALLMARK_GOLD',
    grossWeight: 5.6,
    netWeight: 4.9,
    makingCharge: 6200,
    stoneWeight: 0.7,
    stoneValue: 4500,
    sku: 'JMS-RNG-009',
    stockQuantity: 4,
    craftNotes: 'Claws are re-tightened free of charge at any time.',
    status: 'available',
  },
  {
    name: 'Silver Toe Ring Pair',
    description:
      'Plain fine-silver bichiya in a light gauge, sized to sit comfortably without pinching. Sold as a pair.',
    category: 'ring',
    metal: 'silver',
    purity: 'SILVER',
    grossWeight: 7.4,
    netWeight: 7.4,
    makingCharge: 600,
    sku: 'JMS-RNG-010',
    stockQuantity: 20,
    craftNotes: 'Open-back design, so they adjust to fit.',
    status: 'available',
  },
  {
    name: 'Tejabi Gold Mangalsutra',
    description:
      'A long tejabi gold chain with black pote and a small pendant at the drop, in the pattern most asked for in the eastern Terai.',
    category: 'necklace',
    metal: 'gold',
    purity: 'TEJABI_GOLD',
    grossWeight: 16.2,
    netWeight: 14.8,
    makingCharge: 8500,
    stoneWeight: 1.4,
    stoneValue: 900,
    sku: 'JMS-NCK-011',
    stockQuantity: 4,
    status: 'available',
    isFeatured: true,
  },
  {
    name: 'Silver Hasli Choker',
    description:
      'A rigid fine-silver hasli that sits close at the throat, hammered by hand for a faintly uneven surface.',
    category: 'necklace',
    metal: 'silver',
    purity: 'SILVER',
    grossWeight: 84.0,
    netWeight: 84.0,
    makingCharge: 3600,
    sku: 'JMS-NCK-012',
    stockQuantity: 6,
    craftNotes: 'Hook clasp at the back. Can be opened out for a wider neck.',
    status: 'available',
  },
  {
    name: 'Hallmark Gold Tennis Bracelet',
    description:
      'A flexible line bracelet in 22K hallmark gold, each link set with a small zircon. Fastens with a box clasp and safety catch.',
    category: 'bracelet',
    metal: 'gold',
    purity: 'HALLMARK_GOLD',
    grossWeight: 12.8,
    netWeight: 11.2,
    makingCharge: 9800,
    stoneWeight: 1.6,
    stoneValue: 7200,
    sku: 'JMS-BRC-013',
    stockQuantity: 3,
    status: 'available',
  },
  {
    name: 'Gold Stud Earrings',
    description:
      'Small hallmark gold studs with a domed face, light enough to be left in all day. A common first pair for a child.',
    category: 'earring',
    metal: 'gold',
    purity: 'HALLMARK_GOLD',
    grossWeight: 2.4,
    netWeight: 2.4,
    makingCharge: 1800,
    sku: 'JMS-EAR-014',
    stockQuantity: 15,
    craftNotes: 'Butterfly backs. Piercing done free with purchase.',
    status: 'available',
  },
  {
    name: 'Silver Oxidised Chandbali',
    description:
      'Crescent-shaped chandbali in fine silver with an oxidised finish that settles into the engraving and lifts the pattern.',
    category: 'earring',
    metal: 'silver',
    purity: 'SILVER',
    grossWeight: 28.6,
    netWeight: 28.6,
    makingCharge: 2400,
    sku: 'JMS-EAR-015',
    stockQuantity: 8,
    craftNotes: 'Oxidation deepens with wear. Do not polish with abrasive cloth.',
    status: 'available',
  },
  {
    name: 'Fine Gold Biscuit Chain',
    description:
      'A flat biscuit-link chain in 9999 fine gold, 20 inches. Bought largely as a store of value.',
    category: 'chain',
    metal: 'gold',
    purity: 'FINE_GOLD_9999',
    grossWeight: 26.4,
    netWeight: 26.4,
    makingCharge: 11000,
    sku: 'JMS-CHN-016',
    stockQuantity: 2,
    hallmarkId: 'HUID-9999-3067',
    status: 'available',
  },
  {
    name: 'Hallmark Gold Box Chain',
    description:
      'A fine 18-inch box chain in 22K hallmark gold, cut to length. Made to carry a pendant without overwhelming it.',
    category: 'chain',
    metal: 'gold',
    purity: 'HALLMARK_GOLD',
    grossWeight: 7.8,
    netWeight: 7.8,
    makingCharge: 5400,
    sku: 'JMS-CHN-017',
    stockQuantity: 7,
    craftNotes: 'Shortened to any length at no extra charge.',
    status: 'available',
  },
  {
    name: 'Tejabi Gold Chura Bangles',
    description:
      'A set of four thin tejabi gold bangles, worn stacked. Sold as a set of four; single bangles on request.',
    category: 'bangle',
    metal: 'gold',
    purity: 'TEJABI_GOLD',
    grossWeight: 32.4,
    netWeight: 32.4,
    makingCharge: 14000,
    sku: 'JMS-BNG-018',
    stockQuantity: 3,
    craftNotes: 'Weight quoted for all four. Sized to the wrist.',
    status: 'available',
  },
  {
    name: 'Carved Gold Bangle Pair',
    description:
      'A pair of hallmark gold bangles with a deep-cut floral band around the outer face, cut by hand.',
    category: 'bangle',
    metal: 'gold',
    purity: 'HALLMARK_GOLD',
    grossWeight: 41.6,
    netWeight: 41.6,
    makingCharge: 18500,
    sku: 'JMS-BNG-019',
    stockQuantity: 2,
    status: 'reserved',
  },
  {
    name: 'Silver Pooja Thali Set',
    description:
      'A fine-silver thali with matching diyo, kalash and spoon, for daily worship or as a wedding gift.',
    category: 'set',
    metal: 'silver',
    purity: 'SILVER',
    grossWeight: 340.0,
    netWeight: 340.0,
    makingCharge: 7500,
    sku: 'JMS-SET-020',
    stockQuantity: 4,
    craftNotes: 'Weight quoted for the complete set of four pieces.',
    status: 'available',
    isFeatured: true,
  },
  {
    name: 'Everyday Gold Set — Chain and Studs',
    description:
      'A light hallmark gold chain with matching studs, meant to be worn daily rather than kept for occasions.',
    category: 'set',
    metal: 'gold',
    purity: 'HALLMARK_GOLD',
    grossWeight: 10.6,
    netWeight: 10.6,
    makingCharge: 6800,
    sku: 'JMS-SET-021',
    stockQuantity: 5,
    status: 'available',
  },
  {
    name: 'Silver Locket Pendant',
    description:
      'A plain fine-silver locket that opens, sized for a small photograph. Engraving on the face is included.',
    category: 'pendant',
    metal: 'silver',
    purity: 'SILVER',
    grossWeight: 14.2,
    netWeight: 14.2,
    makingCharge: 1400,
    sku: 'JMS-PND-022',
    stockQuantity: 10,
    craftNotes: 'Initials engraved free of charge while you wait.',
    status: 'available',
  },
  {
    name: 'Gold Om Pendant',
    description:
      'An open-cut Om in tejabi gold, finished on both faces so it reads correctly whichever way it turns.',
    category: 'pendant',
    metal: 'gold',
    purity: 'TEJABI_GOLD',
    grossWeight: 4.6,
    netWeight: 4.6,
    makingCharge: 3600,
    sku: 'JMS-PND-023',
    stockQuantity: 0,
    status: 'sold',
  },
];

const run = async () => {
  await connectDB();

  let admin = await User.findOne({ email: ADMIN.email });
  if (admin) {
    logger.info(`Admin already exists: ${ADMIN.email}`);
  } else {
    admin = await User.create(ADMIN);
    logger.success(`Admin created: ${ADMIN.email} / ${ADMIN.password}`);
  }

  for (const article of ARTICLES) {
    const exists = await News.findOne({ title: article.title });

    if (exists) {
      // Same backfill as products — articles seeded before covers were added
      if (!exists.coverImage && article.coverImage) {
        exists.coverImage = article.coverImage;
        await exists.save();
        logger.success(`Cover backfilled: ${article.title}`);
      }
      continue;
    }

    await News.create({ ...article, author: admin._id });
    logger.success(`News seeded: ${article.title}`);
  }

  for (const [category, metal, label, purityLabel, prev, today] of RATE_SETS) {
    for (const [daysAgo, ratePerTola] of [[1, prev], [0, today]]) {
      const effectiveDate = dayStart(daysAgo);

      const changeAmount = daysAgo === 0 ? today - prev : 0;
      const changePercent =
        daysAgo === 0 ? Number(((changeAmount / prev) * 100).toFixed(2)) : 0;

      // Upsert keeps the seed re-runnable without duplicating the day's entry
      await Rate.findOneAndUpdate(
        { metal, category, effectiveDate },
        {
          metal,
          category,
          label,
          purityLabel,
          ratePerTola,
          changeAmount,
          changePercent,
          effectiveDate,
          source: 'seed',
          publishedBy: admin._id,
        },
        { upsert: true, setDefaultsOnInsert: true }
      );
    }
    logger.success(`Rate seeded: ${label}`);
  }

  // Track how many of each category we've placed so withPhotos() can vary the
  // cover shot between pieces that share a category.
  const seenPerCategory = {};

  for (const product of PRODUCTS) {
    const index = seenPerCategory[product.category] ?? 0;
    seenPerCategory[product.category] = index + 1;

    const withImages = withPhotos(product, index);
    const exists = await Product.findOne({ sku: product.sku });

    if (exists) {
      // Products seeded before photography was added have no cover image.
      // Backfill those without touching anything an admin has since edited.
      if (!exists.coverImage && withImages.coverImage) {
        exists.coverImage = withImages.coverImage;
        exists.images = withImages.images;
        await exists.save();
        logger.success(`Photos backfilled: ${product.name}`);
      }
      continue;
    }

    await Product.create({ ...withImages, createdBy: admin._id });
    logger.success(`Product seeded: ${product.name}`);
  }

  await mongoose.connection.close();
  logger.info('Seed complete');
  process.exit(0);
};

run().catch((err) => {
  logger.error(`Seed failed: ${err.message}`);
  process.exit(1);
});
