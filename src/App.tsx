import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router";

import { PageShell } from "./components/PageShell/PageShell";
import { FavoritesProvider } from "./contexts/favorites/favoritesProvider";
import { NotFound } from "./pages/NotFound";

function createAppQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        staleTime: 60_000,
      },
    },
  });
}

function CatalogPlaceholder() {
  return (
    <section aria-labelledby="catalog-title">
      <h1 id="catalog-title">Discover popular movies</h1>
      <p>The CineList catalog is being prepared.</p>
    </section>
  );
}

export default function App() {
  const [queryClient] = useState(createAppQueryClient);

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <FavoritesProvider>
          <PageShell>
            <Routes>
              <Route path="/" element={<CatalogPlaceholder />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </PageShell>
        </FavoritesProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}
