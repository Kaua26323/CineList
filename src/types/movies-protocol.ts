export interface MovieGenre {
  id: number;
  name: string;
}

export interface Movie {
  id: number;
  title: string;
  overview: string;
  voteCount: number;
  popularity: number;
  releaseDate: string;
  voteAverage: number;
  posterPath: string | null;
  backdropPath: string | null;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profilePath: string | null;
}

export interface MovieDetails {
  id: number;
  title: string;
  adult: boolean;
  budget: number;
  status: string;
  revenue: number;
  overview: string;
  popularity: number;
  genreIds?: number[];
  cast?: CastMember[];
  voteCount: number;
  voteAverage: number;
  genres: MovieGenre[];
  runtime: number | null;
  posterPath: string | null;
  releaseDate: string | null;
  backdropPath: string | null;
}

export interface FavoriteMovie {
  id: number;
  title: string;
  voteAverage: number;
  genres: MovieGenre[];
  releaseDate?: string;
  runtime: number | null;
  posterPath: string | null;
}
