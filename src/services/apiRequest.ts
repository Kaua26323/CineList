import type { ApiError } from "@/types/api-protocol";
import { TMDB_CONFIG, DEFAULT_LANGUAGE } from "@/utils/constants";

export function getApiErrorMessage(status?: number): ApiError {
  if (status === 401) {
    return {
      title: "Connection error",
      message: "The movie service is missing valid API credentials.",
      code: "CONFIGURATION_ERROR",
      status,
    };
  }

  if (status === 404) {
    return {
      title: "Movie not found",
      message: "The requested movie could not be found.",
      code: "MOVIE_NOT_FOUND",
      status,
    };
  }

  if (status === 429) {
    return {
      title: "Service is busy",
      message: "Too many requests were sent. Please try again later.",
      code: "RATE_LIMITED",
      status,
    };
  }

  if (status && status >= 500) {
    return {
      title: "Service is temporarily unavailable",
      message: "The movie service is unavailable. Please try again.",
      code: "SERVICE_UNAVAILABLE",
      status,
    };
  }

  return {
    title: "Connection error",
    message: "check your internet connection and try again",
    code: "NETWORK_ERROR",
    status,
  };
}

export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === "object" &&
    error !== null &&
    "title" in error &&
    "message" in error &&
    "code" in error &&
    typeof (error as ApiError).title === "string" &&
    typeof (error as ApiError).message === "string" &&
    typeof (error as ApiError).code === "string"
  );
}

export function normalizeFetchError(error: unknown): ApiError {
  if (isApiError(error)) {
    return error;
  }

  if (error instanceof Error && error.name === "AbortError") {
    return {
      title: "Connection error",
      message: "Request too long. please try again later",
      code: "NETWORK_ERROR",
    };
  }

  if (error instanceof TypeError) {
    return {
      title: "Connection error",
      message: "Check your internet connection and try again.",
      code: "NETWORK_ERROR",
    };
  }

  if (error instanceof Error) {
    return {
      title: "Something went wrong",
      message: error.message || "Unexpected error while loading movie data.",
      code: "UNKNOWN_ERROR",
    };
  }

  return {
    title: "Something went wrong",
    message: "Unexpected error while loading movie data.",
    code: "UNKNOWN_ERROR",
  };
}

type QueryParams = Record<string, string | number | boolean | undefined>;

interface TmdbRequestOptions extends RequestInit {
  params?: QueryParams;
  timeoutMs?: number;
}

function createTmdbUrl(endpoint: string, params?: QueryParams): string {
  const baseUrl = TMDB_CONFIG.baseUrl.replace(/\/$/, "");
  const normalizedEndpoint = endpoint.startsWith("/")
    ? endpoint
    : `/${endpoint}`;

  const url = new URL(`${baseUrl}${normalizedEndpoint}`);

  url.searchParams.set("api_key", TMDB_CONFIG.apiKey);
  url.searchParams.set("language", DEFAULT_LANGUAGE);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    });
  }

  return url.toString();
}

export async function tmdbFetch<T>(
  endpoint: string,
  options: TmdbRequestOptions = {},
): Promise<T> {
  const { params, headers, timeoutMs = 10000, ...fetchOptions } = options;

  const fetchHeaders = new Headers(headers);
  fetchHeaders.set("accept", "application/json");

  const controller = new AbortController();

  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  try {
    const response = await fetch(createTmdbUrl(endpoint, params), {
      ...fetchOptions,
      signal: controller.signal,
      headers: fetchHeaders,
    });

    if (!response.ok) {
      throw getApiErrorMessage(response.status);
    }

    const data = (await response.json()) as T;

    return data;
  } catch (error) {
    console.error("!!tmdbFetch Error:", error);
    throw normalizeFetchError(error);
  } finally {
    clearTimeout(timeoutId);
  }
}
