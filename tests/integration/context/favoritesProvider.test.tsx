import { useState } from "react";
import { beforeEach, describe, expect, it } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";

import { useFavoritesContext } from "@/hooks/useFavoritesContext";
import type { FavoriteMovie, MovieDetails } from "@/types/movies-protocol";
import { createFavoriteMovie, LOCAL_STORAGE_KEYS } from "@/utils/constants";
import { FavoritesProvider } from "../../../src/contexts/favorites/favoritesProvider";

const storedFavoriteMovie: FavoriteMovie = {
  id: 600,
  title: "The New World",
  genres: [{ id: 18, name: "Drama" }],
  voteAverage: 7.4,
  releaseDate: "2005-12-25",
  runtime: 135,
  posterPath: "/poster.jpg",
};

const movieDetails: MovieDetails = {
  id: 601,
  title: "A Hidden Life",
  adult: false,
  budget: 0,
  status: "Released",
  revenue: 0,
  overview: "A movie overview",
  popularity: 12,
  voteCount: 100,
  voteAverage: 7.1,
  releaseDate: "2019-12-13",
  genres: [{ id: 18, name: "Drama" }],
  runtime: 174,
  posterPath: "/hidden-life.jpg",
  backdropPath: "/hidden-life-backdrop.jpg",
};

function saveFavoritesToStorage(favorites: FavoriteMovie[]): void {
  window.localStorage.setItem(
    LOCAL_STORAGE_KEYS.favorites,
    JSON.stringify(favorites),
  );
}

function getStoredFavorites(): FavoriteMovie[] {
  return JSON.parse(
    window.localStorage.getItem(LOCAL_STORAGE_KEYS.favorites) ?? "[]",
  );
}

function FavoritesConsumer() {
  const [isFavoriteResult, setIsFavoriteResult] = useState("not checked");
  const { favorites, isFavorited, addFavoriteMovie, removeFavoriteMovie } =
    useFavoritesContext();

  return (
    <div>
      <p>Favorites count: {favorites.length}</p>
      <p>First favorite: {favorites[0]?.title}</p>
      <p>Is favorite: {isFavoriteResult}</p>

      <button
        type="button"
        onClick={() =>
          setIsFavoriteResult(String(isFavorited(storedFavoriteMovie.id)))
        }
      >
        Check favorite
      </button>
      <button type="button" onClick={() => addFavoriteMovie(movieDetails)}>
        Add favorite
      </button>
      <button
        type="button"
        onClick={() => removeFavoriteMovie(storedFavoriteMovie.id)}
      >
        Remove favorite
      </button>
    </div>
  );
}

function renderFavoritesProvider(): void {
  render(
    <FavoritesProvider>
      <FavoritesConsumer />
    </FavoritesProvider>,
  );
}

describe("FavoritesProvider (integration)", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterAll(() => {
    window.localStorage.clear();
  });

  it("should initialize favorites from localStorage", () => {
    saveFavoritesToStorage([storedFavoriteMovie]);

    renderFavoritesProvider();

    expect(screen.getByText("Favorites count: 1")).toBeInTheDocument();
    expect(
      screen.getByText("First favorite: The New World"),
    ).toBeInTheDocument();
  });

  it("should add a favorite movie", () => {
    renderFavoritesProvider();

    fireEvent.click(screen.getByRole("button", { name: "Add favorite" }));

    expect(screen.getByText("Favorites count: 1")).toBeInTheDocument();
    expect(
      screen.getByText("First favorite: A Hidden Life"),
    ).toBeInTheDocument();
    expect(getStoredFavorites()).toEqual([createFavoriteMovie(movieDetails)]);
  });

  it("should remove a favorite movie", () => {
    saveFavoritesToStorage([storedFavoriteMovie]);
    renderFavoritesProvider();

    fireEvent.click(screen.getByRole("button", { name: "Remove favorite" }));

    expect(screen.getByText("Favorites count: 0")).toBeInTheDocument();
    expect(getStoredFavorites()).toEqual([]);
  });

  it("should return true when movie is favorited", () => {
    saveFavoritesToStorage([storedFavoriteMovie]);
    renderFavoritesProvider();

    fireEvent.click(screen.getByRole("button", { name: "Check favorite" }));

    expect(screen.getByText("Is favorite: true")).toBeInTheDocument();
  });

  it("should update favorites when storage event is fired", () => {
    renderFavoritesProvider();

    saveFavoritesToStorage([storedFavoriteMovie]);

    act(() => {
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: LOCAL_STORAGE_KEYS.favorites,
        }),
      );
    });

    expect(screen.getByText("Favorites count: 1")).toBeInTheDocument();
    expect(
      screen.getByText("First favorite: The New World"),
    ).toBeInTheDocument();
  });
});
