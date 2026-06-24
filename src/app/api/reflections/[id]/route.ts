import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/server/auth-request";
import {
  deleteReflection,
  getReflection,
  saveReflection,
} from "@/lib/server/app-data-store";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;
  const reflection = await getReflection(user.id, id);
  if (!reflection) {
    return NextResponse.json({ message: "Reflection not found." }, { status: 404 });
  }

  return NextResponse.json(reflection);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;
  const body = (await request.json()) as Record<string, unknown>;
  const existing = await getReflection(user.id, id);
  if (!existing) {
    return NextResponse.json({ message: "Reflection not found." }, { status: 404 });
  }

  const reflection = await saveReflection(user.id, { ...existing, ...body, id });
  return NextResponse.json(reflection);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;
  const deleted = await deleteReflection(user.id, id);
  if (!deleted) {
    return NextResponse.json({ message: "Reflection not found." }, { status: 404 });
  }

  return new NextResponse(null, { status: 204 });
}
