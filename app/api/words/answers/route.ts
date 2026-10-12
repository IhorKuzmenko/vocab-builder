
import { NextRequest, NextResponse } from "next/server";

import { apiRequest, ApiError } from "@/lib/api";
import { getAuthToken } from "@/lib/auth-cookie";

import type {
  TrainingAnswer,
  TrainingAnswersResponse,
} from "@/types/training";

export async function POST(request: NextRequest) {
  const token = await getAuthToken();

  if (!token) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 },
    );
  }

  let answers: TrainingAnswer[];

  try {
    answers = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Invalid JSON body" },
      { status: 400 },
    );
  }

  if (
    !Array.isArray(answers) ||
    answers.length === 0 ||
    !answers.every(
      (answer) =>
        typeof answer._id === "string" &&
        typeof answer.en === "string" &&
        typeof answer.ua === "string" &&
        (answer.task === "en" || answer.task === "ua"),
    )
  ) {
    return NextResponse.json(
      { message: "Invalid answers" },
      { status: 400 },
    );
  }

  try {
    const data = await apiRequest<TrainingAnswersResponse>(
      "/words/answers",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(answers),
      },
    );

    return NextResponse.json(data);
  } catch (error) {
    const status =
      error instanceof ApiError ? error.status : 500;

    return NextResponse.json(
      { message: "Failed to save training answers" },
      { status },
    );
  }
}
