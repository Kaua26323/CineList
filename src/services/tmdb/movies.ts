import { createInvalidInputError, toAppError } from "../../types/errors";
import type { MovieDetails, MovieSummary } from "../../types/movies";
import { TMDB_PATHS } from "../../utils/constants";
import { tmdbRequest } from "./client";
import {
  normalizeMovieDetails,
  normalizePopularMoviesResponse,
} from "./normalizers";

export async function getPopularMovies(): Promise<MovieSummary[]> {
  try {
    const response = await tmdbRequest<unknown>(TMDB_PATHS.popularMovies);
    return normalizePopularMoviesResponse(response);
  } catch (error) {
    throw toAppError(error, "Popular movies couldn't be loaded. Please try again.");
  }
}

export async function getMovieDetails(movieId: number): Promise<MovieDetails> {
  if (!Number.isInteger(movieId) || movieId <= 0) {
    throw createInvalidInputError();
  }

  try {
    const response = await tmdbRequest<unknown>(TMDB_PATHS.movieDetails(movieId), {
      append_to_response: "credits",
    });
    return normalizeMovieDetails(response, movieId);
  } catch (error) {
    throw toAppError(error, "Movie details couldn't be loaded. Please try again.");
  }
}
