import { Film } from "lucide-react";

import { ErrorMessage } from "../components/ErrorMessage/ErrorMessage";
import { LoadingSpinner } from "../components/LoadingSpinner/LoadingSpinner";
import { MovieGrid } from "../components/MovieGrid/MovieGrid";
import { useFavoritesContext } from "../hooks/useFavoritesContext";
import { usePopularMovies } from "../hooks/usePopularMovies";
import { toAppError } from "../types/errors";
import styles from "./Home.module.css";

export function Home() {
  const popularMovies = usePopularMovies();
  const { isFavorited } = useFavoritesContext();

  if (popularMovies.isPending) {
    return <LoadingSpinner label="Loading popular movies…" size="large" />;
  }

  if (popularMovies.isError) {
    return (
      <ErrorMessage
        error={toAppError(popularMovies.error)}
        title="Popular movies couldn't be loaded"
        onRetry={() => void popularMovies.refetch()}
      />
    );
  }

  const movies = popularMovies.data ?? [];

  return (
    <section aria-labelledby="popular-movies-title">
      <div className={styles.heading}>
        <div>
          <p className={styles.eyebrow}>Discover</p>
          <h1 id="popular-movies-title">Popular movies</h1>
        </div>
        <p className={styles.intro}>
          Explore what audiences are watching, then open a movie to save it for
          later.
        </p>
      </div>

      {movies.length === 0 ? (
        <div className={styles.empty}>
          <Film size={36} aria-hidden="true" />
          <h2>No popular movies are available</h2>
          <p>Please check back later for fresh recommendations.</p>
        </div>
      ) : (
        <MovieGrid movies={movies} isFavorited={isFavorited} />
      )}
    </section>
  );
}
