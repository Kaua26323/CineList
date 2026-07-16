export type { ApiError, ApiErrorCode } from "./errors";

export interface TmdbGenre {
  id: number;
  name: string;
}

export interface TmdbMovieSummary {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  popularity: number;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
}

export interface GetPopularMoviesResponse {
  page: number;
  results: TmdbMovieSummary[];
  total_pages: number;
  total_results: number;
}

export interface TmdbCastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface TmdbCredits {
  cast: TmdbCastMember[];
}

export interface GetMovieDetailsResponse {
  id: number;
  title: string;
  adult: boolean;
  budget: number;
  status: string;
  revenue: number;
  overview: string;
  popularity: number;
  vote_count: number;
  vote_average: number;
  release_date: string;
  genres: TmdbGenre[];
  credits?: TmdbCredits;
  runtime: number | null;
  cast?: TmdbCastMember[];
  poster_path: string | null;
  backdrop_path: string | null;
}
