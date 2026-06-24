import { NextRequest, NextResponse } from "next/server";
import { deleteLearningPlan, getLearningPlan, saveLearningPlan } from "@/lib/server/app-data-store";
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
  const plan = await getLearningPlan(user.id, id);
  if (!plan) {
    return NextResponse.json({ message: "Learning plan not found." }, { status: 404 });
  }

  return NextResponse.json(plan);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;
  const body = (await request.json()) as Record<string, unknown>;
  const existing = await getLearningPlan(user.id, id);
  if (!existing) {
    return NextResponse.json({ message: "Learning plan not found." }, { status: 404 });
  }

  const plan = await saveLearningPlan(user.id, { ...existing, ...body, id });
  return NextResponse.json(plan);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;
  const deleted = await deleteLearningPlan(user.id, id);
  if (!deleted) {
    return NextResponse.json({ message: "Learning plan not found." }, { status: 404 });
  }

  return new NextResponse(null, { status: 204 });
}
