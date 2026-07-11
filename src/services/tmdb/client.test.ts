import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AppError } from "../../types/errors";
import { getTmdbConfig, tmdbRequest } from "./client";

describe("TMDB client", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_TMDB_API_KEY", "test-api-key");
    vi.stubEnv("VITE_TMDB_BASE_URL", "https://api.example.test/3");
    vi.stubEnv("VITE_TMDB_IMAGE_BASE_URL", "https://images.example.test/w500");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("reads the required browser configuration", () => {
    expect(getTmdbConfig()).toEqual({
      apiKey: "test-api-key",
      baseUrl: "https://api.example.test/3",
      imageBaseUrl: "https://images.example.test/w500",
    });
  });

  it("maps missing configuration to a user-friendly AppError", () => {
    vi.stubEnv("VITE_TMDB_API_KEY", "");

    expect(() => getTmdbConfig()).toThrowError(
      expect.objectContaining({
        kind: "api",
        code: "missing-config",
        message: expect.stringMatching(/configured/i),
      }),
    );
  });

  it("builds an authenticated URL and returns a successful JSON payload", async () => {
    const payload = { results: [{ id: 1 }] };
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(payload), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      tmdbRequest("/movie/popular", { page: 2 }),
    ).resolves.toEqual(payload);

    const requestedUrl = new URL(String(fetchMock.mock.calls[0]?.[0]));
    expect(requestedUrl.pathname).toBe("/3/movie/popular");
    expect(requestedUrl.searchParams.get("api_key")).toBe("test-api-key");
    expect(requestedUrl.searchParams.get("language")).toBe("en-US");
    expect(requestedUrl.searchParams.get("page")).toBe("2");
  });

  it("maps non-success responses to an API AppError", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ status_message: "Internal failure" }), {
          status: 500,
        }),
      ),
    );

    await expect(tmdbRequest("/movie/popular")).rejects.toEqual(
      expect.objectContaining({
        kind: "api",
        status: 500,
        message: expect.not.stringContaining("Internal failure"),
      }),
    );
  });

  it("maps fetch failures to a recoverable network AppError", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new TypeError("Failed to fetch")),
    );

    const error = await tmdbRequest("/movie/popular").catch(
      (reason: unknown) => reason,
    );

    expect(error).toBeInstanceOf(AppError);
    expect(error).toEqual(
      expect.objectContaining({ kind: "network", recoverable: true }),
    );
  });
});
