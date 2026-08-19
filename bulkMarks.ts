export type BulkMarkStudent = { roll: string; name: string; unit: string };
export type BulkMarkKind = "monthly_marks" | "quarterly_marks" | "job_marks";
export type BulkMarkScores = Record<string, Record<string, string>>;
export const MARK_YEARS = ["1st Year", "2nd Year"] as const;
export type MarkYear = typeof MARK_YEARS[number];

export const SCORE_FIELDS: Record<BulkMarkKind, string[]> = {
  monthly_marks: ["Practical 50", "Theory 20", "WCS 10", "Drawing 20"],
  quarterly_marks: ["Practical 50", "Theory 20", "WCS 10", "Drawing 20"],
  job_marks: ["A (10)", "B (15)", "C (7)", "D (8)", "E (10)"],
};

export const SCORE_LIMITS: Record<BulkMarkKind, Record<string, number>> = {
  monthly_marks: { "Practical 50": 50, "Theory 20": 20, "WCS 10": 10, "Drawing 20": 20 },
  quarterly_marks: { "Practical 50": 50, "Theory 20": 20, "WCS 10": 10, "Drawing 20": 20 },
  job_marks: { "A (10)": 10, "B (15)": 15, "C (7)": 7, "D (8)": 8, "E (10)": 10 },
};

export function getBulkMarkTotal(kind: BulkMarkKind, scores: Record<string, string> | undefined) {
  return SCORE_FIELDS[kind].reduce((sum, field) => sum + Math.min(SCORE_LIMITS[kind][field], Math.max(0, Number(scores?.[field] || 0))), 0);
}

export function clampBulkMarkValue(kind: BulkMarkKind, field: string, value: string) {
  const limit = SCORE_LIMITS[kind][field] ?? 0;
  if (value === "") return "";
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "";
  return String(Math.min(limit, Math.max(0, numeric)));
}

export function validateBulkMarkScores(kind: BulkMarkKind, scores: BulkMarkScores) {
  const invalid: Array<{ roll: string; field: string; value: string; limit: number }> = [];
  for (const [roll, studentScores] of Object.entries(scores)) {
    for (const field of SCORE_FIELDS[kind]) {
      const raw = studentScores?.[field];
      if (raw === undefined || raw === "") continue;
      const value = Number(raw);
      const limit = SCORE_LIMITS[kind][field];
      if (!Number.isFinite(value) || value < 0 || value > limit) invalid.push({ roll, field, value: String(raw), limit });
    }
  }
  return invalid;
}

export function buildBulkMarkEntries(kind: BulkMarkKind, students: BulkMarkStudent[], scores: BulkMarkScores, details: { trade: string; session?: string; year?: string; date: string; label: string }) {
  const fields = SCORE_FIELDS[kind];
  return students
    .filter((student) => fields.some((field) => scores[student.roll]?.[field] !== undefined && scores[student.roll]?.[field] !== ""))
    .map((student) => {
      const values = fields.map((field) => Math.min(SCORE_LIMITS[kind][field], Math.max(0, Number(scores[student.roll]?.[field] || 0))));
      const total = values.reduce((sum, value) => sum + value, 0);
      return kind === "job_marks"
        ? [student.roll, student.name, details.session || "", details.trade, student.unit, details.year || "", details.label, ...values, total]
        : [details.date || "", student.roll, student.name, details.session || "", details.trade, student.unit, details.year || "", details.label, ...values, total];
    });
}

export const MARK_MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
export const QUARTERS = Array.from({ length: 12 }, (_, index) => `Quarterly ${index + 1}`);
export const JOB_WEEKS = Array.from({ length: 104 }, (_, index) => `Week ${index + 1}`);
export const SESSIONS = ["2024-26", "2025-27", "2026-28", "2027-29"];
export const ATTENDANCE_DATES = [] as string[];
