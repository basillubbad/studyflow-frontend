import "server-only";

import { NextRequest } from "next/server";
import { findUserById } from "@/lib/server/auth-store";
import { verifyAuthToken } from "@/lib/server/auth-token";

export async function getAuthenticatedUser(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.slice("Bearer ".length).trim();
  const payload = verifyAuthToken(token);
  if (!payload) {
    return null;
  }

  return findUserById(payload.sub);
}
