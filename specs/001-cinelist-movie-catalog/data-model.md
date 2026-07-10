# Data Model: CineList Movie Catalog and Favorites

## TMDB DTOs

Raw DTO types are service-layer only and mirror TMDB response shapes needed by the feature.

### `TmdbPopularMoviesResponse`

- `page: number`
- `results: TmdbMovieSummaryDto[]`
- `total_pages?: number`
- `total_results?: number`

### `TmdbMovieSummaryDto`

- `id: number`
- `title?: string`
- `name?: string`
- `poster_path: string | null`
- `release_date?: string`
- `vote_average?: number`
- `overview?: string`

### `TmdbMovieDetailsDto`

- `id: number`
- `title?: string`
- `poster_path: string | null`
- `release_date?: string`
- `vote_average?: number`
- `overview?: string`
- `genres?: TmdbGenreDto[]`
- `runtime?: number | null`
- `credits?: { cast?: TmdbCastMemberDto[] }`

### `TmdbGenreDto`

- `id: number`
- `name: string`

### `TmdbCastMemberDto`

- `id: number`
- `name: string`
- `character?: string`
- `profile_path?: string | null`

## App Models

### `MovieSummary`

Represents a movie in the home grid.

- `id: number`
- `title: string`
- `posterPath: string | null`
- `releaseDate: string | null`
- `releaseYear: string | null`
- `voteAverage: number | null`
- `overview: string | null`

Validation:

- `id` must be a positive integer.
- `title` falls back to `"Untitled movie"` when TMDB omits title/name.
- `releaseYear` is derived from a valid `YYYY-MM-DD` release date; otherwise `null`.
- `voteAverage` is `null` when missing or not finite.

### `MovieDetails`

Represents a movie details route.

- `id: number`
- `title: string`
- `posterPath: string | null`
- `releaseDate: string | null`
- `releaseYear: string | null`
- `voteAverage: number | null`
- `overview: string | null`
- `genres: string[]`
- `runtimeMinutes: number | null`
- `cast: CastMember[]`

Validation:

- `id` must match the requested positive integer movie ID.
- `genres` contains non-empty names only.
- `runtimeMinutes` is `null` when missing, zero, negative, or not finite.
- `cast` is limited to a focused display list during normalization.

### `CastMember`

- `id: number`
- `name: string`
- `character: string | null`
- `profilePath: string | null`

Validation:

- Members without a positive `id` or non-empty `name` are ignored.
- `character` and `profilePath` may be `null`.

### `FavoriteMovie`

Persisted favorite snapshot used by the favorites page.

- `id: number`
- `title: string`
- `posterPath: string | null`
- `releaseYear: string | null`
- `voteAverage: number | null`
- `runtimeMinutes: number | null`
- `genres: string[]`

Validation:

- `id` must be a positive integer and unique in the collection.
- Required display fields are normalized before persistence.
- Unknown fields from storage are ignored.
- Invalid records from storage are skipped rather than crashing the app.

### `FavoriteCollection`

- `items: FavoriteMovie[]`
- `lastUpdatedAt: string | null`

Validation:

- In memory, the collection is represented as an ordered array of unique favorite movies.
- The newest add or refreshed favorite appears first unless implementation tasks choose to preserve insertion order consistently.
- Removing the final item transitions the favorites page to the empty state immediately.

State transitions:

- `empty -> populated`: user adds a favorite.
- `populated -> populated`: user adds another favorite, refreshes an existing favorite snapshot, removes one of multiple favorites, or receives valid cross-tab storage data.
- `populated -> empty`: user removes the final favorite or receives an empty valid cross-tab storage update.
- `any -> warning`: storage read/write fails, while in-memory state remains usable.

### `AppError`

Typed error object mapped to user-friendly UI.

- `kind: 'network' | 'api' | 'not-found' | 'invalid-input' | 'storage' | 'unknown'`
- `message: string`
- `recoverable: boolean`
- `status?: number`
- `code?: string`

Validation:

- User-facing `message` must not expose raw stack traces or implementation-only details.
- `not-found` is used for 404/unavailable movie details.
- `invalid-input` is used when route params cannot become a positive integer movie ID.

## Relationships

- `MovieDetails` can be converted to `FavoriteMovie` when a user favorites from the details route.
- `FavoriteMovie.id` is used by `MovieSummary` and `MovieDetails` UI composition to derive favorite state.
- `FavoriteCollection` is owned by `FavoritesContext` and persisted through `favoritesStorage`.
- TMDB DTOs never flow directly into React page or component props.
