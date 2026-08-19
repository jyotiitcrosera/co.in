import { afterEach, describe, expect, it, vi } from "vitest";
import { feeLookup, getNotices, getSheetData, writePortalData } from "./googleSheets";

afterEach(() => vi.unstubAllGlobals());

describe("Google Sheets notice fallback", () => {
  it("returns an empty result when the upstream connection fails", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => { throw new TypeError("fetch failed"); }));
    await expect(getNotices()).resolves.toEqual([]);
  });

  it("preserves POST across the Apps Script redirect", async () => {
    process.env.GOOGLE_SHEETS_API_URL = "https://script.google.com/macros/s/test/exec";
    const responses = [
      new Response(null, { status: 302, headers: { location: "https://script.googleusercontent.com/macros/echo?token=test" } }),
      new Response(JSON.stringify({ status: "success", rowsAdded: 1 }), { status: 200, headers: { "content-type": "application/json" } }),
    ];
    const fetchMock = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      expect(init?.method).toBe("POST");
      expect(init?.body).toBe(JSON.stringify({ type: "admission_enquiry", applicantName: "RAM" }));
      return responses.shift() as Response;
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(writePortalData({ type: "admission_enquiry", applicantName: "RAM" })).resolves.toMatchObject({ status: "success" });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("normalizes Fee Ledger responses and sends compatible lookup parameter names", async () => {
    process.env.GOOGLE_SHEETS_API_URL = "https://script.google.com/macros/s/test/exec";
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = new URL(String(input));
      expect(url.searchParams.get("action")).toBe("get_fee_student");
      expect(url.searchParams.get("registration_no")).toBe("REG-001");
      expect(url.searchParams.get("registrationNo")).toBe("REG-001");
      expect(url.searchParams.get("registration")).toBe("REG-001");
      return new Response(JSON.stringify({ data: { student: { registrationNo: "REG-001", name: "Test Student" }, payments: [["INV-1"]], totals: { admissionFee: 30000, paid: 10000, balance: 20000, status: "PARTIALLY PAID" } } }), { status: 200, headers: { "content-type": "application/json" } });
    });
    vi.stubGlobal("fetch", fetchMock);
    await expect(feeLookup({ registrationNo: " REG-001 " })).resolves.toMatchObject({ student: { registrationNo: "REG-001" }, totals: { balance: 20000 } });
  });

  it("falls back to the selected session sheet when Fee Lookup returns non-JSON HTML", async () => {
    process.env.GOOGLE_SHEETS_API_URL = "https://script.google.com/macros/s/test/exec";
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = new URL(String(input));
      if (url.searchParams.get("action") === "get_sheet_data") {
        return new Response(JSON.stringify([["ROLL NO", "NAME", "TRADE", "UNIT", "Mobile No", "Admission Fee", "Paid Amount", "Balance", "Mediator Name", "Mediator Paid", "Payment History", "Payment Status"], ["1", "NITISH KUMAR", "Fitter", "1", "", "30000", "5000", "25000", "", "", JSON.stringify([["INV-1", "2026-08-18T10:00:00.000Z", "1", "NITISH KUMAR", "Fitter", "2025-27", "30000", "5000", "5000", "25000", "PARTIALLY PAID"]]), "PARTIALLY PAID"]]), { status: 200, headers: { "content-type": "application/json" } });
      }
      return new Response("<html>Drive error</html>", { status: 200, headers: { "content-type": "text/html" } });
    });
    vi.stubGlobal("fetch", fetchMock);
    await expect(feeLookup({ registrationNo: "1", session: "2025-27", trade: "Fitter" })).resolves.toMatchObject({ student: { registrationNo: "1", name: "NITISH KUMAR" }, totals: { admissionFee: 30000, paid: 5000, balance: 25000, status: "PARTIALLY PAID" }, payments: [["INV-1", "2026-08-18T10:00:00.000Z", "1", "NITISH KUMAR", "Fitter", "2025-27", "30000", "5000", "5000", "25000", "PARTIALLY PAID"]] });
  });

  it("filters Fee Ledger history by selected session and trade", async () => {
    process.env.GOOGLE_SHEETS_API_URL = "https://script.google.com/macros/s/test/exec";
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ student: { registrationNo: "1", name: "RAM" }, payments: [["INV-OLD", "2026-01-01", "1", "RAM", "Fitter", "2025-27", "30000", "5000", "5000", "25000", "PARTIALLY PAID", "CASH", "", "", "0"], ["INV-NEW", "2026-02-01", "1", "RAM", "Electrician", "2026-28", "30000", "10000", "10000", "20000", "PARTIALLY PAID", "CASH", "", "", "0"]], totals: { admissionFee: 30000, paid: 15000, balance: 15000, status: "PARTIALLY PAID" } }), { status: 200, headers: { "content-type": "application/json" } })));
    await expect(feeLookup({ registrationNo: "1", session: "2026-28", trade: "Electrician" })).resolves.toMatchObject({ payments: [["INV-NEW", "2026-02-01", "1", "RAM", "Electrician", "2026-28", "30000", "10000", "10000", "20000", "PARTIALLY PAID", "CASH", "", "", "0"]], totals: { admissionFee: 30000, paid: 10000, balance: 20000, status: "PARTIALLY PAID" } });
  });

  it("returns an empty Job Evolution result when the optional sheet is unavailable", async () => {
    process.env.GOOGLE_SHEETS_API_URL = "https://script.google.com/macros/s/test/exec";
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ status: "error", message: "Sheet not found: JOB EVOLUTION" }), { status: 404, headers: { "content-type": "application/json" } })));
    await expect(getSheetData("JOB EVOLUTION")).resolves.toEqual([]);
  });

  it("rejects a final write failure instead of treating it as saved", async () => {
    process.env.GOOGLE_SHEETS_API_URL = "https://script.google.com/macros/s/test/exec";
    vi.stubGlobal("fetch", vi.fn(async () => new Response("Method Not Allowed", { status: 405 })));
    await expect(writePortalData({ type: "admission_enquiry", applicantName: "RAM" })).rejects.toThrow("405");
  });
});
