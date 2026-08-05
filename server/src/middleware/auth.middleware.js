import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import env from '../config/env.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

/** Pulls a bearer token from the Authorization header or the cookie. */
const readToken = (req) => {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) return header.split(' ')[1];
  return req.cookies?.token || null;
};

/** Verifies the token and loads the matching active user, or returns null. */
const resolveUser = async (token) => {
  let payload;
  try {
    payload = jwt.verify(token, env.jwtSecret);
  } catch {
    return null;
  }

  const user = await User.findById(payload._id);
  if (!user || !user.isActive) return null;

  // Rejects tokens issued before the user's credentials were invalidated
  if (typeof payload.tokenVersion === 'number' && payload.tokenVersion !== user.tokenVersion) {
    return null;
  }

  return user;
};

/**
 * Optional auth: sets req.user when a valid token is present, otherwise
 * continues anonymously. Used on public routes that show extra data to staff.
 */
export const attachUser = asyncHandler(async (req, _res, next) => {
  const token = readToken(req);
  if (token) req.user = (await resolveUser(token)) || undefined;
  next();
});

/** Required auth: rejects the request when no valid token is present. */
export const protect = asyncHandler(async (req, _res, next) => {
  const token = readToken(req);
  if (!token) throw ApiError.unauthorized('Authentication required');

  const user = await resolveUser(token);
  if (!user) throw ApiError.unauthorized('Invalid or expired token');

  req.user = user;
  next();
});

/** Role gate. Use after protect: authorize('admin') */
export const authorize =
  (...roles) =>
  (req, _res, next) => {
    if (!req.user) return next(ApiError.unauthorized('Authentication required'));
    if (!roles.includes(req.user.role)) {
      return next(ApiError.forbidden('You do not have permission to perform this action'));
    }
    next();
  };
