import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/server/auth-request";
import { deleteCourse, getCourse, saveCourse } from "@/lib/server/app-data-store";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;
  const course = await getCourse(user.id, id);
  if (!course) {
    return NextResponse.json({ message: "Course not found." }, { status: 404 });
  }

  return NextResponse.json(course);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;
  const body = (await request.json()) as Record<string, unknown>;
  const existing = await getCourse(user.id, id);
  if (!existing) {
    return NextResponse.json({ message: "Course not found." }, { status: 404 });
  }

  const course = await saveCourse(user.id, { ...existing, ...body, id });
  return NextResponse.json({ message: "Course updated successfully.", course });
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;
  const deleted = await deleteCourse(user.id, id);
  if (!deleted) {
    return NextResponse.json({ message: "Course not found." }, { status: 404 });
  }

  return new NextResponse(null, { status: 204 });
}
