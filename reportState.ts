function compact(value: unknown) {
  return String(value ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

function findColumn(headers: string[], ...keywords: string[]) {
  return headers.findIndex((header) => keywords.some((keyword) => compact(header).includes(keyword)));
}

function splitTradeSession(value: unknown, fallbackSession = "") {
  const text = String(value ?? "").trim();
  const sessionMatch = text.match(/20\d{2}\s*[-/]\s*\d{2}/);
  const session = sessionMatch?.[0]?.replace(/\s+/g, "") || fallbackSession;
  const trade = sessionMatch ? text.replace(sessionMatch[0], "").trim() : text;
  return { trade: trade || "—", session: session || "—" };
}

export function normalizeReportMatrix(value: unknown): unknown[][] {
  if (Array.isArray(value)) return value as unknown[][];
  if (value && typeof value === "object" && Array.isArray((value as { rows?: unknown[][] }).rows)) {
    return (value as { rows: unknown[][] }).rows;
  }
  return [];
}

export function normalizeReportResponse(value: unknown) {
  if (Array.isArray(value)) {
    const rows = value as unknown[][];
    return { headers: rows[0]?.map((cell) => String(cell ?? "")) || [], rows };
  }
  if (value && typeof value === "object") {
    const response = value as { headers?: unknown[]; rows?: unknown[][]; data?: unknown[][] };
    const rows = Array.isArray(response.rows) ? response.rows : Array.isArray(response.data) ? response.data : [];
    const headers = Array.isArray(response.headers) ? response.headers.map((cell) => String(cell ?? "")) : rows[0]?.map((cell) => String(cell ?? "")) || [];
    return { headers, rows };
  }
  return { headers: [] as string[], rows: [] as unknown[][] };
}

export function preserveLoadedReportRows(reportRows: unknown[][], loadedRosterRows: unknown[][], studentsLoaded: boolean) {
  if (reportRows.length) return reportRows;
  return studentsLoaded ? loadedRosterRows : [];
}

export function defaultReportHeaders(sheetName: string) {
  const name = sheetName.toLowerCase().replace(/\s+/g, "");
  if (name.includes("attendance")) return ["DATE", "ROLL", "NAME", "TRADE", "SESSION", "UNIT", "STATUS"];
  if (name.includes("monthly")) return ["DATE", "ROLL", "NAME", "SESSION", "TRADE", "UNIT", "YEAR", "MONTH NAME", "PRACTICAL", "THEORY", "WCS", "DRAWING", "TOTAL"];
  if (name.includes("quarterly")) return ["DATE", "ROLL", "NAME", "SESSION", "TRADE", "UNIT", "YEAR", "QUARTERLY NO", "PRACTICAL", "THEORY", "WCS", "DRAWING", "TOTAL"];
  if (name.includes("job")) return ["ROLL NO", "NAME", "SESSION", "TRADE", "UNIT", "YEAR", "WEEK NO", "A", "B", "C", "D", "E", "TOTAL"];
  return ["ROLL", "NAME", "SESSION", "UNIT"];
}

export function reportHeadersFor(sheetName: string, headers: unknown[]) {
  return headers.length ? headers.map((header) => String(header ?? "").trim() || "—") : defaultReportHeaders(sheetName);
}

export function buildReportTableModel(sheetName: string, sourceHeaders: string[], rows: unknown[][], fallbackSession = "") {
  const name = sheetName.toLowerCase().replace(/\s+/g, "");
  if (!rows.length && !sourceHeaders.length) return { headers: defaultReportHeaders(sheetName), rows: [] as unknown[][] };
  if (!sourceHeaders.length || (sourceHeaders.length === 4 && name === "attendance")) {
    return { headers: ["ROLL", "NAME", "SESSION", "UNIT"], rows };
  }
  const headers = sourceHeaders;
  const at = (...keywords: string[]) => findColumn(headers, ...keywords);
  const cell = (row: unknown[], index: number) => index >= 0 ? row[index] ?? "—" : "—";
  const tradeIndex = at("trade", "stream", "course");
  const sessionIndex = at("session", "batch");
  const unitIndex = at("unit");
  const rollIndex = at("roll", "registration", "regno");
  const nameIndex = at("name", "student");
  const dateIndex = at("date", "timestamp");
  const periodIndex = at(name.includes("quarterly") ? "quarter" : name.includes("job") ? "week" : "month");
  const yearIndex = at("year", "academic year");
  const statusIndex = at("status", "present", "attendance");
  const component = (letter: string) => headers.findIndex((header) => {
    const token = compact(header);
    return token === letter || token.startsWith(`${letter}(`) || token.endsWith(`(${letter})`);
  });
  const score = (field: string) => at(field);
  const normalized = rows.map((row) => {
    const split = splitTradeSession(cell(row, tradeIndex), cell(row, sessionIndex) === "—" ? fallbackSession : String(cell(row, sessionIndex)));
    if (name.includes("job")) return [cell(row, rollIndex), cell(row, nameIndex), sessionIndex >= 0 ? cell(row, sessionIndex) : split.session, tradeIndex >= 0 ? cell(row, tradeIndex) : split.trade, cell(row, unitIndex), cell(row, yearIndex), cell(row, periodIndex), cell(row, component("a")), cell(row, component("b")), cell(row, component("c")), cell(row, component("d")), cell(row, component("e")), cell(row, score("total"))];
    if (name.includes("attendance")) return [cell(row, dateIndex), cell(row, rollIndex), cell(row, nameIndex), split.trade, split.session, cell(row, unitIndex), cell(row, statusIndex)];
    return [cell(row, dateIndex), cell(row, rollIndex), cell(row, nameIndex), sessionIndex >= 0 ? cell(row, sessionIndex) : split.session, tradeIndex >= 0 ? cell(row, tradeIndex) : split.trade, cell(row, unitIndex), cell(row, yearIndex), cell(row, periodIndex), cell(row, score("practical")), cell(row, score("theory")), cell(row, score("wcs")), cell(row, score("drawing")), cell(row, score("total"))];
  });
  if (name.includes("job")) return { headers: defaultReportHeaders("JOB EVOLUTION"), rows: normalized };
  if (name.includes("attendance")) return { headers: defaultReportHeaders("ATTENDANCE"), rows: normalized };
  if (name.includes("quarterly")) return { headers: defaultReportHeaders("QUARTERLY MARKS"), rows: normalized };
  return { headers: defaultReportHeaders("MONTHLY MARKS"), rows: normalized };
}
