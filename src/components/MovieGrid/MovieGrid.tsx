import type { MovieSummary } from "../../types/movies";
import { MovieCard } from "../MovieCard/MovieCard";
import styles from "./MovieGrid.module.css";

export interface MovieGridProps {
  movies: MovieSummary[];
  isFavorited?: (movieId: number) => boolean;
}

export function MovieGrid({ movies, isFavorited }: MovieGridProps) {
  return (
    <div className={styles.grid} aria-label="Movie catalog">
      {movies.map((movie) => (
        <MovieCard
          key={movie.id}
          movie={movie}
          isFavorited={isFavorited?.(movie.id) ?? false}
        />
      ))}
    </div>
  );
}
