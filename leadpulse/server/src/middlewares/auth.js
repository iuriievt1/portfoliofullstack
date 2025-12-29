import { verifyAccessToken } from "../utils/jwt.js";
import { Membership } from "../models/membership.model.js";

export function requireAuth(req, res, next) {
  const auth = req.headers.authorization || "";
  const bearer = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  const cookieToken = req.cookies?.access || null;
  const token = bearer || cookieToken;

  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, email: payload.email };
    next();
  } catch {
    return res.status(401).json({ error: "Unauthorized" });
  }
}

export function requireOrgRole(...allowed) {
  return async (req, res, next) => {
    const orgId = req.params.orgId || req.body.orgId || req.query.orgId;
    if (!orgId) return res.status(400).json({ error: "orgId required" });

    const membership = await Membership.findOne({ org: orgId, user: req.user.id }).lean();
    if (!membership) return res.status(403).json({ error: "Forbidden" });

    if (!allowed.includes(membership.role)) return res.status(403).json({ error: "Forbidden" });
    req.membership = membership;
    next();
  };
}
