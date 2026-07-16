import { tmdbFetch } from "./apiRequest";
import type { ApiError } from "@/types/errors";
import { TMDB_CONFIG, TMDB_ENDPOINTS } from "@/utils/constants";
import type { CastMember, Movie, MovieDetails } from "@/types/movies-protocol";
import type {
  GetMovieDetailsResponse,
  GetPopularMoviesResponse,
  TmdbCastMember,
  TmdbMovieSummary,
} from "@/types/api-protocol";

function assertApiKeyConfigured(): void {
  const apiKey = TMDB_CONFIG.apiKey.trim();

  if (apiKey && apiKey !== "your_tmdb_api_key_here") {
    return;
  }

  throw {
    title: "Configuration error",
    message: "Set VITE_TMDB_API_KEY before loading movie data.",
    code: "CONFIGURATION_ERROR",
    status: 401,
  } satisfies ApiError;
}
function mapCastMember(castMember: TmdbCastMember): CastMember {
  return {
    id: castMember.id,
    name: castMember.name,
    character: castMember.character,
    profilePath: castMember.profile_path,
  };
}

function mapPopularMovie(movie: TmdbMovieSummary): Movie {
  return {
    id: movie.id,
    title: movie.title,
    overview: movie.overview,
    voteCount: movie.vote_count,
    popularity: movie.popularity,
    voteAverage: movie.vote_average,
    releaseDate: movie.release_date,
    posterPath: movie.poster_path,
    backdropPath: movie.backdrop_path,
  };
}

function mapMovieDetails(movie: GetMovieDetailsResponse): MovieDetails {
  return {
    id: movie.id,
    title: movie.title,
    adult: movie.adult,
    status: movie.status,
    genres: movie.genres,
    budget: movie.budget,
    revenue: movie.revenue,
    runtime: movie.runtime,
    overview: movie.overview,
    voteCount: movie.vote_count,
    popularity: movie.popularity,
    voteAverage: movie.vote_average,
    releaseDate: movie.release_date,
    posterPath: movie.poster_path,
    backdropPath: movie.backdrop_path,
    cast:
      movie.credits?.cast
        .sort((first, second) => first.order - second.order)
        .slice(0, 10)
        .map(mapCastMember) ?? [],
  };
}

export async function getPopularMovies(page: number = 1): Promise<Movie[]> {
  assertApiKeyConfigured();

  const response = await tmdbFetch<GetPopularMoviesResponse>(
    TMDB_ENDPOINTS.popularMovies,
    {
      params: {
        page: page,
      },
    },
  );

  return response.results.map(mapPopularMovie);
}

export async function getMovieDetails(movieID: number): Promise<MovieDetails> {
  if (!Number.isInteger(movieID) || movieID <= 0) {
    throw {
      title: "Invalid movie",
      message: "Movie IDs must be positive numbers.",
      code: "INVALID_MOVIE_ID",
    } satisfies ApiError;
  }

  assertApiKeyConfigured();

  const response = await tmdbFetch<GetMovieDetailsResponse>(
    TMDB_ENDPOINTS.movieDetails(movieID),
    {
      params: {
        append_to_response: "credits",
      },
    },
  );

  return mapMovieDetails(response);
}
