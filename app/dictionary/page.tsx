import { redirect } from "next/navigation";

import { apiRequest } from "@/lib/api";
import { getAuthToken } from "@/lib/auth-cookie";

import type { CurrentUser } from "@/types/auth";
import LogoutButton from "@/components/LogoutButton/LogoutButton";

export default async function DictionaryPage() {
  const token = await getAuthToken();

  if (!token) {
    redirect("/login");
  }

  let user: CurrentUser;

  try {
    user = await apiRequest<CurrentUser>("/users/current", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch {
    redirect("/login");
  }

  return (
    <main>
      <div className="container">
        <h1>Dictionary</h1>
        <p>Welcome, {user.name}!</p>
        <p>Email: {user.email}</p>
      </div>
      <LogoutButton />
    </main>
  );
}
