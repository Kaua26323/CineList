import { useLocation, useNavigate, useParams } from "react-router";

import styles from "./movieDetails.module.css";
import type { ApiError } from "@/types/api-protocol";
import type { MovieDetails } from "@/types/movies-protocol";

import { NotFound } from "@/pages/NotFound";
import { Button } from "@/components/Button";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorMessage } from "@/components/Errors/ErrorMessage";

import { useMovieDetails } from "@/hooks/useMovieDetails";
import { useFavoritesContext } from "@/hooks/useFavoritesContext";
import {
  getMovieYear,
  buildPosterUrl,
  buildProfileUrl,
  getFormattedRuntime,
} from "@/utils/constants";

function parsedMovieId(movieId: string | undefined): number | null {
  const parsedMovieId = Number(movieId);

  if (!Number.isInteger(parsedMovieId) || parsedMovieId <= 0) {
    return null;
  }

  return parsedMovieId;
}

function isMovieNotFoundError(error: ApiError | null): boolean {
  return (
    error?.status === 404 ||
    error?.code === "MOVIE_NOT_FOUND" ||
    error?.code === "INVALID_MOVIE_ID"
  );
}

function getFormattedReleaseDate(releaseDate: string | undefined): string {
  if (!releaseDate) {
    return "Release date unavailable";
  }
  const formated = releaseDate?.replace("-", "/").replace("-", "/");

  return formated;
}

function getFormattedRating(rating: number | undefined): string {
  return rating ? `${rating.toFixed(1)} / 10` : "Rating unavailable";
}

function getFormattedGenres(movie: MovieDetails | undefined): string {
  return movie && movie.genres.length > 0
    ? movie.genres.map((genre) => genre.name).join(", ")
    : "No genres listed";
}

function getOverview(overview: string | undefined): string {
  return overview || "No overview available.";
}

function getMovieDetailsError(error: ApiError | null): ApiError {
  return {
    title: error?.title ?? "Error loading movies details",
    message:
      error?.message ?? "Unable to load movie details. Please try again",
    code: error?.code ?? "UNKNOWN_ERROR",
  };
}

export function MovieDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const movieId = parsedMovieId(id);
  const locationState = location.state as { from?: string } | null;
  const backPath = locationState?.from ?? "/";
  const {
    data: movie,
    error,
    isError,
    isLoading,
    refetch,
  } = useMovieDetails(movieId ?? 0);
  const { isFavorited, addFavoriteMovie, removeFavoriteMovie } =
    useFavoritesContext();

  const handleRetry = (): void => {
    void refetch();
  };

  const handleBack = (): void => {
    navigate(backPath);
  };

  const handleToggleFavorite = (): void => {
    if (!movie) {
      return;
    }

    if (isFavorited(movie.id)) {
      removeFavoriteMovie(movie.id);
      return;
    }

    addFavoriteMovie(movie);
  };

  if (!movieId) {
    return <NotFound reason="Movie not found" />;
  }

  if (isLoading) {
    return <LoadingSpinner message="Loading movie details..." />;
  }

  if (isError && isMovieNotFoundError(error)) {
    return <NotFound reason="Movie not found" />;
  }

  if (isError) {
    return (
      <ErrorMessage
        error={getMovieDetailsError(error)}
        onRetry={handleRetry}
        action={{ label: "Back to home", onClick: handleBack }}
      />
    );
  }

  const cast = movie?.cast ?? [];
  const isMovieFavorited = isFavorited(movieId);
  const posterUrl = buildPosterUrl(movie?.posterPath);
  const releaseYear = getMovieYear(movie?.releaseDate);

  return (
    <article className={styles.container} aria-labelledby="movie-title">
      <Button size="100px" variant="secondary" onClick={handleBack}>
        Back
      </Button>
      <div className={styles.layout}>
        <aside
          className={styles.postPanel}
          aria-label={`${movie?.title} poster`}
        >
          {posterUrl ? (
            <img
              src={posterUrl}
              alt={`Poster for ${movie?.title}`}
              className={styles.posterImage}
            />
          ) : (
            <div className={styles.posterFallback}> No poster</div>
          )}

          {isMovieFavorited ? <p>Saved to favorites</p> : null}

          {isMovieFavorited ? (
            <Button
              type="button"
              variant="destructive"
              onClick={handleToggleFavorite}
            >
              Remove from favorites
            </Button>
          ) : (
            <Button
              type="button"
              variant="primary"
              onClick={handleToggleFavorite}
            >
              Favorite
            </Button>
          )}
        </aside>

        <section className={styles.detailsSection}>
          <div className={styles.heading}>
            <p>{releaseYear}</p>
            <h1>{movie?.title}</h1>
          </div>

          <dl className={styles.metadata}>
            <div>
              <dt>Rating</dt>
              <dd>{getFormattedRating(movie?.voteAverage)}</dd>
            </div>
            <div>
              <dt>Runtime</dt>
              <dd>{getFormattedRuntime(movie?.runtime)}</dd>
            </div>
            <div>
              <dt>Release Date</dt>
              <dd>{getFormattedReleaseDate(movie?.releaseDate)}</dd>
            </div>
            <div>
              <dt>Genres</dt>
              <dd>{getFormattedGenres(movie)}</dd>
            </div>
          </dl>
          <section
            className={styles.overviewSection}
            aria-labelledby="overview-title"
          >
            <h2 id="overview-title">Overview</h2>
            <p>{getOverview(movie?.overview)}</p>
          </section>
          <section className={styles.castSection} aria-labelledby="cast-title">
            <h2 id="cast-title">Cast</h2>
            {cast.length > 0 ? (
              <ul className={styles.castList}>
                {cast.map((castMember) => {
                  const profileUrl = buildProfileUrl(castMember.profilePath);

                  return (
                    <li key={castMember.id} className={styles.castMembers}>
                      {profileUrl ? (
                        <img
                          src={profileUrl}
                          alt={`Photo of ${castMember.name}`}
                          className={styles.castMemberImage}
                          loading="lazy"
                        />
                      ) : (
                        <div
                          className={styles.profileFallback}
                          aria-hidden="true"
                        >
                          {castMember.name.charAt(0)}
                        </div>
                      )}

                      <div>
                        <p className={styles.castName}>{castMember.name}</p>
                        <p className={styles.castCharacter}>
                          {castMember.character || "Character unavailable"}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p> Cast unavailable. </p>
            )}
          </section>
        </section>
      </div>
    </article>
  );
}
