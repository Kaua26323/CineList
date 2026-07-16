import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";

import { MovieDetails } from "./index";
import type { ApiError } from "@/types/errors";
import { useMovieDetails } from "@/hooks/useMovieDetails";
import { useFavoritesContext } from "@/hooks/useFavoritesContext";
import type { MovieDetails as MovieDetailsType } from "@/types/movies-protocol";

const routerMocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  params: { id: "600" as string | undefined },
  location: { state: null as { from?: string } | null },
}));

vi.mock("react-router", () => ({
  useLocation: () => routerMocks.location,
  useNavigate: () => routerMocks.navigate,
  useParams: () => routerMocks.params,
}));

vi.mock("@/hooks/useMovieDetails", () => ({
  useMovieDetails: vi.fn(),
}));

vi.mock("@/hooks/useFavoritesContext", () => ({
  useFavoritesContext: vi.fn(),
}));

const movieDetails: MovieDetailsType = {
  id: 600,
  title: "The New World",
  adult: false,
  budget: 30000000,
  status: "Released",
  revenue: 30536013,
  overview: "A movie overview",
  popularity: 12,
  voteCount: 100,
  voteAverage: 7.4,
  releaseDate: "2005-12-25",
  genres: [
    { id: 18, name: "Drama" },
    { id: 36, name: "History" },
  ],
  runtime: 135,
  posterPath: "/poster.jpg",
  backdropPath: "/backdrop.jpg",
  cast: [
    {
      id: 1,
      name: "Colin Farrell",
      character: "Captain Smith",
      profilePath: "/profile.jpg",
    },
    {
      id: 2,
      name: "Q'orianka Kilcher",
      character: "",
      profilePath: null,
    },
  ],
};

const apiError: ApiError = {
  title: "Service is busy",
  message: "Too many requests were sent. Please try again later.",
  code: "RATE_LIMITED",
  status: 429,
};

const mockedUseMovieDetails = vi.mocked(useMovieDetails);
const mockedUseFavoritesContext = vi.mocked(useFavoritesContext);

function mockRoute({
  id = "600",
  from = null,
}: {
  id?: string;
  from?: string | null;
} = {}) {
  routerMocks.params = { id };
  routerMocks.location = { state: from ? { from } : null };
}

function mockMovieDetailsState(
  overrides: Partial<ReturnType<typeof useMovieDetails>> = {},
) {
  const refetch = vi.fn();

  mockedUseMovieDetails.mockReturnValue({
    data: movieDetails,
    error: null,
    isError: false,
    isLoading: false,
    refetch,
    ...overrides,
  } as ReturnType<typeof useMovieDetails>);

  return { refetch };
}

function mockFavoritesContext(
  isFavorited: Mock<(movieId: number) => boolean> = vi.fn<
    (movieId: number) => boolean
  >(() => false),
) {
  const addFavoriteMovie = vi.fn();
  const removeFavoriteMovie = vi.fn();

  mockedUseFavoritesContext.mockReturnValue({
    favorites: [],
    storageError: null,
    isFavorited,
    addFavoriteMovie,
    removeFavoriteMovie,
  });

  return { addFavoriteMovie, isFavorited, removeFavoriteMovie };
}

const notFoundErrorCases: Array<[ApiError, string]> = [
  [{ ...apiError, code: "MOVIE_NOT_FOUND", status: 404 }, "status 404"],
  [{ ...apiError, code: "MOVIE_NOT_FOUND", status: 500 }, "not found code"],
  [
    { ...apiError, code: "INVALID_MOVIE_ID", status: 400 },
    "invalid movie ID code",
  ],
];

