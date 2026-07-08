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
  getFavoritesMoviesFromStorage,
} from "@/services/favoritesStorage";

export function FavoritesProvider({ children }: PropsWithChildren) {
  const [favorites, setFavorites] = useState<FavoriteMovie[]>(() => {
    return getFavoritesMoviesFromStorage();
  });

  useEffect(() => {
    function handleStorage(event: StorageEvent): void {
      if (event.key !== LOCAL_STORAGE_KEYS.favorites) {
        return;
      }

      setFavorites(getFavoritesMoviesFromStorage());
    }

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const addFavoriteMovie = useCallback((movie: MovieDetails): void => {
    const favoriteMovie = createFavoriteMovie(movie);
    setFavorites(addFavoriteToStorage(favoriteMovie));
  }, []);

  const removeFavoriteMovie = useCallback((movieId: number): void => {
    setFavorites(removeFavoriteFromStorage(movieId));
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
      isFavorited,
      addFavoriteMovie,
      removeFavoriteMovie,
    }),
    [favorites, isFavorited, addFavoriteMovie, removeFavoriteMovie],
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}
