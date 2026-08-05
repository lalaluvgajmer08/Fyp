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
    if (exists) continue;
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

  for (const product of PRODUCTS) {
    const exists = await Product.findOne({ sku: product.sku });
    if (exists) continue;
    await Product.create({ ...product, createdBy: admin._id });
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
