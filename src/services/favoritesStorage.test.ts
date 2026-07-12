import { describe, expect, it, vi } from "vitest";

import type { FavoriteMovie } from "../types/movies";
import { FAVORITES_STORAGE_KEY } from "../utils/constants";
import {
  parseFavoritesStorageEvent,
  readFavorites,
  readFavoritesResult,
  validateFavorites,
  writeFavorites,
} from "./favoritesStorage";

const favorite: FavoriteMovie = {
  id: 42,
  title: "The Answer",
  posterPath: "/answer.jpg",
  releaseYear: "2025",
  voteAverage: 8.4,
  runtimeMinutes: 121,
  genres: ["Science Fiction"],
};

describe("favorites storage", () => {
  it("returns an empty favorite list when storage has no value", () => {
    expect(readFavorites()).toEqual([]);
    expect(readFavoritesResult()).toEqual({ favorites: [], error: null });
  });

  it("recovers safely from malformed JSON and reports a storage warning", () => {
    window.localStorage.setItem("cinelist:favorites", "{not-json");

    expect(readFavoritesResult()).toEqual({
      favorites: [],
      error: expect.objectContaining({ kind: "storage", recoverable: true }),
    });
  });

  it("validates records and keeps only the first occurrence of a movie ID", () => {
    expect(
      validateFavorites([
        favorite,
        { ...favorite, title: "Duplicate" },
        { ...favorite, id: -1 },
        { id: 7, title: "Incomplete" },
      ]),
    ).toEqual([favorite]);
  });

  it("returns a typed error result when a storage write fails", () => {
    const setItemSpy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("Quota exceeded", "QuotaExceededError");
    });

    expect(writeFavorites([favorite])).toEqual({
      ok: false,
      error: expect.objectContaining({ kind: "storage", code: "write-failed" }),
    });
    setItemSpy.mockRestore();
  });

  it("persists a validated copy without mutating the caller's array", () => {
    const favorites = [favorite];

    expect(writeFavorites(favorites)).toEqual({ ok: true });
    expect(favorites).toEqual([favorite]);
    expect(JSON.parse(window.localStorage.getItem("cinelist:favorites") ?? "[]"))
      .toEqual([favorite]);
  });

  it("parses valid favorites from a storage event payload", () => {
    expect(
      parseFavoritesStorageEvent({
        key: FAVORITES_STORAGE_KEY,
        newValue: JSON.stringify([favorite]),
      }),
    ).toEqual({
      status: "synced",
      favorites: [favorite],
      error: null,
    });
  });

  it("ignores storage events for unrelated keys", () => {
    expect(
      parseFavoritesStorageEvent({
        key: "cinelist:other",
        newValue: JSON.stringify([favorite]),
      }),
    ).toEqual({
      status: "ignored",
      favorites: null,
      error: null,
    });
  });

  it("treats a removed favorites key as an empty synchronized list", () => {
    expect(
      parseFavoritesStorageEvent({
        key: FAVORITES_STORAGE_KEY,
        newValue: null,
      }),
    ).toEqual({
      status: "synced",
      favorites: [],
      error: null,
    });
  });

  it("recovers from malformed storage event payloads with a typed warning", () => {
    expect(
      parseFavoritesStorageEvent({
        key: FAVORITES_STORAGE_KEY,
        newValue: "{not-json",
      }),
    ).toEqual({
      status: "failed",
      favorites: null,
      error: expect.objectContaining({
        kind: "storage",
        code: "sync-read-failed",
      }),
    });
  });
});
