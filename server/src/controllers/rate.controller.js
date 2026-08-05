import Rate from '../models/Rate.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import sendResponse from '../utils/sendResponse.js';

/** Midnight-to-midnight window for a given date, so "today" ignores clock time. */
const dayRange = (date = new Date()) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
};

/**
 * GET /api/v1/rates/today — public.
 * Returns the most recent rate for each category, so the board still renders
 * on a day nobody has published yet (a holiday, or before the morning update).
 */
export const getTodayRates = asyncHandler(async (_req, res) => {
  const items = await Rate.aggregate([
    { $sort: { effectiveDate: -1, createdAt: -1 } },
    {
      $group: {
        _id: '$category',
        doc: { $first: '$$ROOT' },
      },
    },
    { $replaceRoot: { newRoot: '$doc' } },
    // Stable display order: fine gold, tejabi, hallmark, then silver
    { $addFields: { _order: { $indexOfArray: [['FINE_GOLD_9999', 'TEJABI_GOLD', 'HALLMARK_GOLD', 'SILVER'], '$category'] } } },
    { $sort: { _order: 1 } },
    { $project: { _order: 0 } },
  ]);

  return sendResponse(res, 200, 'Rates fetched', items);
});

/** GET /api/v1/rates/history — paginated history for the admin table. */
export const getRateHistory = asyncHandler(async (req, res) => {
  const { metal, category, from, to } = req.query;
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Number(req.query.limit) || 20);

  const filter = {};
  if (metal) filter.metal = metal;
  if (category) filter.category = category;
  if (from || to) {
    filter.effectiveDate = {};
    if (from) filter.effectiveDate.$gte = new Date(from);
    if (to) filter.effectiveDate.$lte = new Date(to);
  }

  const [items, total] = await Promise.all([
    Rate.find(filter)
      .sort({ effectiveDate: -1, category: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('publishedBy', 'name')
      .lean(),
    Rate.countDocuments(filter),
  ]);

  return sendResponse(res, 200, 'Rate history fetched', items, {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
});

/**
 * POST /api/v1/rates — admin/staff.
 * Upserts by (category, effectiveDate) so re-publishing a correction on the
 * same day overwrites rather than creating a duplicate board entry.
 * changeAmount/changePercent are derived from the previous day automatically.
 */
export const upsertRate = asyncHandler(async (req, res) => {
  const { metal, category, label, purityLabel, ratePerTola, effectiveDate, source } = req.body;

  if (!metal || !category || ratePerTola === undefined || ratePerTola === null) {
    throw ApiError.badRequest('metal, category and ratePerTola are required');
  }

  const rate = Number(ratePerTola);
  if (!Number.isFinite(rate) || rate <= 0) {
    throw ApiError.badRequest('ratePerTola must be a positive number');
  }

  const { start } = dayRange(effectiveDate ? new Date(effectiveDate) : new Date());

  // Previous published rate for this category, to compute the day's movement
  const previous = await Rate.findOne({ category, effectiveDate: { $lt: start } })
    .sort({ effectiveDate: -1 })
    .lean();

  const changeAmount = previous ? rate - previous.ratePerTola : 0;
  const changePercent = previous && previous.ratePerTola
    ? Number(((changeAmount / previous.ratePerTola) * 100).toFixed(2))
    : 0;

  const doc = await Rate.findOneAndUpdate(
    { metal, category, effectiveDate: start },
    {
      metal,
      category,
      label: label || category,
      purityLabel: purityLabel || '',
      ratePerTola: rate,
      changeAmount,
      changePercent,
      effectiveDate: start,
      source: source || 'manual',
      publishedBy: req.user?._id,
    },
    { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
  );

  return sendResponse(res, 200, 'Rate saved', doc);
});

/** PUT /api/v1/rates/:id — admin/staff. Edits one existing entry. */
export const updateRate = asyncHandler(async (req, res) => {
  const rateDoc = await Rate.findById(req.params.id);
  if (!rateDoc) throw ApiError.notFound('Rate not found');

  const allowed = ['label', 'purityLabel', 'ratePerTola', 'source'];
  allowed.forEach((field) => {
    if (req.body[field] !== undefined) rateDoc[field] = req.body[field];
  });

  // Recompute movement when the price itself changed
  if (req.body.ratePerTola !== undefined) {
    const previous = await Rate.findOne({
      category: rateDoc.category,
      effectiveDate: { $lt: rateDoc.effectiveDate },
    })
      .sort({ effectiveDate: -1 })
      .lean();

    if (previous?.ratePerTola) {
      rateDoc.changeAmount = rateDoc.ratePerTola - previous.ratePerTola;
      rateDoc.changePercent = Number(
        ((rateDoc.changeAmount / previous.ratePerTola) * 100).toFixed(2)
      );
    }
  }

  await rateDoc.save();
  return sendResponse(res, 200, 'Rate updated', rateDoc);
});

/** DELETE /api/v1/rates/:id — admin only. */
export const deleteRate = asyncHandler(async (req, res) => {
  const rateDoc = await Rate.findById(req.params.id);
  if (!rateDoc) throw ApiError.notFound('Rate not found');

  await rateDoc.deleteOne();
  return sendResponse(res, 200, 'Rate deleted');
});
