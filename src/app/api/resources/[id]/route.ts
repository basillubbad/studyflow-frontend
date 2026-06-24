import { NextRequest, NextResponse } from "next/server";
import { deleteResource, updateResource } from "@/lib/server/app-data-store";
import { getAuthenticatedUser } from "@/lib/server/auth-request";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;
  const body = (await request.json()) as Record<string, unknown>;
  const resource = await updateResource(user.id, id, body);
  if (!resource) {
    return NextResponse.json({ message: "Resource not found." }, { status: 404 });
  }
  return NextResponse.json(resource);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;
  const deleted = await deleteResource(user.id, id);
  if (!deleted) {
    return NextResponse.json({ message: "Resource not found." }, { status: 404 });
  }
  return new NextResponse(null, { status: 204 });
}
