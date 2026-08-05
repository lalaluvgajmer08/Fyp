import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import env from '../config/env.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import sendResponse from '../utils/sendResponse.js';

const signToken = (user) =>
  jwt.sign(
    { _id: user._id, role: user.role, tokenVersion: user.tokenVersion },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );

const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: env.isProd,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

/** POST /api/v1/auth/register */
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password) {
    throw ApiError.badRequest('name, email and password are required');
  }
  if (password.length < 8) {
    throw ApiError.badRequest('Password must be at least 8 characters');
  }

  if (await User.findOne({ email: email.toLowerCase() })) {
    throw ApiError.conflict('An account with that email already exists');
  }

  // Self-registration always creates a customer; staff/admin are seeded or promoted
  const user = await User.create({ name, email, password, phone, role: 'customer' });
  const token = signToken(user);

  res.cookie('token', token, cookieOptions);
  return sendResponse(res, 201, 'Account created', { user, token });
});

/** POST /api/v1/auth/login */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw ApiError.badRequest('Email and password are required');
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  // Same message for unknown email and wrong password — avoids leaking which accounts exist
  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized('Invalid email or password');
  }
  if (!user.isActive) {
    throw ApiError.forbidden('This account has been deactivated');
  }

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  const token = signToken(user);
  res.cookie('token', token, cookieOptions);

  return sendResponse(res, 200, 'Signed in', { user, token });
});

/** GET /api/v1/auth/me */
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) throw ApiError.unauthorized('Account no longer exists');
  return sendResponse(res, 200, 'Current user', user);
});

/** POST /api/v1/auth/logout */
export const logout = asyncHandler(async (_req, res) => {
  res.clearCookie('token');
  return sendResponse(res, 200, 'Signed out');
});
