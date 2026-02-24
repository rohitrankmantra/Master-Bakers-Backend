import { v4 as uuidv4 } from 'uuid';

/**
 * Middleware to generate or reuse a UUID for cart/order
 * - If visitor has a cookie, use that UUID
 * - Otherwise, generate a new UUID and set it in a cookie
 */
export const generateUuid = (req, res, next) => {
  let uuid = req.cookies?.uuid;

  if (!uuid) {
    uuid = uuidv4();

res.cookie('uuid', uuid, {
  httpOnly: true,
  secure: true,        // ALWAYS true (Render is HTTPS)
  sameSite: 'none',    // REQUIRED for cross-site
  maxAge: 1000 * 60 * 60 * 24 * 30,
});
  }

  // Ensure req.body exists
  if (!req.body) req.body = {};
  req.body.uuid = uuid;

  next();
};
