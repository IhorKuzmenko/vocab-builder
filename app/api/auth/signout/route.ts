import { NextResponse } from "next/server";

import { apiRequest, ApiError } from "@/lib/api";
import { deleteAuthCookie, getAuthToken } from "@/lib/auth-cookie";

export async function POST() {
  const token = await getAuthToken();

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    await apiRequest<{ message: string }>("/users/signout", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    await deleteAuthCookie();

    return NextResponse.json({ message: "Signed out successfully" });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.status },
      );
    }

    return NextResponse.json(
      { message: "Unable to sign out. Please try again." },
      { status: 500 },
    );
  }
}
