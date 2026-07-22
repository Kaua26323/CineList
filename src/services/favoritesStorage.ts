import { LOCAL_STORAGE_KEYS } from "@/utils/constants";
import type { FavoriteMovie, MovieGenre } from "@/types/movies-protocol";
import type {
  StorageError,
  ReadStorageResult,
  WriteStorageResult,
} from "@/types/errors";

function getBrowserStorage(): Storage | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && !Array.isArray(value) && typeof value === "object";
}

function isMovieGenre(value: unknown): value is MovieGenre {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === "number" &&
    Number.isInteger(value.id) &&
    value.id > 0 &&
    typeof value.name === "string" &&
    value.name.trim().length > 0
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
    Number.isFinite(value.voteAverage) &&
    value.voteAverage >= 0 &&
    value.voteAverage <= 10 &&
    Array.isArray(value.genres) &&
    value.genres.every(isMovieGenre) &&
    ((typeof value.releaseDate === "string" &&
      value.releaseDate.trim().length > 0) ||
      value.releaseDate === null) &&
    ((typeof value.runtime === "number" &&
      Number.isInteger(value.runtime) &&
      value.runtime > 0) ||
      value.runtime === null) &&
    ((typeof value.posterPath === "string" &&
      value.posterPath.trim().length > 0) ||
      value.posterPath === null)
  );
}

function logStorageError(message: string, error: unknown): void {
  console.error(`[CineList]: ${message}`, error);
}

export function getFavoriteMoviesFromStorage(): ReadStorageResult {
  const storage = getBrowserStorage();

  if (!storage) {
    return {
      success: false,
      favorites: [],
      error: {
        title: "Storage is unavailable.",
        message: "Browser storage is unavailable.",
        code: "STORAGE_UNAVAILABLE",
      },
    };
  }

  try {
    const storedFavorites = storage.getItem(LOCAL_STORAGE_KEYS.favorites);

    if (!storedFavorites) {
      return {
        success: true,
        favorites: [],
        error: null,
      };
    }

    const parsedStorage: unknown = JSON.parse(storedFavorites);

    if (!Array.isArray(parsedStorage)) {
      return {
        success: false,
        favorites: [],
        error: {
          title: "Invalid Data.",
          message: "The saved favorites data is invalid.",
          code: "INVALID_DATA",
        },
      };
    }

    const favoritesById = new Map<number, FavoriteMovie>();

    for (const movie of parsedStorage) {
      if (isFavoriteMovie(movie)) {
        favoritesById.set(movie.id, movie);
      }
    }

    return {
      success: true,
      favorites: Array.from(favoritesById.values()),
      error: null,
    };
  } catch (err) {
    logStorageError("Unable to read favorites movies from localStorage", err);

    if (err instanceof SyntaxError) {
      return {
        success: false,
        favorites: [],
        error: {
          title: "Invalid data",
          message: "The saved favorites data could not be understood.",
          code: "INVALID_DATA",
        },
      };
    }

    return {
      success: false,
      favorites: [],
      error: {
        title: "Unable to read favorites movies.",
        message: "We couldn't load your saved favorites.",
        code: "READ_FAILED",
      },
    };
  }
}

export function saveFavoriteMoviesToStorage(
  favoriteMovies: FavoriteMovie[],
): WriteStorageResult {
  const storage = getBrowserStorage();

  if (!storage) {
    return {
      success: false,
      error: {
        title: "Storage is unavailable.",
        message: "Browser storage is unavailable.",
        code: "STORAGE_UNAVAILABLE",
      },
    };
  }

  try {
    storage.setItem(
      LOCAL_STORAGE_KEYS.favorites,
      JSON.stringify(favoriteMovies),
    );

    return {
      success: true,
      error: null,
    };
  } catch (err) {
    logStorageError("Unable to save favorites movies to localStorage.", err);

    if (err instanceof DOMException && err.name === "QuotaExceededError") {
      return {
        success: false,
        error: {
          title: "Storage quota exceeded.",
          message:
            "Local storage is full. Please free up space by clearing your browser's site data",
          code: "STORAGE_FULL",
        },
      };
    }
    return {
      success: false,
      error: {
        title: "Unable to save favorites movies.",
        message: "Your favorites could not be saved. Please try again later.",
        code: "WRITE_FAILED",
      },
    };
  }
}

export function addFavoriteToStorage(
  newMovie: FavoriteMovie,
): FavoriteMovie[] | StorageError {
  const { success, favorites, error } = getFavoriteMoviesFromStorage();

  if (!success) {
    return error;
  }

  const newList = [
    newMovie,
    ...favorites.filter((movie) => movie.id !== newMovie.id),
  ];

  const saveAction = saveFavoriteMoviesToStorage(newList);
  if (!saveAction.success) {
    return saveAction.error;
  }

  return newList;
}

export function removeFavoriteFromStorage(
  movieId: number,
): FavoriteMovie[] | StorageError {
  const { success, favorites, error } = getFavoriteMoviesFromStorage();

  if (!success) {
    return error;
  }

  const removedMovie = favorites.filter((movie) => movie.id !== movieId);

  const removeAction = saveFavoriteMoviesToStorage(removedMovie);
  if (!removeAction.success) {
    return removeAction.error;
  }

  return removedMovie;
}
