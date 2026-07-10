# UI and Service Contract: CineList Movie Catalog and Favorites

## Routes

### Home Route: `/`

Purpose: Browse popular movies.

States:

- Loading: show visible loading feedback while the popular movies query is pending.
- Success: show a responsive movie grid with poster, title, and favorite state.
- Empty: show a clear message when TMDB returns no popular movies.
- Error: show a user-friendly message with a retry action.

Interactions:

- Selecting a movie navigates to `/movie/:movieId`.
- Favorite indicators reflect `useFavoritesContext` state.
- No search, pagination, or infinite scroll controls are exposed.

Accessibility:

- Movie navigation uses links or keyboard-activatable controls with clear names.
- Favorite indicators do not rely on color alone.

### Movie Details Route: `/movie/:movieId`

Purpose: Inspect one movie and add/remove it from favorites.

States:

- Invalid route param: show an unavailable movie message and a Browse movies link without calling TMDB.
- Loading: show visible loading feedback while details are pending.
- Success: show poster, title, release date/year, synopsis, source rating, genres, runtime, cast when available, and favorite toggle.
- Error/not found: show a clear unavailable or loading-failed message with recovery navigation and retry where appropriate.

Interactions:

- Favorite button calls `addFavorite(toFavoriteMovie(details))` when not favorited.
- Remove button calls `removeFavorite(movieId)` when favorited.
- Toggle state updates immediately in the current tab.

Accessibility:

- Favorite control is a button with visible text or an accessible name.
- Pressed/favorited state is exposed with `aria-pressed` when appropriate.

### Favorites Route: `/favorites`

Purpose: View and manage saved favorite movies.

States:

- Loading: not applicable for storage-only reads after provider initialization; provider initialization should avoid blank UI.
- Success: show all persisted favorites with poster, title, source rating, release year, runtime, genres, Details action, and Remove action.
- Empty: show a clear no-favorites message and Browse movies link.
- Error/warning: show non-blocking user-friendly storage warning when favorites could not be read or persisted.

Interactions:

- Details navigates to `/movie/:movieId`.
- Remove deletes the movie immediately from the visible list.
- Removing the last favorite transitions to the empty state without refresh.

Accessibility:

- Details is a link with the movie title in its accessible name.
- Remove is a button with the movie title in its accessible name.

### Fallback Route: `*`

Purpose: Recover from unknown paths.

States:

- Success: show a not-found message and a link back to Home.

## Service Contracts

### `getPopularMovies(): Promise<MovieSummary[]>`

Behavior:

- Calls the configured TMDB popular movies endpoint.
- Returns normalized `MovieSummary[]`.
- Returns an empty array when TMDB returns an empty valid result set.
- Throws `AppError` for missing config, network failure, non-2xx responses, malformed required data, or unknown failures.

### `getMovieDetails(movieId: number): Promise<MovieDetails>`

Behavior:

- Rejects non-positive or non-integer IDs with `AppError.kind = 'invalid-input'`.
- Calls the configured TMDB movie details endpoint with credits included.
- Returns normalized `MovieDetails`.
- Throws `AppError.kind = 'not-found'` for 404/unavailable movie.
- Throws user-friendly `AppError` variants for network/API/malformed failures.

### `readFavorites(): FavoriteMovie[]`

Behavior:

- Reads the configured localStorage key.
- Returns `[]` when no favorites are stored.
- Validates records and skips invalid entries.
- Returns a safe empty array when JSON is malformed or storage is unavailable, while allowing the caller to surface a storage warning.

### `writeFavorites(favorites: FavoriteMovie[]): StorageWriteResult`

Behavior:

- Persists the validated favorite array.
- Returns success or a typed storage error result.
- Does not mutate the caller's in-memory state.

### `FavoritesContext`

Exposed value:

- `favorites: FavoriteMovie[]`
- `favoriteIds: ReadonlySet<number>`
- `addFavorite(movie: FavoriteMovie): void`
- `removeFavorite(movieId: number): void`
- `isFavorited(movieId: number): boolean`
- `storageError: AppError | null`

Behavior:

- Initializes from `readFavorites()`.
- Updates current-tab state immediately for add/remove.
- Attempts persistence after state update.
- Handles write failures with a visible warning and usable in-memory state.
- Listens to `storage` events for the favorites key and replaces state with valid external updates.
