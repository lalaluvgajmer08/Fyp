import mongoose from 'mongoose';

const rateSchema = new mongoose.Schema(
  {
    metal: {
      type: String,
      enum: ['gold', 'silver'],
      required: true,
      index: true,
    },

    category: {
      type: String,
      enum: ['FINE_GOLD_9999', 'TEJABI_GOLD', 'HALLMARK_GOLD', 'SILVER'],
      required: true,
      index: true,
    },

    label: { type: String, required: true },
    purityLabel: { type: String, required: true },

    // Rate per tola in NPR
    ratePerTola: { type: Number, required: true },

    // Change since previous trading day
    changeAmount: { type: Number, default: 0 },
    changePercent: { type: Number, default: 0 },

    currency: { type: String, default: 'NPR' },

    // The date this rate is effective for
    effectiveDate: { type: Date, required: true, index: true },

    // Source of the rate (e.g., FENEGOSIDA, manual entry)
    source: { type: String, default: 'manual' },

    // Who published this rate (staff member)
    publishedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// One rate per (metal, category, effectiveDate) — prevents duplicates
rateSchema.index({ metal: 1, category: 1, effectiveDate: 1 }, { unique: true });

// Quick lookup for today's published rates
rateSchema.index({ effectiveDate: -1 });

export default mongoose.model('Rate', rateSchema);
