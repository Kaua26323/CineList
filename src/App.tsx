import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router";

import { PageShell } from "./components/PageShell/PageShell";
import { FavoritesProvider } from "./contexts/favorites/favoritesProvider";
import { Home } from "./pages/Home";
import { MovieDetails } from "./pages/MovieDetails";
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

export default function App() {
  const [queryClient] = useState(createAppQueryClient);

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <FavoritesProvider>
          <PageShell>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/movie/:movieId" element={<MovieDetails />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </PageShell>
        </FavoritesProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}
