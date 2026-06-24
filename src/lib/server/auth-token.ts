import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

const TOKEN_SECRET = process.env.AUTH_TOKEN_SECRET || "studyflow-local-dev-secret";
const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7;

type TokenPayload = {
  sub: string;
  email: string;
  exp: number;
};

function toBase64Url(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function fromBase64Url(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function signPart(value: string) {
  return createHmac("sha256", TOKEN_SECRET).update(value).digest("base64url");
}

export function createAuthToken(user: { id: string; email: string }) {
  const payload: TokenPayload = {
    sub: user.id,
    email: user.email,
    exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS,
  };

  const payloadEncoded = toBase64Url(JSON.stringify(payload));
  const signature = signPart(payloadEncoded);
  return `${payloadEncoded}.${signature}`;
}

export function verifyAuthToken(token: string) {
  const [payloadEncoded, signature] = token.split(".");
  if (!payloadEncoded || !signature) {
    return null;
  }

  const expectedSignature = signPart(payloadEncoded);
  const providedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    providedBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(providedBuffer, expectedBuffer)
  ) {
    return null;
  }

  const payload = JSON.parse(fromBase64Url(payloadEncoded)) as TokenPayload;
  if (payload.exp < Math.floor(Date.now() / 1000)) {
    return null;
  }

  return payload;
}
