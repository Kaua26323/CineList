import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithProviders } from "../../test/test-utils";
import type { FavoriteMovie, MovieSummary } from "../../types/movies";
import { MovieGrid } from "./MovieGrid";
import styles from "./MovieGrid.module.css";

const movie: MovieSummary = {
  id: 42,
  title: "The Answer",
  posterPath: "/answer.jpg",
  releaseDate: "2025-04-02",
  releaseYear: "2025",
  voteAverage: 8.4,
  overview: "A meaningful overview.",
};

const favorite: FavoriteMovie = {
  id: 7,
  title: "Saved Movie",
  posterPath: "/saved.jpg",
  releaseYear: "2024",
  voteAverage: 7.9,
  runtimeMinutes: 110,
  genres: ["Drama"],
};

describe("MovieGrid responsive layout contract", () => {
  it("uses the responsive grid class for catalog movies", () => {
    renderWithProviders(<MovieGrid movies={[movie]} />);

    expect(screen.getByLabelText("Movie catalog")).toHaveClass(styles.grid);
    expect(screen.getByRole("link", { name: /view details for the answer/i }))
      .toHaveAttribute("href", "/movie/42");
  });

  it("uses the responsive grid class for favorite movies", () => {
    renderWithProviders(<MovieGrid movies={[favorite]} mode="favorite" />);

    expect(screen.getByLabelText("Favorite movies")).toHaveClass(styles.grid);
    expect(screen.getByRole("link", { name: "Details for Saved Movie" }))
      .toHaveAttribute("href", "/movie/7");
  });
});
