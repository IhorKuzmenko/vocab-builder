import { NextResponse } from "next/server";

import { authorizedWordsRequest } from "@/lib/words-api";
import type { WordsStatistics } from "@/types/words";

export async function GET() {
  const { data, error } =
    await authorizedWordsRequest<WordsStatistics>("/words/statistics");

  if (error) return error;

  return NextResponse.json(data);
}
