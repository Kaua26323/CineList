import type { PropsWithChildren } from "react";

/**
 * Establishes the app-wide favorites boundary. Phase 3 adds the context value,
 * localStorage persistence, and favorite mutations inside this provider.
 */
export function FavoritesProvider({ children }: PropsWithChildren) {
  return children;
}
