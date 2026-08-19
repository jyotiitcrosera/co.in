import { describe, expect, it } from "vitest";
import { calculateFeeState } from "../shared/fee";

describe("fee ledger calculations", () => {
  it("records a first partial payment", () => {
    expect(calculateFeeState(50000, 0, 15000)).toEqual({
      admissionFee: 50000,
      paid: 15000,
      balance: 35000,
      status: "PARTIALLY PAID",
    });
  });

  it("adds a repeat payment to the cumulative total", () => {
    expect(calculateFeeState(50000, 15000, 20000)).toEqual({
      admissionFee: 50000,
      paid: 35000,
      balance: 15000,
      status: "PARTIALLY PAID",
    });
  });

  it("rejects payments above the outstanding balance", () => {
    expect(() => calculateFeeState(50000, 35000, 20000)).toThrow("outstanding balance");
  });

  it("marks the student fully paid when the balance reaches zero", () => {
    expect(calculateFeeState(50000, 35000, 15000)).toMatchObject({
      paid: 50000,
      balance: 0,
      status: "FULLY PAID",
    });
  });
});
