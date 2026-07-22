import { useLocation, useNavigate } from "react-router";

import styles from "./home.module.css";
import type { ApiError } from "@/types/errors";
import { MovieCard } from "@/components/MovieCard";
import { usePopularMovies } from "@/hooks/usePopularMovies";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorMessage } from "@/components/Errors/ErrorMessage";
import { useFavoritesContext } from "@/hooks/useFavoritesContext";

function getHomeError(error: ApiError | null) {
  return {
    title: error?.title ?? "Error loading movies",
    message:
      error?.message ?? "Unable to load popular movies. Please try again.",
    code: error?.code,
  };
}

export function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isFavorited } = useFavoritesContext();
  const {
    data: movies = [],
    error,
    isError,
    isLoading = true,
    refetch,
  } = usePopularMovies();

  const handleMovieClick = (movieId: number): void => {
    navigate(`/movie/${movieId}`, { state: { from: location.pathname } });
  };

  const handleRetry = (): void => {
    void refetch();
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading movies..." />;
  }

  if (isError) {
    return <ErrorMessage error={getHomeError(error)} onRetry={handleRetry} />;
  }

  if (movies.length === 0) {
    return (
      <ErrorMessage
        error={{
          title: "No movies found",
          message: "We could not find popular movies to show right now",
          code: "EMPTY_MOVIES",
        }}
        onRetry={handleRetry}
      />
    );
  }

  return (
    <main className={styles.container}>
      <div className={styles.header}>
        <h1 id="home-title" className={styles.title}>
          Popular Movies
        </h1>
      </div>
      <section className={styles.movieGrid}>
        {movies.length > 0 &&
          movies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              isFavorited={isFavorited(movie.id)}
              onMovieClick={handleMovieClick}
            />
          ))}
      </section>
    </main>
  );
}
