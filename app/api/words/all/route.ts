import { NextRequest, NextResponse } from "next/server";

import { apiRequest, ApiError } from "@/lib/api";
import { getAuthToken } from "@/lib/auth-cookie";
import type { WordsResponse } from "@/types/words";

export async function GET(request: NextRequest) {
  const token = await getAuthToken();

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;

  const params = new URLSearchParams();

  params.set("page", searchParams.get("page") || "1");
  params.set("limit", searchParams.get("limit") || "7");

  const keyword = searchParams.get("keyword");
  const category = searchParams.get("category");
  const isIrregular = searchParams.get("isIrregular");

  if (keyword?.trim()) {
    params.set("keyword", keyword.trim());
  }

  if (category) {
    params.set("category", category);
  }

  if (category === "verb" && isIrregular !== null) {
    params.set("isIrregular", isIrregular);
  }

  try {
    const data = await apiRequest<WordsResponse>(
      `/words/all?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return NextResponse.json(data);
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 500;

    return NextResponse.json(
      { message: "Failed to fetch recommended words" },
      { status },
    );
  }
}
