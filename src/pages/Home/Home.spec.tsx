import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";

import { Home } from "./index";
import type { ApiError } from "@/types/errors";
import type { Movie } from "@/types/movies-protocol";
import { usePopularMovies } from "@/hooks/usePopularMovies";
import { useFavoritesContext } from "@/hooks/useFavoritesContext";

const navigateMock = vi.fn();

vi.mock("react-router", () => ({
  useLocation: () => ({
    pathname: "/",
  }),
  useNavigate: () => navigateMock,
}));

vi.mock("@/hooks/usePopularMovies", () => ({
  usePopularMovies: vi.fn(),
}));

vi.mock("@/hooks/useFavoritesContext", () => ({
  useFavoritesContext: vi.fn(),
}));

const popularMovies: Movie[] = [
  {
    id: 600,
    title: "The New World",
    overview: "A movie overview",
    voteCount: 100,
    popularity: 12,
    voteAverage: 7.4,
    releaseDate: "2005-12-25",
    posterPath: "/poster.jpg",
    backdropPath: "/backdrop.jpg",
  },
  {
    id: 601,
    title: "A Hidden Life",
    overview: "Another movie overview",
    voteCount: 200,
    popularity: 18,
    voteAverage: 7.1,
    releaseDate: "2019-12-13",
    posterPath: "/hidden-life.jpg",
    backdropPath: "/hidden-life-backdrop.jpg",
  },
];

const apiError: ApiError = {
  title: "Service is busy",
  message: "Too many requests were sent. Please try again later.",
  code: "RATE_LIMITED",
  status: 429,
};

const mockedUsePopularMovies = vi.mocked(usePopularMovies);
const mockedUseFavoritesContext = vi.mocked(useFavoritesContext);

function mockPopularMoviesState(
  overrides: Partial<ReturnType<typeof usePopularMovies>> = {},
) {
  const refetch = vi.fn();

  mockedUsePopularMovies.mockReturnValue({
    data: popularMovies,
    error: null,
    isError: false,
    isLoading: false,
    refetch,
    ...overrides,
  } as ReturnType<typeof usePopularMovies>);

  return { refetch };
}

function mockFavoritesContext(
  isFavorited: Mock<(movieId: number) => boolean> = vi.fn<
    (movieId: number) => boolean
  >(() => false),
) {
  mockedUseFavoritesContext.mockReturnValue({
    favorites: [],
    storageError: null,
    isFavorited,
    addFavoriteMovie: vi.fn(),
    removeFavoriteMovie: vi.fn(),
  });

  return { isFavorited };
}

describe("Home (unity)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFavoritesContext();
  });

  it("should render loading state", () => {
    mockPopularMoviesState({
      data: undefined,
      isLoading: true,
    });

    render(<Home />);

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("Loading movies...")).toBeInTheDocument();
  });

  it("should render popular movies and favorite indicator", () => {
    const { isFavorited } = mockFavoritesContext(
      vi.fn((movieId: number) => movieId === popularMovies[0].id),
    );
    mockPopularMoviesState();

    render(<Home />);

    expect(
      screen.getByRole("heading", { name: "Popular Movies" }),
    ).toBeInTheDocument();
    expect(screen.getByText("The New World")).toBeInTheDocument();
    expect(screen.getByText("A Hidden Life")).toBeInTheDocument();
    expect(screen.getByText("Favorite")).toBeInTheDocument();
    expect(screen.getAllByRole("button")).toHaveLength(2);
    expect(isFavorited).toHaveBeenCalledWith(600);
    expect(isFavorited).toHaveBeenCalledWith(601);
  });

  it("should navigate to movie details when movie card is clicked", () => {
    mockPopularMoviesState();

    render(<Home />);

    fireEvent.click(screen.getByRole("button", { name: /A Hidden Life/i }));

    expect(navigateMock).toHaveBeenCalledWith("/movie/601", {
      state: { from: "/" },
    });
    expect(navigateMock).toHaveBeenCalledTimes(1);
  });

  it("should render API error and retry request", () => {
    const { refetch } = mockPopularMoviesState({
      data: undefined,
      error: apiError,
      isError: true,
    });

    render(<Home />);

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Service is busy")).toBeInTheDocument();
    expect(
      screen.getByText("Too many requests were sent. Please try again later."),
    ).toBeInTheDocument();
    expect(screen.getByText("RATE_LIMITED")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Try Again" }));

    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it("should render empty movies state and retry request", () => {
    const { refetch } = mockPopularMoviesState({
      data: [],
    });

    render(<Home />);

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("No movies found")).toBeInTheDocument();
    expect(
      screen.getByText("We could not find popular movies to show right now"),
    ).toBeInTheDocument();
    expect(screen.getByText("EMPTY_MOVIES")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Try Again" }));

    expect(refetch).toHaveBeenCalledTimes(1);
  });
});
