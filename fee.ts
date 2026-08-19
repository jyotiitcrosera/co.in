export type FeeState = {
  admissionFee: number;
  paid: number;
  balance: number;
  status: "UNPAID" | "PARTIALLY PAID" | "FULLY PAID";
};

export function calculateFeeState(admissionFee: number, previousPaid: number, paymentAmount: number): FeeState {
  if (!Number.isFinite(admissionFee) || admissionFee <= 0) throw new Error("Admission fee must be positive");
  if (!Number.isFinite(previousPaid) || previousPaid < 0) throw new Error("Previous paid amount is invalid");
  if (!Number.isFinite(paymentAmount) || paymentAmount <= 0) throw new Error("Payment amount must be positive");
  const outstanding = Math.max(0, admissionFee - previousPaid);
  if (paymentAmount > outstanding) throw new Error("Payment cannot exceed the outstanding balance");
  const paid = previousPaid + paymentAmount;
  const balance = Math.max(0, admissionFee - paid);
  return { admissionFee, paid, balance, status: balance === 0 ? "FULLY PAID" : "PARTIALLY PAID" };
}
