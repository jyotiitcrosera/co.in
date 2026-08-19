import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("session-sheet Fee Ledger Code.gs contract", () => {
  it("contains a narrowly scoped duplicate fee-history repair action", () => {
    const source = readFileSync(resolve(process.cwd(), "docs/Code.gs.new"), "utf8");
    expect(source).toContain("repair_fee_payment_history");
    expect(source).toContain("The exact duplicate payment entry was not uniquely identified");
    expect(source).toContain("removedPaymentAmount");
    expect(source).toContain("row[columns.history] = JSON.stringify(history)");
  });

  it("contains dynamic roster lookup and cumulative fee columns", () => {
    const source = readFileSync(resolve(process.cwd(), "docs/Code.gs.new"), "utf8");
    expect(source).toContain("function sessionTradeSheet_");
    expect(source).toContain("function feeColumns_");
    expect(source).toContain("function feeColumnsReadOnly_");
    expect(source).toContain("const columns = feeColumnsReadOnly_(sessionSheet);");
    expect(source).toContain("Mobile No.");
    expect(source).toContain("Admission Fee");
    expect(source).toContain("Paid Amount");
    expect(source).toContain("Balance");
    expect(source).toContain("Mediator Name");
    expect(source).toContain("Mediator Paid");
    expect(source).toContain("Payment History");
    expect(source).toContain("existing.totals.paid + paymentAmount");
    expect(source).toContain("paymentAmount > admissionFee - existing.totals.paid");
    expect(source).toContain("new Date().toISOString()");
    expect(source).toContain("paymentHistory: history");
    expect(source).toContain("target.getRange(existing.rowNumber");
  });
});
