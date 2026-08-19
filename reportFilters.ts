export type ReportFilters = {
  roll: string;
  session: string;
  trade: string;
  unit: string;
  date: string;
  month: string;
  quarter: string;
  week: string;
  year: string;
};

function compact(value: unknown) {
  return String(value ?? "").toLowerCase().replace(/\s+/g, "");
}

function dateKey(value: unknown) {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  const iso = raw.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (iso) return `${iso[1]}-${iso[2].padStart(2, "0")}-${iso[3].padStart(2, "0")}`;
  const dmy = raw.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (dmy) return `${dmy[3]}-${dmy[2].padStart(2, "0")}-${dmy[1].padStart(2, "0")}`;
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? compact(raw) : `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, "0")}-${String(parsed.getDate()).padStart(2, "0")}`;
}

function headerIndex(headers: unknown[], keywords: string[]) {
  return headers.findIndex((header) => keywords.some((keyword) => compact(header).replace(/[^a-z]/g, "").includes(keyword)));
}

export function filterRosterRows(rows: unknown[][], unit = "", session = "", options?: { sourceScoped?: boolean }) {
  const normalizedUnit = compact(unit);
  const normalizedSession = compact(session);
  const firstRow = rows[0] || [];
  const firstRowLooksLikeHeader = [firstRow[0], firstRow[1], firstRow[2], firstRow[3]].some((value) => {
    const token = compact(value);
    return token.includes("roll") || token.includes("name") || token.includes("session") || token.includes("batch") || token.includes("unit");
  });
  const dataRows = firstRowLooksLikeHeader ? rows.slice(1) : rows;
  const headerSessionIndex = firstRow.findIndex((value) => {
    const token = compact(value);
    return token.includes("session") || token.includes("batch");
  });
  const sessionIndex = headerSessionIndex >= 0 ? headerSessionIndex : 2;
  const headerUnitIndex = headerIndex(firstRow, ["unit"]);
  const unitIndex = headerUnitIndex >= 0 ? headerUnitIndex : 3;
  return dataRows.filter((row) => {
    const sessionMatches = Boolean(options?.sourceScoped) || headerSessionIndex < 0 || !normalizedSession || !row[sessionIndex] || compact(row[sessionIndex]) === normalizedSession;
    const unitMatches = !normalizedUnit || compact(row[unitIndex]).includes(normalizedUnit);
    return sessionMatches && unitMatches;
  });
}

export function filterRowsByRoster(rows: unknown[][], sheetName: string, allowedRolls: Set<string>) {
  const rollIndex = compact(sheetName).includes("jobevolution") ? 0 : 1;
  return rows.filter((row) => allowedRolls.has(String(row[rollIndex] ?? "")));
}

export function filterReportRows(rows: unknown[][], filters: ReportFilters, sheetName: string) {
  const headers = rows[0] || [];
  const mappings: Array<[keyof ReportFilters, string[]]> = [
    ["roll", ["roll", "registration", "regno"]],
    ["session", ["session", "batch"]],
    ["trade", ["trade"]],
    ["unit", ["unit"]],
    ["date", ["date", "timestamp"]],
    ["month", ["month"]],
    ["quarter", ["quarter"]],
    ["week", ["week"]],
    ["year", ["year", "academic year"]],
  ];

  return rows.slice(1).filter((row) => mappings.every(([key, keywords]) => {
    const filter = key === "date" ? dateKey(filters[key]) : compact(filters[key]);
    if (!filter) return true;
    const index = headerIndex(headers, keywords);
    if (index >= 0) return key === "date" ? dateKey(row[index]) === filter : compact(row[index]).includes(filter);
    if (key === "session" || key === "trade") {
      const tradeIndex = headerIndex(headers, ["trade", "stream", "course"]);
      const encodedTrade = tradeIndex >= 0 ? row[tradeIndex] : row.join(" ");
      return compact(encodedTrade).includes(filter) || compact(sheetName).includes(filter);
    }
    return false;
  }));
}
