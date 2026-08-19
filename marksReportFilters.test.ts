import { describe, expect, it } from "vitest";
import { marksReportFiltersForSheet } from "@shared/marksReportFilters";

const filters = { roll: "", session: "2025-27", trade: "Electrician", unit: "2", date: "2026-08-08", month: "August", quarter: "Quarterly 1", week: "Week 1", year: "1st Year" };

describe("marks report filter isolation", () => {
  it("keeps Month only for Monthly Marks", () => {
    expect(marksReportFiltersForSheet(filters, "MONTHLY MARKS")).toMatchObject({ date: "", month: "August", quarter: "", week: "", year: "1st Year", session: "", unit: "" });
  });
  it("keeps Quarter only for Quarterly Marks", () => {
    expect(marksReportFiltersForSheet(filters, "QUARTERLY MARKS")).toMatchObject({ date: "", month: "", quarter: "Quarterly 1", week: "", year: "1st Year", session: "", unit: "" });
  });
  it("keeps Week only for Job Evolution", () => {
    expect(marksReportFiltersForSheet(filters, "JOB EVOLUTION")).toMatchObject({ date: "", month: "", quarter: "", week: "Week 1", year: "1st Year", session: "", unit: "2" });
  });
});
