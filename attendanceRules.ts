export type AttendanceEntry = unknown[];

export function validateStaffAttendanceBatch(entries: AttendanceEntry[], assignedUnit: string) {
  if (!Array.isArray(entries) || entries.length === 0) return "No attendance entries supplied";
  if (!assignedUnit.trim()) return "No unit is assigned to this staff account";
  if (entries.length > 20) return "A staff member can mark attendance for a maximum of 20 students per unit";
  const units = entries.map((entry) => String(entry[4] ?? "").trim());
  if (units.some((unit) => unit !== assignedUnit.trim())) return "Staff can mark attendance only for the assigned unit";
  if (new Set(units).size !== 1) return "Attendance batch must contain one unit only";
  return null;
}
