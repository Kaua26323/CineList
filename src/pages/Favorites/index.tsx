import { useLocation, useNavigate } from "react-router";
import {
  Star,
  Info,
  Clock,
  Heart,
  Search,
  Trash2,
  Calendar,
} from "lucide-react";

import styles from "./favorites.module.css";
import { Button } from "@/components/Button";
import type { FavoriteMovie } from "@/types/movies-protocol";
import { useFavoritesContext } from "@/hooks/useFavoritesContext";
import {
  getMovieYear,
  buildPosterUrl,
  getFormattedRuntime,
} from "@/utils/constants";
import { ErrorMessage } from "@/components/Errors/ErrorMessage";

function getFormattedGenres(movie: FavoriteMovie | undefined): string[] {
  return movie && movie.genres.length > 0
    ? movie.genres.map((genre) => genre.name).slice(0, 2)
    : ["No genres listed"];
}

function EmptyFavoriteState({ buttonAction }: { buttonAction: () => void }) {
  return (
    <section className={styles.emptyState}>
      <div>
        <Heart size={32} />
      </div>
      <h2>No favorite movies yet</h2>
      <p>Browse movies and add your favorites to build your list.</p>
      <Button size="180px" variant="primary" onClick={buttonAction}>
        <Search size={16} /> Browse movies
      </Button>
    </section>
  );
}

export function Favorites() {
  const navigate = useNavigate();
  const location = useLocation();
  const { favorites, storageError, removeFavoriteMovie } =
    useFavoritesContext();

  const handleDetailsClick = (movieId: number): void => {
    navigate(`/movie/${movieId}`, { state: { from: location.pathname } });
  };

  const handleRemoveFavorite = (movieId: number): void => {
    removeFavoriteMovie(movieId);
  };

  const handleHome = (): void => {
    navigate("/");
  };

  return (
    <article className={styles.container}>
      <div className={styles.heading}>
        <p>My Collection</p>
        <div className={styles.titleDiv}>
          <h1>Your favorites</h1>
          <span>{favorites.length}</span>
        </div>
        <div className={styles.headingLine}></div>
      </div>

      {favorites.length === 0 && (
        <EmptyFavoriteState buttonAction={handleHome} />
      )}

      {storageError && (
        <ErrorMessage
          error={{
            title: storageError.title,
            message: storageError.message,
            code: storageError.code,
          }}
        />
      )}

      <section className={styles.favoritesSection}>
        {favorites.length > 0 &&
          favorites.map((movie) => {
            const posterUrl = buildPosterUrl(movie.posterPath);

            return (
              <div key={movie.id} className={styles.favoriteCard}>
                <div className={styles.cardImage}>
                  {posterUrl ? (
                    <img
                      src={posterUrl}
                      alt={`Poster for ${movie.title}`}
                      className={styles.posterImage}
                    />
                  ) : (
                    <div className={styles.posterFallback}> No poster</div>
                  )}
                  <p>
                    <Star size={11} fill="var(--color-primary)" />
                    {movie.voteAverage.toFixed(1)} - <Calendar size={11} />
                    {getMovieYear(movie.releaseDate)}
                  </p>
                </div>

                <div className={styles.cardDetails}>
                  <h2>{movie.title}</h2>

                  <div className={styles.cardInfo}>
                    <p>
                      <Clock size={14} />
                      {getFormattedRuntime(movie.runtime)}
                    </p>
                    <div className={styles.cardGenres}>
                      {getFormattedGenres(movie).map((genre) => (
                        <span key={genre}>{genre}</span>
                      ))}
                    </div>
                  </div>

                  <div className={styles.cardButtons}>
                    <Button
                      variant="primary"
                      onClick={() => handleDetailsClick(movie.id)}
                    >
                      <Info size={16} />
                      Details
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleRemoveFavorite(movie.id)}
                    >
                      <Trash2 size={16} />
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
      </section>
    </article>
  );
}
