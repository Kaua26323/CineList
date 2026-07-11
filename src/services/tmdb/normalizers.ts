import { createApiError } from "../../types/errors";
import type {
  CastMember,
  FavoriteMovie,
  MovieDetails,
  MovieSummary,
  TmdbCastMemberDto,
  TmdbMovieDetailsDto,
  TmdbMovieSummaryDto,
} from "../../types/movies";
import { FALLBACK_MOVIE_TITLE, TMDB_CAST_LIMIT } from "../../utils/constants";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isPositiveInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value > 0;
}

function nonEmptyString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  return normalized ? normalized : null;
}

function nullablePath(value: unknown): string | null {
  return nonEmptyString(value);
}

function finiteNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function normalizeReleaseDate(value: unknown): string | null {
  const releaseDate = nonEmptyString(value);
  if (!releaseDate || !/^\d{4}-\d{2}-\d{2}$/.test(releaseDate)) {
    return null;
  }

  const parsed = new Date(`${releaseDate}T00:00:00Z`);
  return Number.isNaN(parsed.getTime()) ||
    parsed.toISOString().slice(0, 10) !== releaseDate
    ? null
    : releaseDate;
}

function normalizeTitle(value: Record<string, unknown>): string {
  return (
    nonEmptyString(value.title) ??
    nonEmptyString(value.name) ??
    FALLBACK_MOVIE_TITLE
  );
}

export function normalizeMovieSummary(value: unknown): MovieSummary | null {
  if (!isRecord(value) || !isPositiveInteger(value.id)) {
    return null;
  }

  const dto = value as unknown as TmdbMovieSummaryDto;
  const releaseDate = normalizeReleaseDate(dto.release_date);

  return {
    id: dto.id,
    title: normalizeTitle(value),
    posterPath: nullablePath(dto.poster_path),
    releaseDate,
    releaseYear: releaseDate?.slice(0, 4) ?? null,
    voteAverage: finiteNumber(dto.vote_average),
    overview: nonEmptyString(dto.overview),
  };
}

function normalizeCastMember(value: unknown): CastMember | null {
  if (!isRecord(value) || !isPositiveInteger(value.id)) {
    return null;
  }

  const dto = value as unknown as TmdbCastMemberDto;
  const name = nonEmptyString(dto.name);
  if (!name) {
    return null;
  }

  return {
    id: dto.id,
    name,
    character: nonEmptyString(dto.character),
    profilePath: nullablePath(dto.profile_path),
  };
}

export function normalizeMovieDetails(
  value: unknown,
  requestedMovieId: number,
): MovieDetails {
  if (
    !isRecord(value) ||
    !isPositiveInteger(value.id) ||
    value.id !== requestedMovieId
  ) {
    throw createApiError(
      "The movie service returned incomplete details for this movie.",
      { code: "invalid-movie-details" },
    );
  }

  const dto = value as unknown as TmdbMovieDetailsDto;
  const summary = normalizeMovieSummary(value);
  if (!summary) {
    throw createApiError(
      "The movie service returned incomplete details for this movie.",
      { code: "invalid-movie-details" },
    );
  }

  const genres = Array.isArray(dto.genres)
    ? Array.from(
        new Set(dto.genres.map((genre) => nonEmptyString(genre?.name)).filter(Boolean)),
      )
    : [];
  const cast = Array.isArray(dto.credits?.cast)
    ? dto.credits.cast
        .map(normalizeCastMember)
        .filter((member): member is CastMember => member !== null)
        .slice(0, TMDB_CAST_LIMIT)
    : [];
  const runtime = finiteNumber(dto.runtime);

  return {
    ...summary,
    genres: genres as string[],
    runtimeMinutes: runtime !== null && runtime > 0 ? runtime : null,
    cast,
  };
}

export function normalizePopularMoviesResponse(value: unknown): MovieSummary[] {
  if (!isRecord(value) || !Array.isArray(value.results)) {
    throw createApiError(
      "The movie service returned a list CineList couldn't read.",
      { code: "invalid-popular-response" },
    );
  }

  return value.results
    .map(normalizeMovieSummary)
    .filter((movie): movie is MovieSummary => movie !== null);
}

export function toFavoriteMovie(details: MovieDetails): FavoriteMovie {
  return {
    id: details.id,
    title: details.title,
    posterPath: details.posterPath,
    releaseYear: details.releaseYear,
    voteAverage: details.voteAverage,
    runtimeMinutes: details.runtimeMinutes,
    genres: [...details.genres],
  };
}
