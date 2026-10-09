import { NextRequest, NextResponse } from "next/server";

import { authorizedWordsRequest } from "@/lib/words-api";
import type { WordsResponse } from "@/types/words";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const params = new URLSearchParams();

  const keyword = searchParams.get("keyword")?.trim();
  const category = searchParams.get("category")?.trim();
  const isIrregular = searchParams.get("isIrregular");

  const page = Number(searchParams.get("page") ?? "1");
  const limit = Number(searchParams.get("limit") ?? "7");

  if (
    !Number.isSafeInteger(page) ||
    page < 1 ||
    !Number.isSafeInteger(limit) ||
    limit < 1 ||
    limit > 100
  ) {
    return NextResponse.json(
      { message: "Invalid pagination parameters." },
      { status: 400 },
    );
  }

  if (isIrregular !== null && !["true", "false"].includes(isIrregular)) {
    return NextResponse.json(
      { message: "Invalid isIrregular value." },
      { status: 400 },
    );
  }

  if (keyword) params.set("keyword", keyword);
  if (category) params.set("category", category);
  if (isIrregular !== null) params.set("isIrregular", isIrregular);

  params.set("page", String(page));
  params.set("limit", String(limit));

  const { data, error } = await authorizedWordsRequest<WordsResponse>(
    `/words/own?${params.toString()}`,
  );

  if (error) return error;

  return NextResponse.json(data);
}
