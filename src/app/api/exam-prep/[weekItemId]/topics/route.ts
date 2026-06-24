import { NextRequest, NextResponse } from "next/server";
import { addExamPrepTopic } from "@/lib/server/app-data-store";
import { getAuthenticatedUser } from "@/lib/server/auth-request";

type RouteContext = {
  params: Promise<{ weekItemId: string }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const { weekItemId } = await context.params;
  const body = (await request.json()) as { title?: string; completed?: boolean };
  const topic = await addExamPrepTopic(user.id, weekItemId, body);
  return NextResponse.json(topic, { status: 201 });
}
