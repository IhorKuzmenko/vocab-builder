import { redirect } from "next/navigation";

import DashboardHeader from "@/components/DashboardHeader/DashboardHeader";
import { apiRequest } from "@/lib/api";
import { getAuthToken } from "@/lib/auth-cookie";

import type { CurrentUser } from "@/types/auth";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
    <>
      <DashboardHeader userName={user.name} />
      {children}
    </>
  );
}
