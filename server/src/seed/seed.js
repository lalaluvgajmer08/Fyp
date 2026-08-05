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

  await mongoose.connection.close();
  logger.info('Seed complete');
  process.exit(0);
};

run().catch((err) => {
  logger.error(`Seed failed: ${err.message}`);
  process.exit(1);
});
