export type PortalNotice = {
  date: string;
  type: string;
  content: string;
};

export type SheetMatrix = Array<Array<string | number | null>>;

function getBaseUrl() {
  const value = process.env.GOOGLE_SHEETS_API_URL;
  if (!value) throw new Error("GOOGLE_SHEETS_API_URL is not configured");
  return value;
}

let noticesCache: { data: PortalNotice[]; expiresAt: number } | null = null;

async function fetchLegacy<T>(params: Record<string, string>, options: { timeoutMs?: number; maxAttempts?: number } = {}) {
  const initialUrl = new URL(getBaseUrl());
  Object.entries(params).forEach(([key, value]) => initialUrl.searchParams.set(key, value));
  const timeoutMs = options.timeoutMs ?? 45_000;
  const maxAttempts = options.maxAttempts ?? 3;
  let lastError: unknown;
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    try {
      let target = initialUrl.toString();
      for (let redirect = 0; redirect < 3; redirect += 1) {
        const response = await fetch(target, { redirect: "manual", signal: AbortSignal.timeout(timeoutMs) });
        if ([301, 302, 303, 307, 308].includes(response.status)) {
          const location = response.headers.get("location");
          if (!location) throw new Error(`Google Sheets backend redirect ${response.status} had no location`);
          target = new URL(location, target).toString();
          continue;
        }
        if (!response.ok) throw new Error(`Google Sheets backend returned ${response.status}`);
        return (await response.json()) as T;
      }
      throw new Error("Google Sheets backend redirected too many times while reading");
    } catch (error) {
      lastError = error;
      if (attempt < maxAttempts - 1) await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Google Sheets request failed");
}

async function postLegacy<T>(payload: Record<string, unknown>) {
  const body = JSON.stringify(payload);
  let target = getBaseUrl();

  // Google Apps Script commonly returns a 302 to a googleusercontent URL. Native
  // fetch follows 302 by converting POST to GET, which drops the payload and can
  // make a working doPost deployment appear to succeed while saving nothing.
  for (let redirect = 0; redirect < 3; redirect += 1) {
    const response = await fetch(target, {
      method: "POST",
      redirect: "manual",
      headers: { "Content-Type": "application/json" },
      body,
    });

    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get("location");
      if (!location) throw new Error(`Google Sheets backend redirect ${response.status} had no location`);
      target = new URL(location, target).toString();
      continue;
    }

    if (!response.ok) {
      const detail = (await response.text()).slice(0, 240);
      throw new Error(`Google Sheets backend returned ${response.status}${detail ? `: ${detail}` : ""}`);
    }

    return (await response.json()) as T;
  }

  throw new Error("Google Sheets backend redirected too many times while saving");
}

export async function getNotices() {
  const now = Date.now();
  if (noticesCache && noticesCache.expiresAt > now) return noticesCache.data;
  try {
    const data = await fetchLegacy<PortalNotice[]>({ action: "get_notices" }, { timeoutMs: 30_000, maxAttempts: 2 });
    noticesCache = { data, expiresAt: now + 60_000 };
    return data;
  } catch (error) {
    if (noticesCache) return noticesCache.data;
    console.info("[Google Sheets] Notice board temporarily unavailable; no cached notices are available", error instanceof Error ? error.message : error);
    return [];
  }
}

export async function getSheetData(sheetName: string) {
  const normalizedSheet = normalize(sheetName);
  if (normalizedSheet === "JOBEVOLUTION") {
    try {
      return await fetchLegacy<SheetMatrix>({ action: "get_sheet_data", sheet_name: sheetName }, { timeoutMs: 20_000, maxAttempts: 2 });
    } catch (error) {
      console.info("[Google Sheets] Job Evolution temporarily unavailable; returning a structured empty result", error instanceof Error ? error.message : error);
      return [];
    }
  }
  return fetchLegacy<SheetMatrix>({ action: "get_sheet_data", sheet_name: sheetName });
}

export async function getStaffList() {
  return fetchLegacy<Array<{ username: string; password?: string; trade: string; name: string; unit?: string }>>({ action: "get_staff_list" });
}

export async function staffLogin(username: string, password: string) {
  return fetchLegacy<{ status?: string; message?: string; name?: string; trade?: string; unit?: string }>({
    action: "staff_login",
    id: username,
    pass: password,
  });
}

function normalize(value: unknown) {
  return String(value ?? "").replace(/\s+/g, "").toUpperCase();
}

function findColumn(headers: string[], tokens: string[], fallback: number) {
  const index = headers.findIndex((header) => tokens.some((token) => header.includes(token)));
  return index >= 0 ? index : fallback;
}

