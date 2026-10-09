import { NextResponse } from "next/server";

import { apiRequest, ApiError } from "@/lib/api";
import { getAuthToken } from "@/lib/auth-cookie";

import type { CurrentUser } from "@/types/auth";

export async function GET() {
  const token = await getAuthToken();

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await apiRequest<CurrentUser>("/users/current", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return NextResponse.json({
      _id: user._id,
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.status },
      );
    }

    return NextResponse.json(
      { message: "Unable to fetch current user." },
      { status: 500 },
    );
  }
}
