import type { FavoriteMovie } from "./movies-protocol";

export type ApiErrorCode =
  | "CONFIGURATION_ERROR"
  | "INVALID_MOVIE_ID"
  | "MOVIE_NOT_FOUND"
  | "NETWORK_ERROR"
  | "RATE_LIMITED"
  | "SERVICE_UNAVAILABLE"
  | "UNKNOWN_ERROR";

export interface ApiError {
  title: string;
  status?: number;
  message: string;
  code: ApiErrorCode;
}

export type StorageErrorCode =
  | "STORAGE_UNAVAILABLE"
  | "READ_FAILED"
  | "WRITE_FAILED"
  | "INVALID_DATA"
  | "UNKNOWN_ERROR"
  | "STORAGE_FULL";

export interface StorageError {
  title: string;
  status?: number;
  message: string;
  code: StorageErrorCode;
}

export type ReadStorageResult =
  | {
      success: true;
      favorites: FavoriteMovie[];
      error: null;
    }
  | {
      success: false;
      favorites: FavoriteMovie[];
      error: StorageError;
    };

export type WriteStorageResult =
  | {
      success: true;
      error: null;
    }
  | {
      success: false;
      error: StorageError;
    };
