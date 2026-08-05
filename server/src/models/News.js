import mongoose from 'mongoose';

const newsSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    slug: { type: String, unique: true, index: true },
    summary: { type: String, required: true, trim: true, maxlength: 500 },
    content: { type: String, required: true },

    category: {
      type: String,
      enum: ['gold_market', 'silver_market', 'industry', 'shop_update', 'general'],
      default: 'general',
      index: true,
    },

    // Language the article is written in (pairs with the i18n module)
    language: { type: String, enum: ['en', 'ne'], default: 'en' },

    tags: [{ type: String, trim: true, lowercase: true }],
    coverImage: { type: String, default: '' },

    // Where the story came from, when it is not written in-house
    // (e.g. "FENEGOSIDA", "Kantipur"). Free text — the admin form sends a string.
    source: { type: String, trim: true, default: '' },

    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
      index: true,
    },
    isFeatured: { type: Boolean, default: false },
    publishedAt: { type: Date },
    views: { type: Number, default: 0 },

    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// Newest-first listing of live articles
newsSchema.index({ status: 1, publishedAt: -1 });
// Keyword search over title/summary
newsSchema.index({ title: 'text', summary: 'text' });

/** Build a URL slug and stamp publishedAt the first time an article goes live. */
newsSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug =
      this.title
        .toLowerCase()
        .trim()
        .replace(/[^\p{L}\p{N}\s-]/gu, '')
        .replace(/\s+/g, '-')
        .slice(0, 80) + `-${Date.now().toString(36)}`;
  }

  if (this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }

  next();
});

export default mongoose.model('News', newsSchema);
