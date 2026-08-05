import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, index: true },
    description: { type: String, trim: true, default: '' },

    category: {
      type: String,
      enum: ['ring', 'necklace', 'bracelet', 'earring', 'pendant', 'chain', 'bangle', 'set'],
      required: true,
      index: true,
    },

    // Metal composition
    metal: {
      type: String,
      enum: ['gold', 'silver'],
      required: true,
      index: true,
    },

    purity: {
      type: String,
      enum: ['FINE_GOLD_9999', 'TEJABI_GOLD', 'HALLMARK_GOLD', 'SILVER'],
      required: true,
      index: true,
    },

    // Weight in grams
    grossWeight: { type: Number, required: true, min: 0 },
    netWeight: { type: Number, required: true, min: 0 },

    // Making charge in NPR (flat fee, independent of metal price)
    makingCharge: { type: Number, required: true, min: 0 },

    // Optional stone/diamond details
    stoneWeight: { type: Number, default: 0, min: 0 },
    stoneValue: { type: Number, default: 0, min: 0 },

    // Inventory
    sku: { type: String, trim: true, sparse: true, unique: true },
    stockQuantity: { type: Number, default: 1, min: 0 },

    // Images
    images: [{ type: String, trim: true }],
    coverImage: { type: String, default: '' },

    // Design/craft notes for customers
    craftNotes: { type: String, trim: true, default: '' },

    // Hallmark identification number (HUID) for gold
    hallmarkId: { type: String, trim: true, default: '' },

    status: {
      type: String,
      enum: ['available', 'sold', 'reserved', 'discontinued'],
      default: 'available',
      index: true,
    },

    isFeatured: { type: Boolean, default: false },

    // Tracks who added/modified the entry
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// Composite indexes for common queries
productSchema.index({ status: 1, category: 1 });
productSchema.index({ metal: 1, purity: 1, status: 1 });
productSchema.index({ isFeatured: -1, createdAt: -1 });

// Text search on name and description
productSchema.index({ name: 'text', description: 'text' });

/** Build URL slug from name on create/update. */
productSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug =
      this.name
        .toLowerCase()
        .trim()
        .replace(/[^\p{L}\p{N}\s-]/gu, '')
        .replace(/\s+/g, '-')
        .slice(0, 60) + `-${Date.now().toString(36)}`;
  }
  next();
});

/** Validate that netWeight <= grossWeight. */
productSchema.pre('save', function (next) {
  if (this.netWeight > this.grossWeight) {
    return next(new Error('Net weight cannot exceed gross weight'));
  }
  next();
});

export default mongoose.model('Product', productSchema);
