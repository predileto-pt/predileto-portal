import { cn, formatPrice, formatDate, formatArea, truncate, slugify } from "../utils";

describe("cn", () => {
  it("joins classes", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("filters falsy values", () => {
    expect(cn("foo", false, null, undefined, "", "bar")).toBe("foo bar");
  });

  it("returns empty string for no truthy values", () => {
    expect(cn(false, null, undefined)).toBe("");
  });
});

describe("formatPrice", () => {
  it("formats with pt locale", () => {
    const result = formatPrice(250000, "pt");
    // pt-PT format: 250.000 €  or  250 000 €
    expect(result).toContain("250");
    expect(result).toContain("€");
  });

  it("formats with en locale", () => {
    const result = formatPrice(250000, "en");
    expect(result).toContain("250");
    expect(result).toContain("€");
  });

  it("formats zero", () => {
    const result = formatPrice(0);
    expect(result).toContain("0");
    expect(result).toContain("€");
  });

  it("uses pt locale by default", () => {
    const result = formatPrice(1000);
    expect(result).toContain("€");
  });
});

describe("formatDate", () => {
  it("formats with pt locale", () => {
    const result = formatDate("2024-06-15T12:00:00Z", "pt");
    expect(result).toContain("2024");
    expect(result).toContain("15");
  });

  it("formats with en locale", () => {
    const result = formatDate("2024-06-15T12:00:00Z", "en");
    expect(result).toContain("2024");
    expect(result).toContain("15");
  });
});

describe("formatArea", () => {
  it("appends m²", () => {
    expect(formatArea(85)).toBe("85 m²");
  });

  it("handles zero", () => {
    expect(formatArea(0)).toBe("0 m²");
  });
});

describe("truncate", () => {
  it("returns short text unchanged", () => {
    expect(truncate("hello", 10)).toBe("hello");
  });

  it("truncates long text with ellipsis", () => {
    expect(truncate("hello world", 5)).toBe("hello...");
  });

  it("trims trailing space before ellipsis", () => {
    expect(truncate("hello world foo", 6)).toBe("hello...");
  });

  it("returns text unchanged when equal to maxLength", () => {
    expect(truncate("hello", 5)).toBe("hello");
  });
});

describe("slugify", () => {
  it("converts to lowercase", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("removes diacritics", () => {
    expect(slugify("São Paulo")).toBe("sao-paulo");
  });

  it("removes special chars", () => {
    expect(slugify("hello@world!")).toBe("hello-world");
  });

  it("collapses hyphens", () => {
    expect(slugify("hello   world")).toBe("hello-world");
  });

  it("removes leading/trailing hyphens", () => {
    expect(slugify("--hello--")).toBe("hello");
  });
});
