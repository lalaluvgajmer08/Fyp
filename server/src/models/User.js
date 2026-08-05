import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    phone: { type: String, trim: true, sparse: true },

    // select:false keeps the hash out of every ordinary query
    password: { type: String, required: true, minlength: 8, select: false },

    role: {
      type: String,
      enum: ['admin', 'staff', 'customer'],
      default: 'customer',
      index: true,
    },

    avatar: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },

    // Bumping this invalidates every previously issued token
    tokenVersion: { type: Number, default: 0 },
  },
  { timestamps: true }
);

/** Hash the password whenever it is set or changed. */
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

/** Strip sensitive fields from any JSON response. */
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.tokenVersion;
  delete obj.__v;
  return obj;
};

export default mongoose.model('User', userSchema);
