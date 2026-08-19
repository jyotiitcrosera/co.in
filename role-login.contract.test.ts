import { afterEach, describe, expect, it, vi } from "vitest";
import { staffLogin, studentLogin } from "./googleSheets";

const jsonResponse = (body: unknown) => new Response(JSON.stringify(body), { status: 200, headers: { "content-type": "application/json" } });

afterEach(() => vi.unstubAllGlobals());

describe("Google Sheets role login contracts", () => {
  it("maps a Student login into the dashboard data contract", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("sheet_name=2026-28ELECTRICIAN")) return jsonResponse([["ROLL NO", "NAME", "TRADE", "UNIT"], ["1", "ANKIT", "ELECTRICIAN", "2"]]);
      if (url.includes("sheet_name=ATTENDANCE")) return jsonResponse([["DATE", "ROLL", "NAME", "TRADE", "STATUS"], ["2026-03-12", "1", "ANKIT", "2026-28ELECTRICIAN", "P"]]);
      if (url.includes("sheet_name=MONTHLY")) return jsonResponse([["DATE", "ROLL", "NAME", "TRADE", "TOTAL"], ["2026-03-01", "1", "ANKIT", "2026-28ELECTRICIAN", "100"]]);
      if (url.includes("sheet_name=QUARTERLY")) return jsonResponse([["DATE", "ROLL", "NAME", "TRADE", "TOTAL"], ["2026-03-01", "1", "ANKIT", "2026-28ELECTRICIAN", "100"]]);
      return jsonResponse([["ROLL NO", "NAME", "TRADE", "UNIT"], ["1", "ANKIT", "ELECTRICIAN", "2"]]);
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await studentLogin("2026-28", "Electrician", "1");
    expect(result?.student).toMatchObject({ roll: "1", name: "ANKIT", unit: "2", trade: "Electrician" });
    expect(result?.attendance).toHaveLength(2);
    expect(result?.monthlyMarks).toHaveLength(2);
    expect(result?.monthlyMarks[0]).toEqual(["DATE", "ROLL", "NAME", "TRADE", "TOTAL"]);
  });

  it("filters organized marks by session, trade, unit, and roll without mixing another cohort", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("sheet_name=2026-28ELECTRICIAN")) return jsonResponse([["ROLL NO", "NAME", "TRADE", "UNIT"], ["1", "ANKIT", "ELECTRICIAN", "2"]]);
      if (url.includes("sheet_name=ATTENDANCE")) return jsonResponse([["DATE", "ROLL", "NAME", "SESSION", "TRADE", "UNIT", "STATUS"], ["2026-03-12", "1", "ANKIT", "2026-28", "Electrician", "2", "P"], ["2026-03-12", "1", "OTHER", "2025-27", "Electrician", "2", "A"]]);
      if (url.includes("sheet_name=MONTHLY")) return jsonResponse([["DATE", "ROLL", "NAME", "SESSION", "TRADE", "UNIT", "YEAR", "MONTH", "TOTAL"], ["2026-03-01", "1", "ANKIT", "2026-28", "Electrician", "2", "1st Year", "August", "100"], ["2026-03-01", "1", "OTHER", "2025-27", "Electrician", "2", "1st Year", "August", "20"]]);
      if (url.includes("sheet_name=QUARTERLY")) return jsonResponse([["SESSION", "TRADE", "UNIT", "ROLL", "YEAR", "QUARTER", "TOTAL"], ["2026-28", "Electrician", "2", "1", "1st Year", "Quarterly 1", "130"]]);
      return jsonResponse([["ROLL NO", "NAME", "SESSION", "TRADE", "UNIT", "YEAR", "WEEK NO", "TOTAL"], ["1", "ANKIT", "2026-28", "Electrician", "2", "1st Year", "1", "40"], ["1", "OTHER", "2025-27", "Electrician", "2", "1st Year", "1", "10"]]);
    });
    vi.stubGlobal("fetch", fetchMock);
    const result = await studentLogin("2026-28", "Electrician", "1");
    expect(result?.attendance).toHaveLength(2);
    expect(result?.monthlyMarks).toHaveLength(2);
    expect(result?.quarterlyMarks).toHaveLength(2);
    expect(result?.jobEvolution).toHaveLength(2);
    expect(result?.monthlyMarks[1]?.[2]).toBe("ANKIT");
    expect(result?.jobEvolution[1]?.[2]).toBe("2026-28");
  });

  it("maps Staff login with the assigned unit", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => jsonResponse({ status: "success", username: "niket", name: "NIKET PRASAD SINGH", trade: "Fitter", unit: "1" })));
    await expect(staffLogin("niket", "password")).resolves.toMatchObject({ status: "success", name: "NIKET PRASAD SINGH", trade: "Fitter", unit: "1" });
  });
});
