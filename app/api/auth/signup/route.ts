import { NextResponse } from "next/server";

import { apiRequest, ApiError } from "@/lib/api";
import { setAuthCookie } from "@/lib/auth-cookie";

import type { AuthResponse, SignUpRequest } from "@/types/auth";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SignUpRequest;

    if (
      typeof body.name !== "string" ||
      !body.name.trim() ||
      typeof body.email !== "string" ||
      !body.email.trim() ||
      typeof body.password !== "string" ||
      !body.password
    ) {
      return NextResponse.json(
        { message: "Please fill in all required fields." },
        { status: 400 },
      );
    }

    const user = await apiRequest<AuthResponse>("/users/signup", {
      method: "POST",
      body: JSON.stringify(body),
    });

    await setAuthCookie(user.token);

    return NextResponse.json({
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
      { message: "Unable to register. Please try again." },
      { status: 500 },
    );
  }
}
