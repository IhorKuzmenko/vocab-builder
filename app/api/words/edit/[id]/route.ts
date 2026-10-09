import { NextRequest, NextResponse } from "next/server";

import { apiRequest, ApiError } from "@/lib/api";
import { getAuthToken } from "@/lib/auth-cookie";

import type { Word, WordCategory } from "@/types/words";
import { WORD_CATEGORIES } from "@/types/words";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const token = await getAuthToken();

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (!/^[a-f\d]{24}$/i.test(id)) {
    return NextResponse.json({ message: "Invalid word ID." }, { status: 400 });
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

  if (en.length > 100 || ua.length > 100) {
    return NextResponse.json(
      { message: "Words must be 100 characters or fewer." },
      { status: 400 },
    );
  }

  if (
    typeof category !== "string" ||
    !WORD_CATEGORIES.includes(category as WordCategory)
  ) {
    return NextResponse.json(
      { message: "Invalid word category." },
      { status: 400 },
    );
  }

  if (category === "verb" && typeof input.isIrregular !== "boolean") {
    return NextResponse.json(
      { message: "isIrregular is required for verbs." },
      { status: 400 },
    );
  }

  const payload = {
    en,
    ua,
    category,
    ...(category === "verb" && {
      isIrregular: input.isIrregular,
    }),
  };

  try {
    const updatedWord = await apiRequest<Word>(
      `/words/edit/${encodeURIComponent(id)}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    );

    return NextResponse.json(updatedWord);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.status },
      );
    }

    return NextResponse.json(
      { message: "Unable to update word." },
      { status: 500 },
    );
  }
}
