import {
  readCache,
  writeCache,
  clearCache,
  subscribeCrossTab,
} from "../cache";
import { CACHE_KEY } from "../types";

beforeEach(() => {
  window.localStorage.clear();
});

describe("session cache", () => {
  const valid = {
    kind: "ANONYMOUS" as const,
    user_id: null,
    capabilities: ["SAVE_FAVORITE", "VIEW_HISTORY", "SET_PREFERENCES"] as const,
    prefs: {},
    favorites: [],
  };

  it("write/read roundtrip", () => {
    writeCache({ ...valid, capabilities: [...valid.capabilities] });
    const got = readCache();
    expect(got?.kind).toBe("ANONYMOUS");
    expect(got?.user_id).toBeNull();
  });

  it("returns null when absent", () => {
    expect(readCache()).toBeNull();
  });

  it("clears + logs on invalid JSON", () => {
    window.localStorage.setItem(CACHE_KEY, "not json {{{");
    const warn = jest.fn();
    expect(readCache({ warn })).toBeNull();
    expect(window.localStorage.getItem(CACHE_KEY)).toBeNull();
    expect(warn).toHaveBeenCalledWith(
      "session_cache_invalid",
      expect.objectContaining({ reason: "json_parse" }),
    );
  });

  it("clears + logs on schema mismatch", () => {
    window.localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ kind: "BOGUS", favorites: 42 }),
    );
    const warn = jest.fn();
    expect(readCache({ warn })).toBeNull();
    expect(window.localStorage.getItem(CACHE_KEY)).toBeNull();
    expect(warn).toHaveBeenCalledWith(
      "session_cache_invalid",
      expect.objectContaining({ reason: "schema_mismatch" }),
    );
  });

  it("clearCache wipes the key", () => {
    writeCache({ ...valid, capabilities: [...valid.capabilities] });
    expect(window.localStorage.getItem(CACHE_KEY)).not.toBeNull();
    clearCache();
    expect(window.localStorage.getItem(CACHE_KEY)).toBeNull();
  });

  it("subscribeCrossTab fires on storage event for our key only", () => {
    const cb = jest.fn();
    const unsubscribe = subscribeCrossTab(cb);
    window.dispatchEvent(
      new StorageEvent("storage", { key: CACHE_KEY }),
    );
    expect(cb).toHaveBeenCalledTimes(1);
    window.dispatchEvent(
      new StorageEvent("storage", { key: "different-key" }),
    );
    expect(cb).toHaveBeenCalledTimes(1);
    unsubscribe();
    window.dispatchEvent(
      new StorageEvent("storage", { key: CACHE_KEY }),
    );
    expect(cb).toHaveBeenCalledTimes(1);
  });
});
