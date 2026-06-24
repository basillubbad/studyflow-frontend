import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/server/auth-request";
import { buildNotificationFeed } from "@/lib/server/notification-feed";

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const notifications = await buildNotificationFeed(user.id);
  return NextResponse.json(
    notifications.map((notification) => ({
      id: notification.id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      severity: notification.severity,
      read_at: notification.read ? notification.createdAt : null,
      created_at: notification.createdAt,
      event_date: notification.eventDate,
      target_route: notification.targetRoute,
      target_id: notification.targetId,
    })),
  );
}
