/**
 * Standard success envelope so every endpoint responds in the same shape.
 * The frontend can then rely on `res.data.data` everywhere.
 *
 *   return sendResponse(res, 200, 'Products fetched', products);
 */
export const sendResponse = (res, statusCode = 200, message = 'Success', data = null, meta = null) => {
  const body = {
    success: statusCode < 400,
    message,
    data,
  };

  // Only present on paginated list endpoints
  if (meta) body.meta = meta;

  return res.status(statusCode).json(body);
};

export default sendResponse;
