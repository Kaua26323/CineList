import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Favorites } from "./index";
import type { FavoriteMovie } from "@/types/movies-protocol";
import { useFavoritesContext } from "@/hooks/useFavoritesContext";

const navigateMock = vi.fn();

vi.mock("react-router", () => ({
  useLocation: () => ({
    pathname: "/favorites",
  }),
  useNavigate: () => navigateMock,
}));

vi.mock("@/hooks/useFavoritesContext", () => ({
  useFavoritesContext: vi.fn(),
}));

const favoriteMovies: FavoriteMovie[] = [
  {
    id: 600,
    title: "The New World",
    voteAverage: 7.4,
    genres: [
      { id: 18, name: "Drama" },
      { id: 36, name: "History" },
      { id: 10749, name: "Romance" },
    ],
    releaseDate: "2005-12-25",
    runtime: 135,
    posterPath: "/poster.jpg",
  },
  {
    id: 601,
    title: "A Hidden Life",
    voteAverage: 7.1,
    genres: [],
    runtime: null,
    posterPath: null,
  },
];

const mockedUseFavoritesContext = vi.mocked(useFavoritesContext);

function mockFavoritesContext(favorites: FavoriteMovie[] = []) {
  const removeFavoriteMovie = vi.fn();

  mockedUseFavoritesContext.mockReturnValue({
    favorites,
    isFavorited: vi.fn(),
    addFavoriteMovie: vi.fn(),
    removeFavoriteMovie,
  });

  return { removeFavoriteMovie };
}

function getParagraphByText(text: string) {
  return screen.getByText((_content, element) => {
    const elementText = element?.textContent?.replace(/\s+/g, " ").trim();

    return element?.tagName === "P" && elementText === text;
  });
}

describe("Favorites (unity)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "log").mockImplementation(() => undefined);
    mockFavoritesContext();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should render empty favorites state and navigate to home", () => {
    render(<Favorites />);

    expect(screen.getByText("My Collection")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Favorites" }),
    ).toBeInTheDocument();
    expect(screen.getByText("0")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "No favorite movies yet" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Browse movies and add your favorites to build your list.",
      ),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Browse movies/i }));

    expect(navigateMock).toHaveBeenCalledWith("/");
    expect(navigateMock).toHaveBeenCalledTimes(1);
  });

  it("should render favorite movies", () => {
    mockFavoritesContext(favoriteMovies);

    render(<Favorites />);

    expect(screen.getByText("2")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "The New World" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "A Hidden Life" }),
    ).toBeInTheDocument();
    expect(getParagraphByText("7.4 - 2005")).toBeInTheDocument();
    expect(getParagraphByText("2h 15m")).toBeInTheDocument();
    expect(screen.getByText("Drama")).toBeInTheDocument();
    expect(screen.getByText("History")).toBeInTheDocument();
    expect(screen.queryByText("Romance")).not.toBeInTheDocument();

    expect(
      screen.getByRole("img", { name: "Poster for The New World" }),
    ).toHaveAttribute("src", "https://image.tmdb.org/t/p/w500/poster.jpg");
  });

  it("should render fallback content when favorite movie details are missing", () => {
    mockFavoritesContext([favoriteMovies[1]]);

    render(<Favorites />);

    expect(screen.getByText("No poster")).toBeInTheDocument();
    expect(getParagraphByText("7.1 - Unknown year")).toBeInTheDocument();
    expect(getParagraphByText("Runtime unavailable")).toBeInTheDocument();
    expect(screen.getByText("No genres listed")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("should navigate to movie details", () => {
    mockFavoritesContext(favoriteMovies);

    render(<Favorites />);

    fireEvent.click(screen.getAllByRole("button", { name: /Details/i })[0]);

    expect(navigateMock).toHaveBeenCalledWith("/movie/600", {
      state: { from: "/favorites" },
    });
    expect(navigateMock).toHaveBeenCalledTimes(1);
  });

  it("should remove favorite movie", () => {
    const { removeFavoriteMovie } = mockFavoritesContext(favoriteMovies);

    render(<Favorites />);

    fireEvent.click(screen.getAllByRole("button", { name: /Remove/i })[1]);

    expect(removeFavoriteMovie).toHaveBeenCalledWith(601);
    expect(removeFavoriteMovie).toHaveBeenCalledTimes(1);
  });
});
