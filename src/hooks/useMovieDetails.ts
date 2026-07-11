import { useQuery } from "@tanstack/react-query";

import { getMovieDetails } from "../services/tmdb/movies";
import type { AppError } from "../types/errors";
import type { MovieDetails } from "../types/movies";
import { MOVIE_QUERY_KEYS } from "../utils/constants";

export function useMovieDetails(movieId: number | null) {
  return useQuery<MovieDetails, AppError>({
    queryKey: MOVIE_QUERY_KEYS.details(movieId ?? 0),
    queryFn: () => getMovieDetails(movieId ?? 0),
    enabled: movieId !== null,
    retry: (failureCount, error) => error.recoverable && failureCount < 1,
  });
}
