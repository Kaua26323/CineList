import { useQuery } from "@tanstack/react-query";

import { getPopularMovies } from "../services/tmdb/movies";
import type { AppError } from "../types/errors";
import type { MovieSummary } from "../types/movies";
import { MOVIE_QUERY_KEYS } from "../utils/constants";

export function usePopularMovies() {
  return useQuery<MovieSummary[], AppError>({
    queryKey: MOVIE_QUERY_KEYS.popular,
    queryFn: getPopularMovies,
    retry: (failureCount, error) => error.recoverable && failureCount < 1,
  });
}
