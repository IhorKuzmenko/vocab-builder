import { NextRequest, NextResponse } from "next/server";

import { apiRequest, ApiError } from "@/lib/api";
import { getAuthToken } from "@/lib/auth-cookie";
import { WORD_CATEGORIES } from "@/types/words";

import type { CreateWordRequest, Word } from "@/types/words";

export async function POST(request: NextRequest) {
  const token = await getAuthToken();

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Invalid JSON body." },
      { status: 400 },
    );
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json(
      { message: "Invalid request body." },
      { status: 400 },
    );
  }

  const input = body as Record<string, unknown>;

  const en = typeof input.en === "string" ? input.en.trim() : "";
  const ua = typeof input.ua === "string" ? input.ua.trim() : "";
  const category = input.category;

  if (!en || !ua) {
    return NextResponse.json(
      { message: "Word and translation are required." },
      { status: 400 },
    );
  }

  if (
    typeof category !== "string" ||
    !WORD_CATEGORIES.some((item) => item === category)
  ) {
    return NextResponse.json(
      { message: "Invalid word category." },
      { status: 400 },
    );
  }

  if (
    input.isIrregular !== undefined &&
    typeof input.isIrregular !== "boolean"
  ) {
    return NextResponse.json(
      { message: "Invalid isIrregular value." },
      { status: 400 },
    );
  }

  const payload: CreateWordRequest = {
    en,
    ua,
    category: category as CreateWordRequest["category"],
  };

  if (category === "verb") {
    payload.isIrregular = input.isIrregular === true;
  }

  try {
    const word = await apiRequest<Word>("/words/create", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    return NextResponse.json(word, { status: 201 });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.status },
      );
    }

    return NextResponse.json(
      { message: "Unable to create word." },
      { status: 500 },
    );
  }
}
