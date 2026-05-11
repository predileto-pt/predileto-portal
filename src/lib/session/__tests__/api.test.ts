/**
 * Tests for the api layer: credentials, URL composition, error classification.
 */

const ORIGINAL_FETCH = global.fetch;

beforeAll(() => {
  process.env.NEXT_PUBLIC_ESTATE_OS_BASE_URL = "http://example.test";
});

afterEach(() => {
  global.fetch = ORIGINAL_FETCH;
});

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function validView(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    kind: "ANONYMOUS",
    user_id: null,
    capabilities: ["SAVE_FAVORITE", "VIEW_HISTORY", "SET_PREFERENCES"],
    prefs: {},
    favorites: [],
    ...overrides,
  };
}

describe("api layer", () => {
  it("getSession passes credentials: 'include' and parses the wire shape", async () => {
    const fetchMock = jest.fn().mockResolvedValue(jsonResponse(validView()));
    global.fetch = fetchMock as unknown as typeof global.fetch;

    const { getSession } = await import("../api");
    const view = await getSession();
    expect(view.kind).toBe("ANONYMOUS");
    expect(view.user_id).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("http://example.test/api/v1/session/me");
    expect(init.credentials).toBe("include");
    expect(init.method).toBe("GET");
  });

  it("initSession POSTs and parses the response", async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValue(jsonResponse(validView({ favorites: ["abc"] })));
    global.fetch = fetchMock as unknown as typeof global.fetch;

    const { initSession } = await import("../api");
    const view = await initSession();
    expect(view.favorites).toEqual(["abc"]);
    const [, init] = fetchMock.mock.calls[0];
    expect(init.method).toBe("POST");
    expect(init.credentials).toBe("include");
  });

  it("patchSession sends the patch body", async () => {
    const fetchMock = jest.fn().mockResolvedValue(jsonResponse(validView()));
    global.fetch = fetchMock as unknown as typeof global.fetch;

    const { patchSession } = await import("../api");
    await patchSession({ favorites: { add: ["x"] } });
    const [, init] = fetchMock.mock.calls[0];
    expect(init.method).toBe("PATCH");
    expect(init.body).toBe(JSON.stringify({ favorites: { add: ["x"] } }));
  });

  it("claimSession attaches Authorization: Bearer", async () => {
    const fetchMock = jest.fn().mockResolvedValue(jsonResponse(validView()));
    global.fetch = fetchMock as unknown as typeof global.fetch;

    const { claimSession } = await import("../api");
    await claimSession("token-abc");
    const [, init] = fetchMock.mock.calls[0];
    expect(init.headers.Authorization).toBe("Bearer token-abc");
  });

  it("classifies 401 SESSION_MISSING", async () => {
    // Fresh Response per call — bodies can only be read once.
    const fetchMock = jest.fn(async () =>
      jsonResponse({ error: { code: "SESSION_MISSING" } }, 401),
    );
    global.fetch = fetchMock as unknown as typeof global.fetch;

    const { getSession, SessionRequestError } = await import("../api");
    try {
      await getSession();
      fail("expected throw");
    } catch (err) {
      if (err instanceof SessionRequestError) {
        expect(err.error.kind).toBe("missing");
        expect(err.error.code).toBe("SESSION_MISSING");
      } else throw err;
    }
  });

  it("classifies 401 SESSION_INVALID", async () => {
    const fetchMock = jest.fn().mockResolvedValue(
      jsonResponse({ error: { code: "SESSION_INVALID" } }, 401),
    );
    global.fetch = fetchMock as unknown as typeof global.fetch;

    const { getSession, SessionRequestError } = await import("../api");
    try {
      await getSession();
      fail("expected throw");
    } catch (err) {
      if (err instanceof SessionRequestError) {
        expect(err.error.kind).toBe("invalid");
        expect(err.error.code).toBe("SESSION_INVALID");
      } else throw err;
    }
  });

  it("classifies 400 FAVORITE_LIMIT_EXCEEDED", async () => {
    const fetchMock = jest.fn().mockResolvedValue(
      jsonResponse(
        { error: { code: "FAVORITE_LIMIT_EXCEEDED", message: "max 500" } },
        400,
      ),
    );
    global.fetch = fetchMock as unknown as typeof global.fetch;

    const { patchSession, SessionRequestError } = await import("../api");
    try {
      await patchSession({ favorites: { add: ["x"] } });
      fail("expected throw");
    } catch (err) {
      if (err instanceof SessionRequestError) {
        expect(err.error.kind).toBe("validation");
        if (err.error.kind === "validation") {
          expect(err.error.code).toBe("FAVORITE_LIMIT_EXCEEDED");
        }
      } else throw err;
    }
  });

  it("maps unknown errors to transport", async () => {
    const fetchMock = jest.fn().mockResolvedValue(
      new Response("upstream blew up", { status: 503 }),
    );
    global.fetch = fetchMock as unknown as typeof global.fetch;

    const { getSession, SessionRequestError } = await import("../api");
    try {
      await getSession();
      fail("expected throw");
    } catch (err) {
      if (err instanceof SessionRequestError) {
        expect(err.error.kind).toBe("transport");
        if (err.error.kind === "transport") {
          expect(err.error.status).toBe(503);
        }
      } else throw err;
    }
  });

  it("network errors become transport with status 0", async () => {
    const fetchMock = jest.fn().mockRejectedValue(new Error("offline"));
    global.fetch = fetchMock as unknown as typeof global.fetch;

    const { getSession, SessionRequestError } = await import("../api");
    try {
      await getSession();
      fail("expected throw");
    } catch (err) {
      if (err instanceof SessionRequestError) {
        expect(err.error.kind).toBe("transport");
        if (err.error.kind === "transport") {
          expect(err.error.status).toBe(0);
        }
      } else throw err;
    }
  });
});
