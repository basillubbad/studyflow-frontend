import { NextResponse } from "next/server";
import { createUser, sanitizeUser } from "@/lib/server/auth-store";
import { createAuthToken } from "@/lib/server/auth-token";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name?: string;
      email?: string;
      password?: string;
      password_confirmation?: string;
    };

    if (!body.name?.trim()) {
      return NextResponse.json({ message: "Name is required." }, { status: 422 });
    }
    if (!body.email?.trim()) {
      return NextResponse.json({ message: "Email is required." }, { status: 422 });
    }
    if (!body.password || body.password.length < 8) {
      return NextResponse.json(
        { message: "Password must be at least 8 characters long." },
        { status: 422 },
      );
    }
    if (body.password !== body.password_confirmation) {
      return NextResponse.json(
        { message: "Password confirmation does not match." },
        { status: 422 },
      );
    }

    const user = await createUser({
      name: body.name,
      email: body.email,
      password: body.password,
    });

    return NextResponse.json({
      message: "Account created successfully.",
      token: createAuthToken({ id: user.id, email: user.email }),
      user: sanitizeUser(user),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create account.";
    return NextResponse.json({ message }, { status: 409 });
  }
}
