import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { FavoriteMovie } from "../../types/movies";
import { FAVORITES_STORAGE_KEY } from "../../utils/constants";
import { useFavoritesContext } from "../../hooks/useFavoritesContext";
import { FavoritesProvider } from "./favoritesProvider";

const originalFavorite: FavoriteMovie = {
  id: 42,
  title: "The Answer",
  posterPath: "/answer.jpg",
  releaseYear: "2025",
  voteAverage: 8.4,
  runtimeMinutes: 121,
  genres: ["Science Fiction"],
};

const refreshedFavorite: FavoriteMovie = {
  ...originalFavorite,
  title: "The Updated Answer",
  voteAverage: 8.8,
};

function FavoritesHarness({ favorite = originalFavorite }: { favorite?: FavoriteMovie }) {
  const context = useFavoritesContext();

  return (
    <div>
      <output aria-label="favorite count">{context.favorites.length}</output>
      <output aria-label="favorite titles">
        {context.favorites.map((movie) => movie.title).join(",")}
      </output>
      <output aria-label="is favorite">{String(context.isFavorited(42))}</output>
      {context.storageError && <p role="alert">{context.storageError.message}</p>}
      <button type="button" onClick={() => context.addFavorite(favorite)}>
        Add favorite
      </button>
    </div>
  );
}

function renderHarness(favorite?: FavoriteMovie) {
  return render(
    <FavoritesProvider>
      <FavoritesHarness favorite={favorite} />
    </FavoritesProvider>,
  );
}

describe("FavoritesProvider", () => {
  it("initializes favorites from localStorage", () => {
    window.localStorage.setItem(
      FAVORITES_STORAGE_KEY,
      JSON.stringify([originalFavorite]),
    );

    renderHarness();

    expect(screen.getByLabelText("favorite titles")).toHaveTextContent(
      "The Answer",
    );
    expect(screen.getByLabelText("is favorite")).toHaveTextContent("true");
  });

  it("updates state immediately and persists when adding a favorite", () => {
    renderHarness();

    fireEvent.click(screen.getByRole("button", { name: "Add favorite" }));

    expect(screen.getByLabelText("favorite count")).toHaveTextContent("1");
    expect(screen.getByLabelText("is favorite")).toHaveTextContent("true");
    expect(JSON.parse(window.localStorage.getItem(FAVORITES_STORAGE_KEY) ?? "[]"))
      .toEqual([originalFavorite]);
  });

  it("refreshes a duplicate favorite snapshot without duplicating it", () => {
    window.localStorage.setItem(
      FAVORITES_STORAGE_KEY,
      JSON.stringify([originalFavorite]),
    );
    renderHarness(refreshedFavorite);

    fireEvent.click(screen.getByRole("button", { name: "Add favorite" }));

    expect(screen.getByLabelText("favorite count")).toHaveTextContent("1");
    expect(screen.getByLabelText("favorite titles")).toHaveTextContent(
      "The Updated Answer",
    );
  });

  it("keeps in-memory state and exposes a warning when persistence fails", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("Quota exceeded", "QuotaExceededError");
    });
    renderHarness();

    fireEvent.click(screen.getByRole("button", { name: "Add favorite" }));

    expect(screen.getByLabelText("favorite titles")).toHaveTextContent(
      "The Answer",
    );
    expect(screen.getByRole("alert")).toHaveTextContent(/couldn't be saved/i);
  });
});
