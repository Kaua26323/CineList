import { fireEvent, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Route, Routes } from "react-router";

import type { FavoritesContextValue } from "../contexts/favorites/favoritesContext";
import { useFavoritesContext } from "../hooks/useFavoritesContext";
import { useMovieDetails } from "../hooks/useMovieDetails";
import { renderWithProviders } from "../test/test-utils";
import { createApiError, createNotFoundError } from "../types/errors";
import type { MovieDetails as MovieDetailsModel } from "../types/movies";
import { MovieDetails } from "./MovieDetails";

vi.mock("../hooks/useMovieDetails", () => ({ useMovieDetails: vi.fn() }));
vi.mock("../hooks/useFavoritesContext", () => ({
  useFavoritesContext: vi.fn(),
}));

const movie: MovieDetailsModel = {
  id: 42,
  title: "The Answer",
  posterPath: "/answer.jpg",
  releaseDate: "2025-04-02",
  releaseYear: "2025",
  voteAverage: 8.4,
  overview: "A meaningful overview.",
  genres: ["Science Fiction"],
  runtimeMinutes: 121,
  cast: [
    {
      id: 7,
      name: "Alex Actor",
      character: "The Hero",
      profilePath: "/alex.jpg",
    },
  ],
};

const addFavorite = vi.fn();
const favoritesValue: FavoritesContextValue = {
  favorites: [],
  favoriteIds: new Set<number>(),
  addFavorite,
  removeFavorite: vi.fn(),
  isFavorited: () => false,
  storageError: null,
};

const movieDetailsMock = vi.mocked(useMovieDetails);
const favoritesContextMock = vi.mocked(useFavoritesContext);

function renderDetails(path = "/movie/42") {
  return renderWithProviders(
    <Routes>
      <Route path="/movie/:movieId" element={<MovieDetails />} />
    </Routes>,
    { initialEntries: [path] },
  );
}

describe("MovieDetails route", () => {
  beforeEach(() => {
    addFavorite.mockReset();
    movieDetailsMock.mockReset();
    favoritesContextMock.mockReset();
    favoritesContextMock.mockReturnValue(favoritesValue);
  });

  it("rejects an invalid route parameter without enabling a request", () => {
    movieDetailsMock.mockReturnValue({
      data: undefined,
      error: null,
      isPending: false,
      isError: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useMovieDetails>);

    renderDetails("/movie/not-a-number");

    expect(movieDetailsMock).toHaveBeenCalledWith(null);
    expect(screen.getByText(/requested movie is unavailable/i)).toBeVisible();
    expect(screen.getByRole("link", { name: /browse movies/i }))
      .toHaveAttribute("href", "/");
  });

  it("shows loading feedback", () => {
    movieDetailsMock.mockReturnValue({
      data: undefined,
      error: null,
      isPending: true,
      isError: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useMovieDetails>);

    renderDetails();

    expect(screen.getByRole("status")).toHaveTextContent(/loading movie/i);
  });

  it("renders available movie details", () => {
    movieDetailsMock.mockReturnValue({
      data: movie,
      error: null,
      isPending: false,
      isError: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useMovieDetails>);

    renderDetails();

    expect(screen.getByRole("heading", { name: "The Answer" })).toBeVisible();
    expect(screen.getByText("A meaningful overview.")).toBeVisible();
    expect(screen.getByText("Science Fiction")).toBeVisible();
    expect(screen.getByText(/121 min/i)).toBeVisible();
    expect(screen.getByText("Alex Actor")).toBeVisible();
  });

  it("renders fallbacks for missing optional details", () => {
    movieDetailsMock.mockReturnValue({
      data: {
        ...movie,
        posterPath: null,
        releaseDate: null,
        releaseYear: null,
        voteAverage: null,
        overview: null,
        genres: [],
        runtimeMinutes: null,
        cast: [],
      },
      error: null,
      isPending: false,
      isError: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useMovieDetails>);

    renderDetails();

    expect(screen.getByText(/poster unavailable/i)).toBeVisible();
    expect(screen.getByText(/synopsis unavailable/i)).toBeVisible();
    expect(screen.getByText(/cast information unavailable/i)).toBeVisible();
  });

  it.each([
    createApiError(),
    createNotFoundError("That movie is unavailable.", { status: 404 }),
  ])("shows recovery UI for $kind errors", (error) => {
    const refetch = vi.fn();
    movieDetailsMock.mockReturnValue({
      data: undefined,
      error,
      isPending: false,
      isError: true,
      refetch,
    } as unknown as ReturnType<typeof useMovieDetails>);

    renderDetails();

    expect(screen.getByRole("alert")).toBeVisible();
    expect(screen.getByRole("link", { name: /browse movies/i })).toBeVisible();
    if (error.recoverable) {
      fireEvent.click(screen.getByRole("button", { name: "Try again" }));
      expect(refetch).toHaveBeenCalledOnce();
    }
  });

  it("adds a movie to favorites and exposes the pressed state immediately", () => {
    let favorited = false;
    favoritesContextMock.mockImplementation(() => ({
      ...favoritesValue,
      isFavorited: () => favorited,
      addFavorite: (favorite) => {
        favorited = true;
        addFavorite(favorite);
      },
    }));
    movieDetailsMock.mockReturnValue({
      data: movie,
      error: null,
      isPending: false,
      isError: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useMovieDetails>);

    const view = renderDetails();
    fireEvent.click(screen.getByRole("button", { name: "Favorite" }));
    view.rerender(
      <Routes>
        <Route path="/movie/:movieId" element={<MovieDetails />} />
      </Routes>,
    );

    expect(addFavorite).toHaveBeenCalledWith(
      expect.objectContaining({ id: 42, title: "The Answer" }),
    );
    expect(screen.getByRole("button", { name: "Remove from Favorites" }))
      .toHaveAttribute("aria-pressed", "true");
  });
});
