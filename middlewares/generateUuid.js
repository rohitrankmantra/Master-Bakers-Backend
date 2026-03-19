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

  // Try multiple header variations (case-insensitive)
  let token = 
    req.headers['x-visitor-token'] ||
    req.headers['X-Visitor-Token'] ||
    req.headers['X-VISITOR-TOKEN'];

  let uuid;

  console.log(`\n[UUID] ═══════════════════════════════════════`);
  console.log(`[UUID] ${req.method} ${req.path}`);
  
  if (token) {
    console.log(`[UUID] 📦 Token found in header: ${token.substring(0, 30)}...`);
    const parts = token.split('.');
    if (parts.length === 2) {
      const [id, sig] = parts;
      const expectedSig = sign(id);
      if (sig === expectedSig) {
        uuid = id;
        console.log(`[UUID] ✅ Token VERIFIED - Reusing UUID: ${uuid.substring(0, 12)}...`);
      } else {
        console.log(`[UUID] ❌ Token signature INVALID - generating new`);
      }
    } else {
      console.log(`[UUID] ❌ Invalid token format (${parts.length} parts) - generating new`);
    }
  } else {
    console.log(`[UUID] ⚠️  No token in header`);
    
    // Try query param
    if (req.query?.token) {
      const queryToken = req.query.token;
      const parts = queryToken.split('.');
      if (parts.length === 2) {
        const [id, sig] = parts;
        if (sig === sign(id)) {
          uuid = id;
          console.log(`[UUID] Using UUID from query: ${uuid.substring(0, 12)}...`);
        }
      }
    }

    // Try cookie
    if (!uuid && req.cookies?.uuid) {
      uuid = req.cookies.uuid;
      console.log(`[UUID] Using UUID from cookie: ${uuid.substring(0, 12)}...`);
    }

    // Try body
    if (!uuid && req.body?.token) {
      const bodyToken = req.body.token;
      const parts = bodyToken.split('.');
      if (parts.length === 2) {
        const [id, sig] = parts;
        if (sig === sign(id)) {
          uuid = id;
          console.log(`[UUID] Using UUID from body: ${uuid.substring(0, 12)}...`);
        }
      }
    }
  }

  let issuedNew = false;
  if (!uuid) {
    uuid = uuidv4();
    issuedNew = true;
    console.log(`[UUID] ⚠️  GENERATED NEW UUID: ${uuid.substring(0, 12)}...`);
  }

  req.visitorUuid = uuid;

  // Always return the token (so client can save it on first request)
  const newToken = `${uuid}.${sign(uuid)}`;
  res.setHeader('x-visitor-token', newToken);
  
  if (issuedNew) {
    console.log(`[UUID] 📤 Sending NEW token in response header`);
  } else {
    console.log(`[UUID] 📤 Sending token to confirm UUID`);
  }
  console.log(`[UUID] ═══════════════════════════════════════\n`);

  next();
};
