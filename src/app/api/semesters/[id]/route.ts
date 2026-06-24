import { NextRequest, NextResponse } from "next/server";
import {
  deleteSemester,
  getSemester,
  saveSemester,
} from "@/lib/server/app-data-store";
import { getAuthenticatedUser } from "@/lib/server/auth-request";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;
  const semester = await getSemester(user.id, id);
  if (!semester) {
    return NextResponse.json({ message: "Semester not found." }, { status: 404 });
  }

  return NextResponse.json(semester);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;
  const body = (await request.json()) as Record<string, unknown>;
  const existing = await getSemester(user.id, id);
  if (!existing) {
    return NextResponse.json({ message: "Semester not found." }, { status: 404 });
  }

  const semester = await saveSemester(user.id, { ...existing, ...body, id });
  return NextResponse.json(semester);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;
  const deleted = await deleteSemester(user.id, id);
  if (!deleted) {
    return NextResponse.json({ message: "Semester not found." }, { status: 404 });
  }

  return new NextResponse(null, { status: 204 });
}
