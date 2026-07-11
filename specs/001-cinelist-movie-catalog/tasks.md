# Tasks: CineList Movie Catalog and Favorites

**Input**: Design documents from `/specs/001-cinelist-movie-catalog/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/ui-contract.md](./contracts/ui-contract.md), [quickstart.md](./quickstart.md)

**Tests**: Test tasks are REQUIRED for changed CineList core behavior, including API services, favorites storage, favorites context, route behavior, loading states, empty states, error states, and favorite/remove interactions. Test tasks below must be written before their implementation tasks and should fail until implementation is completed.

**Organization**: Tasks are grouped by user story priority to enable independent implementation and testing.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare the Vite/React/TypeScript app for tested feature implementation.

- [X] T001 Add `test`, `test:run`, and `coverage` scripts and add `lucide-react` dependency in package.json
- [X] T002 [P] Configure Vitest jsdom setup in vite.config.ts
- [X] T003 [P] Create Testing Library setup imports in src/test/setup.ts
- [X] T004 [P] Create shared route/query render helpers in src/test/test-utils.tsx
- [X] T005 [P] Create global browser style baseline and shared CSS design tokens for CineList dark theme in src/styles/globals.css
- [X] T006 Import src/styles/globals.css from src/main.tsx
- [X] T007 [P] Document required TMDB environment variables in .env.example

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Add shared types, constants, providers, and shell components required by every user story.

**CRITICAL**: No user story work can begin until this phase is complete.

- [X] T008 [P] Define typed `AppError` and error factory helpers in src/types/errors.ts
- [X] T009 [P] Define TMDB DTO, MovieSummary, MovieDetails, CastMember, FavoriteMovie, and FavoriteCollection types in src/types/movies.ts
- [X] T010 [P] Define TMDB and favorites constants in src/utils/constants.ts
- [X] T011 [P] Create reusable Button component with CSS Module styles in src/components/Button/Button.tsx and src/components/Button/Button.module.css
- [X] T012 [P] Create reusable LoadingSpinner component with CSS Module styles in src/components/LoadingSpinner/LoadingSpinner.tsx and src/components/LoadingSpinner/LoadingSpinner.module.css
- [X] T013 [P] Create reusable ErrorMessage component with retry/link support in src/components/ErrorMessage/ErrorMessage.tsx and src/components/ErrorMessage/ErrorMessage.module.css
- [X] T014 [P] Create PageShell layout with semantic header/nav/main landmarks in src/components/PageShell/PageShell.tsx and src/components/PageShell/PageShell.module.css
- [X] T015 Create app provider composition for BrowserRouter, QueryClientProvider, FavoritesProvider, routes, and PageShell in src/App.tsx
- [X] T016 [P] Create NotFound route component with accessible recovery link in src/pages/NotFound.tsx and src/pages/NotFound.module.css

**Checkpoint**: Foundation ready; user story implementation can now begin.

---

## Phase 3: User Story 1 - Discover and Favorite a Movie (Priority: P1) MVP

**Goal**: A user can browse popular movies, open details, and favorite a movie from the details page with immediate UI feedback.

**Independent Test**: Start with no favorite for a visible popular movie, open `/`, select that movie, favorite it from `/movie/:movieId`, and verify the details control changes to a remove action while the movie is treated as favorited.

### Tests for User Story 1 (REQUIRED)

- [X] T017 [P] [US1] Write failing TMDB client tests for config, success, non-2xx, network failure, and user-friendly AppError mapping in src/services/tmdb/client.test.ts
- [X] T018 [P] [US1] Write failing TMDB movie service and normalizer tests for popular movies, movie details, empty results, invalid IDs, not-found responses, and missing optional fields in src/services/tmdb/movies.test.ts
- [X] T019 [P] [US1] Write failing favorites storage tests for empty read, malformed JSON recovery, duplicate validation, and write failure result in src/services/favoritesStorage.test.ts
- [X] T020 [P] [US1] Write failing FavoritesProvider tests for initialization, addFavorite immediate state, duplicate refresh, storage warning, and isFavorited in src/contexts/favorites/favoritesProvider.test.tsx
- [X] T021 [P] [US1] Write failing Home route tests for loading, success grid, empty popular results, error with retry, favorite indicators, and movie navigation in src/pages/Home.test.tsx
- [X] T022 [P] [US1] Write failing MovieDetails route tests for invalid param, loading, success fields, missing optional fields, error recovery, and Favorite toggle interaction in src/pages/MovieDetails.test.tsx

### Implementation for User Story 1

- [X] T023 [P] [US1] Implement TMDB request client with environment config, URL building, fetch execution, and AppError mapping in src/services/tmdb/client.ts
- [X] T024 [P] [US1] Implement TMDB response normalizers and details-to-favorite conversion in src/services/tmdb/normalizers.ts
- [X] T025 [US1] Implement `getPopularMovies` and `getMovieDetails` service functions in src/services/tmdb/movies.ts
- [X] T026 [P] [US1] Implement favoritesStorage read/write/validate helpers with storage error results in src/services/favoritesStorage.ts
- [X] T027 [P] [US1] Create FavoritesContext object and value types in src/contexts/favorites/favoritesContext.tsx
- [X] T028 [US1] Implement FavoritesProvider addFavorite, removeFavorite placeholder, duplicate refresh, storage persistence, and storage warning behavior in src/contexts/favorites/favoritesProvider.tsx
- [X] T029 [P] [US1] Implement `useFavoritesContext` guard hook in src/hooks/useFavoritesContext.ts
- [X] T030 [P] [US1] Implement TanStack Query hooks for popular movies and details in src/hooks/usePopularMovies.ts and src/hooks/useMovieDetails.ts
- [X] T031 [P] [US1] Create MovieCard component with poster fallback, title, metadata, favorite indicator, accessible details link, and CSS Module styles in src/components/MovieCard/MovieCard.tsx and src/components/MovieCard/MovieCard.module.css
- [X] T032 [P] [US1] Create MovieGrid component with responsive CSS Grid constraints in src/components/MovieGrid/MovieGrid.tsx and src/components/MovieGrid/MovieGrid.module.css
- [X] T033 [P] [US1] Create favorite toggle Button composition using lucide-react icons and `aria-pressed` in src/components/Button/FavoriteToggle.tsx
- [X] T034 [US1] Implement Home route loading/success/empty/error states and popular movie grid in src/pages/Home.tsx and src/pages/Home.module.css
- [X] T035 [US1] Implement MovieDetails route param validation, loading/success/error/not-found states, details UI, and Favorite action in src/pages/MovieDetails.tsx and src/pages/MovieDetails.module.css
- [X] T036 [US1] Register `/`, `/movie/:movieId`, and fallback routes with provider composition in src/App.tsx

**Checkpoint**: User Story 1 is fully functional and testable as the MVP.

---

## Phase 4: User Story 2 - View Favorite Movies (Priority: P2)

**Goal**: A user can open a dedicated favorites page, see all saved favorite movies, and navigate from a favorite item back to details.

**Independent Test**: Add at least one favorite movie, open `/favorites`, verify the saved movie appears with required summary fields, select Details, and verify the selected movie details page opens.

### Tests for User Story 2 (REQUIRED)

- [ ] T037 [P] [US2] Write failing Favorites route tests for populated favorites, required favorite summary fields, storage warning display, and Details navigation in src/pages/Favorites.test.tsx
- [ ] T038 [P] [US2] Write failing MovieCard or favorites item accessibility tests for Details link role/name and visible favorite metadata in src/components/MovieCard/MovieCard.test.tsx

### Implementation for User Story 2

- [ ] T039 [P] [US2] Extend MovieCard props to support FavoriteMovie display mode and Details action labels in src/components/MovieCard/MovieCard.tsx
- [ ] T040 [US2] Implement Favorites route populated success state, storage warning state, Details links, and responsive favorite grid in src/pages/Favorites.tsx and src/pages/Favorites.module.css
- [ ] T041 [US2] Register `/favorites` route and header navigation active state in src/App.tsx and src/components/PageShell/PageShell.tsx
- [ ] T042 [US2] Verify favorites page uses only `useFavoritesContext` and does not call TMDB services in src/pages/Favorites.tsx

**Checkpoint**: User Stories 1 and 2 both work independently.

---

## Phase 5: User Story 3 - Remove a Favorite Movie (Priority: P3)

**Goal**: A user can remove a favorite from the details page or favorites page and see the UI update immediately without refresh.

**Independent Test**: Start with a favorited movie, remove it from `/movie/:movieId` and verify the control changes to Favorite. Repeat from `/favorites` and verify the item disappears without a page refresh.

### Tests for User Story 3 (REQUIRED)

- [ ] T043 [P] [US3] Write failing FavoritesProvider tests for removeFavorite immediate state, persisted removal, missing ID no-op, and removing the last favorite in src/contexts/favorites/favoritesProvider.test.tsx
- [ ] T044 [P] [US3] Write failing MovieDetails remove interaction test for favorited movie state changing back to Favorite in src/pages/MovieDetails.test.tsx
- [ ] T045 [P] [US3] Write failing Favorites route remove interaction test for immediate item removal and last-favorite transition to empty state in src/pages/Favorites.test.tsx

### Implementation for User Story 3

- [ ] T046 [US3] Complete removeFavorite behavior with immediate state update, localStorage persistence, and safe no-op for unknown IDs in src/contexts/favorites/favoritesProvider.tsx
- [ ] T047 [US3] Wire MovieDetails favorited-state remove action to `removeFavorite(movieId)` in src/pages/MovieDetails.tsx
- [ ] T048 [US3] Add Remove button with lucide-react icon, accessible name including movie title, and immediate removal handling in src/pages/Favorites.tsx
- [ ] T049 [US3] Add focused remove button styles and non-overlapping favorite item controls in src/pages/Favorites.module.css

**Checkpoint**: User Stories 1, 2, and 3 are independently functional.

---

## Phase 6: User Story 4 - Understand Empty Favorites (Priority: P4)

**Goal**: A user with no favorites sees a clear empty favorites state and can navigate back to browse movies.

**Independent Test**: Clear all favorites, open `/favorites`, verify a clear empty message explains how favorites are added, then activate Browse movies and verify navigation to `/`.

### Tests for User Story 4 (REQUIRED)

- [ ] T050 [P] [US4] Write failing Favorites route empty-state tests for no favorites message, add-from-details guidance, and Browse movies navigation in src/pages/Favorites.test.tsx

### Implementation for User Story 4

- [ ] T051 [US4] Implement empty favorites state copy, Browse movies link, and no empty grid rendering in src/pages/Favorites.tsx
- [ ] T052 [US4] Add accessible and responsive empty-state layout styles in src/pages/Favorites.module.css
- [ ] T053 [US4] Ensure removing the last favorite routes through the same empty state component in src/pages/Favorites.tsx

**Checkpoint**: Empty favorites behavior is independently testable.

---

## Phase 7: User Story 5 - Keep Favorites Synchronized Across Tabs (Priority: P5)

**Goal**: A user with multiple open browser tabs sees favorite changes reflected across tabs when browser storage events are available.

**Independent Test**: Open CineList in two tabs, add or remove a favorite in one tab, switch to the other tab, and verify favorite state updates when storage events are emitted.

### Tests for User Story 5 (REQUIRED)

- [ ] T054 [P] [US5] Write failing favoritesStorage tests for parsing valid storage event payloads, ignoring unrelated keys, and recovering from malformed event payloads in src/services/favoritesStorage.test.ts
- [ ] T055 [P] [US5] Write failing FavoritesProvider cross-tab synchronization tests for add, remove, malformed payload, and unavailable storage event behavior in src/contexts/favorites/favoritesProvider.test.tsx

### Implementation for User Story 5

- [ ] T056 [US5] Implement favoritesStorage storage-event parsing helpers for the configured favorites key in src/services/favoritesStorage.ts
- [ ] T057 [US5] Add storage event subscription, cleanup, and validated external state replacement in src/contexts/favorites/favoritesProvider.tsx
- [ ] T058 [US5] Surface non-blocking storage synchronization warnings through PageShell or affected pages in src/components/PageShell/PageShell.tsx

**Checkpoint**: Cross-tab synchronization behavior is test-covered and implemented.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Finish constitution checks, accessibility, responsiveness, and verification across all user stories.

- [ ] T059 [P] Add route-level accessibility regression tests for header navigation, retry actions, favorite buttons, remove buttons, and not-found recovery in src/App.test.tsx
- [ ] T060 [P] Add focused responsive CSS checks or class-level tests for MovieGrid and Favorites layouts in src/components/MovieGrid/MovieGrid.test.tsx and src/pages/Favorites.test.tsx
- [ ] T061 Audit and remove any direct TMDB `fetch` usage outside src/services/tmdb and query hooks in src/pages/Home.tsx, src/pages/MovieDetails.tsx, and src/components/MovieCard/MovieCard.tsx
- [ ] T062 Audit scope boundaries to ensure no search, pagination, accounts, backend sync, sharing, custom ratings, or theme modes were added in src/App.tsx and src/pages/Home.tsx
- [ ] T063 Run and fix lint issues with `npm run lint` across src/
- [ ] T064 Run and fix type/build issues with `npm run build` across src/
- [ ] T065 Run and fix automated tests with `npm run test:run` across src/
- [ ] T066 Execute quickstart manual validation scenarios and record any unavailable verification notes in specs/001-cinelist-movie-catalog/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 Setup**: No dependencies; start immediately.
- **Phase 2 Foundational**: Depends on Phase 1 and blocks all user stories.
- **Phase 3 US1**: Depends on Phase 2; this is the MVP.
- **Phase 4 US2**: Depends on Phase 2 and benefits from US1 components/context, but remains independently testable with seeded favorites.
- **Phase 5 US3**: Depends on Phase 2 and favorite context from US1; can be tested with seeded state.
- **Phase 6 US4**: Depends on Phase 2 and the Favorites route shell from US2.
- **Phase 7 US5**: Depends on Phase 2 and favorite storage/context from US1.
- **Phase 8 Polish**: Depends on all implemented target user stories.

### User Story Dependencies

- **US1 (P1)**: MVP; no dependency on other stories after foundation.
- **US2 (P2)**: Requires favorites context and FavoriteMovie model from US1 foundation work; can be tested with mocked provider state.
- **US3 (P3)**: Requires favorites context and details/favorites route surfaces.
- **US4 (P4)**: Requires favorites route surface from US2.
- **US5 (P5)**: Requires favorites storage/context from US1.

### Within Each User Story

- Write tests first and verify they fail before implementation.
- Implement types/helpers before services.
- Implement services before hooks and route components that consume them.
- Implement route state handling before accessibility and responsive polish for that route.
- Validate each story at its checkpoint before moving to the next priority.

## Parallel Opportunities

- T002, T003, T004, T005, and T007 can run in parallel after T001 is understood.
- T008 through T014 and T016 can run in parallel because they create separate shared files.
- US1 tests T017 through T022 can run in parallel before implementation.
- US1 implementation tasks T023, T024, T026, T027, T029, T031, T032, and T033 can run in parallel after foundation.
- US2 tests T037 and T038 can run in parallel.
- US3 tests T043, T044, and T045 can run in parallel.
- US5 tests T054 and T055 can run in parallel.
- Polish tasks T059 and T060 can run in parallel before full verification commands.

## Parallel Example: User Story 1

```text
Task: "Write failing TMDB client tests for config, success, non-2xx, network failure, and user-friendly AppError mapping in src/services/tmdb/client.test.ts"
Task: "Write failing TMDB movie service and normalizer tests for popular movies, movie details, empty results, invalid IDs, not-found responses, and missing optional fields in src/services/tmdb/movies.test.ts"
Task: "Write failing favorites storage tests for empty read, malformed JSON recovery, duplicate validation, and write failure result in src/services/favoritesStorage.test.ts"
Task: "Write failing FavoritesProvider tests for initialization, addFavorite immediate state, duplicate refresh, storage warning, and isFavorited in src/contexts/favorites/favoritesProvider.test.tsx"
Task: "Write failing Home route tests for loading, success grid, empty popular results, error with retry, favorite indicators, and movie navigation in src/pages/Home.test.tsx"
Task: "Write failing MovieDetails route tests for invalid param, loading, success fields, missing optional fields, error recovery, and Favorite toggle interaction in src/pages/MovieDetails.test.tsx"
```

## Parallel Example: User Story 2

```text
Task: "Write failing Favorites route tests for populated favorites, required favorite summary fields, storage warning display, and Details navigation in src/pages/Favorites.test.tsx"
Task: "Write failing MovieCard or favorites item accessibility tests for Details link role/name and visible favorite metadata in src/components/MovieCard/MovieCard.test.tsx"
```

## Parallel Example: User Story 3

```text
Task: "Write failing FavoritesProvider tests for removeFavorite immediate state, persisted removal, missing ID no-op, and removing the last favorite in src/contexts/favorites/favoritesProvider.test.tsx"
Task: "Write failing MovieDetails remove interaction test for favorited movie state changing back to Favorite in src/pages/MovieDetails.test.tsx"
Task: "Write failing Favorites route remove interaction test for immediate item removal and last-favorite transition to empty state in src/pages/Favorites.test.tsx"
```

## Parallel Example: User Story 5

```text
Task: "Write failing favoritesStorage tests for parsing valid storage event payloads, ignoring unrelated keys, and recovering from malformed event payloads in src/services/favoritesStorage.test.ts"
Task: "Write failing FavoritesProvider cross-tab synchronization tests for add, remove, malformed payload, and unavailable storage event behavior in src/contexts/favorites/favoritesProvider.test.tsx"
```

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 setup.
2. Complete Phase 2 foundational files and providers.
3. Complete Phase 3 User Story 1 tests and implementation.
4. Stop and validate US1 independently with automated tests and the quickstart browse/details/favorite scenario.

### Incremental Delivery

1. Deliver US1 as the MVP discovery/details/favorite loop.
2. Add US2 so saved movies can be viewed from `/favorites`.
3. Add US3 so removal is reliable from details and favorites.
4. Add US4 to make empty favorites understandable.
5. Add US5 for storage-event cross-tab synchronization.
6. Complete polish verification and constitution checks.

### Parallel Team Strategy

1. Complete setup and foundation together.
2. Assign US1 service, storage/context, and route/component work to separate developers after tests are written.
3. After foundation, US2 and US3 can proceed with mocked provider state while US1 integration finishes.
4. US5 can proceed in parallel with later UI work once storage/context contracts are stable.

## Notes

- [P] tasks touch separate files or can be completed without depending on incomplete tasks.
- Every user story phase includes required tests before implementation tasks.
- All task descriptions include file paths and use the required checkbox format.
- Keep TMDB API logic isolated to `src/services/tmdb` and service-specific hooks.
- Keep favorites persistence in `src/services/favoritesStorage.ts` and `src/contexts/favorites/`.
- Do not add search, pagination, infinite scroll, accounts, backend sync, sharing, custom ratings, or theme modes.
