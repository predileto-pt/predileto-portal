import type { LocationTree } from "@/lib/estate-os";

jest.mock("@/lib/estate-os", () => {
  const actual = jest.requireActual("@/lib/estate-os");
  return {
    ...actual,
    fetchLocationTree: jest.fn(),
  };
});

import { fetchLocationTree } from "@/lib/estate-os";
import { GET } from "../route";

const mockedFetch = fetchLocationTree as jest.MockedFunction<
  typeof fetchLocationTree
>;

describe("GET /api/listings/locations", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns the upstream location tree", async () => {
    const tree: LocationTree = {
      countries: [
        {
          code: "PT",
          name: "Portugal",
          districts: [
            {
              name: "Lisboa",
              municipalities: [
                { name: "Cascais", parishes: ["Cascais", "Estoril"] },
              ],
            },
          ],
        },
      ],
    };
    mockedFetch.mockResolvedValue(tree);

    const res = await GET();
    expect(res.status).toBe(200);
    const body = (await res.json()) as LocationTree;
    expect(body.countries).toHaveLength(1);
    expect(body.countries[0].code).toBe("PT");
    expect(body.countries[0].districts[0].name).toBe("Lisboa");
  });

  it("maps upstream failures to 502", async () => {
    mockedFetch.mockRejectedValue(new Error("estate-os error: 500"));

    const res = await GET();
    expect(res.status).toBe(502);
  });
});
