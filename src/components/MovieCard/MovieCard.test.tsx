import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithProviders } from "../../test/test-utils";
import type { FavoriteMovie } from "../../types/movies";
import { MovieCard } from "./MovieCard";

const favorite: FavoriteMovie = {
  id: 42,
  title: "The Answer",
  posterPath: "/answer.jpg",
  releaseYear: "2025",
  voteAverage: 8.4,
  runtimeMinutes: 121,
  genres: ["Science Fiction", "Adventure"],
};

describe("MovieCard favorite display mode", () => {
  it("provides a clearly named Details link for the favorite", () => {
    renderWithProviders(<MovieCard movie={favorite} mode="favorite" />);

    expect(screen.getByRole("link", { name: "Details for The Answer" }))
      .toHaveAttribute("href", "/movie/42");
  });

  it("shows visible favorite metadata without relying on the poster", () => {
    renderWithProviders(<MovieCard movie={favorite} mode="favorite" />);

    expect(screen.getByRole("heading", { name: "The Answer" })).toBeVisible();
    expect(screen.getByText("2025")).toBeVisible();
    expect(screen.getByText("8.4")).toBeVisible();
    expect(screen.getByText("121 min")).toBeVisible();
    expect(screen.getByText("Science Fiction")).toBeVisible();
    expect(screen.getByText("Adventure")).toBeVisible();
  });

  it("replaces a poster that fails to load with the accessible fallback", () => {
    renderWithProviders(<MovieCard movie={favorite} mode="favorite" />);

    fireEvent.error(screen.getByRole("img", { name: "The Answer poster" }));

    expect(screen.queryByRole("img", { name: "The Answer poster" })).not
      .toBeInTheDocument();
    expect(screen.getByText("Poster unavailable")).toBeVisible();
  });
});
