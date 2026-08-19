import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const portalSource = readFileSync(new URL("../client/src/pages/Portal.tsx", import.meta.url), "utf8");
const adminRecordsSource = readFileSync(new URL("../client/src/components/AdminRecords.tsx", import.meta.url), "utf8");
const sheetsSource = readFileSync(new URL("./googleSheets.ts", import.meta.url), "utf8");

describe("Fee Ledger performance and payment flow contract", () => {
  it("loads the selected roster once and maps fee rows locally instead of fanning out fee lookups", () => {
    expect(portalSource).toContain("staleTime: 120000");
    expect(portalSource).toContain("students.map((row: any[]) => {");
    expect(portalSource).not.toContain("Promise.all(students.map(async");
    expect(portalSource).toContain("Search is now local.");
  });

  it("routes Mark Paid to the Pay Fee form with the pending amount prefilled", () => {
    expect(portalSource).toContain('setActiveModule("fees")');
    expect(portalSource).toContain('paymentAmount: String(amount)');
    expect(portalSource).toContain('document.getElementById("fee-payment-form")');
  });

  it("uses the selected session roster mobile field for WhatsApp and blocks fully paid records", () => {
    expect(portalSource).toContain('row.mobile || row.data?.student?.mobile || ""');
    expect(portalSource).toContain("This student is already Fully Paid; no additional payment is allowed.");
  });

  it("keeps receipt generation on the confirmed payment-save path", () => {
    expect(portalSource).toContain("Save payment + generate invoice");
    expect(portalSource).toContain("printFeeReceipt(result, receiptWindow)");
  });

  it("caches notices and preserves a bounded retry policy for slow reads", () => {
    expect(sheetsSource).toContain("noticesCache");
    expect(sheetsSource).toContain("timeoutMs: 30_000, maxAttempts: 2");
    expect(sheetsSource).toContain("timeoutMs: 20_000, maxAttempts: 2");
  });

  it("reconciles matrix writes after an Apps Script response fails", () => {
    expect(sheetsSource).toContain('if (type === "monthly_marks") return "MONTHLY MARKS"');
    expect(sheetsSource).toContain('if (type === "quarterly_marks") return "QUARTERLY MARKS"');
    expect(sheetsSource).toContain('if (type === "job_marks") return "JOB EVOLUTION"');
    expect(sheetsSource).toContain('if (type === "attendance") return "ATTENDANCE"');
    expect(sheetsSource).toContain("reconcileMatrixWrite");
    expect(sheetsSource).toContain("verifiedEntries !== entries.length");
    expect(adminRecordsSource).toContain('utils.portal.sheetData.invalidate');
    expect(adminRecordsSource).toContain('reportQuery.data ?? (await reportQuery.refetch()).data');
  });

  it("reconciles a payment that was saved before an Apps Script response failed", () => {
    expect(sheetsSource).toContain("recentMatchingPayment");
    expect(sheetsSource).toContain("reconcileFeePayment");
    expect(sheetsSource).toContain('String(result?.status || "").toLowerCase() === "error"');
    expect(sheetsSource).toContain('reconciled: true');
    expect(sheetsSource).toContain("paymentHistory: lookup.payments");
    expect(sheetsSource).toContain("10 * 60 * 1000");
  });
});
