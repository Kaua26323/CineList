# Phase 0 Research: CineList Movie Catalog and Favorites

## Decision: Use the existing Vite React TypeScript app as a single-page application

**Rationale**: The repository already contains Vite, React 19, TypeScript 6, React Router, TanStack Query, Vitest, Testing Library, and jsdom dependencies. Keeping a single app avoids extra project boundaries and matches the constitution's technical boundaries.

**Alternatives considered**: A multi-package workspace was rejected because the feature is a single browser app. A backend service was rejected because backend synchronization and accounts are out of scope.

## Decision: Use React Router for `/`, `/movie/:movieId`, `/favorites`, and fallback routes

**Rationale**: The feature needs three user-facing routes and one recovery route. React Router keeps route params typed at the page boundary and supports accessible links without custom navigation state.

**Alternatives considered**: Manual `window.location` routing was rejected because it weakens route tests and accessibility. Hash routing was rejected because no static host constraint requires it.

## Decision: Use TanStack Query for TMDB reads only

**Rationale**: Popular movies and movie details are remote reads with loading, success, empty, and error states. TanStack Query provides cache, retry, refetch, and observable state while keeping favorite persistence separate.

**Alternatives considered**: Component-local `useEffect` fetches were rejected because they would duplicate loading/error logic and risk violating service isolation. Storing TMDB responses in context was rejected because server state and client favorites have different lifecycles.

## Decision: Isolate TMDB calls in `services/tmdb`

**Rationale**: TMDB config, request construction, response validation, normalization, and user-friendly error mapping belong outside React components. Query hooks call typed services and pages consume query state.

**Alternatives considered**: Calling `fetch` directly in pages was rejected by the constitution. A generic API repository abstraction was rejected as unnecessary for two TMDB operations.

## Decision: Persist full favorite snapshots in `localStorage`

**Rationale**: The favorites page must display poster, title, source rating, release year, runtime, and genres without requiring a network call for every favorite. Persisting validated `FavoriteMovie` snapshots gives a reliable offline-ish current-browser view and still allows details navigation.

**Alternatives considered**: Persisting only movie IDs was rejected because favorites would need multiple TMDB detail requests to render required fields. Persisting raw TMDB detail payloads was rejected because it exposes DTO instability to UI and storage.

## Decision: Keep `FavoritesContext` as the single client-state owner

**Rationale**: Favorites are app-wide client state used by home cards, details, and favorites page. A context provider can initialize once, update immediately, handle storage warnings, and subscribe to cross-tab events.

**Alternatives considered**: Per-page `localStorage` reads were rejected because they can show stale UI and duplicate error handling. TanStack Query mutations were rejected because favorites are local client state, not remote server state.

## Decision: Synchronize tabs through the browser `storage` event

**Rationale**: The `storage` event is the platform-provided mechanism for notifying other tabs when `localStorage` changes. The current tab still updates through context state immediately.

**Alternatives considered**: `BroadcastChannel` was rejected because the requirements only require sync when available through storage events and localStorage remains the persistence source. Polling was rejected as unnecessary and wasteful.

## Decision: Use CSS Modules for component-level styles and one global baseline

**Rationale**: CSS Modules keep reusable components focused and avoid accidental style bleed. A small global stylesheet can define reset, root typography, and shared CSS variables.

**Alternatives considered**: CSS-in-JS and utility-first CSS were rejected because they are not part of the requested stack. A single global stylesheet was rejected because it scales poorly across route and component states.

## Decision: Use lucide-react only for icons in controls/status indicators

**Rationale**: lucide-react gives accessible, consistent SVG icons for favorite, remove, retry, navigation, and status affordances while visible text or labels provide meaning.

**Alternatives considered**: Custom inline SVGs were rejected because an icon library is requested and easier to test consistently. Icon-only controls without accessible labels were rejected for accessibility.

## Decision: Test behavior with Vitest, Testing Library, jsdom, and mocked fetch/storage

**Rationale**: The core risks are service error mapping, storage reliability, context synchronization, route state rendering, and interactions. Unit and component tests can cover those risks without depending on the live TMDB API.

**Alternatives considered**: Live API tests were rejected because they would be flaky and require secrets. Snapshot-heavy tests were rejected because state and accessibility behavior matter more than markup stability.
