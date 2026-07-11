import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from "react";

import {
  readFavoritesResult,
  validateFavorites,
  writeFavorites,
} from "../../services/favoritesStorage";
import type { FavoriteMovie } from "../../types/movies";
import { FavoritesContext, type FavoritesContextValue } from "./favoritesContext";

export function FavoritesProvider({ children }: PropsWithChildren) {
  const [initialState] = useState(readFavoritesResult);
  const [favorites, setFavorites] = useState(initialState.favorites);
  const favoritesRef = useRef(initialState.favorites);
  const [storageError, setStorageError] = useState(initialState.error);

  const addFavorite = useCallback((movie: FavoriteMovie) => {
    const nextFavorites = validateFavorites([
      movie,
      ...favoritesRef.current.filter((favorite) => favorite.id !== movie.id),
    ]);
    favoritesRef.current = nextFavorites;
    setFavorites(nextFavorites);

    const writeResult = writeFavorites(nextFavorites);
    setStorageError(writeResult.ok ? null : writeResult.error);
  }, []);

  const removeFavorite = useCallback(() => {
    // Removal is completed in User Story 3. The stable API is available now.
  }, []);

  const favoriteIds = useMemo(
    () => new Set(favorites.map((favorite) => favorite.id)),
    [favorites],
  );
  const isFavorited = useCallback(
    (movieId: number) => favoriteIds.has(movieId),
    [favoriteIds],
  );

  const value = useMemo<FavoritesContextValue>(
    () => ({
      favorites,
      favoriteIds,
      addFavorite,
      removeFavorite,
      isFavorited,
      storageError,
    }),
    [
      addFavorite,
      favoriteIds,
      favorites,
      isFavorited,
      removeFavorite,
      storageError,
    ],
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}
