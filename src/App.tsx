import { BrowserRouter, Routes, Route } from "react-router";

import "@/styles/globals.css";
import { Home } from "./pages/Home";
import { AppLayout } from "@/components/AppLayout";
import { MovieDetails } from "./pages/MovieDetails";
import { Favorites } from "./pages/Favorites";
import { NotFound } from "@/pages/NotFound";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/movie/:id" element={<MovieDetails />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
