import { useQuery } from "@tanstack/react-query";

import type { Movie } from "@/types/movies-protocol";
import type { ApiError } from "@/types/api-protocol";
import { getPopularMovies } from "@/services/tmdbApi";
import { QUERY_KEYS, QUERY_STALE_TIMES_MS } from "@/utils/constants";

export function usePopularMovies() {
  return useQuery<Movie[], ApiError>({
    queryKey: QUERY_KEYS.popularMovies,
    queryFn: () => getPopularMovies(),
    staleTime: QUERY_STALE_TIMES_MS,
  });
}
