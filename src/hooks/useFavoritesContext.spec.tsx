import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import { useFavoritesContext } from "./useFavoritesContext";
import type { FavoriteMovie, MovieDetails } from "@/types/movies-protocol";
import {
  FavoritesContext,
  type FavoritesContextProps,
} from "@/contexts/favorites/favoritesContext";

const favoriteMovie: FavoriteMovie = {
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
          setIsFavoriteResult(String(isFavorited(favoriteMovie.id)))
        }
      >
        Check favorite
      </button>
      <button type="button" onClick={() => addFavoriteMovie(movieDetails)}>
        Add favorite
      </button>
      <button
        type="button"
        onClick={() => removeFavoriteMovie(favoriteMovie.id)}
      >
        Remove favorite
      </button>
    </div>
  );
}

describe("useFavoritesContext (unity)", () => {
  it("should throw an error when used outside FavoritesProvider", () => {
    expect(() => render(<FavoritesConsumer />)).toThrow(
      "useFavoritesContext must be used within FavoritesProvider",
    );
  });

  it("should return context value when used inside provider", () => {
    const contextValue: FavoritesContextProps = {
      favorites: [favoriteMovie],
      storageError: null,
      isFavorited: vi.fn((movieId: number) => movieId === favoriteMovie.id),
      addFavoriteMovie: vi.fn(),
      removeFavoriteMovie: vi.fn(),
    };

    render(
      <FavoritesContext.Provider value={contextValue}>
        <FavoritesConsumer />
      </FavoritesContext.Provider>,
    );

    expect(screen.getByText("Favorites count: 1")).toBeInTheDocument();
    expect(
      screen.getByText("First favorite: The New World"),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Check favorite" }));
    fireEvent.click(screen.getByRole("button", { name: "Add favorite" }));
    fireEvent.click(screen.getByRole("button", { name: "Remove favorite" }));

    expect(contextValue.isFavorited).toHaveBeenCalledWith(600);
    expect(screen.getByText("Is favorite: true")).toBeInTheDocument();
    expect(contextValue.addFavoriteMovie).toHaveBeenCalledWith(movieDetails);
    expect(contextValue.removeFavoriteMovie).toHaveBeenCalledWith(600);
  });
});
