const API_URL = process.env.NEXT_PUBLIC_API_URL || `http://localhost:5000`;

export interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  success: boolean;
  user: User;
  tokens: AuthTokens;
}

export async function getGoogleAuthUrl(): Promise<string> {
  const response = await fetch(`${API_URL}/api/auth/google`);
  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || "Failed to get auth URL");
  }
  return data.authUrl;
}

//store user in localStorage
export function storeUser(user: User) {
  if (typeof window !== "undefined") {
    localStorage.setItem("user", JSON.stringify(user));
  }
}

//store tokens in localstorage
export function storeTokens(tokens: AuthTokens) {
  if (typeof window !== "undefined") {
    localStorage.setItem("accessToken", tokens.accessToken);
    localStorage.setItem("refreshToken", tokens.refreshToken);
  }
}

//get tokens from localstorage
export function getStoredTokens(): AuthTokens | null {
  if (typeof window !== "undefined") {
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");

    if (accessToken && refreshToken) {
      return { accessToken, refreshToken };
    }
  }
  return null;
}

//get the stored  user from localstorage
export function getStoredUser(): User | null {
  if (typeof window !== "undefined") {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
  }
  return null;
}

//clear tokens & user from localstorage
export function clearTokens() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
  }
}

export async function refreshAccessToken(): Promise<AuthTokens | null> {
  const tokens = getStoredTokens();

  if (!tokens?.refreshToken) {
    return null;
  }

  try {
    const response = await fetch(`${API_URL}/api/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refreshToken: tokens.refreshToken,
      }),
    });
    if (!response.ok) {
      throw new Error("Failed to refresh token");
    }

    const data = await response.json();
    if (data.success && data.accessToken) {
      // Refresh endpoint only returns accessToken, keep existing refreshToken
      const newTokens = {
        accessToken: data.accessToken,
        refreshToken: tokens.refreshToken, // Keep existing refresh token
      };
      storeTokens(newTokens);
      return newTokens;
    }
    return null;
  } catch (error) {
    console.error("Refresh token error:", error);
    clearTokens();
    return null;
  }
}

//get stored user from backend
export async function getCurrentUser(): Promise<User | null> {
  const tokens = getStoredTokens();

  if (!tokens) return null;
  try {
    const response = await fetch(`${API_URL}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
      },
    });

    if (!response.ok) {
      const newTokens = await refreshAccessToken();
      if (newTokens) {
        storeTokens(newTokens);
        return getCurrentUser();
      }
      throw new Error("Failed to get user");
    }

    const data = await response.json();

    if (data.success && data.user) {
      storeUser(data.user);
      return data.user;
    }
    return null;
  } catch (error) {
    console.error("Get user error:", error);
    clearTokens();
    return null;
  }
}

//logout
export async function logoutUser(): Promise<void> {
  const tokens = getStoredTokens();

  if (tokens) {
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
        },
      });
    } catch (error) {
      console.error("Logout error: ", error);
    }
  }
  clearTokens();
}

//check if user is authenticated
export function isAuthenticated(): boolean {
  return getStoredTokens() !== null;
}
