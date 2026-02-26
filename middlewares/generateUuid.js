import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

/**
 * Signed token based visitor UUID middleware.
 *
 * The client stores `visitor_token` (uuid.signature) in localStorage.
 * Each request should send it via `x-visitor-token` header.
 *
 * If the token is absent or invalid the server generates a new UUID
 * and returns a fresh token in the same header so the client can save it.
 *
 * For backward compatibility a plain cookie is still read if present.
 */
export const generateUuid = (req, res, next) => {
  const secret = process.env.TOKEN_SECRET || 'change-this-in-production';

  const sign = (id) =>
    crypto.createHmac('sha256', secret).update(id).digest('hex');

  // look for token in header or body
  let token = req.headers['x-visitor-token'] || req.body?.token;
  let uuid;

  if (token) {
    const parts = token.split('.');
    if (parts.length === 2) {
      const [id, sig] = parts;
      if (sig === sign(id)) {
        uuid = id;
      } else {
        console.warn('Invalid visitor token signature');
      }
    }
  }

  // fallback to cookie (legacy support)
  if (!uuid && req.cookies?.uuid) {
    uuid = req.cookies.uuid;
  }

  let issuedNew = false;
  if (!uuid) {
    uuid = uuidv4();
    issuedNew = true;
  }

  req.visitorUuid = uuid;

  if (issuedNew) {
    const newToken = `${uuid}.${sign(uuid)}`;
    res.setHeader('x-visitor-token', newToken);
  }

  next();
};
