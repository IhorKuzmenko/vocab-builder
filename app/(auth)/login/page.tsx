import type { Metadata } from "next";

import AuthForm from "@/components/AuthForm/AuthForm";

export const metadata: Metadata = {
  title: "Login",
  description: "Log in to your VocabBuilder account.",
};

export default function LoginPage() {
  return <AuthForm mode="login" />;
}
