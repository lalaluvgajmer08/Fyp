import { isValidObjectId } from 'mongoose';
import News from '../models/News.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import sendResponse from '../utils/sendResponse.js';

/** GET /api/v1/news  — public: published only. staff/admin: all statuses. */
export const getAllNews = asyncHandler(async (req, res) => {
  const { category, language, tag, search, featured, status } = req.query;
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Number(req.query.limit) || 10);

  const isStaff = ['admin', 'staff'].includes(req.user?.role);
  const filter = {};

  // Non-staff can only ever see published articles.
  // Staff may request a specific status, or 'all' to see every status at once.
  if (isStaff) {
    if (status && status !== 'all') filter.status = status;
  } else {
    filter.status = 'published';
  }

  if (category) filter.category = category;
  if (language) filter.language = language;
  if (tag) filter.tags = tag.toLowerCase();
  if (featured === 'true') filter.isFeatured = true;
  if (search) filter.$text = { $search: search };

  const [items, total] = await Promise.all([
    News.find(filter)
      .sort({ isFeatured: -1, publishedAt: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('author', 'name')
      .select('-content')
      .lean(),
    News.countDocuments(filter),
  ]);

  return sendResponse(res, 200, 'News fetched', items, {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
});

/** GET /api/v1/news/latest — small payload for the customer homepage widget. */
export const getLatestNews = asyncHandler(async (req, res) => {
  const limit = Math.min(10, Number(req.query.limit) || 5);

  const items = await News.find({ status: 'published' })
    .sort({ publishedAt: -1 })
    .limit(limit)
    .select('title slug summary category coverImage publishedAt')
    .lean();

  return sendResponse(res, 200, 'Latest news fetched', items);
});

/**
 * GET /api/v1/news/:slug — single article; increments view count.
 * Also accepts an ObjectId so the admin editor can link by id, which
 * survives a title change (the slug is regenerated on every retitle).
 */
export const getNewsBySlug = asyncHandler(async (req, res) => {
  const isStaff = ['admin', 'staff'].includes(req.user?.role);
  const { slug } = req.params;

  const query = isValidObjectId(slug) ? { _id: slug } : { slug };
  const article = await News.findOne(query).populate('author', 'name');
  if (!article) throw ApiError.notFound('News article not found');

  // Drafts and archived articles are staff-only
  if (article.status !== 'published' && !isStaff) {
    throw ApiError.notFound('News article not found');
  }

  if (article.status === 'published') {
    News.updateOne({ _id: article._id }, { $inc: { views: 1 } }).catch(() => {});
  }

  return sendResponse(res, 200, 'News article fetched', article);
});

/** POST /api/v1/news — admin only. */
export const createNews = asyncHandler(async (req, res) => {
  const { title, summary, content, category, language, tags, coverImage, source, status, isFeatured } = req.body;

  if (!title || !summary || !content) {
    throw ApiError.badRequest('title, summary and content are required');
  }

  const article = await News.create({
    title,
    summary,
    content,
    category,
    language,
    tags,
    coverImage,
    source,
    status,
    isFeatured,
    author: req.user?._id,
  });

  return sendResponse(res, 201, 'News created', article);
});

/** PUT /api/v1/news/:id — admin only. */
export const updateNews = asyncHandler(async (req, res) => {
  const article = await News.findById(req.params.id);
  if (!article) throw ApiError.notFound('News article not found');

  const allowed = [
    'title', 'summary', 'content', 'category', 'language',
    'tags', 'coverImage', 'source', 'status', 'isFeatured',
  ];

  allowed.forEach((field) => {
    if (req.body[field] !== undefined) article[field] = req.body[field];
  });

  await article.save(); // save() so slug/publishedAt hooks run
  return sendResponse(res, 200, 'News updated', article);
});

/** DELETE /api/v1/news/:id — admin only. Archives by default; ?permanent=true hard-deletes. */
export const deleteNews = asyncHandler(async (req, res) => {
  const article = await News.findById(req.params.id);
  if (!article) throw ApiError.notFound('News article not found');

  if (req.query.permanent === 'true') {
    await article.deleteOne();
    return sendResponse(res, 200, 'News permanently deleted');
  }

  article.status = 'archived';
  await article.save();
  return sendResponse(res, 200, 'News archived', article);
});
