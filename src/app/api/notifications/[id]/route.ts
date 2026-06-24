import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/server/auth-request";
import { saveNotification } from "@/lib/server/app-data-store";
import { findNotificationInFeed } from "@/lib/server/notification-feed";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function DELETE(request: NextRequest, context: RouteContext) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;
  const notification = await findNotificationInFeed(user.id, id);
  if (!notification) {
    return NextResponse.json({ message: "Notification not found." }, { status: 404 });
  }

  await saveNotification(user.id, {
    ...notification,
    read: true,
    dismissed: true,
  });
  return new NextResponse(null, { status: 204 });
}
