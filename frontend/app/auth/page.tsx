import { Suspense } from "react";
import { AuthContent } from "@/app/auth/AuthContent";

function AuthFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-slate-500">Loading...</p>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<AuthFallback />}>
      <AuthContent />
    </Suspense>
  );
}
