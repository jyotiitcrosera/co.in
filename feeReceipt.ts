export type FeeReceiptFallback = {
  registrationNo: string;
  studentName: string;
  admissionFee: number;
  paymentAmount: number;
  totalPaid?: number;
  balance?: number;
  paymentStatus?: string;
  fullyPaid?: boolean;
  paymentMode?: string;
  mediator?: string;
  mediatorPaid?: number;
  paymentHistory?: any[][];
};

export function normalizeFeeReceipt(raw: any, fallback: FeeReceiptFallback) {
  const source = raw?.data || raw?.result || raw || {};
  const admissionFee = Number(source.admissionFee ?? source.admission_fee ?? fallback.admissionFee);
  const paymentAmount = Number(source.paymentAmount ?? source.payment_amount ?? fallback.paymentAmount);
  const totalPaid = Number(source.totalPaid ?? source.total_paid ?? fallback.totalPaid ?? paymentAmount);
  const balance = Math.max(0, Number(source.balance ?? source.balance_due ?? (admissionFee - totalPaid)));
  const paymentStatus = String(source.paymentStatus ?? source.payment_status ?? (balance === 0 && admissionFee > 0 ? "FULLY PAID" : totalPaid > 0 ? "PARTIALLY PAID" : "UNPAID")).toUpperCase();
  return {
    ...fallback,
    ...source,
    invoiceNo: source.invoiceNo || source.invoice_no,
    registrationNo: source.registrationNo || source.registration_no || fallback.registrationNo,
    studentName: source.studentName || source.student_name || fallback.studentName,
    paymentAmount,
    admissionFee,
    totalPaid,
    balance,
    paymentStatus,
    fullyPaid: Boolean(source.fullyPaid || paymentStatus === "FULLY PAID"),
    paymentMode: source.paymentMode || source.payment_mode || fallback.paymentMode,
    mediator: source.mediator || "",
    mediatorPaid: Number(source.mediatorPaid ?? source.mediator_paid ?? 0),
    totalMediatorPaid: Number(source.totalMediatorPaid ?? source.total_mediator_paid ?? 0),
    paymentHistory: Array.isArray(source.paymentHistory) ? source.paymentHistory : Array.isArray(source.payments) ? source.payments : (fallback.paymentHistory || []),
  };
}
