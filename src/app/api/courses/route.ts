import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/server/auth-request";
import { listCourses, saveCourse } from "@/lib/server/app-data-store";

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const courses = await listCourses(user.id);
  return NextResponse.json(courses);
}

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const body = (await request.json()) as Record<string, unknown>;
  const course = await saveCourse(user.id, body);
  return NextResponse.json({ message: "Course saved successfully.", course }, { status: 201 });
}
