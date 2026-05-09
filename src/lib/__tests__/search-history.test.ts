import {
  addEntry,
  buildHistoryKey,
  clear,
  formatHistoryLabel,
  listEntries,
  __INTERNAL,
  type SearchHistoryEntry,
} from "@/lib/search-history";

const STORAGE_KEY = __INTERNAL.STORAGE_KEY;
const MAX = __INTERNAL.MAX_PER_LIST;

function makeEntry(overrides: Partial<SearchHistoryEntry> = {}): SearchHistoryEntry {
  return {
    url: "/pt/comprar/lisboa",
    label: "T2 em Lisboa",
    count: 12,
    timestamp: Date.now(),
    ...overrides,
  };
}

describe("search-history", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  describe("buildHistoryKey", () => {
    it("strips page and selected from query string", () => {
      expect(
        buildHistoryKey("/pt/comprar/lisboa?q=jardim&page=3&selected=abc"),
      ).toBe("/pt/comprar/lisboa?q=jardim");
    });

    it("preserves only the active filter params in a stable order", () => {
      // URLSearchParams preserves insertion order; we always set in FILTER_KEYS order
      expect(
        buildHistoryKey("/pt/arrendar?bedrooms=2&propertyType=apartment&q=varanda"),
      ).toBe("/pt/arrendar?q=varanda&propertyType=apartment&bedrooms=2");
    });

    it("returns just the pathname when no filters present", () => {
      expect(buildHistoryKey("/pt/comprar/lisboa?page=2")).toBe(
        "/pt/comprar/lisboa",
      );
    });

    it("ignores empty filter values", () => {
      expect(buildHistoryKey("/pt/comprar?q=&propertyType=house")).toBe(
        "/pt/comprar?propertyType=house",
      );
    });
  });

  describe("addEntry / listEntries / clear", () => {
    it("adds an entry to the correct bucket", () => {
      addEntry("buy", makeEntry({ url: "/pt/comprar/lisboa" }));
      expect(listEntries("buy")).toHaveLength(1);
      expect(listEntries("rent")).toHaveLength(0);
    });

    it("does not cross-contaminate buy and rent buckets", () => {
      addEntry("buy", makeEntry({ url: "/pt/comprar/lisboa" }));
      addEntry("rent", makeEntry({ url: "/pt/arrendar/porto" }));
      expect(listEntries("buy").map((e) => e.url)).toEqual([
        "/pt/comprar/lisboa",
      ]);
      expect(listEntries("rent").map((e) => e.url)).toEqual([
        "/pt/arrendar/porto",
      ]);
    });

    it("re-running an existing URL bumps it to the top, no duplicate", () => {
      addEntry("buy", makeEntry({ url: "/pt/comprar/a", timestamp: 1 }));
      addEntry("buy", makeEntry({ url: "/pt/comprar/b", timestamp: 2 }));
      addEntry("buy", makeEntry({ url: "/pt/comprar/a", timestamp: 3 }));
      const urls = listEntries("buy").map((e) => e.url);
      expect(urls).toEqual(["/pt/comprar/a", "/pt/comprar/b"]);
      expect(listEntries("buy")[0].timestamp).toBe(3);
    });

    it("dedupes via the canonical history key (ignores page param)", () => {
      addEntry("buy", makeEntry({ url: "/pt/comprar/a?q=x" }));
      addEntry("buy", makeEntry({ url: "/pt/comprar/a?q=x&page=2" }));
      expect(listEntries("buy")).toHaveLength(1);
    });

    it("caps the list at MAX_PER_LIST and drops the oldest", () => {
      for (let i = 0; i < MAX + 3; i++) {
        addEntry("buy", makeEntry({ url: `/pt/comprar/${i}`, timestamp: i }));
      }
      const entries = listEntries("buy");
      expect(entries).toHaveLength(MAX);
      // newest first
      expect(entries[0].url).toBe(`/pt/comprar/${MAX + 2}`);
      // oldest preserved is index 3 (0,1,2 dropped)
      expect(entries[entries.length - 1].url).toBe("/pt/comprar/3");
    });

    it("clear empties only the requested bucket", () => {
      addEntry("buy", makeEntry({ url: "/pt/comprar/a" }));
      addEntry("rent", makeEntry({ url: "/pt/arrendar/b" }));
      clear("buy");
      expect(listEntries("buy")).toHaveLength(0);
      expect(listEntries("rent")).toHaveLength(1);
    });

    it("survives malformed JSON in storage", () => {
      window.localStorage.setItem(STORAGE_KEY, "{not json");
      expect(listEntries("buy")).toEqual([]);
      addEntry("buy", makeEntry({ url: "/pt/comprar/x" }));
      expect(listEntries("buy")).toHaveLength(1);
    });

    it("never throws when localStorage.setItem fails", () => {
      const original = window.localStorage.setItem;
      window.localStorage.setItem = jest.fn(() => {
        throw new DOMException("quota");
      });
      expect(() =>
        addEntry("buy", makeEntry({ url: "/pt/comprar/x" })),
      ).not.toThrow();
      window.localStorage.setItem = original;
    });
  });

  describe("formatHistoryLabel", () => {
    const dict = {
      propertyTypes: { apartment: "Apartamento", house: "Casa" },
      searchHistory: { in: "em", upTo: "até" },
    };

    it("composes typology + property type + location + price ceiling", () => {
      const label = formatHistoryLabel({
        resolved: {
          valid: true,
          municipality: { name: "Lisboa", slug: "lisboa", children: [] },
        },
        filters: { bedrooms: "2", propertyType: "apartment", maxPrice: "300000" },
        dict,
        fallback: "Pesquisa",
      });
      expect(label).toBe("T2 Apartamento em Lisboa até 300k€");
    });

    it("falls back to the fallback string when nothing is present", () => {
      const label = formatHistoryLabel({ dict, fallback: "Pesquisa" });
      expect(label).toBe("Pesquisa");
    });

    it("uses the q value when no other meta is present", () => {
      const label = formatHistoryLabel({
        filters: { q: "vista mar" },
        dict,
        fallback: "Pesquisa",
      });
      expect(label).toBe('"vista mar"');
    });
  });
});
