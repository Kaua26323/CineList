import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import App from "./App";
import { useMovieDetails } from "./hooks/useMovieDetails";
import { usePopularMovies } from "./hooks/usePopularMovies";
import { createApiError } from "./types/errors";
import type { FavoriteMovie, MovieDetails, MovieSummary } from "./types/movies";
import { FAVORITES_STORAGE_KEY } from "./utils/constants";

vi.mock("./hooks/usePopularMovies", () => ({ usePopularMovies: vi.fn() }));
vi.mock("./hooks/useMovieDetails", () => ({ useMovieDetails: vi.fn() }));

const movieSummary: MovieSummary = {
  id: 42,
  title: "The Answer",
  posterPath: "/answer.jpg",
  releaseDate: "2025-04-02",
  releaseYear: "2025",
  voteAverage: 8.4,
  overview: "A meaningful overview.",
};

const movieDetails: MovieDetails = {
  ...movieSummary,
  genres: ["Science Fiction"],
  runtimeMinutes: 121,
  cast: [],
};

const favoriteMovie: FavoriteMovie = {
  id: 42,
  title: "The Answer",
  posterPath: "/answer.jpg",
  releaseYear: "2025",
  voteAverage: 8.4,
  runtimeMinutes: 121,
  genres: ["Science Fiction"],
};

const popularMoviesMock = vi.mocked(usePopularMovies);
const movieDetailsMock = vi.mocked(useMovieDetails);

function setRoute(path: string) {
  window.history.pushState({}, "", path);
}

function mockPopularMovies(
  overrides: Partial<ReturnType<typeof usePopularMovies>> = {},
) {
  popularMoviesMock.mockReturnValue({
    data: [movieSummary],
    error: null,
    isPending: false,
    isError: false,
    refetch: vi.fn(),
    ...overrides,
  } as unknown as ReturnType<typeof usePopularMovies>);
}

function mockMovieDetails(
  overrides: Partial<ReturnType<typeof useMovieDetails>> = {},
) {
  movieDetailsMock.mockReturnValue({
    data: movieDetails,
    error: null,
    isPending: false,
    isError: false,
    refetch: vi.fn(),
    ...overrides,
  } as unknown as ReturnType<typeof useMovieDetails>);
}

describe("App route accessibility", () => {
  beforeEach(() => {
    setRoute("/");
    popularMoviesMock.mockReset();
    movieDetailsMock.mockReset();
    mockPopularMovies();
    mockMovieDetails();
  });

  it("exposes header navigation with the active route", () => {
    setRoute("/favorites");

    render(<App />);

    expect(screen.getByRole("navigation", { name: "Primary navigation" }))
      .toBeVisible();
    expect(screen.getByRole("link", { name: "Favorites" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Home" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("keeps Home retry action keyboard-accessible and named", () => {
    const refetch = vi.fn();
    mockPopularMovies({
      data: undefined,
      error: createApiError(),
      isError: true,
      refetch,
    });

    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));

    expect(screen.getByRole("alert")).toHaveTextContent(/movie service/i);
    expect(refetch).toHaveBeenCalledOnce();
  });

  it("keeps the details favorite toggle accessible with pressed state", () => {
    setRoute("/movie/42");

    const view = render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Favorite" }));

    view.rerender(<App />);

    expect(screen.getByRole("button", { name: "Remove from Favorites" }))
      .toHaveAttribute("aria-pressed", "true");
    expect(JSON.parse(window.localStorage.getItem(FAVORITES_STORAGE_KEY) ?? "[]"))
      .toEqual([favoriteMovie]);
  });

  it("keeps favorite remove controls accessible from the favorites route", () => {
    window.localStorage.setItem(
      FAVORITES_STORAGE_KEY,
      JSON.stringify([favoriteMovie]),
    );
    setRoute("/favorites");

    render(<App />);
    fireEvent.click(
      screen.getByRole("button", { name: "Remove The Answer from favorites" }),
    );

    expect(screen.getByRole("heading", { name: "No favorite movies yet" }))
      .toBeVisible();
    expect(JSON.parse(window.localStorage.getItem(FAVORITES_STORAGE_KEY) ?? "[]"))
      .toEqual([]);
  });

  it("provides not-found recovery back to Home", () => {
    setRoute("/missing-page");

    render(<App />);
    fireEvent.click(screen.getByRole("link", { name: "Back to Home" }));

    expect(screen.getByRole("heading", { name: "Popular movies" })).toBeVisible();
  });
});
