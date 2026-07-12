import { createStorageError, type AppError } from "../types/errors";
import type { FavoriteMovie } from "../types/movies";
import { FAVORITES_STORAGE_KEY } from "../utils/constants";

export interface StorageReadResult {
  favorites: FavoriteMovie[];
  error: AppError | null;
}

export type StorageWriteResult =
  | { ok: true }
  | { ok: false; error: AppError };

export type FavoritesStorageEventParseResult =
  | { status: "ignored"; favorites: null; error: null }
  | { status: "synced"; favorites: FavoriteMovie[]; error: null }
  | { status: "failed"; favorites: null; error: AppError };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === "string";
}

function isNullableFiniteNumber(value: unknown): value is number | null {
  return value === null ||
    (typeof value === "number" && Number.isFinite(value));
}

export function validateFavoriteMovie(value: unknown): FavoriteMovie | null {
  if (
    !isRecord(value) ||
    typeof value.id !== "number" ||
    !Number.isInteger(value.id) ||
    value.id <= 0 ||
    typeof value.title !== "string" ||
    !value.title.trim() ||
    !("posterPath" in value) ||
    !isNullableString(value.posterPath) ||
    !("releaseYear" in value) ||
    !isNullableString(value.releaseYear) ||
    !("voteAverage" in value) ||
    !isNullableFiniteNumber(value.voteAverage) ||
    !("runtimeMinutes" in value) ||
    !isNullableFiniteNumber(value.runtimeMinutes) ||
    !Array.isArray(value.genres) ||
    !value.genres.every((genre) => typeof genre === "string")
  ) {
    return null;
  }

  const releaseYear = value.releaseYear?.trim() || null;
  if (releaseYear !== null && !/^\d{4}$/.test(releaseYear)) {
    return null;
  }

  if (value.runtimeMinutes !== null && value.runtimeMinutes <= 0) {
    return null;
  }

  return {
    id: value.id,
    title: value.title.trim(),
    posterPath: value.posterPath?.trim() || null,
    releaseYear,
    voteAverage: value.voteAverage,
    runtimeMinutes: value.runtimeMinutes,
    genres: Array.from(
      new Set(value.genres.map((genre) => genre.trim()).filter(Boolean)),
    ),
  };
}

export function validateFavorites(value: unknown): FavoriteMovie[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const seenIds = new Set<number>();
  const favorites: FavoriteMovie[] = [];

  value.forEach((item) => {
    const favorite = validateFavoriteMovie(item);
    if (favorite && !seenIds.has(favorite.id)) {
      seenIds.add(favorite.id);
      favorites.push(favorite);
    }
  });

  return favorites;
}

export function readFavoritesResult(): StorageReadResult {
  try {
    const storedValue = window.localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (storedValue === null) {
      return { favorites: [], error: null };
    }

    const parsed: unknown = JSON.parse(storedValue);
    if (!Array.isArray(parsed)) {
      return {
        favorites: [],
        error: createStorageError(
          "Saved favorites couldn't be read, so CineList started with a safe empty list.",
          { code: "invalid-data" },
        ),
      };
    }

    return { favorites: validateFavorites(parsed), error: null };
  } catch (error) {
    return {
      favorites: [],
      error: createStorageError(
        "Saved favorites couldn't be read, so CineList started with a safe empty list.",
        { code: "read-failed", cause: error },
      ),
    };
  }
}

export function readFavorites(): FavoriteMovie[] {
  return readFavoritesResult().favorites;
}

export function parseFavoritesStorageEvent(
  event: Pick<StorageEvent, "key" | "newValue">,
): FavoritesStorageEventParseResult {
  if (event.key === null && event.newValue === null) {
    return { status: "synced", favorites: [], error: null };
  }

  if (event.key !== FAVORITES_STORAGE_KEY) {
    return { status: "ignored", favorites: null, error: null };
  }

  if (event.newValue === null) {
    return { status: "synced", favorites: [], error: null };
  }

  try {
    const parsed: unknown = JSON.parse(event.newValue);
    if (!Array.isArray(parsed)) {
      return {
        status: "failed",
        favorites: null,
        error: createStorageError(
          "Favorites changed in another tab, but the saved data couldn't be read. This tab kept its last working list.",
          { code: "sync-invalid-data" },
        ),
      };
    }

    return {
      status: "synced",
      favorites: validateFavorites(parsed),
      error: null,
    };
  } catch (error) {
    return {
      status: "failed",
      favorites: null,
      error: createStorageError(
        "Favorites changed in another tab, but the saved data couldn't be read. This tab kept its last working list.",
        { code: "sync-read-failed", cause: error },
      ),
    };
  }
}

export function writeFavorites(favorites: FavoriteMovie[]): StorageWriteResult {
  const validatedFavorites = validateFavorites(favorites);

  try {
    window.localStorage.setItem(
      FAVORITES_STORAGE_KEY,
      JSON.stringify(validatedFavorites),
    );
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: createStorageError(
        "Favorites couldn't be saved in this browser. Your current list is still available until you leave this tab.",
        { code: "write-failed", cause: error },
      ),
    };
  }
}
