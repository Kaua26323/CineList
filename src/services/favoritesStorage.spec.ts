import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

import { LOCAL_STORAGE_KEYS } from "@/utils/constants";
import type { FavoriteMovie } from "@/types/movies-protocol";
import {
  isFavorited,
  addFavoriteToStorage,
  removeFavoriteFromStorage,
  saveFavoriteMovieToStorage,
  getFavoritesMoviesFromStorage,
} from "./favoritesStorage";

const favoriteMovie: FavoriteMovie = {
  id: 600,
  title: "The New World",
  genres: [{ id: 18, name: "Drama" }],
  voteAverage: 7.4,
  releaseDate: "2005-12-25",
  runtime: 135,
  posterPath: "/poster.jpg",
};

const anotherFavoriteMovie: FavoriteMovie = {
  id: 601,
  title: "A Hidden Life",
  genres: [{ id: 36, name: "History" }],
  voteAverage: 7.1,
  releaseDate: "2019-12-13",
  runtime: 174,
  posterPath: "/hidden-life.jpg",
};

const updatedFavoriteMovie: FavoriteMovie = {
  ...favoriteMovie,
  title: "The New World: Extended",
  voteAverage: 7.8,
};

function saveFavoritesToStorage(favorites: unknown): void {
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

describe("favoritesStorage (unity)", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  afterAll(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  describe("getFavoritesMoviesFromStorage", () => {
    it("should return empty list when no favorites are stored", () => {
      expect(getFavoritesMoviesFromStorage()).toEqual([]);
    });

    it("should return valid favorite movies from localStorage", () => {
      saveFavoritesToStorage([favoriteMovie, anotherFavoriteMovie]);

      expect(getFavoritesMoviesFromStorage()).toEqual([
        favoriteMovie,
        anotherFavoriteMovie,
      ]);
    });

    it("should ignore invalid payloads and invalid favorite movies", () => {
      const invalidFavoriteMovie = {
        ...favoriteMovie,
        id: 0,
      };

      saveFavoritesToStorage([
        invalidFavoriteMovie,
        favoriteMovie,
        null,
        "invalid",
        {
          id: 602,
          title: "Invalid Movie",
          genres: [{ id: "18", name: "Drama" }],
          voteAverage: 6,
          runtime: 100,
          posterPath: "/invalid.jpg",
        },
      ]);

      expect(getFavoritesMoviesFromStorage()).toEqual([favoriteMovie]);
    });

    it("should return empty list when stored payload is not an array", () => {
      saveFavoritesToStorage({ favorites: [favoriteMovie] });

      expect(getFavoritesMoviesFromStorage()).toEqual([]);
    });

    it("should deduplicate favorite movies by ID preserving the last value", () => {
      saveFavoritesToStorage([
        favoriteMovie,
        anotherFavoriteMovie,
        updatedFavoriteMovie,
      ]);

      expect(getFavoritesMoviesFromStorage()).toEqual([
        updatedFavoriteMovie,
        anotherFavoriteMovie,
      ]);
    });

    it("should return empty list and log error when stored JSON is invalid", () => {
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => undefined);

      window.localStorage.setItem(
        LOCAL_STORAGE_KEYS.favorites,
        "{invalid-json",
      );

      expect(getFavoritesMoviesFromStorage()).toEqual([]);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          "[CineList]: Unable to read favorites movies from localStorage",
        ),
      );
    });
  });

  describe("saveFavoriteMovieToStorage", () => {
    it("should save favorite movies to localStorage and return the same list", () => {
      const favorites = [favoriteMovie, anotherFavoriteMovie];

      const savedFavorites = saveFavoriteMovieToStorage(favorites);

      expect(savedFavorites).toBe(favorites);
      expect(getStoredFavorites()).toEqual(favorites);
    });

    it("should return favorite movies and log error when localStorage save fails", () => {
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => undefined);
      vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
        throw new Error("Storage is full");
      });

      const favorites = [favoriteMovie];

      expect(saveFavoriteMovieToStorage(favorites)).toBe(favorites);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          "[CineList]: Unable to save favorites movies to localStorage.",
        ),
      );
    });
  });

  describe("addFavoriteToStorage", () => {
    it("should add a favorite movie to the beginning of the list", () => {
      saveFavoritesToStorage([favoriteMovie]);

      expect(addFavoriteToStorage(anotherFavoriteMovie)).toEqual([
        anotherFavoriteMovie,
        favoriteMovie,
      ]);
      expect(getStoredFavorites()).toEqual([
        anotherFavoriteMovie,
        favoriteMovie,
      ]);
    });

    it("should replace an existing favorite movie with the same ID", () => {
      saveFavoritesToStorage([favoriteMovie, anotherFavoriteMovie]);

      expect(addFavoriteToStorage(updatedFavoriteMovie)).toEqual([
        updatedFavoriteMovie,
        anotherFavoriteMovie,
      ]);
      expect(getStoredFavorites()).toEqual([
        updatedFavoriteMovie,
        anotherFavoriteMovie,
      ]);
    });
  });

  describe("removeFavoriteFromStorage", () => {
    it("should remove a favorite movie by ID and keep the remaining favorites", () => {
      saveFavoritesToStorage([favoriteMovie, anotherFavoriteMovie]);

      expect(removeFavoriteFromStorage(favoriteMovie.id)).toEqual([
        anotherFavoriteMovie,
      ]);
      expect(getStoredFavorites()).toEqual([anotherFavoriteMovie]);
    });
  });

  describe("isFavorited", () => {
    it("should return true when movie is stored as favorite", () => {
      saveFavoritesToStorage([favoriteMovie]);

      expect(isFavorited(favoriteMovie.id)).toBe(true);
    });

    it("should return false when movie is not stored as favorite", () => {
      saveFavoritesToStorage([favoriteMovie]);

      expect(isFavorited(anotherFavoriteMovie.id)).toBe(false);
    });
  });
});
