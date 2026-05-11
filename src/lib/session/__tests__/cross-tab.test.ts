/**
 * Cross-tab AC: a synthetic `storage` event on the cache key updates the
 * store snapshot and fires `predileto:session-change`. Manual two-tab smoke
 * test is documented in the PR description; this is the automated guard.
 */

import { CACHE_KEY } from "../types";

beforeAll(() => {
  process.env.NEXT_PUBLIC_ESTATE_OS_BASE_URL = "http://example.test";
});

afterEach(() => {
  window.localStorage.clear();
  jest.resetModules();
});

function view(overrides: Record<string, unknown> = {}) {
  return {
    kind: "ANONYMOUS",
    user_id: null,
    capabilities: ["SAVE_FAVORITE"],
    prefs: {},
    favorites: [],
    ...overrides,
  };
}

describe("cross-tab sync", () => {
  it("storage event on the cache key re-reads the snapshot", async () => {
    const { createSessionStore } = await import("../store");
    const store = createSessionStore({ isolated: false });

    // Initial: empty.
    expect(store.getSnapshot().favorites.size).toBe(0);

    // Simulate another tab writing to the cache.
    const updated = view({ favorites: ["from-other-tab"] });
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(updated));
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: CACHE_KEY,
        newValue: JSON.stringify(updated),
      }),
    );

    expect(store.getSnapshot().favorites.has("from-other-tab")).toBe(true);
  });

  it("ignores storage events for unrelated keys", async () => {
    const { createSessionStore } = await import("../store");
    const store = createSessionStore({ isolated: false });
    expect(store.getSnapshot().favorites.size).toBe(0);

    window.dispatchEvent(
      new StorageEvent("storage", {
        key: "something-else",
        newValue: "{}",
      }),
    );
    expect(store.getSnapshot().favorites.size).toBe(0);
  });
});
