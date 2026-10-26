
import { NextRequest, NextResponse } from "next/server";

import {
  getIrregularForms,
  mapWordCategories,
  type WordDetection,
} from "@/lib/word-category";

type DictionaryEntry = {
  meanings?: {
    partOfSpeech?: string;
  }[];
};

export async function GET(request: NextRequest) {
  const word = request.nextUrl.searchParams
    .get("word")
    ?.trim()
    .toLowerCase();

  if (!word || word.length > 100) {
    return NextResponse.json(
      { message: "Invalid English word." },
      { status: 400 },
    );
  }

  const irregularForms = getIrregularForms(word);

  try {
    const response = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`,
      {
        next: { revalidate: 86400 },
        signal: AbortSignal.timeout(5000),
      },
    );

    if (response.status === 404) {
      const result: WordDetection = {
        categories: irregularForms ? ["verb"] : [],
        irregularForms,
        found: Boolean(irregularForms),
      };

      return NextResponse.json(result);
    }

    if (!response.ok) {
      throw new Error("Dictionary service unavailable.");
    }

    const entries = (await response.json()) as DictionaryEntry[];

    const parts = Array.isArray(entries)
      ? entries.flatMap((entry) =>
          (entry.meanings ?? [])
            .map((meaning) => meaning.partOfSpeech)
            .filter((part): part is string => typeof part === "string"),
        )
      : [];

    const categories = mapWordCategories(parts);

    if (irregularForms && !categories.includes("verb")) {
      categories.unshift("verb");
    }

    const result: WordDetection = {
      categories,
      irregularForms,
      found: categories.length > 0,
    };

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { message: "Unable to check word category right now." },
      { status: 503 },
    );
  }
}
