export type ProgressMatrix = Array<Array<string | number | null>>;

export type ProgressCardData = {
  student: { name: string; roll: string; trade: string; session: string; unit?: string };
  attendance: ProgressMatrix;
  monthlyMarks: ProgressMatrix;
  quarterlyMarks: ProgressMatrix;
  jobEvolution: ProgressMatrix;
};

export type ProgressCardRowEdit = { grading?: string; remarks?: string };
export type ElectricianProgressCardOptions = { instituteSignUrl?: string; exerciseSignUrl?: string; drawingSignUrl?: string; mathSignUrl?: string; gisSignUrl?: string; rowEdits?: Record<string, ProgressCardRowEdit>; manual?: { admissionDate?: string; leavingDate?: string; qualification?: string; grading?: string; remarks?: string } };

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function headersOf(matrix: ProgressMatrix) {
  return (matrix[0] ?? []).map((cell) => String(cell ?? "").trim());
}

function indexOfHeader(headers: string[], tokens: string[]) {
  return headers.findIndex((header) => tokens.some((token) => header.toUpperCase().replace(/[^A-Z0-9]/g, "").includes(token)));
}

function normalizeYear(value: unknown) {
  const normalized = String(value ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
  if (["1", "1st", "first", "firstyear", "1styear", "year1"].includes(normalized)) return "1styear";
  if (["2", "2nd", "second", "secondyear", "2ndyear", "year2"].includes(normalized)) return "2ndyear";
  return normalized;
}

function splitYear(matrix: ProgressMatrix, year: string) {
  const headers = headersOf(matrix);
  const yearIndex = indexOfHeader(headers, ["YEAR", "CLASS"]);
  if (yearIndex < 0) return year === "1st Year" ? matrix : [matrix[0]];
  const wanted = normalizeYear(year);
  return [matrix[0], ...matrix.slice(1).filter((row) => normalizeYear(row[yearIndex]) === wanted)];
}

function matrixRows(matrix: ProgressMatrix) {
  return matrix.slice(1).filter((row) => row.some((cell) => String(cell ?? "").trim() !== ""));
}

function valueAt(row: ProgressMatrix[number], headers: string[], tokens: string[]) {
  const index = indexOfHeader(headers, tokens);
  return index >= 0 ? row[index] : "";
}

const MONTHS = ["Monthly Test I (Aug)", "Monthly Test II (Sep)", "Monthly Test III (Oct)", "Monthly Test IV (Nov)", "Monthly Test V (Dec)", "Monthly Test VI (Jan)", "Monthly Test VII (Feb)", "Monthly Test VIII (Mar)", "Monthly Test IX (Apr)", "Monthly Test X (May)", "Monthly Test XI (Jun)", "Monthly Test XII (Jul)"];
const QUARTERS = ["I", "II", "III", "IV"];

function numberValue(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function assessmentRows(matrix: ProgressMatrix, labels: string[], maxTotal: number) {
  const headers = headersOf(matrix);
  const rows = matrixRows(matrix);
  const labelTokens = ["MONTH", "QUARTER", "PERIOD", "LABEL", "NOOFMONTHLYTESTS", "NOOFQRS"];
  return labels.map((label, index) => {
    const row = rows[index] ?? [];
    const practical = valueAt(row, headers, ["PRACTICAL"]);
    const theory = valueAt(row, headers, ["THEORY"]);
    const science = valueAt(row, headers, ["SCIENCE", "WSCAL", "WCS", "ARITH"]) || row[2] || "";
    const drawing = valueAt(row, headers, ["DRG", "DRAWING", "ENGINEERING"]);
    const totalValue = valueAt(row, headers, ["TOTAL"]);
    const componentValues = [practical, theory, science, drawing].map(numberValue).filter((value): value is number => value !== null);
    const total = totalValue !== "" ? totalValue : componentValues.length ? componentValues.reduce((sum, value) => sum + value, 0) : "";
    const totalNumber = numberValue(total);
    return { label, practical, theory, science, drawing, total, percentage: totalNumber === null ? "" : `${Math.round((totalNumber / maxTotal) * 100)}%`, sourceLabel: valueAt(row, headers, labelTokens) };
  });
}

function inlineSign(url: string | undefined, alt: string) { return url ? `<img class="pc-inline-sign" src="${escapeHtml(url)}" alt="${escapeHtml(alt)}" />` : ""; }

function assessmentTable(title: string, rows: ReturnType<typeof assessmentRows>, totalLabel: string, manual: ElectricianProgressCardOptions["manual"] = {}, rowEdits: ElectricianProgressCardOptions["rowEdits"] = {}, keyPrefix = "assessment", signs: Pick<ElectricianProgressCardOptions, "drawingSignUrl" | "mathSignUrl" | "gisSignUrl"> = {}) {
  return `<section class="pc-section"><h3>${escapeHtml(title)}</h3><table class="pc-table"><thead><tr><th>No. of Tests</th><th>Practical</th><th>Theory</th><th>W/S Cal. &amp; Science</th><th>Engg. Drg.</th><th>Total</th><th>Percentage</th><th>Drg. Inst. Initial</th><th>Math Inst. Initial</th><th>G.I.S. Initial</th><th>Grading</th><th>Remarks</th></tr></thead><tbody>${rows.map((row, index) => { const edit = rowEdits[`${keyPrefix}-${index}`] || {}; const grading = edit.grading || manual.grading || ""; const remarks = edit.remarks || manual.remarks || ""; const populated = [row.practical, row.theory, row.science, row.drawing, row.total, grading, remarks].some((value) => String(value ?? "").trim() !== ""); const initial = (url: string | undefined, alt: string) => populated ? inlineSign(url, alt) : ""; return `<tr><td>${escapeHtml(row.label)}</td><td>${escapeHtml(row.practical)}</td><td>${escapeHtml(row.theory)}</td><td>${escapeHtml(row.science)}</td><td>${escapeHtml(row.drawing)}</td><td>${escapeHtml(row.total)}</td><td>${escapeHtml(row.percentage)}</td><td>${initial(signs.drawingSignUrl, "Drawing instructor initial")}</td><td>${initial(signs.mathSignUrl, "Mathematics instructor initial")}</td><td>${initial(signs.gisSignUrl, "GIS instructor initial")}</td><td>${escapeHtml(grading)}</td><td>${escapeHtml(remarks)}</td></tr>`; }).join("")}</tbody><tfoot><tr><td colspan="5">${escapeHtml(totalLabel)}</td><td colspan="7"></td></tr></tfoot></table></section>`;
}

function weeklyTable(exercises: Array<{ week: number; text: string }>, data: ProgressMatrix, rowEdits: ElectricianProgressCardOptions["rowEdits"] = {}, exerciseSignUrl?: string) {
  const headers = headersOf(data);
  const rows = matrixRows(data);
  const map = new Map(rows.map((row) => [String(valueAt(row, headers, ["WEEK", "WEEKNO"])), row]));
  const weekIndex = indexOfHeader(headers, ["WEEK", "WEEKNO"]);
  const cell = (item: { week: number; text: string } | undefined) => {
    if (!item) return "<td></td><td></td><td></td><td></td><td></td>";
    const row = map.get(String(item.week)) ?? (weekIndex >= 0 ? rows.find((candidate) => String(candidate[weekIndex]) === String(item.week)) : undefined);
    const edit = rowEdits[`week-${item.week}`] || {};
    const grade = edit.grading || row?.[indexOfHeader(headers, ["GRADE", "GRADING"])] || "";
    const gradeText = String(grade ?? "").trim().toUpperCase();
    const automaticRemark = gradeText === "A" ? "Excellent" : gradeText === "B" ? "Good" : gradeText === "C" ? "Pass" : gradeText === "D" ? "Fail" : "";
    const remarks = edit.remarks || row?.[indexOfHeader(headers, ["REMARK"])] || automaticRemark;
    const populated = String(grade).trim() !== "" || String(remarks).trim() !== "";
    return `<td>${item.week}</td><td>${escapeHtml(item.text)}</td><td>${escapeHtml(grade)}</td><td>${populated ? inlineSign(exerciseSignUrl, "Instructor initial") : ""}</td><td>${escapeHtml(remarks)}</td>`;
  };
  const pairedRows = Array.from({ length: Math.ceil(exercises.length / 2) }, (_, index) => `<tr>${cell(exercises[index * 2])}${cell(exercises[index * 2 + 1])}</tr>`).join("");
  return `<section class="pc-section"><h3>Week No. · Exercise done during the work</h3><table class="pc-table pc-weekly"><thead><tr><th>Week</th><th>Exercise</th><th>Grade</th><th>Inst. Initial</th><th>Remarks</th><th>Week</th><th>Exercise</th><th>Grade</th><th>Inst. Initial</th><th>Remarks</th></tr></thead><tbody>${pairedRows}</tbody></table><div class="pc-last-exercise-line" aria-hidden="true"></div></section>`;
}

function studentHeader(data: ProgressCardData, manual: ElectricianProgressCardOptions["manual"] = {}) {
  return `<header class="pc-header"><h1>Progress Card</h1><div class="pc-info"><span><b>Name of trainee:</b> ${escapeHtml(data.student.name)}</span><span><b>Roll no.:</b> ${escapeHtml(data.student.roll)}</span><span><b>I.T.I.:</b> JYOTI ITC ROSERA</span><span><b>Date of Admission:</b> ${escapeHtml(manual.admissionDate)}</span><span><b>Trade:</b> ${escapeHtml(data.student.trade).toUpperCase()}</span><span><b>Date of Leaving:</b> ${escapeHtml(manual.leavingDate)}</span><span><b>Educational Qualification:</b> ${escapeHtml(manual.qualification)}</span><span><b>Session:</b> ${escapeHtml(data.student.session)}</span></div></header>`;
}

export function buildProgressSectionMarkup(title: string, matrix: ProgressMatrix, emptyMessage: string) {
  const headers = matrix[0] ?? [];
  const rows = matrix.slice(1).filter((row) => row.some((cell) => String(cell ?? "").trim() !== ""));
  if (!headers.length || !rows.length) return `<section class="progress-section"><h3>${escapeHtml(title)}</h3><p class="progress-empty">${escapeHtml(emptyMessage)}</p></section>`;
  return `<section class="progress-section"><h3>${escapeHtml(title)}</h3><table><thead><tr>${headers.map((header, index) => `<th>${escapeHtml(String(header || `Column ${index + 1}`))}</th>`).join("")}</tr></thead><tbody>${rows.slice(0, 120).map((row) => `<tr>${headers.map((_, index) => `<td>${escapeHtml(row[index])}</td>`).join("")}</tr>`).join("")}</tbody></table></section>`;
}

export function buildProgressCardMarkup(data: ProgressCardData) {
  const sections = ["attendance", "monthlyMarks", "quarterlyMarks", "jobEvolution"] as const;
  return `<div class="progress-card"><div class="progress-card-heading"><p class="progress-kicker">JYOTI ITC · ROSERA, BIHAR</p><h2>STUDENT PROGRESS CARD</h2><div class="progress-student-grid"><p><b>Student:</b> ${escapeHtml(data.student.name)}</p><p><b>Roll No:</b> ${escapeHtml(data.student.roll)}</p><p><b>Trade:</b> ${escapeHtml(data.student.trade)}</p><p><b>Session:</b> ${escapeHtml(data.student.session)}</p><p><b>Unit:</b> ${escapeHtml(data.student.unit)}</p></div></div>${sections.map((key) => buildProgressSectionMarkup(key, data[key], `No ${key} records found for this student.`)).join("")}<div class="progress-signature">Authorized Signatory<br>Signature &amp; Stamp</div></div>`;
}

export function buildElectricianProgressCardMarkup(data: ProgressCardData, exercises: Array<{ week: number; text: string }>, options: ElectricianProgressCardOptions = {}) {
  const year1Monthly = assessmentRows(splitYear(data.monthlyMarks, "1st Year"), MONTHS, 100);
  const year2Monthly = assessmentRows(splitYear(data.monthlyMarks, "2nd Year"), MONTHS, 100);
  const year1Quarterly = assessmentRows(splitYear(data.quarterlyMarks, "1st Year"), QUARTERS, 100);
  const year2Quarterly = assessmentRows(splitYear(data.quarterlyMarks, "2nd Year"), QUARTERS, 100);
  const weeklyExercises = exercises.filter((item) => item.week >= 1 && item.week <= 104).sort((a, b) => a.week - b.week);
  const exercisesPerPage = String(data.student.trade).toLowerCase().includes("fitter") ? 38 : 36;
  const weeklyPages = Array.from({ length: Math.ceil(weeklyExercises.length / exercisesPerPage) }, (_, index) => weeklyExercises.slice(index * exercisesPerPage, index * exercisesPerPage + exercisesPerPage));
  const totalPages = weeklyPages.length + 2;
  const page = (content: string, pageNo: number) => `<section class="pc-page" data-page="${pageNo}">${content}<div class="pc-page-footer"><span>JYOTI ITC ROSERA</span><span>Page ${pageNo} of ${totalPages}</span></div></section>`;
  const signs = { drawingSignUrl: options.drawingSignUrl, mathSignUrl: options.mathSignUrl, gisSignUrl: options.gisSignUrl };
  const exercisePages = weeklyPages.map((chunk, index) => page(studentHeader(data, options.manual) + weeklyTable(chunk, data.jobEvolution, options.rowEdits, options.exerciseSignUrl || options.instituteSignUrl), index + 1)).join("");
  const assessmentStart = weeklyPages.length + 1;
  return `<div class="electrician-progress-card">${exercisePages}${page(studentHeader(data, options.manual) + assessmentTable("Monthly Test · Year 1", year1Monthly, "Monthly Assessment Year 1", options.manual, options.rowEdits, "monthly-y1", signs) + assessmentTable("Quarterly Assessment · Year 1", year1Quarterly, "Quarterly Assessment Year 1", options.manual, options.rowEdits, "quarterly-y1", signs), assessmentStart)}${page(studentHeader(data, options.manual) + assessmentTable("Monthly Test · Year 2", year2Monthly, "Monthly Assessment Year 2", options.manual, options.rowEdits, "monthly-y2", signs) + assessmentTable("Quarterly Assessment · Year 2", year2Quarterly, "Quarterly Assessment Year 2", options.manual, options.rowEdits, "quarterly-y2", signs) + `<p class="pc-remarks"><b>General Remarks:</b> ${escapeHtml(options.manual?.remarks)}</p><div class="pc-signatures"><div><span class="pc-principal-line"></span><span>Principal Signature</span></div></div>`, assessmentStart + 1)}</div>`;
}

export function progressSectionNames() {
  return ["attendance", "monthlyMarks", "quarterlyMarks", "jobEvolution"];
}

export function buildProgressBatchMarkup(cards: string[]) {
  const validCards = cards.filter((card) => String(card || "").trim() !== "");
  return `<div class="progress-card-batch" data-card-count="${validCards.length}">${validCards.join("")}</div>`;
}
