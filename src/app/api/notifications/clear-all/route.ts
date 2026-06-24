import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/server/auth-request";
import { saveNotification } from "@/lib/server/app-data-store";
import { buildNotificationFeed } from "@/lib/server/notification-feed";

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const notifications = await buildNotificationFeed(user.id);
  await Promise.all(
    notifications.map((notification) =>
      saveNotification(user.id, {
        ...notification,
        read: true,
        dismissed: true,
      }),
    ),
  );

  return NextResponse.json({ success: true });
}