function matchesIdentity(row: Array<string | number | null>, headers: string[], identity: { session: string; trade: "Fitter" | "Electrician"; unit: string; roll: string }, fallback: { roll: number; trade: number }) {
  const rollIndex = findColumn(headers, ["ROLL"], fallback.roll);
  const sessionIndex = headers.findIndex((header) => header.includes("SESSION"));
  const tradeIndex = findColumn(headers, ["TRADE"], fallback.trade);
  const unitIndex = headers.findIndex((header) => header.includes("UNIT"));
  const wantedSession = normalize(identity.session);
  const wantedTrade = normalize(identity.trade);
  const wantedCombined = normalizeSessionTrade(identity.session, identity.trade);
  const actualTrade = normalize(row[tradeIndex]);
  const sessionMatches = sessionIndex < 0 || !normalize(row[sessionIndex]) || normalize(row[sessionIndex]) === wantedSession;
  const tradeMatches = actualTrade.includes(wantedCombined) || actualTrade === wantedTrade || actualTrade.includes(wantedTrade);
  const unitMatches = !identity.unit || unitIndex < 0 || !normalize(row[unitIndex]) || normalize(row[unitIndex]) === normalize(identity.unit);
  return normalize(row[rollIndex]) === normalize(identity.roll) && sessionMatches && tradeMatches && unitMatches;
}

export async function studentLogin(session: string, trade: "Fitter" | "Electrician", roll: string) {
  const sheetName = normalizeSessionTrade(session, trade);
  const roster = await getSheetData(sheetName);
  const headers = roster[0]?.map((value) => normalize(value)) ?? [];
  const rollIndex = findColumn(headers, ["ROLL"], 0);
  const nameIndex = findColumn(headers, ["NAME"], 1);
  const unitIndex = findColumn(headers, ["UNIT"], 3);
  const record = roster.slice(1).find((row) => normalize(row[rollIndex]) === normalize(roll));
  if (!record) return null;

  const studentUnit = String(record[unitIndex] ?? "");
  const [attendance, monthlyMarks, quarterlyMarks, jobEvolution] = await Promise.all([
    getSheetData("ATTENDANCE"),
    getSheetData("MONTHLY MARKS"),
    getSheetData("QUARTERLY MARKS"),
    getSheetData("JOB EVOLUTION"),
  ]);
  const filterMatrix = (matrix: SheetMatrix, fallback: { roll: number; trade: number }) => {
    const matrixHeaders = matrix[0]?.map((value) => normalize(value)) ?? [];
    const rows = matrix.slice(1).filter((row) => matchesIdentity(row, matrixHeaders, { session, trade, unit: studentUnit, roll }, fallback));
    return [matrix[0] ?? [], ...rows];
  };

  return {
    student: { roll: String(record[rollIndex] ?? roll), name: String(record[nameIndex] ?? ""), unit: studentUnit, session, trade, sheetName },
    attendance: filterMatrix(attendance, { roll: 1, trade: 3 }),
    monthlyMarks: filterMatrix(monthlyMarks, { roll: 1, trade: 3 }),
    quarterlyMarks: filterMatrix(quarterlyMarks, { roll: 1, trade: 3 }),
    jobEvolution: filterMatrix(jobEvolution, { roll: 0, trade: 2 }),
  };
}

export function normalizeSessionTrade(session: string, trade: "Fitter" | "Electrician") {
  return `${session}${trade}`.replace(/\s+/g, "").toUpperCase();
}

type FeeLookupResponse = { status?: string; message?: string; student: { registrationNo: string; name: string } | null; payments: SheetMatrix; mediator?: string; totals: { admissionFee: number; paid: number; balance: number; mediatorPaid?: number; status: string } };

function normalizeFeeLookupResponse(raw: any): FeeLookupResponse {
  const source = raw?.data || raw?.result || raw || {};
  return {
    ...source,
    student: source.student || source.studentRecord || null,
    payments: Array.isArray(source.payments) ? source.payments : [],
    totals: source.totals || { admissionFee: 0, paid: 0, balance: 0, status: "UNPAID" },
  };
}

