import { fireEvent, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { FavoritesContextValue } from "../contexts/favorites/favoritesContext";
import { useFavoritesContext } from "../hooks/useFavoritesContext";
import { usePopularMovies } from "../hooks/usePopularMovies";
import { renderWithProviders } from "../test/test-utils";
import { createApiError } from "../types/errors";
import type { MovieSummary } from "../types/movies";
import { Home } from "./Home";

vi.mock("../hooks/usePopularMovies", () => ({ usePopularMovies: vi.fn() }));
vi.mock("../hooks/useFavoritesContext", () => ({
  useFavoritesContext: vi.fn(),
}));

const movie: MovieSummary = {
  id: 42,
  title: "The Answer",
  posterPath: "/answer.jpg",
  releaseDate: "2025-04-02",
  releaseYear: "2025",
  voteAverage: 8.4,
  overview: "A meaningful overview.",
};

const favoritesValue: FavoritesContextValue = {
  favorites: [],
  favoriteIds: new Set<number>(),
  addFavorite: vi.fn(),
  removeFavorite: vi.fn(),
  isFavorited: () => false,
  storageError: null,
};

const popularMoviesMock = vi.mocked(usePopularMovies);
const favoritesContextMock = vi.mocked(useFavoritesContext);

describe("Home route", () => {
  beforeEach(() => {
    popularMoviesMock.mockReset();
    favoritesContextMock.mockReset();
    favoritesContextMock.mockReturnValue(favoritesValue);
  });

  it("shows loading feedback", () => {
    popularMoviesMock.mockReturnValue({
      data: undefined,
      error: null,
      isPending: true,
      isError: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof usePopularMovies>);

    renderWithProviders(<Home />);

    expect(screen.getByRole("status")).toHaveTextContent(/loading popular/i);
  });

  it("shows a successful movie grid with details navigation", () => {
    popularMoviesMock.mockReturnValue({
      data: [movie],
      error: null,
      isPending: false,
      isError: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof usePopularMovies>);

    renderWithProviders(<Home />);

    expect(screen.getByRole("heading", { name: "Popular movies" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "The Answer" })).toBeVisible();
    expect(screen.getByRole("link", { name: /view details for the answer/i }))
      .toHaveAttribute("href", "/movie/42");
  });

  it("shows a clear empty state", () => {
    popularMoviesMock.mockReturnValue({
      data: [],
      error: null,
      isPending: false,
      isError: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof usePopularMovies>);

    renderWithProviders(<Home />);

    expect(screen.getByText(/no popular movies/i)).toBeVisible();
  });

  it("shows a user-friendly error with retry", () => {
    const refetch = vi.fn();
    popularMoviesMock.mockReturnValue({
      data: undefined,
      error: createApiError(),
      isPending: false,
      isError: true,
      refetch,
    } as unknown as ReturnType<typeof usePopularMovies>);

    renderWithProviders(<Home />);
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));

    expect(screen.getByRole("alert")).toHaveTextContent(/movie service/i);
    expect(refetch).toHaveBeenCalledOnce();
  });

  it("shows favorite state without relying on color", () => {
    favoritesContextMock.mockReturnValue({
      ...favoritesValue,
      favoriteIds: new Set([42]),
      isFavorited: (movieId) => movieId === 42,
    });
    popularMoviesMock.mockReturnValue({
      data: [movie],
      error: null,
      isPending: false,
      isError: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof usePopularMovies>);

    renderWithProviders(<Home />);

    expect(screen.getByText("In favorites")).toBeVisible();
  });
});
