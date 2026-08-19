function normalize(value: unknown) {
  return String(value ?? "").trim().toLowerCase();
}

export function filterReportTableRows(rows: unknown[][], query: string) {
  const needle = normalize(query);
  if (!needle) return rows;
  return rows.filter((row) => row.some((cell) => normalize(cell).includes(needle)));
}

function average(values: number[]) {
  return values.length ? Number((values.reduce((total, value) => total + value, 0) / values.length).toFixed(2)) : 0;
}

function numericAt(rows: unknown[][], index: number) {
  return rows.map((row) => Number(row[index])).filter((value) => Number.isFinite(value));
}

export function summarizeReportRows(sheetName: string, rows: unknown[][]) {
  const name = sheetName.toLowerCase().replace(/\s+/g, "");
  if (name.includes("attendance")) {
    const present = rows.filter((row) => ["p", "present", "yes", "1"].includes(normalize(row[6]))).length;
    const absent = rows.filter((row) => ["a", "absent", "no", "0"].includes(normalize(row[6]))).length;
    const marked = present + absent;
    return { kind: "attendance" as const, total: rows.length, present, absent, percentage: marked ? Number(((present / marked) * 100).toFixed(2)) : 0 };
  }
  if (name.includes("job")) {
    return { kind: "marks" as const, students: rows.length, averages: { A: average(numericAt(rows, 7)), B: average(numericAt(rows, 8)), C: average(numericAt(rows, 9)), D: average(numericAt(rows, 10)), E: average(numericAt(rows, 11)), Total: average(numericAt(rows, 12)) } };
  }
  return { kind: "marks" as const, students: rows.length, averages: { Practical: average(numericAt(rows, 8)), Theory: average(numericAt(rows, 9)), WCS: average(numericAt(rows, 10)), Drawing: average(numericAt(rows, 11)), Total: average(numericAt(rows, 12)) } };
}
