import { NextResponse } from "next/server";
import { resetPassword } from "@/lib/server/auth-store";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      token?: string;
      email?: string;
      password?: string;
      password_confirmation?: string;
    };

    if (!body.token || !body.email || !body.password) {
      return NextResponse.json(
        { message: "Token, email, and password are required." },
        { status: 422 },
      );
    }

    if (body.password !== body.password_confirmation) {
      return NextResponse.json(
        { message: "Password confirmation does not match." },
        { status: 422 },
      );
    }

    await resetPassword({
      token: body.token,
      email: body.email,
      password: body.password,
    });

    return NextResponse.json({ message: "Password reset successful." });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to reset password.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