function feeLookupFromSessionSheet(rows: SheetMatrix, input: { registrationNo: string; name: string; session: string; trade: string }): FeeLookupResponse {
  const headers = rows[0]?.map((value) => normalize(value)) ?? [];
  const column = (tokens: string[], fallback: number) => findColumn(headers, tokens, fallback);
  const registrationIndex = column(["ROLL", "REGISTRATION"], 0);
  const nameIndex = column(["NAME"], 1);
  const mobileIndex = column(["MOBILE", "PHONE", "WHATSAPP"], 4);
  const admissionIndex = column(["ADMISSIONFEE", "TOTALFEE", "FEE"], 5);
  const paidIndex = column(["PAIDAMOUNT", "TOTALPAID", "AMOUNTPAID", "PAID"], 6);
  const balanceIndex = column(["BALANCE", "UNPAID", "PENDING"], 7);
  const mediatorIndex = column(["MEDIATORNAME", "MEDIATOR", "AGENT"], 8);
  const mediatorPaidIndex = column(["MEDIATORPAID", "AGENTPAID"], 9);
  const historyIndex = column(["PAYMENTHISTORY", "FEEHISTORY", "INSTALLMENTHISTORY"], 10);
  const statusIndex = column(["PAYMENTSTATUS", "STATUS"], 11);
  const wantedRegistration = normalize(input.registrationNo);
  const wantedName = normalize(input.name);
  const match = rows.slice(1).find((row) => wantedRegistration
    ? normalize(row[registrationIndex]) === wantedRegistration
    : normalize(row[nameIndex]) === wantedName);
  if (!match) return { student: null, payments: [], totals: { admissionFee: 0, paid: 0, balance: 0, status: "UNPAID" } };
  const admissionFee = Number(match[admissionIndex] || 0);
  const paid = Number(match[paidIndex] || 0);
  const balance = Math.max(0, Number(match[balanceIndex] || admissionFee - paid));
  let payments: SheetMatrix = [];
  try { payments = match[historyIndex] ? JSON.parse(String(match[historyIndex])) : []; } catch { payments = []; }
  return {
    student: { registrationNo: String(match[registrationIndex] ?? ""), name: String(match[nameIndex] ?? "") },
    payments,
    mediator: String(match[mediatorIndex] ?? ""),
    totals: {
      admissionFee,
      paid,
      balance,
      mediatorPaid: Number(match[mediatorPaidIndex] || 0),
      status: String(match[statusIndex] || (balance === 0 && admissionFee > 0 ? "FULLY PAID" : paid > 0 ? "PARTIALLY PAID" : "UNPAID")),
    },
  };
}

export async function feeLookup(input: { registrationNo?: string; name?: string; session?: string; trade?: string }) {
  const registrationNo = String(input.registrationNo || "").trim();
  const name = String(input.name || "").trim();
  const session = String(input.session || "").trim();
  const trade = String(input.trade || "").trim();
  const params: Record<string, string> = { action: "get_fee_student" };
  if (registrationNo) {
    params.registration_no = registrationNo;
    params.registrationNo = registrationNo;
    params.registration = registrationNo;
  }
  if (name) {
    params.name = name;
    params.student_name = name;
    params.studentName = name;
  }
  if (session) params.session = session;
  if (trade) params.trade = trade;
  let rawResult: FeeLookupResponse;
  try {
    rawResult = await fetchLegacy<FeeLookupResponse>(params);
  } catch (error) {
    if (!session || !trade || (!registrationNo && !name)) throw error;
    const roster = await getSheetData(normalizeSessionTrade(session, trade as "Fitter" | "Electrician"));
    return feeLookupFromSessionSheet(roster, { registrationNo, name, session, trade });
  }
  const result = normalizeFeeLookupResponse(rawResult);
  if ((!session && !trade) || !result.payments.length) return result;
  const matchingPayments = result.payments.filter((row) => {
    const rowTrade = String(row[4] ?? "").trim().toLowerCase();
    const rowSession = String(row[5] ?? "").trim().toLowerCase();
    return (!trade || rowTrade === trade.toLowerCase()) && (!session || rowSession === session.toLowerCase());
  });
  if (!matchingPayments.length) return { ...result, student: null, payments: [], totals: { admissionFee: 0, paid: 0, balance: 0, status: "UNPAID" } };
  const admissionFee = Number(matchingPayments[matchingPayments.length - 1]?.[6] || result.totals.admissionFee || 0);
  const paid = matchingPayments.reduce((sum, row) => sum + Number(row[7] || 0), 0);
  const mediatorPaid = matchingPayments.reduce((sum, row) => sum + Number(row[14] || 0), 0);
  const balance = Math.max(0, admissionFee - paid);
  return { ...result, payments: matchingPayments, totals: { admissionFee, paid, balance, mediatorPaid, status: balance === 0 ? "FULLY PAID" : paid > 0 ? "PARTIALLY PAID" : "UNPAID" } };

}

