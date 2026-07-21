"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { storeTokens, storeUser, clearTokens } from "@/app/lib/auth";
import { CheckCircle2, LoaderCircle, TriangleAlert } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

function AuthCallbackContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const hasRun = useRef(false);

  useEffect(() => {
    // Prevent double execution in StrictMode
    if (hasRun.current) return;
    hasRun.current = true;

    const handleCallback = async () => {
      try {
        const accessToken = searchParams.get("access_token");
        const refreshToken = searchParams.get("refresh_token");

        console.log("[Callback] Received tokens:", { 
          hasAccessToken: !!accessToken, 
          hasRefreshToken: !!refreshToken,
        });

        if (!accessToken || !refreshToken) {
          throw new Error("Missing authentication tokens");
        }

        // Store tokens
        storeTokens({ accessToken, refreshToken });
        console.log("[Callback] Tokens stored in localStorage");

        // Fetch user data
        console.log("[Callback] Fetching user from /auth/me...");
        const response = await fetch(`${API_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        console.log("[Callback] Response status:", response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("[Callback] Auth/me failed:", response.status, errorText);
          throw new Error(`Failed to fetch user: ${response.status}`);
        }

        const data = await response.json();
        console.log("[Callback] User data:", data);

        if (!data.success || !data.user) {
          throw new Error("Invalid user data");
        }

        // Store user
        storeUser(data.user);
        console.log("[Callback] User stored, redirecting...");

        setStatus("success");

        // Use window.location for full page reload to ensure auth context re-initializes
        window.location.href = "/dashboard";
      } catch (error) {
        console.error("[Callback] Error:", error);
        setErrorMessage(error instanceof Error ? error.message : "Authentication failed");
        setStatus("error");
        clearTokens();

        setTimeout(() => {
          window.location.href = "/?error=auth_failed";
        }, 3000);
      }
    };

    handleCallback();
  }, [searchParams]);

  return (
    <div className="w-full max-w-sm space-y-4 text-center">
      {status === "loading" && (
        <>
          <LoaderCircle className="mx-auto size-8 animate-spin text-primary" />
          <h1 className="display text-2xl">Signing you in</h1>
          <p className="text-sm text-muted-foreground">
            Setting up your workspace.
          </p>
        </>
      )}

      {status === "success" && (
        <>
          <CheckCircle2 className="mx-auto size-8 text-open" />
          <h1 className="display text-2xl">You&#39;re in</h1>
          <p className="text-sm text-muted-foreground">
            Opening your inbox.
          </p>
        </>
      )}

      {status === "error" && (
        <>
          <TriangleAlert className="mx-auto size-8 text-destructive" />
          <h1 className="display text-2xl">
            Sign-in didn&#39;t complete
          </h1>
          <p className="text-sm text-muted-foreground">{errorMessage}</p>
          <p className="text-xs text-muted-foreground">
            Taking you back to the sign-in page.
          </p>
        </>
      )}
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="w-full max-w-sm space-y-4 text-center">
      <LoaderCircle className="mx-auto size-8 animate-spin text-primary" />
      <h1 className="display text-2xl">Loading</h1>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Suspense fallback={<LoadingFallback />}>
        <AuthCallbackContent />
      </Suspense>
    </div>
  );
}
