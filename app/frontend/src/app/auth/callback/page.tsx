"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { storeTokens, storeUser, getCurrentUser } from "../../lib/auth";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get tokens from URL params (backend redirects with these)
        const accessToken = searchParams.get("access_token");
        const refreshToken = searchParams.get("refresh_token");

        if (!accessToken || !refreshToken) {
          throw new Error("Missing authentication tokens");
        }

        // Store tokens
        storeTokens({
          accessToken,
          refreshToken,
        });

        // Fetch user data from backend
        const user = await getCurrentUser();
        if (!user) {
          throw new Error("Failed to fetch user data");
        }

        // Store user
        storeUser(user);

        setStatus("success");

        // Redirect to dashboard after a short delay
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      } catch (error) {
        console.error("Auth callback error:", error);
        setErrorMessage(
          error instanceof Error ? error.message : "Authentication failed"
        );
        setStatus("error");

        // Redirect to auth page with error after delay
        setTimeout(() => {
          router.push("/auth?error=auth_failed");
        }, 3000);
      }
    };

    handleCallback();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-slate-950 to-black p-4">
      <div className="max-w-md w-full text-center space-y-6">
        {status === "loading" && (
          <>
            <div className="flex justify-center">
              <svg
                className="animate-spin h-12 w-12 text-blue-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-white">
              Completing authentication...
            </h2>
            <p className="text-gray-400">
              Please wait while we set up your account
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="flex justify-center">
              <svg
                className="h-16 w-16 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-white">
              Successfully authenticated!
            </h2>
            <p className="text-gray-400">
              Redirecting you to your dashboard...
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="flex justify-center">
              <svg
                className="h-16 w-16 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-white">
              Authentication failed
            </h2>
            <p className="text-gray-400">{errorMessage}</p>
            <p className="text-gray-500 text-sm">
              Redirecting you back to the login page...
            </p>
          </>
        )}
      </div>
    </div>
  );
}

