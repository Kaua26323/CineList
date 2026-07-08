# CineList - Movie Catalog with TMDB

**Date:** June 19, 2026
**Project:** CineList - Movie Catalog App
**Stack:** React + Vite + TypeScript + Vitest + CSS Modules

---

## 1. Overview

**CineList** is a web application that allows users to:

- Browse and discover movies from the TMDB API
- View complete details for each movie
- Favorite movies for later reference
- Access a dedicated page with their favorite movies
- Remove movies from the favorites list

Favorites are persisted in `localStorage` and automatically synchronized across browser tabs.

---

## 2. Functional Requirements

### FR1: Movie Listing (Home Page)

- **Description:** Display a catalog of movies from the TMDB API in a grid format
- **Displayed data:** Poster, title, and a visual indication of whether the movie is favorited
- **Interaction:** Clicking on a movie takes the user to the details page
- **Loading:** Show a spinner while data is loading
- **Error:** Display an error message if the request fails

### FR2: Movie Details Page

- **Description:** Display more information about the selected movie
- **Displayed data:**
  - Poster (large image)
  - Title and release year - (Year/Month/Day)
  - Full synopsis/description
  - TMDB rating
  - Genres
  - Runtime
  - Cast (if available)

- **Interactions:**
  - "Favorite" / "Remove from Favorites" button (toggleable)
  - "Back" button to return to the home page

- **Synchronization:** When favoriting/unfavoriting, update the global state

### FR3: Favorites System

- **Persistence:** Store the IDs of favorited movies in `localStorage`
- **Synchronization:** Update all components in real time when a movie is favorited/removed
- **Context:** `FavoritesContext` provides global state and functions (`addFavoriteMovie`, `removeFavoriteMovie`, `isFavorited`)

### FR4: Favorites Page

- **Description:** Show the list of movies favorited by the user
- **Displayed data:**
  - Movie poster
  - Title
  - TMDB rating
  - release year - (Year)
  - Runtime
  - Genres
  - "Details" button (redirects to the details page)
  - "Remove" button (removes the movie from the favorites list)

- **Empty state:** If there are no favorites, display a message ("No favorite movies")
- **Responsiveness:** Responsive grid that adjusts the number of columns

### FR5: Removing Favorites

- **Description:** Remove a movie from the favorites list
- **Activation locations:**
  - Button on the details page
  - Button on the favorites page

- **Feedback:** Immediate UI update

---

## 3. Technical Requirements

### Technology Stack

- **Framework:** React v19+
- **Build Tool:** Vite
- **Language:** TypeScript
- **Styling:** CSS Modules
- **Data Fetching:** TanStack Query v5+ (React Query)
- **Testing:** Vitest
- **Routing:** React Router v8+
- **API:** TMDB (The Movie Database)

### Main Dependencies

```json
{
  "react": "^19.2.0",
  "react-dom": "^19.2.0",
  "react-router": "^8.x",
  "@tanstack/react-query": "^5.x",
  "lucide-react": "^1.x"
}
```

### Development Dependencies

```json
{
  "vite": "^5.x",
  "typescript": "^5.x",
  "vitest": "^1.x",
  "@testing-library/react": "^14.x",
  "@testing-library/jest-dom": "^6.x"
}
```

---

## 4. Architecture

### 4.1 Application Layers

#### **Data Layer (Services)**

- `tmdbApi.ts` — HTTP calls to the TMDB API using fetch
  - `getPopularMovies()` — Fetch popular movies
  - `getMovieDetails(id)` — Fetch details for a specific movie
  - Centralized error handling

- `favoritesStorage.ts` — Favorites management with localStorage
  - `getFavoritesMoviesFromStorage()` — Read favorites from localStorage
  - `saveFavoriteMovieToStorage(favorites)` — Save favorites
  - `isFavorited(movieId)` — Check whether a movie is favorited

#### **State Layer (Contexts + Queries)**

- `FavoritesContext.tsx` — Context provider that:
  - Manages global favorites state
  - Automatically synchronizes with localStorage
  - Exposes hooks: `useFavoritesContext()`
  - Available functions: `addFavoriteMovie(movie)`, `removeFavoriteMovie(movieId)`, `isFavorited(movieId)`

- **TanStack Query** — Custom queries:
  - `usePopularMovies()` — Cache popular movies
  - `useMovieDetails(movieId)` — Cache movie details

#### **UI Layer (Components)**

- `Home.tsx` — Main page with a movie grid
- `MovieDetails.tsx` — Page with complete movie information
- `Favorites.tsx` — Page with the favorites list
- `MovieCard.tsx` — Reusable card displaying poster + title
- `LoadingSpinner.tsx` — Loading indicator
- `ErrorBoundary.tsx` — React error handling
- `App.tsx` — Router and providers

