import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppError, createNotFoundError } from "../../types/errors";
import type { TmdbMovieDetailsDto } from "../../types/movies";
import { tmdbRequest } from "./client";
import { getMovieDetails, getPopularMovies } from "./movies";
import {
  normalizeMovieDetails,
  normalizeMovieSummary,
  toFavoriteMovie,
} from "./normalizers";

vi.mock("./client", () => ({
  tmdbRequest: vi.fn(),
}));

const tmdbRequestMock = vi.mocked(tmdbRequest);

const detailsDto: TmdbMovieDetailsDto = {
  id: 42,
  title: "The Answer",
  poster_path: "/answer.jpg",
  release_date: "2025-04-02",
  vote_average: 8.4,
  overview: "A meaningful overview.",
  genres: [{ id: 1, name: "Science Fiction" }],
  runtime: 121,
  credits: {
    cast: [
      {
        id: 7,
        name: "Alex Actor",
        character: "The Hero",
        profile_path: "/alex.jpg",
      },
    ],
  },
};

describe("TMDB movie services and normalizers", () => {
  beforeEach(() => {
    tmdbRequestMock.mockReset();
  });

  it("normalizes popular movies and skips records with invalid IDs", async () => {
    tmdbRequestMock.mockResolvedValue({
      page: 1,
      results: [
        {
          id: 42,
          title: "The Answer",
          poster_path: "/answer.jpg",
          release_date: "2025-04-02",
          vote_average: 8.4,
          overview: "A meaningful overview.",
        },
        { id: 0, title: "Invalid", poster_path: null },
      ],
    });

    await expect(getPopularMovies()).resolves.toEqual([
      expect.objectContaining({
        id: 42,
        title: "The Answer",
        releaseYear: "2025",
      }),
    ]);
  });

  it("returns an empty array for an empty valid popular response", async () => {
    tmdbRequestMock.mockResolvedValue({ page: 1, results: [] });

    await expect(getPopularMovies()).resolves.toEqual([]);
  });

  it("fetches and normalizes movie details with credits", async () => {
    tmdbRequestMock.mockResolvedValue(detailsDto);

    await expect(getMovieDetails(42)).resolves.toEqual(
      expect.objectContaining({
        id: 42,
        title: "The Answer",
        genres: ["Science Fiction"],
        runtimeMinutes: 121,
        cast: [
          expect.objectContaining({ name: "Alex Actor", character: "The Hero" }),
        ],
      }),
    );
    expect(tmdbRequestMock).toHaveBeenCalledWith("/movie/42", {
      append_to_response: "credits",
    });
  });

  it.each([0, -1, 1.5, Number.NaN])(
    "rejects invalid movie ID %s before requesting",
    async (movieId) => {
      await expect(getMovieDetails(movieId)).rejects.toEqual(
        expect.objectContaining({ kind: "invalid-input" }),
      );
      expect(tmdbRequestMock).not.toHaveBeenCalled();
    },
  );

  it("preserves a not-found AppError from the client", async () => {
    tmdbRequestMock.mockRejectedValue(
      createNotFoundError("That movie is unavailable.", { status: 404 }),
    );

    await expect(getMovieDetails(404)).rejects.toEqual(
      expect.objectContaining({ kind: "not-found", status: 404 }),
    );
  });

  it("uses safe fallbacks for missing optional movie fields", () => {
    const normalized = normalizeMovieDetails(
      {
        id: 42,
        poster_path: null,
        release_date: "not-a-date",
        runtime: 0,
        genres: [{ id: 1, name: " " }],
        credits: { cast: [{ id: 0, name: "" }] },
      },
      42,
    );

    expect(normalized).toEqual({
      id: 42,
      title: "Untitled movie",
      posterPath: null,
      releaseDate: null,
      releaseYear: null,
      voteAverage: null,
      overview: null,
      genres: [],
      runtimeMinutes: null,
      cast: [],
    });
  });

  it("normalizes summaries and converts details to a favorite snapshot", () => {
    expect(
      normalizeMovieSummary({
        id: 9,
        name: "Fallback title",
        poster_path: null,
      }),
    ).toEqual(expect.objectContaining({ title: "Fallback title" }));

    expect(toFavoriteMovie(normalizeMovieDetails(detailsDto, 42))).toEqual({
      id: 42,
      title: "The Answer",
      posterPath: "/answer.jpg",
      releaseYear: "2025",
      voteAverage: 8.4,
      runtimeMinutes: 121,
      genres: ["Science Fiction"],
    });
  });

  it("rejects malformed detail payloads with a user-friendly AppError", () => {
    expect(() => normalizeMovieDetails({ id: 1 }, 42)).toThrowError(AppError);
  });
});
