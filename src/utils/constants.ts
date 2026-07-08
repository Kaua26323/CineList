import type { MovieDetails, FavoriteMovie } from "@/types/movies-protocol";

export const DEFAULT_LANGUAGE = "en-US";
export const DEFAULT_TMDB_BASE_URL = "https://api.themoviedb.org/3";
export const DEFAULT_TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

export const TMDB_CONFIG = {
  apiKey: import.meta.env.VITE_TMDB_API_KEY ?? "",
  baseUrl: import.meta.env.VITE_TMDB_BASE_URL ?? DEFAULT_TMDB_BASE_URL,
  imageBaseUrl:
    import.meta.env.VITE_TMDB_IMAGE_BASE_URL ?? DEFAULT_TMDB_IMAGE_BASE_URL,
} as const;

export const TMDB_ENDPOINTS = {
  popularMovies: "/movie/popular",
  movieDetails: (movieId: number) => `/movie/${movieId}`,
} as const;

export const LOCAL_STORAGE_KEYS = {
  favorites: "cinelist_favorites",
} as const;

export const QUERY_KEYS = {
  popularMovies: ["movies", "popular"] as const,
  movieDetails: (movieId: number) => ["movies", "details", movieId] as const,
} as const;

export function createFavoriteMovie(movie: MovieDetails): FavoriteMovie {
  return {
    id: movie.id,
    title: movie.title,
    genres: movie.genres || [],
    posterPath: movie.posterPath,
    voteAverage: movie.voteAverage,
    runtime: movie.runtime || null,
    releaseDate: movie.releaseDate || undefined,
  };
}

export function getFormattedRuntime(
  runtime: number | null | undefined,
): string {
  if (!runtime) {
    return "Runtime unavailable";
  }

  const hours = Math.floor(runtime / 60);
  const min = runtime % 60;

  if (hours === 0) {
    return `${min}m`;
  }

  if (min === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${min}m`;
}

export function getMovieYear(releaseDate: string | undefined): string {
  return releaseDate ? releaseDate.slice(0, 4) : "Unknown year";
}

export const QUERY_STALE_TIMES_MS = 5 * 60 * 1000;
export const QUERY_CACHE_TIMES_MS = 10 * 60 * 1000;

export const IMAGE_SIZES = {
  posterCard: "w500",
  posterThumbnail: "w342",
  profile: "w185",
} as const;

export function buildTmdImageUrl(
  path: string | null | undefined,
  size: string,
): string | null {
  if (!path) {
    return null;
  }

  if (path.startsWith("http")) {
    return path;
  }

  return `${TMDB_CONFIG.imageBaseUrl}/${size}${path}`;
}

export function buildPosterUrl(
  posterPath: string | null | undefined,
  size = IMAGE_SIZES.posterCard,
): string | null {
  return buildTmdImageUrl(posterPath, size);
}

export function buildProfileUrl(
  profilePath: string | null | undefined,
  size = IMAGE_SIZES.profile,
): string | null {
  return buildTmdImageUrl(profilePath, size);
}
