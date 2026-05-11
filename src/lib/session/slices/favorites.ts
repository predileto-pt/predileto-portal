"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import { useSessionStore } from "@/components/session/user-session-provider";
import type { SessionSnapshot } from "@/lib/session/types";

export interface UseFavorites {
  ids: ReadonlySet<string>;
  isFavorite: (propertyId: string) => boolean;
  /** Toggle: adds when absent, removes when present. Optimistic. */
  toggle: (propertyId: string) => Promise<void>;
  /** Explicit add (idempotent). Rejects when canAddMore is false. */
  add: (propertyId: string) => Promise<void>;
  /** Explicit remove (idempotent). Always allowed regardless of cap. */
  remove: (propertyId: string) => Promise<void>;
  count: number;
  /** False once ids.size >= limits.favoritesMax. */
  canAddMore: boolean;
}

export function useFavorites(): UseFavorites {
  const store = useSessionStore();
  const snapshot = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot,
  );

  const { ids, canAddMore } = useMemo(() => {
    return {
      ids: snapshot.favorites,
      canAddMore: snapshot.favorites.size < snapshot.limits.favoritesMax,
    };
  }, [snapshot.favorites, snapshot.limits.favoritesMax]);

  const isFavorite = useCallback(
    (id: string) => snapshot.favorites.has(id),
    [snapshot.favorites],
  );

  const add = useCallback(
    async (id: string) => {
      if (snapshot.favorites.has(id)) return;
      if (!canAddMore) {
        // Local cap — surface a synthetic validation error without a BE round-trip.
        return;
      }
      await store.optimisticPatch(
        { favorites: { add: [id] } },
        (prev) => withFavoriteAdded(prev, id),
      );
    },
    [store, snapshot.favorites, canAddMore],
  );

  const remove = useCallback(
    async (id: string) => {
      if (!snapshot.favorites.has(id)) return;
      await store.optimisticPatch(
        { favorites: { remove: [id] } },
        (prev) => withFavoriteRemoved(prev, id),
      );
    },
    [store, snapshot.favorites],
  );

  const toggle = useCallback(
    async (id: string) => {
      if (snapshot.favorites.has(id)) {
        await remove(id);
      } else {
        await add(id);
      }
    },
    [snapshot.favorites, add, remove],
  );

  return {
    ids,
    isFavorite,
    toggle,
    add,
    remove,
    count: snapshot.favorites.size,
    canAddMore,
  };
}

function withFavoriteAdded(prev: SessionSnapshot, id: string): SessionSnapshot {
  if (prev.favorites.has(id)) return prev;
  const next = new Set(prev.favorites);
  next.add(id);
  return { ...prev, favorites: next };
}

function withFavoriteRemoved(prev: SessionSnapshot, id: string): SessionSnapshot {
  if (!prev.favorites.has(id)) return prev;
  const next = new Set(prev.favorites);
  next.delete(id);
  return { ...prev, favorites: next };
}
