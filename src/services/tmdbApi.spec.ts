import { beforeEach, describe, expect, it, vi } from "vitest";

import { tmdbFetch } from "./apiRequest";
import { getMovieDetails, getPopularMovies } from "./tmdbApi";
import type {
  ApiError,
  TmdbCastMember,
  GetMovieDetailsResponse,
  GetPopularMoviesResponse,
} from "@/types/api-protocol";

vi.mock("./apiRequest", () => ({
  tmdbFetch: vi.fn(),
}));

vi.mock("@/utils/constants", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/utils/constants")>();

  return {
    ...actual,
    TMDB_CONFIG: {
      ...actual.TMDB_CONFIG,
      apiKey: "test-api-key",
    },
  };
});

const apiError: ApiError = {
  title: "Service is temporarily unavailable",
  message: "The movie service is unavailable. Please try again.",
  code: "SERVICE_UNAVAILABLE",
  status: 500,
};

const mockedTmdbFetch = vi.mocked(tmdbFetch);

function createCastMember(order: number): TmdbCastMember {
  return {
    id: order + 1,
    name: `Cast ${order}`,
    character: `Character ${order}`,
    profile_path: order % 2 === 0 ? `/cast-${order}.jpg` : null,
    order,
  };
}
const popularMoviesResponse: GetPopularMoviesResponse = {
  page: 1,
  total_pages: 10,
  total_results: 200,
  results: [
    {
      id: 600,
      title: "The New World",
      overview: "A movie overview",
      vote_count: 100,
      popularity: 12,
      vote_average: 7.4,
      release_date: "2005-12-25",
      poster_path: "/poster.jpg",
      backdrop_path: "/backdrop.jpg",
      genre_ids: [18],
    },
    {
      id: 601,
      title: "A Hidden Life",
      overview: "Another movie overview",
      vote_count: 200,
      popularity: 18,
      vote_average: 7.1,
      release_date: "2019-12-13",
      poster_path: null,
      backdrop_path: null,
      genre_ids: [36],
    },
  ],
};

const movieDetailsResponse: GetMovieDetailsResponse = {
  id: 600,
  title: "The New World",
  adult: false,
  budget: 30000000,
  status: "Released",
  revenue: 30536013,
  overview: "A movie overview",
  popularity: 12,
  vote_count: 100,
  vote_average: 7.4,
  release_date: "2005-12-25",
  genres: [{ id: 18, name: "Drama" }],
  runtime: 135,
  poster_path: "/poster.jpg",
  backdrop_path: "/backdrop.jpg",
  credits: {
    cast: [
      createCastMember(10),
      createCastMember(2),
      createCastMember(0),
      createCastMember(1),
      createCastMember(3),
      createCastMember(4),
      createCastMember(5),
      createCastMember(6),
      createCastMember(7),
      createCastMember(8),
      createCastMember(9),
    ],
  },
};

describe("tmdbApi (unity)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getPopularMovies", () => {
    it("should fetch and map popular movies using the default page", async () => {
      mockedTmdbFetch.mockResolvedValue(popularMoviesResponse);

      await expect(getPopularMovies()).resolves.toEqual([
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
          posterPath: null,
          backdropPath: null,
        },
      ]);
      expect(mockedTmdbFetch).toHaveBeenCalledWith("/movie/popular", {
        params: {
          page: 1,
        },
      });
      expect(mockedTmdbFetch).toHaveBeenCalledTimes(1);
    });

    it("should fetch popular movies using the requested page", async () => {
      mockedTmdbFetch.mockResolvedValue({
        ...popularMoviesResponse,
        page: 3,
        results: [],
      });

      await expect(getPopularMovies(3)).resolves.toEqual([]);
      expect(mockedTmdbFetch).toHaveBeenCalledWith("/movie/popular", {
        params: {
          page: 3,
        },
      });
    });

    it("should propagate API errors when popular movies request fails", async () => {
      mockedTmdbFetch.mockRejectedValue(apiError);

      await expect(getPopularMovies()).rejects.toEqual(apiError);
      expect(mockedTmdbFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe("getMovieDetails", () => {
    it("should fetch and map movie details with sorted cast limited to ten members", async () => {
      mockedTmdbFetch.mockResolvedValue(movieDetailsResponse);

      await expect(getMovieDetails(600)).resolves.toEqual({
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
        genres: [{ id: 18, name: "Drama" }],
        runtime: 135,
        posterPath: "/poster.jpg",
        backdropPath: "/backdrop.jpg",
        cast: Array.from({ length: 10 }, (_, order) => ({
          id: order + 1,
          name: `Cast ${order}`,
          character: `Character ${order}`,
          profilePath: order % 2 === 0 ? `/cast-${order}.jpg` : null,
        })),
      });
      expect(mockedTmdbFetch).toHaveBeenCalledWith("/movie/600", {
        params: {
          append_to_response: "credits",
        },
      });
      expect(mockedTmdbFetch).toHaveBeenCalledTimes(1);
    });

    it("should return empty cast when movie details response has no credits", async () => {
      mockedTmdbFetch.mockResolvedValue({
        ...movieDetailsResponse,
        credits: undefined,
      });

      await expect(getMovieDetails(600)).resolves.toMatchObject({
        cast: [],
      });
    });

    it("should reject invalid movie ID", async () => {
      await expect(getMovieDetails(-1)).rejects.toMatchObject({
        title: "Invalid movie",
        message: "Movie IDs must be positive numbers.",
        code: "INVALID_MOVIE_ID",
      });
      expect(mockedTmdbFetch).not.toHaveBeenCalled();
    });

    it("should propagate API errors when movie details request fails", async () => {
      mockedTmdbFetch.mockRejectedValue(apiError);

      await expect(getMovieDetails(600)).rejects.toEqual(apiError);
      expect(mockedTmdbFetch).toHaveBeenCalledWith("/movie/600", {
        params: {
          append_to_response: "credits",
        },
      });
    });
  });
});
