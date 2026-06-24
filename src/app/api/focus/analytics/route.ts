import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/server/auth-request";
import { listFocusSessions } from "@/lib/server/app-data-store";

function sameWeek(a: Date, b: Date) {
  const startOfWeek = (date: Date) => {
    const copy = new Date(date);
    const day = copy.getDay();
    const diff = (day + 6) % 7;
    copy.setHours(0, 0, 0, 0);
    copy.setDate(copy.getDate() - diff);
    return copy;
  };

  return startOfWeek(a).getTime() === startOfWeek(b).getTime();
}

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const sessions = await listFocusSessions(user.id);
  const now = new Date();
  const completedSessions = sessions.filter((session) => session.completed);
  const weeklySessions = completedSessions.filter((session) =>
    sameWeek(new Date(session.startTime), now),
  );
  const monthlySessions = completedSessions.filter((session) => {
    const date = new Date(session.startTime);
    return (
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth()
    );
  });

  const dailyBreakdownMap = new Map<string, number>();
  weeklySessions.forEach((session) => {
    const date = new Date(session.startTime).toISOString().slice(0, 10);
    dailyBreakdownMap.set(
      date,
      (dailyBreakdownMap.get(date) || 0) + session.durationMinutes,
    );
  });

  const totalMinutesAllTime = completedSessions.reduce(
    (sum, session) => sum + session.durationMinutes,
    0,
  );

  return NextResponse.json({
    totalSessions: completedSessions.length,
    totalMinutesAllTime,
    weekly: {
      totalSessions: weeklySessions.length,
      totalMinutes: weeklySessions.reduce(
        (sum, session) => sum + session.durationMinutes,
        0,
      ),
      dailyBreakdown: Array.from(dailyBreakdownMap.entries())
        .map(([date, minutes]) => ({ date, minutes }))
        .sort((a, b) => a.date.localeCompare(b.date)),
    },
    monthly: {
      totalSessions: monthlySessions.length,
      totalMinutes: monthlySessions.reduce(
        (sum, session) => sum + session.durationMinutes,
        0,
      ),
    },
    averageSessionMinutes:
      completedSessions.length > 0
        ? Math.round(totalMinutesAllTime / completedSessions.length)
        : 0,
  });
}
