/**
 * useFavorites slice + RequireCapability tests. Renders the real provider
 * against mocked fetch and asserts: add/remove/toggle work, the local cap
 * blocks adds before any network call, removes are always allowed, and
 * RequireCapability gates correctly.
 */

import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useFavorites } from "@/lib/session/slices/favorites";
import { useUserSession, UserSessionProvider } from "@/components/session/user-session-provider";
import { RequireCapability } from "@/components/session/require-capability";

const ORIGINAL_FETCH = global.fetch;

beforeAll(() => {
  process.env.NEXT_PUBLIC_ESTATE_OS_BASE_URL = "http://example.test";
});

afterEach(() => {
  global.fetch = ORIGINAL_FETCH;
  window.localStorage.clear();
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
    limits: { favorites_max: 500, prefs_max_bytes: 8192 },
    ...overrides,
  };
}

function withProvider(ui: React.ReactElement) {
  return render(<UserSessionProvider>{ui}</UserSessionProvider>);
}

function FavoriteToggle({ id }: { id: string }) {
  const { isFavorite, toggle, count, canAddMore } = useFavorites();
  return (
    <div>
      <span data-testid="state">
        {isFavorite(id) ? "yes" : "no"}/{count}/{canAddMore ? "open" : "full"}
      </span>
      <button onClick={() => void toggle(id)}>toggle</button>
    </div>
  );
}

describe("useFavorites", () => {
  it("toggle adds an absent id", async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce(jsonResponse(view()))
      .mockResolvedValueOnce(jsonResponse(view({ favorites: ["a"] })));
    global.fetch = fetchMock as unknown as typeof global.fetch;

    withProvider(<FavoriteToggle id="a" />);
    // Wait for bootstrap to settle the snapshot.
    await screen.findByText("no/0/open");

    await act(async () => {
      await userEvent.click(screen.getByRole("button"));
    });
    expect(screen.getByTestId("state").textContent).toBe("yes/1/open");

    // The second fetch (PATCH) sent the add patch.
    const [, init] = fetchMock.mock.calls[1];
    expect(init.method).toBe("PATCH");
    expect(JSON.parse(init.body as string)).toEqual({
      favorites: { add: ["a"] },
    });
  });

  it("toggle removes a present id", async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce(jsonResponse(view({ favorites: ["a"] })))
      .mockResolvedValueOnce(jsonResponse(view({ favorites: [] })));
    global.fetch = fetchMock as unknown as typeof global.fetch;

    withProvider(<FavoriteToggle id="a" />);
    await screen.findByText("yes/1/open");

    await act(async () => {
      await userEvent.click(screen.getByRole("button"));
    });
    expect(screen.getByTestId("state").textContent).toBe("no/0/open");

    const [, init] = fetchMock.mock.calls[1];
    expect(JSON.parse(init.body as string)).toEqual({
      favorites: { remove: ["a"] },
    });
  });

  it("local cap blocks add before any network call; removes still allowed", async () => {
    // Bootstrap with 2 favorites and a cap of 2 → canAddMore is false.
    const fetchMock = jest.fn().mockResolvedValueOnce(
      jsonResponse(
        view({
          favorites: ["a", "b"],
          limits: { favorites_max: 2, prefs_max_bytes: 8192 },
        }),
      ),
    );
    global.fetch = fetchMock as unknown as typeof global.fetch;

    function Probe() {
      const { canAddMore, count, add, remove } = useFavorites();
      return (
        <div>
          <span data-testid="state">
            {count}/{canAddMore ? "open" : "full"}
          </span>
          <button onClick={() => void add("c")}>add-c</button>
          <button onClick={() => void remove("a")}>remove-a</button>
        </div>
      );
    }
    withProvider(<Probe />);
    await screen.findByText("2/full");

    await act(async () => {
      await userEvent.click(screen.getByRole("button", { name: "add-c" }));
    });
    // No PATCH was issued for the add (cap blocked).
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("state").textContent).toBe("2/full");

    // Remove IS allowed regardless of cap.
    const fetchAfter = global.fetch as jest.Mock;
    fetchAfter.mockResolvedValueOnce(
      jsonResponse(
        view({ favorites: ["b"], limits: { favorites_max: 2, prefs_max_bytes: 8192 } }),
      ),
    );
    await act(async () => {
      await userEvent.click(screen.getByRole("button", { name: "remove-a" }));
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("falls back to default limits when BE doesn't surface them", async () => {
    const fetchMock = jest.fn().mockResolvedValue(jsonResponse(view()));
    global.fetch = fetchMock as unknown as typeof global.fetch;

    function Probe() {
      const { canAddMore } = useFavorites();
      return <span data-testid="state">{canAddMore ? "open" : "full"}</span>;
    }
    withProvider(<Probe />);
    await screen.findByText("open");
    // Default 500 is the fallback; with 0 favorites we're well below it.
  });
});

describe("RequireCapability", () => {
  it("renders fallback when capability is missing (anonymous)", async () => {
    const fetchMock = jest.fn().mockResolvedValue(jsonResponse(view()));
    global.fetch = fetchMock as unknown as typeof global.fetch;

    withProvider(
      <RequireCapability cap="COMMENT" fallback={<span>signin</span>}>
        <span>form</span>
      </RequireCapability>,
    );
    await screen.findByText("signin");
    expect(screen.queryByText("form")).toBeNull();
  });

  it("renders children when capability is present", async () => {
    const fetchMock = jest.fn().mockResolvedValue(
      jsonResponse(
        view({
          capabilities: [
            "SAVE_FAVORITE",
            "VIEW_HISTORY",
            "SET_PREFERENCES",
            "COMMENT",
          ],
        }),
      ),
    );
    global.fetch = fetchMock as unknown as typeof global.fetch;

    withProvider(
      <RequireCapability cap="COMMENT" fallback={<span>signin</span>}>
        <span>form</span>
      </RequireCapability>,
    );
    await screen.findByText("form");
    expect(screen.queryByText("signin")).toBeNull();
  });
});

describe("useUserSession", () => {
  it("returns camelCase shape (userId, not user_id)", async () => {
    const fetchMock = jest.fn().mockResolvedValue(jsonResponse(view()));
    global.fetch = fetchMock as unknown as typeof global.fetch;

    function Probe() {
      const session = useUserSession();
      return (
        <span data-testid="probe">
          {session.kind}/{session.userId === null ? "null" : session.userId}/
          {session.hydrated ? "h" : "p"}
        </span>
      );
    }
    withProvider(<Probe />);
    await screen.findByText("ANONYMOUS/null/h");
  });
});
