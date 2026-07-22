import { useContext } from "react";

import { FavoritesContext } from "@/contexts/favorites/favoritesContext";
import type { FavoritesContextProps } from "@/contexts/favorites/favoritesContext";

export function useFavoritesContext(): FavoritesContextProps {
  const context = useContext(FavoritesContext);

  if (!context) {
    throw new Error(
      "useFavoritesContext must be used within FavoritesProvider",
    );
  }

  return context;
}
