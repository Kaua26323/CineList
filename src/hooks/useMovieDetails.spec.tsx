import type { ReactNode } from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import type { ApiError } from "@/types/errors";
import { useMovieDetails } from "./useMovieDetails";
import { getMovieDetails } from "@/services/tmdbApi";
import type { MovieDetails } from "@/types/movies-protocol";

vi.mock("@/services/tmdbApi", () => ({
  getMovieDetails: vi.fn(),
}));

const movieDetails: MovieDetails = {
  id: 600,
  title: "The New World",
  adult: false,
  budget: 30000000,
  status: "Released",
  revenue: 30536013,
  overview: "A movie overview",
  popularity: 12,
  voteCount: 100,
  voteAverage: 7.4,
  releaseDate: "2005-12-25",
  genres: [{ id: 18, name: "Drama" }],
  runtime: 135,
  posterPath: "/poster.jpg",
  backdropPath: "/backdrop.jpg",
  cast: [
    {
      id: 1,
      name: "Colin Farrell",
      character: "Captain Smith",
      profilePath: "/profile.jpg",
    },
  ],
};

const apiError: ApiError = {
  title: "Movie not found",
  message: "The requested movie could not be found.",
  code: "MOVIE_NOT_FOUND",
  status: 404,
};

const mockedGetMovieDetails = vi.mocked(getMovieDetails);

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

describe("useMovieDetails (unity)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch movie details when movie ID is valid", async () => {
    mockedGetMovieDetails.mockResolvedValue(movieDetails);

    const { result } = renderHook(() => useMovieDetails(600), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(movieDetails);
    expect(mockedGetMovieDetails).toHaveBeenCalledWith(600);
    expect(mockedGetMovieDetails).toHaveBeenCalledTimes(1);
  });

  it("should not fetch movie details when movie ID is invalid", async () => {
    const { result } = renderHook(() => useMovieDetails(0), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.fetchStatus).toBe("idle"));

    expect(result.current.isPending).toBe(true);
    expect(mockedGetMovieDetails).not.toHaveBeenCalled();
  });

  it("should return error when movie details request fails", async () => {
    mockedGetMovieDetails.mockRejectedValue(apiError);

    const { result } = renderHook(() => useMovieDetails(404), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toEqual(apiError);
    expect(mockedGetMovieDetails).toHaveBeenCalledWith(404);
    expect(mockedGetMovieDetails).toHaveBeenCalledTimes(1);
  });
});
