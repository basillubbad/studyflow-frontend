import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/server/auth-request";
import { listFocusSessions, saveFocusSession } from "@/lib/server/app-data-store";

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const sessions = await listFocusSessions(user.id);
  return NextResponse.json(sessions);
}

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const body = (await request.json()) as Record<string, unknown>;
  const session = await saveFocusSession(user.id, body);
  return NextResponse.json(session, { status: 201 });
}
