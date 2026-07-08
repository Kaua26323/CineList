import styles from "./moviedCard.module.css";
import { buildPosterUrl } from "@/utils/constants";

export interface MovieCardContent {
  id: number;
  title: string;
  posterPath: string | null;
}

interface MovieCardProps {
  isFavorited: boolean;
  movie: MovieCardContent;
  onMovieClick: (movieId: number) => void;
}

export function MovieCard({
  movie,
  isFavorited,
  onMovieClick,
}: MovieCardProps) {
  const posterUrl = buildPosterUrl(movie.posterPath);

  const handleMovieClick = (): void => {
    onMovieClick(movie.id);
  };

  return (
    <article className={styles.card}>
      <button
        type="button"
        className={styles.contentButton}
        onClick={handleMovieClick}
      >
        <figure className={styles.figure}>
          {posterUrl ? (
            <img
              src={posterUrl}
              alt={`Poster for ${movie.title}`}
              loading="lazy"
              className={styles.posterImg}
            />
          ) : (
            <div className={styles.posterFallback}>No Poster</div>
          )}
          {isFavorited ? (
            <span className={styles.favoriteBadge}>Favorite</span>
          ) : null}
          <figcaption className={styles.title}>{movie.title}</figcaption>
        </figure>
      </button>
    </article>
  );
}
