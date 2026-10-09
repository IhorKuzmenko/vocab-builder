import { NextResponse } from "next/server";

import { authorizedWordsRequest } from "@/lib/words-api";

export async function GET() {
  const { data, error } =
    await authorizedWordsRequest<string[]>("/words/categories");

  if (error) return error;

  return NextResponse.json(data);
}
