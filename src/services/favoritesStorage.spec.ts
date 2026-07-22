import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

import { LOCAL_STORAGE_KEYS } from "@/utils/constants";
import type { FavoriteMovie } from "@/types/movies-protocol";
import {
  addFavoriteToStorage,
  removeFavoriteFromStorage,
  saveFavoriteMoviesToStorage,
  getFavoriteMoviesFromStorage,
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

  describe("getFavoriteMoviesFromStorage", () => {
    it("should return empty list when no favorites are stored", () => {
      expect(getFavoriteMoviesFromStorage()).toEqual({
        success: true,
        favorites: [],
        error: null,
      });
    });

    it("should return valid favorite movies from localStorage", () => {
      saveFavoritesToStorage([favoriteMovie, anotherFavoriteMovie]);

      expect(getFavoriteMoviesFromStorage()).toEqual({
        success: true,
        favorites: [favoriteMovie, anotherFavoriteMovie],
        error: null,
      });
    });

    it("should ignore invalid favorite movies", () => {
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

      expect(getFavoriteMoviesFromStorage()).toEqual({
        success: true,
        favorites: [favoriteMovie],
        error: null,
      });
    });

    it("should return invalid data error when stored payload is not an array", () => {
      saveFavoritesToStorage({ favorites: [favoriteMovie] });

      expect(getFavoriteMoviesFromStorage()).toEqual({
        success: false,
        favorites: [],
        error: {
          title: "Invalid Data.",
          message: "The saved favorites data is invalid.",
          code: "INVALID_DATA",
        },
      });
    });

    it("should deduplicate favorite movies by ID preserving the last value", () => {
      saveFavoritesToStorage([
        favoriteMovie,
        anotherFavoriteMovie,
        updatedFavoriteMovie,
      ]);

      expect(getFavoriteMoviesFromStorage()).toEqual({
        success: true,
        favorites: [updatedFavoriteMovie, anotherFavoriteMovie],
        error: null,
      });
    });

    it("should return invalid data error and log error when stored JSON is invalid", () => {
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => undefined);

      window.localStorage.setItem(
        LOCAL_STORAGE_KEYS.favorites,
        "{invalid-json",
      );

      expect(getFavoriteMoviesFromStorage()).toEqual({
        success: false,
        favorites: [],
        error: {
          title: "Invalid data",
          message: "The saved favorites data could not be understood.",
          code: "INVALID_DATA",
        },
      });
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          "[CineList]: Unable to read favorites movies from localStorage",
        ),
        expect.any(SyntaxError),
      );
    });
  });

  describe("saveFavoriteMoviesToStorage", () => {
    it("should save favorite movies to localStorage", () => {
      const favorites = [favoriteMovie, anotherFavoriteMovie];

      expect(saveFavoriteMoviesToStorage(favorites)).toEqual({
        success: true,
        error: null,
      });
      expect(getStoredFavorites()).toEqual(favorites);
    });

    it("should return write error and log error when localStorage save fails", () => {
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => undefined);
      vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
        throw new Error("Storage is full");
      });

      expect(saveFavoriteMoviesToStorage([favoriteMovie])).toEqual({
        success: false,
        error: {
          title: "Unable to save favorites movies.",
          message: "Your favorites could not be saved. Please try again later.",
          code: "WRITE_FAILED",
        },
      });
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          "[CineList]: Unable to save favorites movies to localStorage.",
        ),
        expect.any(Error),
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
});
