# Implementation Plan: CineList Movie Catalog and Favorites

**Branch**: `genai-assisted-implementation` | **Date**: 2026-07-09 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-cinelist-movie-catalog/spec.md`

## Summary

Build CineList as a React/Vite/TypeScript single-page app for browsing TMDB popular movies, opening movie details, adding/removing favorites, and viewing persisted favorites. The implementation will isolate TMDB access in typed services and query hooks, keep favorites in `FavoritesContext` backed by `localStorage`, synchronize favorites across tabs via browser storage events where available, and provide explicit loading, success, empty, and error states on each route.

## Technical Context

**Language/Version**: TypeScript `~6.0.2`, React `^19.2.6`, Vite `^8.0.12`

**Primary Dependencies**: React, React DOM, React Router `^8.0.1`, TanStack Query `^5.101.0`, CSS Modules, lucide-react for icons, TMDB API via `fetch`

**Storage**: Browser `localStorage` for `FavoriteMovie[]`; in-memory React state remains authoritative when storage writes fail

**Testing**: Vitest `^4.1.9`, Testing Library React `^16.3.2`, `@testing-library/jest-dom`, jsdom

**Target Platform**: Modern browsers on mobile, tablet, and desktop

**Project Type**: Single-page web app

**Performance Goals**: Home and details routes render stable loading feedback immediately; movie grids remain responsive at representative mobile/tablet/desktop widths; favorite add/remove actions update visible UI synchronously before storage persistence completes

**Constraints**: TMDB API availability and configured `VITE_TMDB_API_KEY`, `VITE_TMDB_BASE_URL`, `VITE_TMDB_IMAGE_BASE_URL`; localStorage may be unavailable, full, malformed, or blocked; cross-tab sync depends on `storage` event support

**Scale/Scope**: Popular movies, movie details, favorites, persistence, cross-tab synchronization, route recovery, and basic error handling only. No search, pagination, infinite scroll, accounts, backend sync, sharing, custom ratings, or theme modes.

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- **Type safety**: PASS. Plan defines typed TMDB DTOs, normalized movie models, favorite models, route param parsing, service returns, and app error structures. No `any` is planned.
- **UX states**: PASS. Home, movie details, favorites, and not-found routes define loading, success, empty, and error states where applicable.
- **Favorites reliability**: PASS. Favorite add/remove updates context state immediately, persists to `localStorage`, handles malformed/unavailable storage, and listens for `storage` events for cross-tab updates.
- **Service isolation**: PASS. TMDB configuration, calls, normalization, and error mapping remain in `services/tmdb` and query hooks. Components do not call TMDB directly.
- **Focused components**: PASS. Pages compose data and context; reusable cards, grids, buttons, state views, and layout components remain prop-driven.
- **Tests for core behavior**: PASS. Strategy includes services, storage, context, route states, empty/error/loading states, and favorite/remove interactions.
- **Accessibility and responsiveness**: PASS. Routes and components specify semantic navigation, keyboard-usable links/buttons, accessible icon labels, and responsive card/detail layouts.
- **User-friendly errors**: PASS. API, invalid ID, missing movie, rate limit, malformed storage, and quota failures map to readable UI messages and recovery actions.
- **Scope control**: PASS. Plan explicitly excludes search, pagination, accounts, backend sync, sharing, custom ratings, and theme modes.

## Project Structure

### Documentation (this feature)

```text
specs/001-cineList-movie-catalog/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── ui-contract.md
└── tasks.md              # Created later by /speckit-tasks
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── ErrorMessage/
│   ├── Button/
│   ├── LoadingSpinner/
│   ├── MovieCard/
│   ├── MovieGrid/
│   └── PageShell/
├── contexts/
│   └── favorites/
│       ├── favoritesContext.tsx
│       └── favoritesProvider.tsx
├── hooks/
│   ├── useFavoritesContext.ts
│   ├── useMovieDetails.ts
│   └── usePopularMovies.ts
├── pages/
│   ├── Favorites.tsx
│   ├── Home.tsx
│   ├── MovieDetails.tsx
│   └── NotFound.tsx
├── services/
│   ├── favoritesStorage.ts
│   └── tmdb/
│       ├── client.ts
│       ├── movies.ts
│       └── normalizers.ts
├── styles/
│   └── globals.css
├── test/
│   └── test-utils.tsx
├── types/
│   ├── errors.ts
│   └── movies.ts
├── App.module.css
├── App.tsx
└── main.tsx
```

**Structure Decision**: Use the existing Vite app root and add feature folders under `src/`. Tests should be colocated next to changed behavior as `*.test.ts` or `*.test.tsx`, with shared render helpers in `src/test/test-utils.tsx`.

## Data Models

- **TMDB DTOs**: Raw response types for popular movie list, movie detail, credits, genre, and cast members. DTOs mirror TMDB fields and remain inside the service layer.
- **MovieSummary**: Normalized card/list model with `id`, `title`, `posterPath`, `releaseDate`, `releaseYear`, `voteAverage`, and `isFavorited` supplied by UI composition.
- **MovieDetails**: Normalized details model with summary fields plus `overview`, `genres`, `runtimeMinutes`, and `cast`.
- **FavoriteMovie**: Persisted favorite snapshot containing `id`, `title`, `posterPath`, `releaseYear`, `voteAverage`, `runtimeMinutes`, and `genres` so the favorites page works without refetching every detail route.
- **FavoriteCollection**: Ordered list of unique `FavoriteMovie` records for the current browser profile.
- **AppError**: Typed user-facing error model with `kind`, `message`, optional `recoverable`, and optional original status/code for logging or tests.

Full field definitions and validation rules are in [data-model.md](./data-model.md).

## Route Plan

- `/`: `Home` fetches popular movies with TanStack Query and renders loading, success grid, empty list, and user-friendly error with retry.
- `/movie/:movieId`: `MovieDetails` parses `movieId`, rejects invalid IDs before fetching, fetches TMDB details, renders details success, missing optional-data fallbacks, error/not-found recovery, and favorite toggle.
- `/favorites`: `Favorites` reads `useFavoritesContext`, renders persisted favorites, empty state with Browse movies link, and immediate remove actions.
- `*`: `NotFound` provides a clear navigation path back to `/`.

## Service Layer Plan

- `services/tmdb/client.ts`: Reads `VITE_TMDB_*` config, builds typed request URLs, executes `fetch`, handles non-2xx responses, and maps network/status failures to `AppError`.
- `services/tmdb/movies.ts`: Exposes `getPopularMovies()` and `getMovieDetails(movieId)` only. No pagination/search APIs are added.
- `services/tmdb/normalizers.ts`: Converts TMDB DTOs to `MovieSummary`, `MovieDetails`, and `FavoriteMovie`-ready values with safe fallbacks for missing optional fields.
- Query hooks wrap service calls with stable query keys: `['movies', 'popular']` and `['movies', 'details', movieId]`; hooks expose TanStack Query state but not fetch details.
- `services/favoritesStorage.ts`: Owns storage key, JSON parsing, validation, write behavior, quota/unavailable handling, and cross-tab event parsing.

## State Management Plan

- `FavoritesContext` initializes from `favoritesStorage.readFavorites()`.
- `addFavorite(movie)` and `removeFavorite(movieId)` update React state immediately, attempt storage persistence, and surface recoverable storage errors without crashing.
- Duplicate favorites are prevented by `id`; adding an existing movie refreshes its snapshot while preserving uniqueness.
- The provider listens for `storage` events on the favorites key and replaces state with validated external data when available.
- `useFavorites()` exposes `favorites`, `favoriteIds`, `addFavorite`, `removeFavorite`, `isFavorited`, and the latest storage warning/error.

## UI Component Plan

- `PageShell`: App landmark layout with header navigation to Home and Favorites.
- `MovieGrid`: Responsive CSS Grid that accepts `MovieSummary[]` or `FavoriteMovie[]`-compatible card data and renders empty content through the page.
- `MovieCard`: Prop-driven card with poster fallback, title, release/rating metadata, favorite indicator, and accessible details link.
- `FavoriteButton`: Button using lucide-react icon plus visible text or accessible label; supports pressed state with `aria-pressed`.
- `LoadingSpinner`: Semantic loading indicator with visible loading copy.
- `ErrorMessage`: User-friendly message, optional retry button, and optional navigation link.
- `FavoritesPage` item controls: Details link and Remove button remain keyboard accessible and do not require hover-only affordances.

## Testing Strategy

- **Service tests**: TMDB client success, non-2xx, network failure, missing config, invalid movie ID, empty popular list, and normalizer fallbacks.
- **Storage tests**: Empty storage, malformed JSON, duplicate prevention, quota/unavailable write failure, and `storage` event payload parsing.
- **Context tests**: Initialization, immediate add/remove UI state, duplicate refresh, storage failure warning, and cross-tab synchronization.
- **Route/page tests**: Home loading/success/empty/error; details invalid ID/loading/success/error/favorite toggle; favorites populated/empty/remove-last; not-found navigation.
- **Accessibility tests**: Testing Library role/name queries for navigation, cards, favorite/remove buttons, retry buttons, and empty-state browse link.
- **Responsive checks**: CSS Modules use stable grid constraints and media queries; manual quickstart includes representative mobile/tablet/desktop validation.

## Implementation Phases

1. **Foundation**: Add missing dependencies if needed (`lucide-react`), global styles, typed models, test setup, and provider/router skeleton.
2. **TMDB data**: Implement TMDB client, movies service, normalizers, query hooks, and service tests.
3. **Favorites persistence**: Implement storage service, `FavoritesContext`, cross-tab sync, and core storage/context tests.
4. **Routes and UI**: Build page shell, home grid, details page, favorites page, focused reusable components, and route state tests.
5. **Polish and verification**: Add responsive CSS Modules, accessible labels/keyboard checks, user-friendly error copy, and run lint/build/test.

## Post-Design Constitution Check

- **Type safety**: PASS. Data model and contracts define the typed interfaces before implementation.
- **UX states**: PASS. Route contract specifies every required loading/success/empty/error state.
- **Favorites reliability**: PASS. State and storage plans include immediate updates, persistence, failures, and cross-tab sync.
- **Service isolation**: PASS. Contracts keep TMDB work in services/query hooks only.
- **Focused components**: PASS. Component responsibilities are narrowly scoped and prop-driven.
- **Tests for core behavior**: PASS. Testing strategy covers the constitution-required changed behavior.
- **Accessibility and responsiveness**: PASS. UI plan and quickstart include keyboard, roles/names, and viewport checks.
- **User-friendly errors**: PASS. Error mapping and recovery paths are planned for API, route, and storage failures.
- **Scope control**: PASS. No out-of-scope features are included.

## Complexity Tracking

No constitution violations require justification.
