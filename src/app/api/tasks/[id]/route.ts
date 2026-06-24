import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/server/auth-request";
import { deleteTask, getTask, saveTask } from "@/lib/server/app-data-store";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;
  const task = await getTask(user.id, id);
  if (!task) {
    return NextResponse.json({ message: "Task not found." }, { status: 404 });
  }

  return NextResponse.json(task);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;
  const body = (await request.json()) as Record<string, unknown>;
  const existing = await getTask(user.id, id);
  if (!existing) {
    return NextResponse.json({ message: "Task not found." }, { status: 404 });
  }

  const task = await saveTask(user.id, { ...existing, ...body, id });
  return NextResponse.json(task);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;
  const deleted = await deleteTask(user.id, id);
  if (!deleted) {
    return NextResponse.json({ message: "Task not found." }, { status: 404 });
  }

  return new NextResponse(null, { status: 204 });
}
