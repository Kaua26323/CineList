import { createContext } from "react";

import type { AppError } from "../../types/errors";
import type { FavoriteMovie } from "../../types/movies";

export interface FavoritesContextValue {
  favorites: FavoriteMovie[];
  favoriteIds: ReadonlySet<number>;
  addFavorite: (movie: FavoriteMovie) => void;
  removeFavorite: (movieId: number) => void;
  isFavorited: (movieId: number) => boolean;
  storageError: AppError | null;
}

export const FavoritesContext = createContext<FavoritesContextValue | null>(null);
