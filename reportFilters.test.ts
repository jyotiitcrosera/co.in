import { describe, expect, it } from "vitest";
import { filterReportRows, filterRosterRows, filterRowsByRoster, type ReportFilters } from "@shared/reportFilters";

const baseFilters: ReportFilters = { roll: "1", session: "2026-28", trade: "Electrician", unit: "", date: "", month: "", quarter: "", week: "", year: "" };

describe("Admin report filtering", () => {
  it("matches the live screenshot filters and preserves Present/Absent status", () => {
    const rows = [["DATE", "ROLL", "NAME", "TRADE", "UNIT", "STATUS"], ["8/8/2026", "1", "NITISH KUMAR", "2025-27FITTER", "1", "P"], ["8/8/2026", "2", "SUDHANSHU KUMAR", "2025-27FITTER", "1", "A"]];
    const filtered = filterReportRows(rows, { roll: "", session: "2025-27", trade: "Fitter", unit: "1", date: "2026-08-08", month: "", quarter: "", week: "", year: "" }, "ATTENDANCE");
    expect(filtered).toHaveLength(2);
    expect(filtered.map((row) => row[5])).toEqual(["P", "A"]);
  });
  it("matches Attendance rows when session and trade are encoded together", () => {
    const rows = [
      ["DATE", "ROLL", "NAME", "TRADE", "UNIT", "STATUS"],
      ["2026-03-12", "1", "ANKIT", "2026-28ELECTRICIAN", "2", "P"],
      ["2026-03-12", "2", "OTHER", "2025-27ELECTRICIAN", "2", "P"],
    ];
    expect(filterReportRows(rows, baseFilters, "ATTENDANCE")).toEqual([rows[1]]);
  });

  it("applies record-specific month and quarter filters", () => {
    const monthly = [
      ["DATE", "ROLL", "NAME", "TRADE", "MONTH", "SCORE"],
      ["2026-04-01", "1", "ANKIT", "2026-28ELECTRICIAN", "April", "88"],
      ["2026-05-01", "1", "ANKIT", "2026-28ELECTRICIAN", "May", "91"],
    ];
    const quarterly = [
      ["DATE", "ROLL", "NAME", "TRADE", "QUARTER", "SCORE"],
      ["2026-06-01", "1", "ANKIT", "2026-28ELECTRICIAN", "Q1", "90"],
    ];
    expect(filterReportRows(monthly, { ...baseFilters, month: "April" }, "MONTHLY MARKS")).toEqual([monthly[1]]);
    expect(filterReportRows(quarterly, { ...baseFilters, quarter: "Q1" }, "QUARTERLY MARKS")).toEqual([quarterly[1]]);
  });

  it("filters date and unit fields independently", () => {
    const rows = [
      ["DATE", "ROLL", "NAME", "TRADE", "UNIT", "STATUS"],
      ["2026-03-12", "1", "ANKIT", "2026-28ELECTRICIAN", "2", "P"],
      ["2026-03-13", "1", "ANKIT", "2026-28ELECTRICIAN", "1", "A"],
    ];
    expect(filterReportRows(rows, { ...baseFilters, unit: "2", date: "2026-03-12" }, "ATTENDANCE")).toEqual([rows[1]]);
    expect(filterReportRows(rows, { ...baseFilters, unit: "1", date: "2026-03-13" }, "ATTENDANCE")).toEqual([rows[2]]);
  });

  it("filters marks rows by academic Year", () => {
    const rows = [["DATE", "ROLL", "NAME", "TRADE", "YEAR", "MONTH", "TOTAL"], ["2026-03-12", "1", "ANKIT", "2026-28ELECTRICIAN", "1st Year", "March", "80"], ["2026-03-12", "1", "ANKIT", "2026-28ELECTRICIAN", "2nd Year", "March", "90"]];
    expect(filterReportRows(rows, { ...baseFilters, year: "2nd Year", month: "March" }, "MONTHLY MARKS")).toEqual([rows[2]]);
  });

  it("filters Job Evolution by week number", () => {
    const rows = [
      ["ROLL NO", "NAME", "TRADE", "UNIT", "WEEK NO", "TOTAL"],
      ["1", "ANKIT", "2026-28ELECTRICIAN", "2", "Week 1", "50"],
      ["1", "ANKIT", "2026-28ELECTRICIAN", "2", "Week 2", "45"],
    ];
    expect(filterReportRows(rows, { ...baseFilters, date: "", unit: "2", week: "Week 1" }, "JOB EVOLUTION")).toEqual([rows[1]]);
  });

  it("loads only students from the selected session-unit roster", () => {
    const roster = [["ROLL", "NAME", "SESSION", "UNIT"], ["1", "ANKIT", "2026-28", "2"], ["2", "OTHER", "2026-28", "1"]];
    expect(filterRosterRows(roster, "2")).toEqual([roster[1]]);
  });

  it("never mixes 2025-27 and 2026-28 students for the same unit", () => {
    const roster = [["ROLL", "NAME", "SESSION", "UNIT"], ["1", "RAM", "2026-28", "1"], ["2", "SITA", "2025-27", "1"]];
    expect(filterRosterRows(roster, "1", "2025-27")).toEqual([roster[2]]);
    expect(filterRosterRows(roster, "1", "2026-28")).toEqual([roster[1]]);
  });

  it("preserves already-loaded roster rows instead of stripping the first student", () => {
    const loadedRows = [["1", "RAM", "2026-28", "1"], ["2", "SITA", "2026-28", "1"]];
    expect(filterRosterRows(loadedRows, "1")).toEqual(loadedRows);
  });

  it("keeps backend sheet-scoped rows visible when the sheet omits a session column", () => {
    const roster = [["ROLL", "NAME", "UNIT"], ["1", "ANKIT", "1"], ["2", "OTHER", "2"]];
    expect(filterRosterRows(roster, "1", "2025-27", { sourceScoped: true })).toEqual([roster[1]]);
  });

  it("keeps direct 2026-28 Fitter matrices visible after unit filtering", () => {
    const roster = [["ROLL", "NAME", "SESSION", "UNIT"], ["1", "RAM", "2026-28", "1"], ["2", "SITA", "2026-28", "2"]];
    expect(filterRosterRows(roster, "1")).toEqual([roster[1]]);
  });

  it("joins attendance and marks rows to the selected roster rolls", () => {
    const attendance = [["DATE", "ROLL", "NAME"], ["2026-03-12", "1", "ANKIT"], ["2026-03-12", "2", "OTHER"]];
    expect(filterRowsByRoster(attendance.slice(1), "ATTENDANCE", new Set(["1"]))).toEqual([attendance[1]]);
    const jobRows = [["ROLL", "NAME"], ["1", "ANKIT"], ["2", "OTHER"]];
    expect(filterRowsByRoster(jobRows.slice(1), "JOB EVOLUTION", new Set(["2"]))).toEqual([jobRows[2]]);
  });

  it("allows a sheet-level trade fallback when the sheet has no trade header", () => {
    const rows = [["DATE", "ROLL", "NAME", "STATUS"], ["2026-03-12", "1", "ANKIT", "P"]];
    expect(filterReportRows(rows, { ...baseFilters, trade: "Electrician" }, "2026-28 ELECTRICIAN")).toEqual([rows[1]]);
  });
});
