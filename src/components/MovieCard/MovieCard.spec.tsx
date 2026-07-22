import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import { MovieCard, type MovieCardContent } from "./index";

const movie: MovieCardContent = {
  id: 600,
  title: "The New World",
  posterPath: "/poster.jpg",
};

describe("MovieCard (unity)", () => {
  it("should render poster, title, and favorite indicator", () => {
    render(<MovieCard movie={movie} isFavorited onMovieClick={vi.fn()} />);

    const poster = screen.getByRole("img", {
      name: "Poster for The New World",
    });

    expect(poster).toBeInTheDocument();
    expect(poster).toHaveAttribute(
      "src",
      "https://image.tmdb.org/t/p/w500/poster.jpg",
    );
    expect(screen.getByText("The New World")).toBeInTheDocument();
    expect(screen.getByText("Favorite")).toBeInTheDocument();
  });

  it("should render fallback when movie has no poster", () => {
    render(
      <MovieCard
        movie={{ ...movie, posterPath: null }}
        isFavorited={false}
        onMovieClick={vi.fn()}
      />,
    );

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.getByText("No Poster")).toBeInTheDocument();
    expect(screen.getByText("The New World")).toBeInTheDocument();
  });

  it("should not render favorite indicator when movie is not favorited", () => {
    render(
      <MovieCard movie={movie} isFavorited={false} onMovieClick={vi.fn()} />,
    );

    expect(screen.queryByText("Favorite")).not.toBeInTheDocument();
  });

  it("should call onMovieClick when clicked", () => {
    const handleMovieClick = vi.fn();

    render(
      <MovieCard movie={movie} isFavorited onMovieClick={handleMovieClick} />,
    );

    fireEvent.click(screen.getByRole("button", { name: /The New World/i }));

    expect(handleMovieClick).toHaveBeenCalledWith(600);
    expect(handleMovieClick).toHaveBeenCalledTimes(1);
  });
});
