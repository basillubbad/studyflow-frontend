import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/server/auth-request";
import { deleteFocusSession } from "@/lib/server/app-data-store";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function DELETE(request: NextRequest, context: RouteContext) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;
  const deleted = await deleteFocusSession(user.id, id);
  if (!deleted) {
    return NextResponse.json({ message: "Focus session not found." }, { status: 404 });
  }

  return new NextResponse(null, { status: 204 });
}
