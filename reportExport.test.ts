import { describe, expect, it } from "vitest";
import { buildReportCsv, buildReportPrintBody } from "@shared/reportExport";

describe("report exports", () => {
  it("escapes CSV cells and includes the report type", () => {
    const csv = buildReportCsv([["1", "RAM, Kumar", "Present"], ["2", "Line\nBreak", 'He said "yes"']], "ATTENDANCE", ["ROLL", "NAME", "STATUS"]);
    expect(csv).toContain("JYOTI ITC Report - ATTENDANCE");
    expect(csv).toContain("ROLL,NAME,STATUS");
    expect(csv).toContain('1,"RAM, Kumar",Present');
    expect(csv).toContain('2,"Line\nBreak","He said ""yes"""');
  });

  it("escapes report cells in print-ready HTML", () => {
    const html = buildReportPrintBody([["<script>alert(1)</script>", "RAM", "88"]], "MONTHLY MARKS", ["ROLL", "NAME", "TOTAL"], { Session: "2025-27", Trade: "Fitter", Unit: "1", Period: "August" });
    expect(html).toContain("MONTHLY MARKS");
    expect(html).toContain("Session");
    expect(html).toContain("2025-27");
    expect(html).toContain("August");
    expect(html).toContain("<th>ROLL</th>");
    expect(html).toContain("<th>TOTAL</th>");
    expect(html).toContain("<td>88</td>");
    expect(html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
    expect(html).not.toContain("<script>alert(1)</script>");
  });
});
