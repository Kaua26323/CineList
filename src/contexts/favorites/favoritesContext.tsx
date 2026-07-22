import { createContext } from "react";
import type { StorageError } from "@/types/errors";
import type { MovieDetails, FavoriteMovie } from "@/types/movies-protocol";

export interface FavoritesContextProps {
  favorites: FavoriteMovie[];
  storageError: StorageError | null;
  isFavorited: (movieId: number) => boolean;
  removeFavoriteMovie: (movieId: number) => void;
  addFavoriteMovie: (movie: MovieDetails) => void;
}

export const FavoritesContext = createContext<FavoritesContextProps | null>(
  null,
);
