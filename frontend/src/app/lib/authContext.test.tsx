import { act, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AuthProvider, useAuth } from "./authContext";
import type { User } from "./auth";

const { getCurrentUser, isAuthenticated, getStoredUser, logoutUser } = vi.hoisted(() => ({
  getCurrentUser: vi.fn(),
  isAuthenticated: vi.fn(),
  getStoredUser: vi.fn(),
  logoutUser: vi.fn(),
}));

vi.mock("./auth", () => ({
  getCurrentUser,
  isAuthenticated,
  getStoredUser,
  logoutUser,
}));

const user: User = { id: "1", email: "test@example.com" };

function Consumer() {
  const { user, loading, isAuthenticated: authed } = useAuth();
  if (loading) return <div>loading</div>;
  return <div>{authed ? `hello ${user?.email}` : "logged out"}</div>;
}

describe("AuthProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows loading then resolves to logged-out when unauthenticated", async () => {
    isAuthenticated.mockReturnValue(false);
    getStoredUser.mockReturnValue(null);

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
    );

    await waitFor(() => expect(screen.getByText("logged out")).toBeInTheDocument());
    expect(getCurrentUser).not.toHaveBeenCalled();
  });

  it("resolves to the authenticated user when a session exists", async () => {
    isAuthenticated.mockReturnValue(true);
    getStoredUser.mockReturnValue(user);
    getCurrentUser.mockResolvedValue(user);

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
    );

    await waitFor(() =>
      expect(screen.getByText(`hello ${user.email}`)).toBeInTheDocument(),
    );
  });

  it("re-checks auth state on a cross-tab storage event", async () => {
    isAuthenticated.mockReturnValue(false);
    getStoredUser.mockReturnValue(null);

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
    );

    await waitFor(() => expect(screen.getByText("logged out")).toBeInTheDocument());

    isAuthenticated.mockReturnValue(true);
    getStoredUser.mockReturnValue(user);
    getCurrentUser.mockResolvedValue(user);

    act(() => {
      window.dispatchEvent(new Event("storage"));
    });

    await waitFor(() =>
      expect(screen.getByText(`hello ${user.email}`)).toBeInTheDocument(),
    );
  });
});
