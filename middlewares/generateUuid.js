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

    const cookieOptions = {
      httpOnly: true,
      secure: true,        // ALWAYS true (Render is HTTPS)
      sameSite: 'none',    // REQUIRED for cross-site
      maxAge: 1000 * 60 * 60 * 24 * 30,
    };

    // apply domain if provided
    if (process.env.COOKIE_DOMAIN) {
      cookieOptions.domain = process.env.COOKIE_DOMAIN;
    }

    res.cookie('uuid', uuid, cookieOptions);
  }

  // Ensure req.body exists
  if (!req.body) req.body = {};
  req.body.uuid = uuid;

  next();
};
