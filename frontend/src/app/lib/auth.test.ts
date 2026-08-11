import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearTokens,
  getCurrentUser,
  getStoredTokens,
  getStoredUser,
  isAuthenticated,
  logoutUser,
  refreshAccessToken,
  storeTokens,
  storeUser,
  type User,
} from "./auth";

const user: User = { id: "1", email: "test@example.com", name: "Test" };
const tokens = { accessToken: "access-1", refreshToken: "refresh-1" };

describe("localStorage-backed helpers", () => {
  afterEach(() => {
    localStorage.clear();
  });

  it("stores and retrieves tokens", () => {
    storeTokens(tokens);
    expect(getStoredTokens()).toEqual(tokens);
  });

  it("returns null when no tokens are stored", () => {
    expect(getStoredTokens()).toBeNull();
  });

  it("stores and retrieves the user", () => {
    storeUser(user);
    expect(getStoredUser()).toEqual(user);
  });

  it("returns null for malformed stored user JSON", () => {
    localStorage.setItem("user", "{not-json");
    expect(getStoredUser()).toBeNull();
  });

  it("clears tokens and user", () => {
    storeTokens(tokens);
    storeUser(user);
    clearTokens();
    expect(getStoredTokens()).toBeNull();
    expect(getStoredUser()).toBeNull();
  });

  it("reports authenticated only when tokens are present", () => {
    expect(isAuthenticated()).toBe(false);
    storeTokens(tokens);
    expect(isAuthenticated()).toBe(true);
  });
});

describe("fetch-backed helpers", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("refreshAccessToken stores and returns new tokens on success", async () => {
    storeTokens(tokens);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, accessToken: "access-2" }),
      }),
    );

    const result = await refreshAccessToken();

    expect(result).toEqual({ accessToken: "access-2", refreshToken: "refresh-1" });
    expect(getStoredTokens()).toEqual({ accessToken: "access-2", refreshToken: "refresh-1" });
  });

  it("refreshAccessToken clears tokens when the request fails", async () => {
    storeTokens(tokens);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false }),
    );

    const result = await refreshAccessToken();

    expect(result).toBeNull();
    expect(getStoredTokens()).toBeNull();
  });

  it("refreshAccessToken returns null when there are no stored tokens", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const result = await refreshAccessToken();

    expect(result).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("getCurrentUser retries once via refresh on a 401, then succeeds", async () => {
    storeTokens(tokens);
    const fetchMock = vi
      .fn()
      // /auth/me -> 401
      .mockResolvedValueOnce({ ok: false, status: 401 })
      // /auth/refresh -> success
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, accessToken: "access-2" }),
      })
      // /auth/me retry -> success
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, user }),
      });
    vi.stubGlobal("fetch", fetchMock);

    const result = await getCurrentUser();

    expect(result).toEqual(user);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("getCurrentUser clears tokens when refresh also fails", async () => {
    storeTokens(tokens);
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 401 }) // /auth/me -> 401
      .mockResolvedValueOnce({ ok: false }); // /auth/refresh -> fails
    vi.stubGlobal("fetch", fetchMock);

    const result = await getCurrentUser();

    expect(result).toBeNull();
    expect(getStoredTokens()).toBeNull();
  });

  it("logoutUser clears tokens even if the network call throws", async () => {
    storeTokens(tokens);
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));

    await logoutUser();

    expect(getStoredTokens()).toBeNull();
  });
});
