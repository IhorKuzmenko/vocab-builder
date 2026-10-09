import { NextResponse } from "next/server";

import { apiRequest, ApiError } from "@/lib/api";
import { getAuthToken } from "@/lib/auth-cookie";

export async function authorizedWordsRequest<T>(endpoint: string) {
  const token = await getAuthToken();

  if (!token) {
    return {
      data: null,
      error: NextResponse.json({ message: "Unauthorized" }, { status: 401 }),
    };
  }

  try {
    const data = await apiRequest<T>(endpoint, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return { data, error: null };
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        data: null,
        error: NextResponse.json(
          { message: error.message },
          { status: error.status },
        ),
      };
    }

    return {
      data: null,
      error: NextResponse.json(
        { message: "Unable to fetch words data." },
        { status: 500 },
      ),
    };
  }
}
