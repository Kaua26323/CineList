import { useQuery } from "@tanstack/react-query";

import type { ApiError } from "@/types/errors";
import type { MovieDetails } from "@/types/movies-protocol";

import { getMovieDetails } from "@/services/tmdbApi";
import { QUERY_KEYS, QUERY_STALE_TIMES_MS } from "@/utils/constants";

export function useMovieDetails(movieId: number) {
  return useQuery<MovieDetails, ApiError>({
    queryKey: QUERY_KEYS.movieDetails(movieId),
    queryFn: () => getMovieDetails(movieId),
    enabled: Number.isInteger(movieId) && movieId > 0,
    staleTime: QUERY_STALE_TIMES_MS,
  });
}
