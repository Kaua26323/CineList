import { Heart, ImageOff, Star } from "lucide-react";
import { Link } from "react-router";

import { getTmdbImageUrl } from "../../services/tmdb/client";
import type { FavoriteMovie, MovieSummary } from "../../types/movies";
import styles from "./MovieCard.module.css";

interface CatalogMovieCardProps {
  movie: MovieSummary;
  mode?: "catalog";
  isFavorited?: boolean;
}

interface FavoriteMovieCardProps {
  movie: FavoriteMovie;
  mode: "favorite";
}

export type MovieCardProps = CatalogMovieCardProps | FavoriteMovieCardProps;

export function MovieCard(props: MovieCardProps) {
  const { movie } = props;
  const favoriteMovie = props.mode === "favorite" ? props.movie : null;
  const isFavorited =
    favoriteMovie !== null ||
    (props.mode !== "favorite" && props.isFavorited === true);
  const posterUrl = getTmdbImageUrl(movie.posterPath);
  const detailsLabel = favoriteMovie
    ? `Details for ${movie.title}`
    : `View details for ${movie.title}`;

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
        {favoriteMovie && (
          <div className={styles.favoriteMetadata}>
            <p>
              {favoriteMovie.runtimeMinutes === null
                ? "Runtime unknown"
                : `${favoriteMovie.runtimeMinutes} min`}
            </p>
            {favoriteMovie.genres.length > 0 ? (
              <ul className={styles.genres} aria-label="Genres">
                {favoriteMovie.genres.map((genre) => (
                  <li key={genre}>{genre}</li>
                ))}
              </ul>
            ) : (
              <p>Genres unavailable</p>
            )}
          </div>
        )}
        <Link
          className={styles.detailsLink}
          to={`/movie/${movie.id}`}
          aria-label={detailsLabel}
        >
          {favoriteMovie ? "Details" : "View details"}
        </Link>
      </div>
    </article>
  );
}
