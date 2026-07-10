export const TMDB_CONFIG_KEYS = {
  apiKey: "VITE_TMDB_API_KEY",
  baseUrl: "VITE_TMDB_BASE_URL",
  imageBaseUrl: "VITE_TMDB_IMAGE_BASE_URL",
} as const;

export const DEFAULT_TMDB_BASE_URL = "https://api.themoviedb.org/3";
export const DEFAULT_TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";
export const TMDB_API_KEY_QUERY_PARAM = "api_key";
export const TMDB_LANGUAGE = "en-US";
export const TMDB_CAST_LIMIT = 10;

export const TMDB_PATHS = {
  popularMovies: "/movie/popular",
  movieDetails: (movieId: number) => `/movie/${movieId}`,
} as const;

export const MOVIE_QUERY_KEYS = {
  popular: ["movies", "popular"] as const,
  details: (movieId: number) => ["movies", "details", movieId] as const,
} as const;

export const FAVORITES_STORAGE_KEY = "cinelist:favorites";
export const FALLBACK_MOVIE_TITLE = "Untitled movie";
