import { NextRequest, NextResponse } from "next/server";
import { getLearningPlan, saveLearningPlan, saveLearningStage } from "@/lib/server/app-data-store";
import { getAuthenticatedUser } from "@/lib/server/auth-request";

type RouteContext = {
  params: Promise<{ id: string; stageId: string }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const { id, stageId } = await context.params;
  const body = (await request.json()) as Record<string, unknown>;
  const plan = await saveLearningStage(user.id, id, { ...body, id: stageId });
  if (!plan) {
    return NextResponse.json({ message: "Learning plan not found." }, { status: 404 });
  }

  return NextResponse.json(plan);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const { id, stageId } = await context.params;
  const plan = await getLearningPlan(user.id, id);
  if (!plan) {
    return NextResponse.json({ message: "Learning plan not found." }, { status: 404 });
  }

  const updated = await saveLearningPlan(user.id, {
    ...plan,
    stages: plan.stages.filter((stage) => stage.id !== stageId),
    updatedAt: new Date().toISOString(),
  });
  return NextResponse.json(updated);
}