### 4.2 Data Flow

```txt
[TMDB API]
     ↓
[TanStack Query Cache]
     ↓
[React Components]
     ↓
[FavoritesContext]
     ↓
[localStorage]
```

1. **Data loading:** TanStack Query fetches data from the TMDB API and automatically caches it
2. **Favorites:** User clicks "Favorite" → updates `FavoritesContext` → synchronizes with localStorage
3. **Synchronization:** localStorage triggers automatic real-time re-renders

---

## 5. Folder Structure

```txt
src/
├── pages/
│   ├── Home.tsx              # Movie listing
│   ├── MovieDetails.tsx      # Details + favorite button
│   ├── Favorites.tsx         # Favorited movies
│   └── NotFound.tsx          # 404 page
├── components/
│   ├── MovieCard.tsx         # Individual movie card
│   ├── LoadingSpinner.tsx    # Loading spinner
│   ├── ErrorMessage.tsx      # Error message
│   └── ErrorBoundary.tsx     # Error boundary
├── contexts/
│   └── favorites/            # Favorites context/provider
├── hooks/
│   ├── usePopularMovies.ts   # Popular movies query hook
│   ├── useFavoritesContext.ts # Hook to access favorites context
│   └── useMovieDetails.ts    # Details query hook
├── services/
│   ├── apiRequest.ts         # fetch config
│   ├── tmdbApi.ts            # API calls
│   ├── favoritesStorage.ts   # localStorage CRUD
├── types/
│   ├── api-protocol.ts       # Tmdb response types
│   └── movies-protocol.ts    # TypeScript movie types
├── utils/
│   └── constants.ts          # URLs, keys, constants
├── App.tsx                   # Main router
├── globals.css               # Global styles
└── main.tsx                  # Entry point
```

---

## 6. Detailed Components

### `MovieCard.tsx`

- **Props:** `movie: Movie`, `onMovieClick?: () => void`
- **Renders:** Poster, title, favorite indicator
- **Styles:** CSS Module with hover effect

### `LoadingSpinner.tsx`

- **Renders:** Animated CSS spinner
- **Usage:** While TanStack Query is loading

### `ErrorBoundary.tsx`

- Captures React component errors
- Displays a fallback with a user-friendly message

---

## 7. User Flow

### **Scenario 1: Discover and Favorite a Movie**

1. User accesses the Home page → popular movie list loads
2. Clicks on a movie → navigates to `/movie/:id`
3. Views the movie details
4. Clicks "Favorite" → adds it to the context + localStorage
5. The button text changes to "Remove from Favorites"

### **Scenario 2: Access Favorites**

1. User accesses `/favorites`
2. Favorites list loads from localStorage via `FavoritesContext`
3. User can click on a movie to view details ("Details" button)
4. User can remove a movie by clicking "Remove"

### **Scenario 3: Synchronization Across Tabs**

1. User favorites a movie in tab 1
2. localStorage triggers the `storage` event
3. Tab 2 detects the change and updates `FavoritesContext`
4. Components automatically re-render

---

## 8. Error Handling

| Error                | Handling                                              |
| -------------------- | ----------------------------------------------------- |
| TMDB request failure | Display error message + retry button                  |
| Movie not found      | Redirect to 404 page or home                          |
| localStorage full    | Log the storage error and keep the UI responsive      |
| API rate limit       | Display an error message and allow retry              |

---

## 9. Testing

### Expected Coverage

- **Hooks:** `useFavoritesContext()`, `usePopularMovies()`, `useMovieDetails()` — unit tests
- **Services:** `tmdbApi.ts`, `favoritesStorage.ts` — request mocks
- **Contexts:** `FavoritesContext` — render + provider tests
- **Components:** Render, interaction, and state tests

### Test Examples

- ✅ Add movie to favorites → localStorage updates
- ✅ Remove movie from favorites → localStorage clears
- ✅ Click on movie → navigates to details
- ✅ Load details → displays all information
- ✅ API error → displays error message

## 10. Next Steps (Not Included in This Phase)

- [ ] Search/filter functionality
- [ ] Pagination or infinite scroll
- [ ] Light mode
- [ ] Custom user ratings
- [ ] Favorite sharing
- [ ] Custom backend to synchronize favorites across devices

---

## Approval Checklist

- ✅ Clear and defined scope
- ✅ Architecture organized into layers
- ✅ User flows mapped
- ✅ Error handling defined
- ✅ Technology stack chosen
- ✅ Folder structure defined
- ✅ No ambiguities or pending TODOs
