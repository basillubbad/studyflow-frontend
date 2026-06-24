import { NextRequest, NextResponse } from "next/server";
import { saveLearningStage } from "@/lib/server/app-data-store";
import { getAuthenticatedUser } from "@/lib/server/auth-request";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;
  const body = (await request.json()) as Record<string, unknown>;
  const plan = await saveLearningStage(user.id, id, body);
  if (!plan) {
    return NextResponse.json({ message: "Learning plan not found." }, { status: 404 });
  }

  return NextResponse.json(plan, { status: 201 });
}
