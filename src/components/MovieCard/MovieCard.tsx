import { Heart, ImageOff, Star } from "lucide-react";
import { Link } from "react-router";

import { getTmdbImageUrl } from "../../services/tmdb/client";
import type { MovieSummary } from "../../types/movies";
import styles from "./MovieCard.module.css";

export interface MovieCardProps {
  movie: MovieSummary;
  isFavorited?: boolean;
}

export function MovieCard({ movie, isFavorited = false }: MovieCardProps) {
  const posterUrl = getTmdbImageUrl(movie.posterPath);

  return (
    <article className={styles.card}>
      <div className={styles.posterFrame}>
        {posterUrl ? (
          <img
            className={styles.poster}
            src={posterUrl}
            alt={`${movie.title} poster`}
            loading="lazy"
          />
        ) : (
          <div className={styles.posterFallback}>
            <ImageOff aria-hidden="true" />
            <span>Poster unavailable</span>
          </div>
        )}
        {isFavorited && (
          <span className={styles.favoriteBadge}>
            <Heart size={16} fill="currentColor" aria-hidden="true" />
            In favorites
          </span>
        )}
      </div>
      <div className={styles.content}>
        <h2 className={styles.title}>{movie.title}</h2>
        <div className={styles.metadata}>
          <span>{movie.releaseYear ?? "Year unknown"}</span>
          <span className={styles.rating}>
            <Star size={16} fill="currentColor" aria-hidden="true" />
            {movie.voteAverage === null ? "Not rated" : movie.voteAverage.toFixed(1)}
          </span>
        </div>
        <Link
          className={styles.detailsLink}
          to={`/movie/${movie.id}`}
          aria-label={`View details for ${movie.title}`}
        >
          View details
        </Link>
      </div>
    </article>
  );
}
