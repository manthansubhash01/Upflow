"use client";

import { useSearchParams } from "next/navigation";
import AuthForm from "@/app/components/auth/AuthForm";

export default function AuthPage() {
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") === "signup" ? "signup" : "login";

  return <AuthForm initialMode={mode} showTabs />;
}
