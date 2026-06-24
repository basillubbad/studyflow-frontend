import { NextResponse } from "next/server";
import { createResetToken } from "@/lib/server/auth-store";

export async function POST(request: Request) {
  const body = (await request.json()) as { email?: string };
  if (!body.email?.trim()) {
    return NextResponse.json({ message: "Email is required." }, { status: 422 });
  }

  const result = await createResetToken(body.email);
  if (!result) {
    return NextResponse.json(
      { message: "No account found for that email." },
      { status: 404 },
    );
  }

  return NextResponse.json({
    message: "Password reset token created.",
    token: result.token,
    email: result.email,
  });
}
