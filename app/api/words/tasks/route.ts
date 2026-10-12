
import { NextResponse } from "next/server";

import { apiRequest, ApiError } from "@/lib/api";
import { getAuthToken } from "@/lib/auth-cookie";
import type { TrainingTasksResponse } from "@/types/training";

export async function GET() {
  const token = await getAuthToken();

  if (!token) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const data = await apiRequest<TrainingTasksResponse>(
      "/words/tasks",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return NextResponse.json(data);
  } catch (error) {
    const status =
      error instanceof ApiError ? error.status : 500;

    return NextResponse.json(
      { message: "Failed to load training tasks" },
      { status },
    );
  }
}
