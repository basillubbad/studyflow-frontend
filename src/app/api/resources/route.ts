import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/server/auth-request";
import { createResource } from "@/lib/server/app-data-store";

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      resourceable_id?: string;
      resourceable_type?: "Course" | "LearningPlan" | "WeekItem";
      title?: string;
      type?: "link" | "file" | "image";
      url?: string;
      description?: string;
    };
    const resource = await createResource(user.id, body);
    return NextResponse.json(resource, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create resource.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