type PortalWriteResponse = { status?: string; message?: string; rowsAdded?: number; invoiceNo?: string; registrationNo?: string; studentName?: string; admissionFee?: number; paymentAmount?: number; totalPaid?: number; balance?: number; paymentStatus?: string; fullyPaid?: boolean; mediator?: string; mediatorPaid?: number; totalMediatorPaid?: number; paymentHistory?: SheetMatrix; reconciled?: boolean };

function recentMatchingPayment(result: FeeLookupResponse, payload: Record<string, unknown>) {
  const amount = Number(payload.payment_amount || 0);
  const registrationNo = normalize(payload.registration_no);
  const latest = result.payments[result.payments.length - 1];
  if (!latest || Number(latest[7] || 0) !== amount || normalize(latest[2]) !== registrationNo) return null;
  const timestamp = Date.parse(String(latest[1] || ""));
  if (!Number.isNaN(timestamp) && Math.abs(Date.now() - timestamp) > 10 * 60 * 1000) return null;
  return latest;
}

function matrixWriteSheetName(type: string) {
  if (type === "monthly_marks") return "MONTHLY MARKS";
  if (type === "quarterly_marks") return "QUARTERLY MARKS";
  if (type === "job_marks") return "JOB EVOLUTION";
  if (type === "attendance") return "ATTENDANCE";
  return null;
}

function matrixRowMatches(type: string, row: Array<string | number | null>, entry: Array<string | number | null>) {
  const same = (left: unknown, right: unknown) => normalize(left) === normalize(right);
  if (type === "job_marks") return same(row[0], entry[0]) && same(row[2], entry[2]) && same(row[3], entry[3]) && same(row[5], entry[5]) && same(row[6], entry[6]);
  if (type === "attendance") return same(row[0], entry[0]) && same(row[1], entry[1]) && same(row[3], entry[3]) && same(row[4], entry[4]);
  return same(row[1], entry[1]) && same(row[3], entry[3]) && same(row[4], entry[4]) && same(row[6], entry[6]) && same(row[7], entry[7]);
}

async function reconcileMatrixWrite(payload: Record<string, unknown>): Promise<PortalWriteResponse | null> {
  const type = String(payload.type || "");
  const sheetName = matrixWriteSheetName(type);
  const entries = Array.isArray(payload.entries) ? payload.entries as Array<Array<string | number | null>> : [];
  if (!sheetName || !entries.length) return null;
  try {
    const matrix = await getSheetData(sheetName);
    const rows = matrix.slice(1);
    const verifiedEntries = entries.filter((entry) => rows.some((row) => matrixRowMatches(type, row, entry))).length;
    if (verifiedEntries !== entries.length) return null;
    return { status: "success", reconciled: true, rowsAdded: verifiedEntries };
  } catch {
    return null;
  }
}

async function reconcileFeePayment(payload: Record<string, unknown>, originalError?: unknown): Promise<PortalWriteResponse | null> {
  if (payload.type !== "record_fee_payment" && payload.type !== "fee_payment") return null;
  const session = String(payload.session || "").trim();
  const trade = String(payload.trade || "").trim();
  const registrationNo = String(payload.registration_no || "").trim();
  if (!session || !trade || !registrationNo) return null;
  try {
    const lookup = await feeLookup({ registrationNo, session, trade });
    const latest = recentMatchingPayment(lookup, payload);
    if (!latest) return null;
    return {
      status: "success",
      reconciled: true,
      invoiceNo: String(latest[0] || ""),
      registrationNo,
      studentName: String(payload.student_name || lookup.student?.name || ""),
      admissionFee: Number(latest[6] || lookup.totals.admissionFee || 0),
      paymentAmount: Number(latest[7] || 0),
      totalPaid: Number(latest[8] || lookup.totals.paid || 0),
      balance: Number(latest[9] || lookup.totals.balance || 0),
      paymentStatus: String(latest[10] || lookup.totals.status || "PARTIALLY PAID"),
      fullyPaid: String(latest[10] || "").toUpperCase() === "FULLY PAID",
      paymentHistory: lookup.payments,
    } satisfies PortalWriteResponse;
  } catch {
    if (originalError) return null;
    return null;
  }
}

export async function writePortalData(payload: Record<string, unknown>) {
  try {
    const result = await postLegacy<PortalWriteResponse>(payload);
    if (String(result?.status || "").toLowerCase() === "error") {
      return (await reconcileMatrixWrite(payload)) || (await reconcileFeePayment(payload)) || result;
    }
    return result;
  } catch (error) {
    const reconciled = await reconcileMatrixWrite(payload) || await reconcileFeePayment(payload, error);
    if (reconciled) return reconciled;
    throw error;
  }
}

export function getConfiguredSheetsUrl() {
  return process.env.GOOGLE_SHEETS_API_URL || "";
}
