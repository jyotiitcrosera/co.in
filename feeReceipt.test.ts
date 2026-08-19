import { describe, expect, it } from "vitest";
import { normalizeFeeReceipt } from "../shared/feeReceipt";

const fallback = { registrationNo: "TEST-001", studentName: "TEST STUDENT", admissionFee: 10000, paymentAmount: 3000, paymentMode: "CASH" };

describe("normalizeFeeReceipt", () => {
  it("maps a raw partial-payment response", () => {
    expect(normalizeFeeReceipt({ status: "success", invoiceNo: "JYOTI-001", paymentAmount: 3000, totalPaid: 3000, balance: 7000, paymentStatus: "PARTIALLY PAID", fullyPaid: false }, fallback)).toMatchObject({ invoiceNo: "JYOTI-001", totalPaid: 3000, balance: 7000, fullyPaid: false });
  });

  it("unwraps data and snake_case response fields", () => {
    expect(normalizeFeeReceipt({ data: { invoice_no: "JYOTI-002", registration_no: "TEST-001", student_name: "TEST STUDENT", admission_fee: 10000, payment_amount: 7000, total_paid: 10000, balance: 0, payment_status: "FULLY PAID", fullyPaid: true } }, fallback)).toMatchObject({ invoiceNo: "JYOTI-002", registrationNo: "TEST-001", paymentAmount: 7000, totalPaid: 10000, balance: 0, paymentStatus: "FULLY PAID", fullyPaid: true });
  });

  it("uses fallback student and payment details when the backend omits them", () => {
    expect(normalizeFeeReceipt({ result: { invoiceNo: "JYOTI-003", balance: 5000 } }, fallback)).toMatchObject({ invoiceNo: "JYOTI-003", studentName: "TEST STUDENT", registrationNo: "TEST-001", paymentAmount: 3000, admissionFee: 10000, balance: 5000 });
  });
});

  it("normalizes mediator payment fields and cumulative total", () => {
    expect(normalizeFeeReceipt({ status: "success", invoiceNo: "JYOTI-004", mediator: "TEST MEDIATOR", mediator_paid: 500, total_mediator_paid: 1500, balance: 5000 }, fallback)).toMatchObject({ invoiceNo: "JYOTI-004", mediator: "TEST MEDIATOR", mediatorPaid: 500, totalMediatorPaid: 1500 });
  });
