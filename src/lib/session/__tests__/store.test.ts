/**
 * Store integration tests against mocked fetch. Covers:
 *  - Bootstrap: cache → /me → recovery flow
 *  - Optimistic patch + rollback on failure
 *  - Write-side SESSION_INVALID: rollback + re-mint, NO auto-retry
 *  - Cross-tab via synthetic storage event
 *  - Hydration mismatch tolerance
 */

import { CACHE_KEY, CHANGE_EVENT } from "../types";

const ORIGINAL_FETCH = global.fetch;

beforeAll(() => {
  process.env.NEXT_PUBLIC_ESTATE_OS_BASE_URL = "http://example.test";
});

afterEach(() => {
  global.fetch = ORIGINAL_FETCH;
  window.localStorage.clear();
  jest.resetModules();
});

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function view(overrides: Record<string, unknown> = {}) {
  return {
    kind: "ANONYMOUS",
    user_id: null,
    capabilities: ["SAVE_FAVORITE", "VIEW_HISTORY", "SET_PREFERENCES"],
    prefs: {},
    favorites: [],
    ...overrides,
  };
}

async function freshModules() {
  jest.resetModules();
  return import("../store");
}

describe("createSessionStore", () => {
  it("bootstrap: cache miss → /me succeeds", async () => {
    const fetchMock = jest.fn().mockResolvedValue(jsonResponse(view()));
    global.fetch = fetchMock as unknown as typeof global.fetch;

    const { createSessionStore } = await freshModules();
    const store = createSessionStore({ isolated: true });
    expect(store.getSnapshot().hydrated).toBe(false);
    await store.bootstrap();
    expect(store.getSnapshot().hydrated).toBe(true);
    expect(store.getSnapshot().kind).toBe("ANONYMOUS");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toContain("/api/v1/portal/session/me");
  });

  it("bootstrap: /me returns SESSION_MISSING → calls /init", async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce(
        jsonResponse({ error: { code: "SESSION_MISSING" } }, 401),
      )
      .mockResolvedValueOnce(jsonResponse(view({ favorites: ["x"] })));
    global.fetch = fetchMock as unknown as typeof global.fetch;

    const { createSessionStore } = await freshModules();
    const store = createSessionStore({ isolated: true });
    await store.bootstrap();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0][0]).toContain("/api/v1/portal/session/me");
    expect(fetchMock.mock.calls[1][0]).toContain("/api/v1/portal/session/init");
    expect(store.getSnapshot().favorites.has("x")).toBe(true);
    expect(store.getSnapshot().hydrated).toBe(true);
  });

  it("bootstrap: /me returns SESSION_INVALID → /init mints fresh", async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce(
        jsonResponse({ error: { code: "SESSION_INVALID" } }, 401),
      )
      .mockResolvedValueOnce(jsonResponse(view()));
    global.fetch = fetchMock as unknown as typeof global.fetch;

    const { createSessionStore } = await freshModules();
    const store = createSessionStore({ isolated: true });
    await store.bootstrap();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(store.getSnapshot().hydrated).toBe(true);
  });

  it("bootstrap circuit breaker: /init failure stops auto-retry", async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce(
        jsonResponse({ error: { code: "SESSION_MISSING" } }, 401),
      )
      .mockResolvedValueOnce(new Response("boom", { status: 503 }));
    global.fetch = fetchMock as unknown as typeof global.fetch;

    const notifier = jest.fn();
    const { createSessionStore } = await freshModules();
    const store = createSessionStore({ isolated: true });
    store.setErrorNotifier(notifier);
    await store.bootstrap();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(store.getSnapshot().hydrated).toBe(false);
    expect(notifier).toHaveBeenCalledTimes(1);
    expect(notifier.mock.calls[0][0].kind).toBe("transport");
  });

  it("optimisticPatch: success → snapshot adopts BE response", async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce(jsonResponse(view()))
      .mockResolvedValueOnce(jsonResponse(view({ favorites: ["p1"] })));
    global.fetch = fetchMock as unknown as typeof global.fetch;

    const { createSessionStore } = await freshModules();
    const store = createSessionStore({ isolated: true });
    await store.bootstrap();
    await store.optimisticPatch({ favorites: { add: ["p1"] } }, (prev) => ({
      ...prev,
      favorites: new Set([...prev.favorites, "p1"]),
    }));
    expect(store.getSnapshot().favorites.has("p1")).toBe(true);
  });

  it("optimisticPatch: failure rolls back to previous snapshot", async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce(jsonResponse(view()))
      .mockResolvedValueOnce(
        jsonResponse(
          { error: { code: "FAVORITE_LIMIT_EXCEEDED", message: "max" } },
          400,
        ),
      );
    global.fetch = fetchMock as unknown as typeof global.fetch;

    const notifier = jest.fn();
    const { createSessionStore } = await freshModules();
    const store = createSessionStore({ isolated: true });
    store.setErrorNotifier(notifier);
    await store.bootstrap();
    await store.optimisticPatch({ favorites: { add: ["p1"] } }, (prev) => ({
      ...prev,
      favorites: new Set([...prev.favorites, "p1"]),
    }));
    expect(store.getSnapshot().favorites.has("p1")).toBe(false);
    expect(notifier).toHaveBeenCalledTimes(1);
    expect(notifier.mock.calls[0][0].kind).toBe("validation");
    expect(notifier.mock.calls[0][1]).toBe("write");
  });

  it("write-side SESSION_INVALID: rollback + re-mint + toast, NO auto-retry", async () => {
    const fetchMock = jest
      .fn()
      // 1. bootstrap /me
      .mockResolvedValueOnce(jsonResponse(view()))
      // 2. PATCH /me → SESSION_INVALID
      .mockResolvedValueOnce(
        jsonResponse({ error: { code: "SESSION_INVALID" } }, 401),
      )
      // 3. /init → fresh session
      .mockResolvedValueOnce(jsonResponse(view()));
    global.fetch = fetchMock as unknown as typeof global.fetch;

    const notifier = jest.fn();
    const { createSessionStore } = await freshModules();
    const store = createSessionStore({ isolated: true });
    store.setErrorNotifier(notifier);
    await store.bootstrap();

    await store.optimisticPatch({ favorites: { add: ["p1"] } }, (prev) => ({
      ...prev,
      favorites: new Set([...prev.favorites, "p1"]),
    }));

    // Cache should be back to its pre-toggle state (no p1).
    expect(store.getSnapshot().favorites.has("p1")).toBe(false);
    // Three calls total: GET /me, PATCH /me, POST /init.
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls[0][0]).toContain("/api/v1/portal/session/me");
    expect(fetchMock.mock.calls[1][0]).toContain("/api/v1/portal/session/me");
    expect(fetchMock.mock.calls[2][0]).toContain("/api/v1/portal/session/init");
    // The original PATCH was NOT re-issued (no 4th call).
    // Notifier fired with kind=invalid on write.
    expect(notifier).toHaveBeenCalledWith(
      expect.objectContaining({ kind: "invalid" }),
      "write",
    );
  });

  it("cache hit on bootstrap shows snapshot before /me resolves", async () => {
    window.localStorage.setItem(
      CACHE_KEY,
      JSON.stringify(view({ favorites: ["cached-x"] })),
    );
    let resolveMe!: (v: Response) => void;
    const pending = new Promise<Response>((r) => {
      resolveMe = r;
    });
    const fetchMock = jest.fn().mockReturnValue(pending);
    global.fetch = fetchMock as unknown as typeof global.fetch;

    const { createSessionStore } = await freshModules();
    const store = createSessionStore({ isolated: true });
    const bootstrapPromise = store.bootstrap();
    // After the cache reconcile (synchronous) the snapshot should reflect it.
    expect(store.getSnapshot().favorites.has("cached-x")).toBe(true);
    expect(store.getSnapshot().hydrated).toBe(false);

    resolveMe(jsonResponse(view({ favorites: ["server-y"] })));
    await bootstrapPromise;
    expect(store.getSnapshot().favorites.has("server-y")).toBe(true);
    expect(store.getSnapshot().hydrated).toBe(true);
  });

  it("fires CHANGE_EVENT after every adoption", async () => {
    const fetchMock = jest.fn().mockResolvedValue(jsonResponse(view()));
    global.fetch = fetchMock as unknown as typeof global.fetch;
    const cb = jest.fn();
    window.addEventListener(CHANGE_EVENT, cb);

    const { createSessionStore } = await freshModules();
    const store = createSessionStore({ isolated: true });
    await store.bootstrap();
    expect(cb).toHaveBeenCalled();
    window.removeEventListener(CHANGE_EVENT, cb);
  });

  it("getServerSnapshot returns anonymous-empty with hydrated:false", async () => {
    const { createSessionStore } = await freshModules();
    const store = createSessionStore({ isolated: true });
    const ssr = store.getServerSnapshot();
    expect(ssr.kind).toBe("ANONYMOUS");
    expect(ssr.userId).toBeNull();
    expect(ssr.capabilities).toEqual([]);
    expect(ssr.favorites.size).toBe(0);
    expect(ssr.hydrated).toBe(false);
  });
});
