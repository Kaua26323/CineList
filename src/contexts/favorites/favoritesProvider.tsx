import { FavoritesContext } from "./favoritesContext";
import type { FavoritesContextProps } from "./favoritesContext";
import type { MovieDetails, FavoriteMovie } from "@/types/movies-protocol";
import { createFavoriteMovie, LOCAL_STORAGE_KEYS } from "@/utils/constants";

import {
  useMemo,
  useState,
  useEffect,
  useCallback,
  type PropsWithChildren,
} from "react";
import {
  addFavoriteToStorage,
  removeFavoriteFromStorage,
  getFavoriteMoviesFromStorage,
} from "@/services/favoritesStorage";
import type { StorageError } from "@/types/errors";

export function FavoritesProvider({ children }: PropsWithChildren) {
  const [initialState] = useState(() => {
    return getFavoriteMoviesFromStorage();
  });
  const [storageError, setStorageError] = useState<StorageError | null>(
    initialState.success ? null : initialState.error,
  );
  const [favorites, setFavorites] = useState<FavoriteMovie[]>(
    initialState.favorites,
  );

  useEffect(() => {
    function handleStorage(event: StorageEvent): void {
      if (event.key !== LOCAL_STORAGE_KEYS.favorites) {
        return;
      }

      const { success, favorites, error } = getFavoriteMoviesFromStorage();
      if (!success) {
        setStorageError(error);
        return;
      }

      setFavorites(favorites);
      setStorageError(null);
    }

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const addFavoriteMovie = useCallback((movie: MovieDetails): void => {
    const favoriteMovie = createFavoriteMovie(movie);

    const result = addFavoriteToStorage(favoriteMovie);
    if (!Array.isArray(result)) {
      setStorageError(result);
      return;
    }

    setFavorites(result);
    setStorageError(null);
  }, []);

  const removeFavoriteMovie = useCallback((movieId: number): void => {
    const result = removeFavoriteFromStorage(movieId);

    if (!Array.isArray(result)) {
      setStorageError(result);
      return;
    }

    setFavorites(result);
    setStorageError(null);
  }, []);

  const isFavorited = useCallback(
    (movieId: number): boolean => {
      return favorites.some((movie) => movie.id === movieId);
    },
    [favorites],
  );

  const value = useMemo<FavoritesContextProps>(
    () => ({
      favorites,
      storageError,
      isFavorited,
      addFavoriteMovie,
      removeFavoriteMovie,
    }),
    [
      favorites,
      storageError,
      isFavorited,
      addFavoriteMovie,
      removeFavoriteMovie,
    ],
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}
