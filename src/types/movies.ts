export interface TmdbPopularMoviesResponse {
  page: number;
  results: TmdbMovieSummaryDto[];
  total_pages?: number;
  total_results?: number;
}

export interface TmdbMovieSummaryDto {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  release_date?: string;
  vote_average?: number;
  overview?: string;
}

export interface TmdbGenreDto {
  id: number;
  name: string;
}

export interface TmdbCastMemberDto {
  id: number;
  name: string;
  character?: string;
  profile_path?: string | null;
}

export interface TmdbCreditsDto {
  cast?: TmdbCastMemberDto[];
}

export interface TmdbMovieDetailsDto {
  id: number;
  title?: string;
  poster_path: string | null;
  release_date?: string;
  vote_average?: number;
  overview?: string;
  genres?: TmdbGenreDto[];
  runtime?: number | null;
  credits?: TmdbCreditsDto;
}

export interface MovieSummary {
  id: number;
  title: string;
  posterPath: string | null;
  releaseDate: string | null;
  releaseYear: string | null;
  voteAverage: number | null;
  overview: string | null;
}

export interface CastMember {
  id: number;
  name: string;
  character: string | null;
  profilePath: string | null;
}

export interface MovieDetails extends MovieSummary {
  genres: string[];
  runtimeMinutes: number | null;
  cast: CastMember[];
}

export interface FavoriteMovie {
  id: number;
  title: string;
  posterPath: string | null;
  releaseYear: string | null;
  voteAverage: number | null;
  runtimeMinutes: number | null;
  genres: string[];
}

export interface FavoriteCollection {
  items: FavoriteMovie[];
  lastUpdatedAt: string | null;
}
