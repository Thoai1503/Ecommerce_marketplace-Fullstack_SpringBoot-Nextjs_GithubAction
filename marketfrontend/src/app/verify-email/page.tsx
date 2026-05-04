"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { API_URL } from "@/helper/api";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Verification token is missing.");
      return;
    }

    let mounted = true;

    const verifyEmail = async () => {
      try {
        const res = await fetch(
          `${API_URL}/users/verify-email?token=${encodeURIComponent(token)}`,
          { cache: "no-store" },
        );
        const text = await res.text();

        if (!mounted) return;

        if (!res.ok) {
          setStatus("error");
          setMessage(text.replace(/<[^>]+>/g, "") || "Email verification failed.");
          return;
        }

        setStatus("success");
        setMessage("Your email has been verified successfully.");
      } catch {
        if (!mounted) return;
        setStatus("error");
        setMessage("Unable to verify your email. Please try again later.");
      }
    };

    verifyEmail();

    return () => {
      mounted = false;
    };
  }, [token]);

  const isSuccess = status === "success";

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <section className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
        <div
          className={`mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full text-2xl font-bold ${
            isSuccess
              ? "bg-green-100 text-green-700"
              : status === "error"
                ? "bg-red-100 text-red-700"
                : "bg-blue-100 text-blue-700"
          }`}
        >
          {isSuccess ? "✓" : status === "error" ? "!" : "..."}
        </div>

        <h1 className="text-2xl font-bold text-slate-950">
          {isSuccess
            ? "Email verified"
            : status === "error"
              ? "Verification failed"
              : "Verifying email"}
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">{message}</p>

        <Link
          href="/login"
          className="mt-6 inline-flex h-11 items-center justify-center rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Go to login
        </Link>
      </section>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <VerifyEmailContent />
    </Suspense>
  );
}
