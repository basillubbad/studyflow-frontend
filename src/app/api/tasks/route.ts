import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/server/auth-request";
import { listTasks, saveTask } from "@/lib/server/app-data-store";

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const tasks = await listTasks(user.id);
  return NextResponse.json(tasks);
}

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const body = (await request.json()) as Record<string, unknown>;
  const task = await saveTask(user.id, body);
  return NextResponse.json(task, { status: 201 });
}
