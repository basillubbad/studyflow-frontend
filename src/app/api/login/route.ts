import { NextResponse } from "next/server";
import { authenticateUser, sanitizeUser } from "@/lib/server/auth-store";
import { createAuthToken } from "@/lib/server/auth-token";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    email?: string;
    password?: string;
  };

  if (!body.email?.trim() || !body.password) {
    return NextResponse.json(
      { message: "Email and password are required." },
      { status: 422 },
    );
  }

  const user = await authenticateUser(body.email, body.password);
  if (!user) {
    return NextResponse.json(
      { message: "Incorrect email or password." },
      { status: 401 },
    );
  }

  return NextResponse.json({
    token: createAuthToken({ id: user.id, email: user.email }),
    user: sanitizeUser(user),
  });
}
