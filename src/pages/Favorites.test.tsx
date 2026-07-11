import { fireEvent, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Route, Routes } from "react-router";

import { PageShell } from "../components/PageShell/PageShell";
import type { FavoritesContextValue } from "../contexts/favorites/favoritesContext";
import { useFavoritesContext } from "../hooks/useFavoritesContext";
import { renderWithProviders } from "../test/test-utils";
import { createStorageError } from "../types/errors";
import type { FavoriteMovie } from "../types/movies";
import { Favorites } from "./Favorites";

vi.mock("../hooks/useFavoritesContext", () => ({
  useFavoritesContext: vi.fn(),
}));

const favorite: FavoriteMovie = {
  id: 42,
  title: "The Answer",
  posterPath: "/answer.jpg",
  releaseYear: "2025",
  voteAverage: 8.4,
  runtimeMinutes: 121,
  genres: ["Science Fiction", "Adventure"],
};

const removeFavorite = vi.fn();

const baseContext: FavoritesContextValue = {
  favorites: [favorite],
  favoriteIds: new Set([favorite.id]),
  addFavorite: vi.fn(),
  removeFavorite,
  isFavorited: (movieId) => movieId === favorite.id,
  storageError: null,
};

const favoritesContextMock = vi.mocked(useFavoritesContext);

function FavoritesRoutes() {
  return (
    <PageShell>
      <Routes>
        <Route path="/" element={<h1>Movie catalog destination</h1>} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/movie/:movieId" element={<h1>Movie details destination</h1>} />
      </Routes>
    </PageShell>
  );
}

function renderFavorites() {
  return renderWithProviders(
    <FavoritesRoutes />,
    { initialEntries: ["/favorites"] },
  );
}

describe("Favorites route", () => {
  beforeEach(() => {
    removeFavorite.mockReset();
    favoritesContextMock.mockReset();
    favoritesContextMock.mockReturnValue(baseContext);
  });

  it("renders persisted favorites with every required summary field", () => {
    renderFavorites();

    expect(screen.getByRole("heading", { name: "Your favorites" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "The Answer" })).toBeVisible();
    expect(screen.getByRole("img", { name: "The Answer poster" })).toBeVisible();
    expect(screen.getByText("2025")).toBeVisible();
    expect(screen.getByText("8.4")).toBeVisible();
    expect(screen.getByText("121 min")).toBeVisible();
    expect(screen.getByText("Science Fiction")).toBeVisible();
    expect(screen.getByText("Adventure")).toBeVisible();
  });

  it("shows a non-blocking storage warning while preserving favorites", () => {
    favoritesContextMock.mockReturnValue({
      ...baseContext,
      storageError: createStorageError(
        "Favorites couldn't be saved in this browser.",
      ),
    });

    renderFavorites();

    expect(screen.getByRole("alert")).toHaveTextContent(/couldn't be saved/i);
    expect(screen.getByRole("heading", { name: "The Answer" })).toBeVisible();
  });

  it("navigates from a favorite to its movie details route", () => {
    renderFavorites();

    fireEvent.click(screen.getByRole("link", { name: "Details for The Answer" }));

    expect(
      screen.getByRole("heading", { name: "Movie details destination" }),
    ).toBeVisible();
  });

  it("marks Favorites as the active primary navigation destination", () => {
    renderFavorites();

    expect(screen.getByRole("link", { name: "Favorites" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Home" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("explains how to add favorites without rendering an empty grid", () => {
    favoritesContextMock.mockReturnValue({
      ...baseContext,
      favorites: [],
      favoriteIds: new Set(),
      isFavorited: () => false,
    });

    renderFavorites();

    expect(screen.getByRole("heading", { name: "No favorite movies yet" }))
      .toBeVisible();
    expect(
      screen.getByText(/open a movie's details page and choose favorite/i),
    ).toBeVisible();
    expect(screen.queryByLabelText("Favorite movies")).not.toBeInTheDocument();
  });

  it("links the empty state back to the movie catalog", () => {
    favoritesContextMock.mockReturnValue({
      ...baseContext,
      favorites: [],
      favoriteIds: new Set(),
      isFavorited: () => false,
    });

    renderFavorites();

    const browseLink = screen.getByRole("link", { name: "Browse movies" });
    expect(browseLink).toHaveAttribute("href", "/");

    fireEvent.click(browseLink);

    expect(
      screen.getByRole("heading", { name: "Movie catalog destination" }),
    ).toBeVisible();
  });

  it("removes the final favorite immediately and shows the empty state", () => {
    let favorites = [favorite];
    favoritesContextMock.mockImplementation(() => ({
      ...baseContext,
      favorites,
      favoriteIds: new Set(favorites.map((movie) => movie.id)),
      isFavorited: (movieId) => favorites.some((movie) => movie.id === movieId),
      removeFavorite: (movieId) => {
        favorites = favorites.filter((movie) => movie.id !== movieId);
        removeFavorite(movieId);
      },
    }));

    const view = renderFavorites();
    fireEvent.click(
      screen.getByRole("button", { name: "Remove The Answer from favorites" }),
    );
    view.rerender(<FavoritesRoutes />);

    expect(removeFavorite).toHaveBeenCalledWith(42);
    expect(screen.queryByRole("heading", { name: "The Answer" })).not
      .toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "No favorite movies yet" }))
      .toBeVisible();
    expect(
      screen.getByText(/open a movie's details page and choose favorite/i),
    ).toBeVisible();
    expect(screen.getByRole("link", { name: "Browse movies" })).toHaveAttribute(
      "href",
      "/",
    );
  });
});
