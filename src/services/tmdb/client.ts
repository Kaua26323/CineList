import {
  createApiError,
  createNetworkError,
  createNotFoundError,
  isAppError,
} from "../../types/errors";
import {
  DEFAULT_TMDB_IMAGE_BASE_URL,
  TMDB_API_KEY_QUERY_PARAM,
  TMDB_LANGUAGE,
} from "../../utils/constants";

export interface TmdbConfig {
  apiKey: string;
  baseUrl: string;
  imageBaseUrl: string;
}

export type TmdbQueryParams = Record<
  string,
  string | number | boolean | null | undefined
>;

function requiredConfigValue(value: string | undefined): string | null {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

export function getTmdbConfig(): TmdbConfig {
  const apiKey = requiredConfigValue(import.meta.env.VITE_TMDB_API_KEY);
  const baseUrl = requiredConfigValue(import.meta.env.VITE_TMDB_BASE_URL);
  const imageBaseUrl = requiredConfigValue(
    import.meta.env.VITE_TMDB_IMAGE_BASE_URL,
  );

  if (!apiKey || !baseUrl || !imageBaseUrl) {
    throw createApiError(
      "The movie catalog is not configured yet. Please try again later.",
      { recoverable: false, code: "missing-config" },
    );
  }

  return { apiKey, baseUrl, imageBaseUrl };
}

export function buildTmdbUrl(
  path: string,
  params: TmdbQueryParams = {},
  config = getTmdbConfig(),
): URL {
  const baseUrl = config.baseUrl.endsWith("/")
    ? config.baseUrl
    : `${config.baseUrl}/`;
  const normalizedPath = path.replace(/^\/+/, "");
  const url = new URL(normalizedPath, baseUrl);

  url.searchParams.set(TMDB_API_KEY_QUERY_PARAM, config.apiKey);
  url.searchParams.set("language", TMDB_LANGUAGE);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  });

  return url;
}

export function getTmdbImageUrl(path: string | null): string | null {
  if (!path) {
    return null;
  }

  const configuredBaseUrl = import.meta.env.VITE_TMDB_IMAGE_BASE_URL?.trim();
  const baseUrl = (configuredBaseUrl || DEFAULT_TMDB_IMAGE_BASE_URL).replace(
    /\/+$/,
    "",
  );
  const sizedBaseUrl = /\/(?:w\d+|h\d+|original)$/.test(baseUrl)
    ? baseUrl
    : `${baseUrl}/w500`;

  return `${sizedBaseUrl}/${path.replace(/^\/+/, "")}`;
}

function errorForResponse(response: Response) {
  if (response.status === 404) {
    return createNotFoundError("That movie is unavailable.", {
      status: response.status,
      code: "tmdb-not-found",
    });
  }

  if (response.status === 429) {
    return createApiError(
      "The movie service is receiving too many requests. Please try again shortly.",
      { status: response.status, code: "rate-limited" },
    );
  }

  return createApiError(
    "The movie service couldn't complete this request. Please try again.",
    { status: response.status, code: "tmdb-response" },
  );
}

export async function tmdbRequest<T = unknown>(
  path: string,
  params?: TmdbQueryParams,
): Promise<T> {
  const url = buildTmdbUrl(path, params);
  let response: Response;

  try {
    response = await fetch(url, {
      headers: { Accept: "application/json" },
    });
  } catch (error) {
    throw createNetworkError(undefined, { cause: error });
  }

  if (!response.ok) {
    throw errorForResponse(response);
  }

  try {
    return (await response.json()) as T;
  } catch (error) {
    if (isAppError(error)) {
      throw error;
    }

    throw createApiError(
      "The movie service returned data CineList couldn't read.",
      { code: "invalid-response", cause: error },
    );
  }
}
