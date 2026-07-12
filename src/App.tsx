import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router";

import { PageShell } from "./components/PageShell/PageShell";
import { FavoritesProvider } from "./contexts/favorites/favoritesProvider";
import { useFavoritesContext } from "./hooks/useFavoritesContext";
import { Favorites } from "./pages/Favorites";
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

function AppShell() {
  const { storageError } = useFavoritesContext();
  const syncWarning = storageError?.code?.startsWith("sync-")
    ? storageError
    : null;

  return (
    <PageShell storageWarning={syncWarning}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movie/:movieId" element={<MovieDetails />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </PageShell>
  );
}

export default function App() {
  const [queryClient] = useState(createAppQueryClient);

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <FavoritesProvider>
          <AppShell />
        </FavoritesProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}
