import { ArrowLeft, Clock, ImageOff, Star } from "lucide-react";
import { Link, useParams } from "react-router";

import { FavoriteToggle } from "../components/Button/FavoriteToggle";
import { ErrorMessage } from "../components/ErrorMessage/ErrorMessage";
import { LoadingSpinner } from "../components/LoadingSpinner/LoadingSpinner";
import { useFavoritesContext } from "../hooks/useFavoritesContext";
import { useMovieDetails } from "../hooks/useMovieDetails";
import { getTmdbImageUrl } from "../services/tmdb/client";
import { toFavoriteMovie } from "../services/tmdb/normalizers";
import { toAppError } from "../types/errors";
import styles from "./MovieDetails.module.css";

function parseMovieId(value: string | undefined): number | null {
  if (!value || !/^\d+$/.test(value)) {
    return null;
  }

  const movieId = Number(value);
  return Number.isSafeInteger(movieId) && movieId > 0 ? movieId : null;
}

export function MovieDetails() {
  const { movieId: routeMovieId } = useParams<{ movieId: string }>();
  const movieId = parseMovieId(routeMovieId);
  const movieQuery = useMovieDetails(movieId);
  const { addFavorite, removeFavorite, isFavorited, storageError } =
    useFavoritesContext();

  if (movieId === null) {
    return (
      <section className={styles.unavailable} aria-labelledby="invalid-movie-title">
        <h1 id="invalid-movie-title">The requested movie is unavailable</h1>
        <p>Check the address or return to the catalog to choose another movie.</p>
        <Link className={styles.backLink} to="/">
          <ArrowLeft size={18} aria-hidden="true" />
          Browse movies
        </Link>
      </section>
    );
  }

  if (movieQuery.isPending) {
    return <LoadingSpinner label="Loading movie details…" size="large" />;
  }

  if (movieQuery.isError) {
    const error = toAppError(movieQuery.error);
    return (
      <ErrorMessage
        error={error}
        title={
          error.kind === "not-found"
            ? "Movie unavailable"
            : "Movie details couldn't be loaded"
        }
        onRetry={error.recoverable ? () => void movieQuery.refetch() : undefined}
        recoveryLink={{ to: "/", label: "Browse movies" }}
      />
    );
  }

  const movie = movieQuery.data;
  if (!movie) {
    return null;
  }

  const posterUrl = getTmdbImageUrl(movie.posterPath);
  const favorited = isFavorited(movie.id);

  return (
    <article className={styles.page}>
      <Link className={styles.topBackLink} to="/">
        <ArrowLeft size={18} aria-hidden="true" />
        Back to popular movies
      </Link>

      <div className={styles.layout}>
        <div className={styles.posterFrame}>
          {posterUrl ? (
            <img
              className={styles.poster}
              src={posterUrl}
              alt={`${movie.title} poster`}
            />
          ) : (
            <div className={styles.posterFallback}>
              <ImageOff aria-hidden="true" />
              <span>Poster unavailable</span>
            </div>
          )}
        </div>

        <div className={styles.content}>
          <p className={styles.eyebrow}>Movie details</p>
          <h1>{movie.title}</h1>
          <div className={styles.metadata} aria-label="Movie information">
            <span>{movie.releaseDate ?? movie.releaseYear ?? "Release date unknown"}</span>
            <span>
              <Star size={17} fill="currentColor" aria-hidden="true" />
              {movie.voteAverage === null
                ? "Not rated"
                : `${movie.voteAverage.toFixed(1)} / 10`}
            </span>
            <span>
              <Clock size={17} aria-hidden="true" />
              {movie.runtimeMinutes === null
                ? "Runtime unknown"
                : `${movie.runtimeMinutes} min`}
            </span>
          </div>

          <FavoriteToggle
            className={styles.favoriteButton}
            isFavorited={favorited}
            onToggle={() => {
              if (favorited) {
                removeFavorite(movie.id);
              } else {
                addFavorite(toFavoriteMovie(movie));
              }
            }}
          />

          {storageError && (
            <p className={styles.storageWarning} role="alert">
              {storageError.message}
            </p>
          )}

          <section className={styles.section} aria-labelledby="synopsis-title">
            <h2 id="synopsis-title">Synopsis</h2>
            <p>{movie.overview ?? "Synopsis unavailable."}</p>
          </section>

          <section className={styles.section} aria-labelledby="genres-title">
            <h2 id="genres-title">Genres</h2>
            {movie.genres.length > 0 ? (
              <ul className={styles.genres}>
                {movie.genres.map((genre) => (
                  <li key={genre}>{genre}</li>
                ))}
              </ul>
            ) : (
              <p>Genre information unavailable.</p>
            )}
          </section>

          <section className={styles.section} aria-labelledby="cast-title">
            <h2 id="cast-title">Cast</h2>
            {movie.cast.length > 0 ? (
              <ul className={styles.cast}>
                {movie.cast.map((member) => (
                  <li key={member.id}>
                    <strong>{member.name}</strong>
                    {member.character && <span> as {member.character}</span>}
                  </li>
                ))}
              </ul>
            ) : (
              <p>Cast information unavailable.</p>
            )}
          </section>
        </div>
      </div>
    </article>
  );
}
