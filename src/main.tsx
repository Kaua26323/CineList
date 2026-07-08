import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import App from "./App";
import type { ApiError } from "./types/api-protocol";
import { QUERY_STALE_TIMES_MS } from "./utils/constants";
import { ErrorBoundary } from "./components/Errors/ErrorBoundary";
import { FavoritesProvider } from "@/contexts/favorites/favoritesProvider";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: QUERY_STALE_TIMES_MS,
      retry: (failureCount, error) => {
        const apiError = error as Partial<ApiError>;

        if (apiError.status === 401 || apiError.status === 404) {
          return false;
        }

        return failureCount < 3;
      },
    },
  },
});

createRoot(rootElement).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <FavoritesProvider>
          <App />
        </FavoritesProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
);
