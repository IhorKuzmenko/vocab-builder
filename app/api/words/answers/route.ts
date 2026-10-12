
import { NextResponse } from "next/server";

import { apiRequest, ApiError } from "@/lib/api";
import { getAuthToken } from "@/lib/auth-cookie";

import type {
  TrainingAnswer,
  TrainingAnswerResult,
} from "@/types/training";

export async function POST(request: Request) {
  try {
    const token = await getAuthToken();

    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 },
      );
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { message: "Invalid JSON body" },
        { status: 400 },
      );
    }

    if (!Array.isArray(body) || body.length === 0) {
      return NextResponse.json(
        {
          message: "Training answers must be a non-empty array",
        },
        { status: 400 },
      );
    }

    const validAnswers = body.every((item: unknown) => {
      if (typeof item !== "object" || item === null) {
        return false;
      }

      const answer = item as Record<string, unknown>;

      return (
        typeof answer._id === "string" &&
        answer._id.trim().length > 0 &&
        (answer.task === "en" || answer.task === "ua") &&
        typeof answer.en === "string" &&
        typeof answer.ua === "string" &&
        answer.en.trim().length > 0 &&
        answer.ua.trim().length > 0
      );
    });

    if (!validAnswers) {
      return NextResponse.json(
        { message: "Invalid training answers format" },
        { status: 400 },
      );
    }

    const answers = body as TrainingAnswer[];

    const result = await apiRequest<TrainingAnswerResult[]>(
      "/words/answers",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(answers),
      },
    );

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.status },
      );
    }

    console.error("Failed to save training answers:", error);

    return NextResponse.json(
      { message: "Failed to save training answers" },
      { status: 500 },
    );
  }
}
