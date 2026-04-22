import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Prisma, type User } from "@prisma/client";
import {
  ACCESS_TOKEN_TTL_SECONDS,
  REFRESH_TOKEN_TTL_SECONDS,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  VERIFICATION_CODE_TTL_MINUTES
} from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import type { SessionUser } from "@/types";

const userSessionInclude = {
  role: true
} satisfies Prisma.UserInclude;

type RequestLike = Request | { headers: Headers };

function getSecret() {
  const secret = process.env.SESSION_SECRET;

  if (!secret) {
    throw new Error("SESSION_SECRET neni nastaven.");
  }

  return new TextEncoder().encode(secret);
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function buildSessionUser(
  user: User & {
    role: {
      name: string;
    };
  }
): SessionUser {
  return {
    id: user.id,
    publicId: user.publicId,
    name: user.name,
    email: user.email,
    role: user.role.name as SessionUser["role"]
  };
}

function getRequestIp(request: RequestLike) {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || null;
}

function getRequestUserAgent(request: RequestLike) {
  return request.headers.get("user-agent");
}

function getBearerToken(request: RequestLike) {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) {
    return null;
  }

  return header.slice("Bearer ".length).trim() || null;
}

export async function authenticate(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email: normalizeEmail(email) },
    include: userSessionInclude
  });

  if (!user || !user.emailVerifiedAt) {
    return null;
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return null;
  }

  return buildSessionUser(user);
}

async function signUserToken(user: SessionUser, ttlSeconds: number) {
  return new SignJWT(user)
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${ttlSeconds}s`)
    .sign(getSecret());
}

export async function createSessionToken(user: SessionUser) {
  return signUserToken(user, SESSION_MAX_AGE);
}

export async function createAccessToken(user: SessionUser) {
  return signUserToken(user, ACCESS_TOKEN_TTL_SECONDS);
}

export async function setSession(user: SessionUser) {
  const token = await createSessionToken(user);
  const store = await cookies();

  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE
  });
}

export async function clearSession() {
  const store = await cookies();
  store.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0
  });
}

async function verifyUserToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as unknown as SessionUser;
  } catch {
    return null;
  }
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  return verifyUserToken(token);
}

export async function getRequestSessionUser(request: RequestLike) {
  const bearerToken = getBearerToken(request);

  if (bearerToken) {
    return verifyUserToken(bearerToken);
  }

  return getSessionUser();
}

export async function requireSessionUser() {
  const session = await getSessionUser();

  if (!session) {
    redirect("/login");
  }

  return session;
}

export async function requireApiSessionUser(request: RequestLike) {
  const session = await getRequestSessionUser(request);
  if (!session) {
    return null;
  }

  return session;
}

function hashRefreshToken(refreshToken: string) {
  return crypto.createHash("sha256").update(refreshToken).digest("hex");
}

export async function createAuthSession(
  user: SessionUser,
  request: RequestLike,
  deviceName?: string | null
) {
  const refreshToken = crypto.randomBytes(48).toString("hex");
  const refreshTokenHash = hashRefreshToken(refreshToken);

  await prisma.authSession.create({
    data: {
      userId: user.id,
      refreshTokenHash,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000),
      lastUsedAt: new Date(),
      deviceName: deviceName?.trim() || null,
      userAgent: getRequestUserAgent(request),
      ipAddress: getRequestIp(request)
    }
  });

  return {
    accessToken: await createAccessToken(user),
    refreshToken,
    expiresIn: ACCESS_TOKEN_TTL_SECONDS
  };
}

export async function rotateAuthSession(refreshToken: string, request: RequestLike) {
  const refreshTokenHash = hashRefreshToken(refreshToken);
  const session = await prisma.authSession.findFirst({
    where: {
      refreshTokenHash,
      revokedAt: null,
      expiresAt: {
        gt: new Date()
      }
    },
    include: {
      user: {
        include: {
          role: true
        }
      }
    }
  });

  if (!session || !session.user.emailVerifiedAt) {
    return null;
  }

  const user = buildSessionUser(session.user);
  const nextRefreshToken = crypto.randomBytes(48).toString("hex");

  await prisma.authSession.update({
    where: {
      id: session.id
    },
    data: {
      refreshTokenHash: hashRefreshToken(nextRefreshToken),
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000),
      lastUsedAt: new Date(),
      userAgent: getRequestUserAgent(request),
      ipAddress: getRequestIp(request)
    }
  });

  return {
    user,
    accessToken: await createAccessToken(user),
    refreshToken: nextRefreshToken,
    expiresIn: ACCESS_TOKEN_TTL_SECONDS
  };
}

export async function revokeAuthSession(refreshToken: string) {
  const refreshTokenHash = hashRefreshToken(refreshToken);

  await prisma.authSession.updateMany({
    where: {
      refreshTokenHash,
      revokedAt: null
    },
    data: {
      revokedAt: new Date()
    }
  });
}

export function generateVerificationCode() {
  return `${crypto.randomInt(100000, 999999)}`;
}

export function hashVerificationCode(code: string) {
  return crypto.createHash("sha256").update(code).digest("hex");
}

export function getVerificationExpiryDate() {
  return new Date(Date.now() + VERIFICATION_CODE_TTL_MINUTES * 60 * 1000);
}

export async function createUniquePublicId() {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const publicId = `${crypto.randomInt(100000000, 999999999)}`;
    const existing = await prisma.user.findUnique({
      where: { publicId },
      select: { id: true }
    });

    if (!existing) {
      return publicId;
    }
  }

  throw new Error("Nepodařilo se vytvořit unikátní ID uživatele.");
}
