import { isValidObjectId } from 'mongoose';
import Product from '../models/Product.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import sendResponse from '../utils/sendResponse.js';
import { getRateMap, withPricing } from '../utils/pricing.js';

/** Fields a client may set. Anything else in the body is ignored. */
const WRITABLE = [
  'name', 'description', 'category', 'metal', 'purity',
  'grossWeight', 'netWeight', 'makingCharge',
  'stoneWeight', 'stoneValue', 'sku', 'stockQuantity',
  'images', 'coverImage', 'craftNotes', 'hallmarkId',
  'status', 'isFeatured',
];

/** Picks only writable keys that were actually supplied. */
const pickWritable = (body) =>
  Object.fromEntries(
    Object.entries(body).filter(([key, value]) => WRITABLE.includes(key) && value !== undefined)
  );

/** Weights and money must be non-negative numbers, and net cannot exceed gross. */
const validateMeasurements = ({ grossWeight, netWeight, makingCharge, stoneValue, stoneWeight }) => {
  const numeric = { grossWeight, netWeight, makingCharge, stoneValue, stoneWeight };

  for (const [field, value] of Object.entries(numeric)) {
    if (value === undefined) continue;
    const n = Number(value);
    if (!Number.isFinite(n) || n < 0) {
      throw ApiError.badRequest(`${field} must be a non-negative number`);
    }
  }

  if (grossWeight !== undefined && netWeight !== undefined && Number(netWeight) > Number(grossWeight)) {
    throw ApiError.badRequest('netWeight cannot exceed grossWeight');
  }
};

/**
 * GET /api/v1/products — public sees available/reserved stock only;
 * staff see every status and may filter by one.
 */
export const getAllProducts = asyncHandler(async (req, res) => {
  const { category, metal, purity, search, featured, status, sort } = req.query;
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Number(req.query.limit) || 12);

  const isStaff = ['admin', 'staff'].includes(req.user?.role);
  const filter = {};

  // Discontinued pieces are staff-only; customers never see them
  if (isStaff) {
    if (status && status !== 'all') filter.status = status;
  } else {
    filter.status = { $in: ['available', 'reserved'] };
  }

  if (category) filter.category = category;
  if (metal) filter.metal = metal;
  if (purity) filter.purity = purity;
  if (featured === 'true') filter.isFeatured = true;
  if (search) filter.$text = { $search: search };

  // Price sorting is deferred: the real price depends on the live metal rate,
  // so it is applied after pricing is attached, below.
  const sortMap = {
    newest: { isFeatured: -1, createdAt: -1 },
    oldest: { createdAt: 1 },
    weight_asc: { netWeight: 1 },
    weight_desc: { netWeight: -1 },
  };
  const sortStage = sortMap[sort] ?? sortMap.newest;

  const [items, total, rateMap] = await Promise.all([
    Product.find(filter)
      .sort(sortStage)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Product.countDocuments(filter),
    getRateMap(),
  ]);

  let priced = withPricing(items, rateMap);

  // Sort within the page — an unpriced item (no published rate) sinks to the end
  if (sort === 'price_asc' || sort === 'price_desc') {
    const dir = sort === 'price_asc' ? 1 : -1;
    priced = [...priced].sort((a, b) => {
      if (a.pricing.totalPrice == null) return 1;
      if (b.pricing.totalPrice == null) return -1;
      return (a.pricing.totalPrice - b.pricing.totalPrice) * dir;
    });
  }

  return sendResponse(res, 200, 'Products fetched', priced, {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
});

/** GET /api/v1/products/featured — small payload for the home page. */
export const getFeaturedProducts = asyncHandler(async (req, res) => {
  const limit = Math.min(12, Number(req.query.limit) || 4);

  const [items, rateMap] = await Promise.all([
    Product.find({ isFeatured: true, status: 'available' })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('name slug category metal purity netWeight makingCharge stoneValue coverImage status')
      .lean(),
    getRateMap(),
  ]);

  return sendResponse(res, 200, 'Featured products fetched', withPricing(items, rateMap));
});

/**
 * GET /api/v1/products/:slug — single product with its price breakdown.
 * Accepts an ObjectId too, so the admin editor can link by id (the slug
 * is regenerated whenever the name changes).
 */
export const getProductBySlug = asyncHandler(async (req, res) => {
  const isStaff = ['admin', 'staff'].includes(req.user?.role);
  const { slug } = req.params;

  const query = isValidObjectId(slug) ? { _id: slug } : { slug };
  const [product, rateMap] = await Promise.all([
    Product.findOne(query).populate('createdBy', 'name').lean(),
    getRateMap(),
  ]);

  if (!product) throw ApiError.notFound('Product not found');
  if (product.status === 'discontinued' && !isStaff) {
    throw ApiError.notFound('Product not found');
  }

  return sendResponse(res, 200, 'Product fetched', withPricing(product, rateMap));
});

/** POST /api/v1/products — admin/staff. */
export const createProduct = asyncHandler(async (req, res) => {
  const payload = pickWritable(req.body);
  const { name, category, metal, purity, grossWeight, netWeight, makingCharge } = payload;

  if (!name || !category || !metal || !purity) {
    throw ApiError.badRequest('name, category, metal and purity are required');
  }
  if (grossWeight === undefined || netWeight === undefined || makingCharge === undefined) {
    throw ApiError.badRequest('grossWeight, netWeight and makingCharge are required');
  }

  validateMeasurements(payload);

  if (payload.sku) {
    const clash = await Product.findOne({ sku: payload.sku });
    if (clash) throw ApiError.conflict(`SKU "${payload.sku}" is already in use`);
  }

  const product = await Product.create({ ...payload, createdBy: req.user?._id });
  const rateMap = await getRateMap();

  return sendResponse(res, 201, 'Product created', withPricing(product.toObject(), rateMap));
});

/** PUT /api/v1/products/:id — admin/staff. */
export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw ApiError.notFound('Product not found');

  const payload = pickWritable(req.body);

  // Validate against the merged result, so changing only one weight is still checked
  validateMeasurements({
    grossWeight: payload.grossWeight ?? product.grossWeight,
    netWeight: payload.netWeight ?? product.netWeight,
    makingCharge: payload.makingCharge ?? product.makingCharge,
    stoneValue: payload.stoneValue ?? product.stoneValue,
    stoneWeight: payload.stoneWeight ?? product.stoneWeight,
  });

  if (payload.sku && payload.sku !== product.sku) {
    const clash = await Product.findOne({ sku: payload.sku, _id: { $ne: product._id } });
    if (clash) throw ApiError.conflict(`SKU "${payload.sku}" is already in use`);
  }

  Object.assign(product, payload);
  product.updatedBy = req.user?._id;

  await product.save(); // save() so the slug hook runs
  const rateMap = await getRateMap();

  return sendResponse(res, 200, 'Product updated', withPricing(product.toObject(), rateMap));
});

/**
 * DELETE /api/v1/products/:id — admin only.
 * Marks discontinued by default so sales history keeps a valid reference;
 * ?permanent=true removes the record outright.
 */
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw ApiError.notFound('Product not found');

  if (req.query.permanent === 'true') {
    await product.deleteOne();
    return sendResponse(res, 200, 'Product permanently deleted');
  }

  product.status = 'discontinued';
  product.updatedBy = req.user?._id;
  await product.save();

  return sendResponse(res, 200, 'Product discontinued', product);
});
