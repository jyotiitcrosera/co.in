import { describe, expect, it } from "vitest";
import { validateStaffAttendanceBatch } from "@shared/attendanceRules";

const entry = (unit: string, roll = "1") => ["2026-03-12", roll, "Student", "2026-28ELECTRICIAN", unit, "P"];

describe("staff attendance authorization", () => {
  it("allows up to 20 students in the assigned unit", () => {
    const entries = Array.from({ length: 20 }, (_, index) => entry("2", String(index + 1)));
    expect(validateStaffAttendanceBatch(entries, "2")).toBeNull();
  });

  it("blocks the 21st student in a unit batch", () => {
    const entries = Array.from({ length: 21 }, (_, index) => entry("2", String(index + 1)));
    expect(validateStaffAttendanceBatch(entries, "2")).toContain("maximum of 20");
  });

  it("blocks entries outside the assigned unit and mixed-unit batches", () => {
    expect(validateStaffAttendanceBatch([entry("1")], "2")).toContain("assigned unit");
    expect(validateStaffAttendanceBatch([entry("2"), entry("1", "2")], "2")).toContain("assigned unit");
  });

  it("blocks staff without an assigned unit", () => {
    expect(validateStaffAttendanceBatch([entry("2")], "")).toContain("No unit");
  });
});
