export const APP_ERROR_KINDS = [
  "network",
  "api",
  "not-found",
  "invalid-input",
  "storage",
  "unknown",
] as const;

export type AppErrorKind = (typeof APP_ERROR_KINDS)[number];

export interface AppErrorOptions {
  recoverable?: boolean;
  status?: number;
  code?: string;
  cause?: unknown;
}

const DEFAULT_RECOVERABILITY: Record<AppErrorKind, boolean> = {
  network: true,
  api: true,
  "not-found": false,
  "invalid-input": false,
  storage: true,
  unknown: true,
};

export class AppError extends Error {
  readonly kind: AppErrorKind;
  readonly recoverable: boolean;
  readonly status?: number;
  readonly code?: string;

  constructor(
    kind: AppErrorKind,
    message: string,
    { recoverable, status, code, cause }: AppErrorOptions = {},
  ) {
    super(message, { cause });
    this.name = "AppError";
    this.kind = kind;
    this.recoverable = recoverable ?? DEFAULT_RECOVERABILITY[kind];
    this.status = status;
    this.code = code;
  }
}

export function createAppError(
  kind: AppErrorKind,
  message: string,
  options?: AppErrorOptions,
): AppError {
  return new AppError(kind, message, options);
}

export function createNetworkError(
  message = "We couldn't connect to the movie service. Check your connection and try again.",
  options?: AppErrorOptions,
): AppError {
  return createAppError("network", message, options);
}

export function createApiError(
  message = "The movie service couldn't complete this request. Please try again.",
  options?: AppErrorOptions,
): AppError {
  return createAppError("api", message, options);
}

export function createNotFoundError(
  message = "We couldn't find that movie.",
  options?: AppErrorOptions,
): AppError {
  return createAppError("not-found", message, options);
}

export function createInvalidInputError(
  message = "The requested movie is unavailable.",
  options?: AppErrorOptions,
): AppError {
  return createAppError("invalid-input", message, options);
}

export function createStorageError(
  message = "Favorites couldn't be saved in this browser.",
  options?: AppErrorOptions,
): AppError {
  return createAppError("storage", message, options);
}

export function createUnknownError(
  message = "Something unexpected happened. Please try again.",
  options?: AppErrorOptions,
): AppError {
  return createAppError("unknown", message, options);
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function toAppError(
  error: unknown,
  fallbackMessage?: string,
): AppError {
  if (isAppError(error)) {
    return error;
  }

  return createUnknownError(fallbackMessage, { cause: error });
}
