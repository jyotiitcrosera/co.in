import { describe, expect, it } from "vitest";
import { buildReportTableModel, normalizeReportMatrix, preserveLoadedReportRows } from "@shared/reportState";
import { filterReportTableRows, summarizeReportRows } from "@shared/reportSummary";

describe("report state persistence", () => {
  it("normalizes raw matrices and rows-wrapped responses", () => {
    const rows = [["ROLL", "NAME"], ["R-001", "Asha"]];
    expect(normalizeReportMatrix(rows)).toEqual(rows);
    expect(normalizeReportMatrix({ rows })).toEqual(rows);
    expect(normalizeReportMatrix({ data: rows })).toEqual([]);
    expect(normalizeReportMatrix(null)).toEqual([]);
  });

  it("keeps the loaded roster visible when the report matrix has no matching rows", () => {
    const roster = [["R-001", "Asha", "Fitter", "Unit 1"], ["R-002", "Bina", "Fitter", "Unit 1"]];
    expect(preserveLoadedReportRows([], roster, true)).toEqual(roster);
    expect(preserveLoadedReportRows([["R-001", "Asha", "January"]], roster, true)).toEqual([["R-001", "Asha", "January"]]);
    expect(preserveLoadedReportRows([], roster, false)).toEqual([]);
  });

  it("maps Attendance into separate Trade and Session columns", () => {
    const model = buildReportTableModel("ATTENDANCE", ["DATE", "ROLL", "NAME", "TRADE", "UNIT", "STATUS"], [["2026-03-12", "1", "ANKIT", "2026-28 ELECTRICIAN", "2", "P"]]);
    expect(model.headers).toEqual(["DATE", "ROLL", "NAME", "TRADE", "SESSION", "UNIT", "STATUS"]);
    expect(model.rows[0]).toEqual(["2026-03-12", "1", "ANKIT", "ELECTRICIAN", "2026-28", "2", "P"]);
  });

  it("maps Monthly, Quarterly, and Job Evolution score columns and totals", () => {
    const monthly = buildReportTableModel("MONTHLY MARKS", ["DATE", "ROLL", "NAME", "SESSION", "TRADE", "UNIT", "YEAR", "MONTH NAME", "PRACTICAL", "THEORY", "WCS", "DRAWING", "TOTAL"], [["2026-04-01", "1", "ANKIT", "2026-28", "FITTER", "1", "1st Year", "April", "40", "15", "8", "17", "80"]]);
    expect(monthly.rows[0]).toEqual(["2026-04-01", "1", "ANKIT", "2026-28", "FITTER", "1", "1st Year", "April", "40", "15", "8", "17", "80"]);
    const quarterly = buildReportTableModel("QUARTERLY MARKS", ["DATE", "ROLL", "NAME", "SESSION", "TRADE", "UNIT", "YEAR", "QUARTERLY NO", "PRACTICAL", "THEORY", "WCS", "DRAWING", "TOTAL"], [["2026-06-01", "1", "ANKIT", "2026-28", "FITTER", "1", "1st Year", "Quarterly 1", "45", "18", "9", "19", "91"]]);
    expect(quarterly.rows[0].slice(-5)).toEqual(["45", "18", "9", "19", "91"]);
    const job = buildReportTableModel("JOB EVOLUTION", ["ROLL NO", "NAME", "SESSION", "TRADE", "UNIT", "YEAR", "WEEK NO", "A", "B", "C", "D", "E", "TOTAL"], [["1", "ANKIT", "2026-28", "FITTER", "1", "1st Year", "Week 1", "8", "12", "6", "7", "9", "42"]]);
    expect(job.rows[0]).toEqual(["1", "ANKIT", "2026-28", "FITTER", "1", "1st Year", "Week 1", "8", "12", "6", "7", "9", "42"]);
  });

  it("uses roster-only headers for preview rows", () => {
    const model = buildReportTableModel("MONTHLY MARKS", [], [["1", "ANKIT", "2026-28", "1"]]);
    expect(model.headers).toEqual(["ROLL", "NAME", "SESSION", "UNIT"]);
    expect(model.rows).toEqual([["1", "ANKIT", "2026-28", "1"]]);
  });

  it("filters rows by roll, name, trade, or session and summarizes live results", () => {
    const attendance = [["2026-03-12", "1", "ANKIT", "ELECTRICIAN", "2026-28", "2", "P"], ["2026-03-12", "2", "RANI", "FITTER", "2026-28", "2", "A"]];
    expect(filterReportTableRows(attendance, "rani")).toEqual([attendance[1]]);
    expect(summarizeReportRows("ATTENDANCE", attendance)).toEqual({ kind: "attendance", total: 2, present: 1, absent: 1, percentage: 50 });
    expect(summarizeReportRows("MONTHLY MARKS", [["date", "roll", "name", "session", "trade", "unit", "year", "month", "40", "10", "8", "18", "76"]])).toEqual({ kind: "marks", students: 1, averages: { Practical: 40, Theory: 10, WCS: 8, Drawing: 18, Total: 76 } });
  });
});
