import type { FavoriteMovie, MovieSummary } from "../../types/movies";
import { MovieCard } from "../MovieCard/MovieCard";
import styles from "./MovieGrid.module.css";

interface CatalogMovieGridProps {
  movies: MovieSummary[];
  mode?: "catalog";
  isFavorited?: (movieId: number) => boolean;
}

interface FavoriteMovieGridProps {
  movies: FavoriteMovie[];
  mode: "favorite";
}

export type MovieGridProps = CatalogMovieGridProps | FavoriteMovieGridProps;

export function MovieGrid(props: MovieGridProps) {
  if (props.mode === "favorite") {
    return (
      <div className={styles.grid} aria-label="Favorite movies">
        {props.movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} mode="favorite" />
        ))}
      </div>
    );
  }

  return (
    <div className={styles.grid} aria-label="Movie catalog">
      {props.movies.map((movie) => (
        <MovieCard
          key={movie.id}
          movie={movie}
          isFavorited={props.isFavorited?.(movie.id) ?? false}
        />
      ))}
    </div>
  );
}
