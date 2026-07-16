import type { ReactNode } from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import type { ApiError } from "@/types/errors";
import type { Movie } from "@/types/movies-protocol";
import { getPopularMovies } from "@/services/tmdbApi";
import { usePopularMovies } from "./usePopularMovies";

vi.mock("@/services/tmdbApi", () => ({
  getPopularMovies: vi.fn(),
}));

const popularMovies: Movie[] = [
  {
    id: 600,
    title: "The New World",
    overview: "A movie overview",
    voteCount: 100,
    popularity: 12,
    voteAverage: 7.4,
    releaseDate: "2005-12-25",
    posterPath: "/poster.jpg",
    backdropPath: "/backdrop.jpg",
  },
  {
    id: 601,
    title: "A Hidden Life",
    overview: "Another movie overview",
    voteCount: 200,
    popularity: 18,
    voteAverage: 7.1,
    releaseDate: "2019-12-13",
    posterPath: "/hidden-life.jpg",
    backdropPath: "/hidden-life-backdrop.jpg",
  },
];

const apiError: ApiError = {
  title: "Service is busy",
  message: "Too many requests were sent. Please try again later.",
  code: "RATE_LIMITED",
  status: 429,
};

const mockedGetPopularMovies = vi.mocked(getPopularMovies);

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe("usePopularMovies (unity)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch popular movies", async () => {
    mockedGetPopularMovies.mockResolvedValue(popularMovies);

    const { result } = renderHook(() => usePopularMovies(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(popularMovies);
    expect(mockedGetPopularMovies).toHaveBeenCalledWith();
    expect(mockedGetPopularMovies).toHaveBeenCalledTimes(1);
  });

  it("should return error when popular movies request fails", async () => {
    mockedGetPopularMovies.mockRejectedValue(apiError);

    const { result } = renderHook(() => usePopularMovies(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toEqual(apiError);
    expect(mockedGetPopularMovies).toHaveBeenCalledWith();
    expect(mockedGetPopularMovies).toHaveBeenCalledTimes(1);
  });
});
