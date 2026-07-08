import { LOCAL_STORAGE_KEYS } from "@/utils/constants";
import type { FavoriteMovie, MovieGenre } from "@/types/movies-protocol";

function isBrowserStorageAvailable(): boolean {
  return (
    typeof window !== "undefined" && typeof window.localStorage !== "undefined"
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function isMovieGenre(value: unknown): value is MovieGenre {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === "number" &&
    Number.isInteger(value.id) &&
    typeof value.name === "string"
  );
}

function isFavoriteMovie(value: unknown): value is FavoriteMovie {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === "number" &&
    Number.isInteger(value.id) &&
    value.id > 0 &&
    typeof value.title === "string" &&
    value.title.trim().length > 0 &&
    typeof value.voteAverage === "number" &&
    Array.isArray(value.genres) &&
    value.genres.every(isMovieGenre) &&
    (typeof value.runtime === "number" || value.runtime === null) &&
    (typeof value.posterPath === "string" || value.posterPath === null)
  );
}

function logStorageError(message: string, error: unknown): void {
  console.error(`[CineList]: ${message} - ${error}`);
}

export function getFavoritesMoviesFromStorage(): FavoriteMovie[] {
  if (!isBrowserStorageAvailable()) {
    return [];
  }

  try {
    const storage = window.localStorage.getItem(LOCAL_STORAGE_KEYS.favorites);

    if (!storage) {
      return [];
    }

    const parsedStorage: unknown = JSON.parse(storage);

    if (!Array.isArray(parsedStorage)) {
      return [];
    }

    const favoritesById = new Map<number, FavoriteMovie>();

    parsedStorage.filter(isFavoriteMovie).forEach((movie) => {
      favoritesById.set(movie.id, movie);
    });

    return Array.from(favoritesById.values());
  } catch (err) {
    logStorageError("Unable to read favorites movies from localStorage", err);
    return [];
  }
}

export function saveFavoriteMovieToStorage(
  FavoritesMovies: FavoriteMovie[],
): FavoriteMovie[] {
  if (!isBrowserStorageAvailable()) {
    return FavoritesMovies;
  }

  try {
    window.localStorage.setItem(
      LOCAL_STORAGE_KEYS.favorites,
      JSON.stringify(FavoritesMovies),
    );
  } catch (err) {
    logStorageError("Unable to save favorites movies to localStorage.", err);
  }

  return FavoritesMovies;
}

export function addFavoriteToStorage(newMovie: FavoriteMovie): FavoriteMovie[] {
  const currentMovies = getFavoritesMoviesFromStorage();

  const newList = [
    newMovie,
    ...currentMovies.filter((movie) => movie.id !== newMovie.id),
  ];

  return saveFavoriteMovieToStorage(newList);
}

export function removeFavoriteFromStorage(movieId: number): FavoriteMovie[] {
  const removedMovie = getFavoritesMoviesFromStorage().filter(
    (movie) => movie.id !== movieId,
  );
  return saveFavoriteMovieToStorage(removedMovie);
}

export function isFavorited(movieId: number): boolean {
  return getFavoritesMoviesFromStorage().some((movie) => movie.id === movieId);
}
