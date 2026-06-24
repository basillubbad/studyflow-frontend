import { NextRequest, NextResponse } from "next/server";
import { getExamPrep } from "@/lib/server/app-data-store";
import { getAuthenticatedUser } from "@/lib/server/auth-request";

type RouteContext = {
  params: Promise<{ weekItemId: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const { weekItemId } = await context.params;
  const prep = await getExamPrep(user.id, weekItemId);
  return NextResponse.json(prep);
}
