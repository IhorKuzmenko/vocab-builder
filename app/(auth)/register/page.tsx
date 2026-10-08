import type { Metadata } from "next";

import AuthForm from "@/components/AuthForm/AuthForm";

export const metadata: Metadata = {
  title: "Register",
  description: "Create your VocabBuilder account.",
};

export default function RegisterPage() {
  return <AuthForm mode="register" />;
}
