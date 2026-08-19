import { describe, expect, it } from "vitest";
import { buildFeeReceiptHtml } from "@shared/feeReceiptPrint";

describe("college fee receipt print HTML", () => {
  it("shows student payment totals without mediator identity or mediator-paid amounts", () => {
    const html = buildFeeReceiptHtml({ invoiceNo: "INV-001", studentName: "Test Student", registrationNo: "TEST-001", trade: "Fitter", session: "2026-28", admissionFee: 10000, paymentAmount: 7000, totalPaid: 7000, balance: 3000, paymentMode: "CASH", mediator: "Hidden Mediator", mediatorPaid: 2000 }, "15/08/2026");
    expect(html).toContain('<span class="label">Roll No.</span><div class="value">TEST-001</div>');
    expect(html).toContain("Amount Paid on This Receipt");
    expect(html).toContain("Grand Total");
    expect(html).toContain("₹7,000");
    expect(html).toContain("Admission Fee");
    expect(html).toContain("Total Paid To Date");
    expect(html).toContain("Balance / Status");
    expect(html).toContain("₹10,000");
    expect(html).toContain("₹7,000");
    expect(html).toContain("PARTIALLY PAID");
    expect(html).toContain("Balance / Status");
    expect(html).toContain("In words:");
    expect(html).not.toContain("Hidden Mediator");
    expect(html).not.toContain("Mediator paid");
    expect(html).not.toContain("Mediator");
  });

  it("prints FULLY PAID when cumulative paid reaches the admission fee", () => {
    const html = buildFeeReceiptHtml({ invoiceNo: "INV-002", admissionFee: 30000, paymentAmount: 5000, totalPaid: 30000, balance: 0, paymentStatus: "FULLY PAID", fullyPaid: true });
    expect(html).toContain("FULLY PAID FEE RECEIPT");
    expect(html).toContain("FULLY PAID");
    expect(html).toContain("₹30,000");
  });

  it("renders an A4 document with persistent outer and inner borders", () => {
    const html = buildFeeReceiptHtml({ invoiceNo: "INV-001" }, "15/08/2026");
    expect(html).toContain("@page{size:A4 portrait");
    expect(html).toContain("border:1.2px solid #172238");
    expect(html).toContain("border:0.6px solid #8d98a8");
    expect(html).toContain("class=\"fee-table\"");
    expect(html).toContain("Sl. No.");
    expect(html).toContain("Sign. of Fee Collector");
    expect(html).not.toContain("Mediator");
  });
});
