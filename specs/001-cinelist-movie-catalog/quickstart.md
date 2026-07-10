# Quickstart: Validate CineList Movie Catalog and Favorites

## Prerequisites

- Node and npm compatible with this Vite project.
- `.env.local` contains:
  - `VITE_TMDB_API_KEY`
  - `VITE_TMDB_BASE_URL`
  - `VITE_TMDB_IMAGE_BASE_URL`
- Dependencies installed. If `lucide-react` is not installed yet, add it during implementation.

## Commands

```bash
npm install
npm run lint
npm run build
npm run dev
```

When tests are added during implementation, run:

```bash
npm run test
```

If no `test` script exists yet, implementation tasks should add a Vitest script before completing the feature.

## Manual Validation Scenarios

### 1. Browse Popular Movies

1. Open the dev server.
2. Visit `/`.
3. Confirm a loading state appears before data resolves.
4. Confirm a responsive grid appears with poster, title, and favorite state.
5. Temporarily simulate an empty popular response in tests or mocks and confirm an empty state appears.
6. Temporarily simulate a TMDB failure in tests or mocks and confirm a user-friendly error with retry appears.

Expected outcome: Home never shows a blank screen for loading, empty, or error states.

### 2. Open Movie Details

1. Select a movie from the home grid.
2. Confirm navigation to `/movie/:movieId`.
3. Confirm the details page shows poster, title, release date/year, synopsis, source rating, genres, runtime, and cast when available.
4. Visit `/movie/not-a-number`.
5. Confirm the app shows an unavailable movie state without crashing.

Expected outcome: Details route handles valid movies, missing optional fields, invalid IDs, and failed loads with clear UI.

### 3. Add and Remove Favorites

1. Open a movie details page for a movie not currently favorited.
2. Activate Favorite.
3. Confirm the control changes immediately to Remove from Favorites.
4. Open `/favorites`.
5. Confirm the movie appears with poster, title, source rating, release year, runtime, genres, Details, and Remove.
6. Remove the movie.
7. Confirm it disappears immediately and the empty state appears if it was the last favorite.

Expected outcome: Favorite state updates immediately and persists across page navigation.

### 4. Persistence

1. Favorite at least one movie.
2. Reload the browser tab.
3. Open `/favorites`.

Expected outcome: Previously favorited movies are restored from `localStorage`.

### 5. Cross-Tab Synchronization

1. Open CineList in two tabs.
2. Favorite a movie in tab A.
3. Switch to tab B.
4. Confirm tab B reflects the favorite when the browser emits storage events.
5. Remove the favorite in tab A and confirm tab B updates when available.

Expected outcome: Current tab always updates immediately; other tabs synchronize through storage events where supported.

### 6. Accessibility and Responsive Layout

1. Navigate Home, Details, and Favorites using only the keyboard.
2. Confirm movie links, favorite buttons, remove buttons, retry buttons, and navigation links have clear visible or accessible names.
3. Check representative mobile, tablet, and desktop viewport widths.

Expected outcome: Controls are reachable and usable by keyboard, and cards/details/favorites do not overlap or clip content.

## Reference Artifacts

- Data model: [data-model.md](./data-model.md)
- UI and service contract: [contracts/ui-contract.md](./contracts/ui-contract.md)
