import { Heart, TriangleAlert } from "lucide-react";

import { MovieGrid } from "../components/MovieGrid/MovieGrid";
import { useFavoritesContext } from "../hooks/useFavoritesContext";
import styles from "./Favorites.module.css";

export function Favorites() {
  const { favorites, storageError } = useFavoritesContext();

  return (
    <section aria-labelledby="favorites-title">
      <div className={styles.heading}>
        <div>
          <p className={styles.eyebrow}>Saved collection</p>
          <h1 id="favorites-title">Your favorites</h1>
        </div>
        <p className={styles.intro}>
          Movies saved in this browser are ready whenever you want to revisit
          their details.
        </p>
      </div>

      {storageError && (
        <div className={styles.warning} role="alert">
          <TriangleAlert size={22} aria-hidden="true" />
          <div>
            <strong>Favorites storage warning</strong>
            <p>{storageError.message}</p>
          </div>
        </div>
      )}

      {favorites.length > 0 ? (
        <MovieGrid movies={favorites} mode="favorite" />
      ) : (
        <div className={styles.empty}>
          <Heart size={36} aria-hidden="true" />
          <h2>No favorite movies yet</h2>
        </div>
      )}
    </section>
  );
}
