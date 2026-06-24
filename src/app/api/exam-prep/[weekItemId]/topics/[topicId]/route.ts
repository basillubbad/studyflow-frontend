import { NextRequest, NextResponse } from "next/server";
import { deleteExamPrepTopic, updateExamPrepTopic } from "@/lib/server/app-data-store";
import { getAuthenticatedUser } from "@/lib/server/auth-request";

type RouteContext = {
  params: Promise<{ weekItemId: string; topicId: string }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const { weekItemId, topicId } = await context.params;
  const body = (await request.json()) as Record<string, unknown>;
  const topic = await updateExamPrepTopic(user.id, weekItemId, topicId, body);
  if (!topic) {
    return NextResponse.json({ message: "Topic not found." }, { status: 404 });
  }
  return NextResponse.json(topic);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const { weekItemId, topicId } = await context.params;
  const deleted = await deleteExamPrepTopic(user.id, weekItemId, topicId);
  if (!deleted) {
    return NextResponse.json({ message: "Topic not found." }, { status: 404 });
  }
  return new NextResponse(null, { status: 204 });
}