describe("MovieDetails (unity)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRoute();
    mockMovieDetailsState();
    mockFavoritesContext();
  });

  it("should render not found when movie ID is invalid", () => {
    mockRoute({ id: "invalid" });

    render(<MovieDetails />);

    expect(
      screen.getByRole("heading", { name: "Movie not found" }),
    ).toBeInTheDocument();
    expect(screen.getByText("404")).toBeInTheDocument();
    expect(mockedUseMovieDetails).toHaveBeenCalledWith(0);
  });

  it("should render loading state", () => {
    mockMovieDetailsState({
      data: undefined,
      isLoading: true,
    });

    render(<MovieDetails />);

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("Loading movie details...")).toBeInTheDocument();
  });

  it.each(notFoundErrorCases)("should render not found for %s", (error) => {
    mockMovieDetailsState({
      data: undefined,
      error,
      isError: true,
    });

    render(<MovieDetails />);

    expect(
      screen.getByRole("heading", { name: "Movie not found" }),
    ).toBeInTheDocument();
    expect(screen.getByText("404")).toBeInTheDocument();
  });

  it("should render API error, retry request, and navigate back to home", () => {
    const { refetch } = mockMovieDetailsState({
      data: undefined,
      error: apiError,
      isError: true,
    });

    render(<MovieDetails />);

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Service is busy")).toBeInTheDocument();
    expect(
      screen.getByText("Too many requests were sent. Please try again later."),
    ).toBeInTheDocument();
    expect(screen.getByText("RATE_LIMITED")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Try Again" }));
    fireEvent.click(screen.getByRole("button", { name: "Back to home" }));

    expect(refetch).toHaveBeenCalledTimes(1);
    expect(routerMocks.navigate).toHaveBeenCalledWith("/");
  });

  it("should render movie details", () => {
    render(<MovieDetails />);

    expect(
      screen.getByRole("heading", { name: "The New World" }),
    ).toBeInTheDocument();
    expect(screen.getByText("2005")).toBeInTheDocument();
    expect(screen.getByText("7.4 / 10")).toBeInTheDocument();
    expect(screen.getByText("2h 15m")).toBeInTheDocument();
    expect(screen.getByText("2005/12/25")).toBeInTheDocument();
    expect(screen.getByText("Drama, History")).toBeInTheDocument();
    expect(screen.getByText("A movie overview")).toBeInTheDocument();
    expect(screen.getByText("Colin Farrell")).toBeInTheDocument();
    expect(screen.getByText("Captain Smith")).toBeInTheDocument();
    expect(screen.getByText("Q'orianka Kilcher")).toBeInTheDocument();
    expect(screen.getByText("Character unavailable")).toBeInTheDocument();

    expect(
      screen.getByRole("img", { name: "Poster for The New World" }),
    ).toHaveAttribute("src", "https://image.tmdb.org/t/p/w500/poster.jpg");
    expect(
      screen.getByRole("img", { name: "Photo of Colin Farrell" }),
    ).toHaveAttribute("src", "https://image.tmdb.org/t/p/w185/profile.jpg");
  });

  it("should render fallback content when movie details are missing", () => {
    mockMovieDetailsState({
      data: {
        ...movieDetails,
        overview: "",
        voteAverage: 0,
        releaseDate: "",
        genres: [],
        runtime: null,
        posterPath: null,
        cast: [],
      },
    });

    render(<MovieDetails />);

    expect(screen.getByText("No poster")).toBeInTheDocument();
    expect(screen.getByText("Unknown year")).toBeInTheDocument();
    expect(screen.getByText("Rating unavailable")).toBeInTheDocument();
    expect(screen.getByText("Runtime unavailable")).toBeInTheDocument();
    expect(screen.getByText("Release date unavailable")).toBeInTheDocument();
    expect(screen.getByText("No genres listed")).toBeInTheDocument();
    expect(screen.getByText("No overview available.")).toBeInTheDocument();
    expect(screen.getByText("Cast unavailable.")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("should navigate back to previous location", () => {
    mockRoute({ from: "/favorites" });

    render(<MovieDetails />);

    fireEvent.click(screen.getByRole("button", { name: "Back" }));

    expect(routerMocks.navigate).toHaveBeenCalledWith("/favorites");
  });

  it("should navigate back to home when previous location is unavailable", () => {
    render(<MovieDetails />);

    fireEvent.click(screen.getByRole("button", { name: "Back" }));

    expect(routerMocks.navigate).toHaveBeenCalledWith("/");
  });

  it("should add movie to favorites", () => {
    const { addFavoriteMovie } = mockFavoritesContext();

    render(<MovieDetails />);

    fireEvent.click(screen.getByRole("button", { name: "Favorite" }));

    expect(addFavoriteMovie).toHaveBeenCalledWith(movieDetails);
    expect(addFavoriteMovie).toHaveBeenCalledTimes(1);
  });

  it("should remove movie from favorites", () => {
    const { removeFavoriteMovie } = mockFavoritesContext(
      vi.fn((movieId: number) => movieId === movieDetails.id),
    );

    render(<MovieDetails />);

    expect(screen.getByText("Saved to favorites")).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "Remove from favorites" }),
    );

    expect(removeFavoriteMovie).toHaveBeenCalledWith(movieDetails.id);
    expect(removeFavoriteMovie).toHaveBeenCalledTimes(1);
  });
});
