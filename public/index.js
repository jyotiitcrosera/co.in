var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/googleSheets.ts
var googleSheets_exports = {};
__export(googleSheets_exports, {
  feeLookup: () => feeLookup,
  getConfiguredSheetsUrl: () => getConfiguredSheetsUrl,
  getNotices: () => getNotices,
  getSheetData: () => getSheetData,
  getStaffList: () => getStaffList,
  normalizeSessionTrade: () => normalizeSessionTrade,
  staffLogin: () => staffLogin,
  studentLogin: () => studentLogin,
  writePortalData: () => writePortalData
});
function getBaseUrl() {
  const value = process.env.GOOGLE_SHEETS_API_URL;
  if (!value) throw new Error("GOOGLE_SHEETS_API_URL is not configured");
  return value;
}
async function fetchLegacy(params, options = {}) {
  const initialUrl = new URL(getBaseUrl());
  Object.entries(params).forEach(([key, value]) => initialUrl.searchParams.set(key, value));
  const timeoutMs = options.timeoutMs ?? 45e3;
  const maxAttempts = options.maxAttempts ?? 3;
  let lastError;
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
        return await response.json();
      }
      throw new Error("Google Sheets backend redirected too many times while reading");
    } catch (error) {
      lastError = error;
      if (attempt < maxAttempts - 1) await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Google Sheets request failed");
}
async function postLegacy(payload) {
  const body = JSON.stringify(payload);
  let target = getBaseUrl();
  for (let redirect = 0; redirect < 3; redirect += 1) {
    const response = await fetch(target, {
      method: "POST",
      redirect: "manual",
      headers: { "Content-Type": "application/json" },
      body
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
    return await response.json();
  }
  throw new Error("Google Sheets backend redirected too many times while saving");
}
async function getNotices() {
  const now = Date.now();
  if (noticesCache && noticesCache.expiresAt > now) return noticesCache.data;
  try {
    const data = await fetchLegacy({ action: "get_notices" }, { timeoutMs: 3e4, maxAttempts: 2 });
    noticesCache = { data, expiresAt: now + 6e4 };
    return data;
  } catch (error) {
    if (noticesCache) return noticesCache.data;
    console.info("[Google Sheets] Notice board temporarily unavailable; no cached notices are available", error instanceof Error ? error.message : error);
    return [];
  }
}
async function getSheetData(sheetName) {
  const normalizedSheet = normalize(sheetName);
  if (normalizedSheet === "JOBEVOLUTION") {
    try {
      return await fetchLegacy({ action: "get_sheet_data", sheet_name: sheetName }, { timeoutMs: 2e4, maxAttempts: 2 });
    } catch (error) {
      console.info("[Google Sheets] Job Evolution temporarily unavailable; returning a structured empty result", error instanceof Error ? error.message : error);
      return [];
    }
  }
  return fetchLegacy({ action: "get_sheet_data", sheet_name: sheetName });
}
async function getStaffList() {
  return fetchLegacy({ action: "get_staff_list" });
}
async function staffLogin(username, password) {
  return fetchLegacy({
    action: "staff_login",
    id: username,
    pass: password
  });
}
function normalize(value) {
  return String(value ?? "").replace(/\s+/g, "").toUpperCase();
}
function findColumn(headers, tokens, fallback) {
  const index = headers.findIndex((header) => tokens.some((token) => header.includes(token)));
  return index >= 0 ? index : fallback;
}
function matchesIdentity(row, headers, identity, fallback) {
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
async function studentLogin(session, trade, roll) {
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
    getSheetData("JOB EVOLUTION")
  ]);
  const filterMatrix = (matrix, fallback) => {
    const matrixHeaders = matrix[0]?.map((value) => normalize(value)) ?? [];
    const rows = matrix.slice(1).filter((row) => matchesIdentity(row, matrixHeaders, { session, trade, unit: studentUnit, roll }, fallback));
    return [matrix[0] ?? [], ...rows];
  };
  return {
    student: { roll: String(record[rollIndex] ?? roll), name: String(record[nameIndex] ?? ""), unit: studentUnit, session, trade, sheetName },
    attendance: filterMatrix(attendance, { roll: 1, trade: 3 }),
    monthlyMarks: filterMatrix(monthlyMarks, { roll: 1, trade: 3 }),
    quarterlyMarks: filterMatrix(quarterlyMarks, { roll: 1, trade: 3 }),
    jobEvolution: filterMatrix(jobEvolution, { roll: 0, trade: 2 })
  };
}
function normalizeSessionTrade(session, trade) {
  return `${session}${trade}`.replace(/\s+/g, "").toUpperCase();
}
function normalizeFeeLookupResponse(raw) {
  const source = raw?.data || raw?.result || raw || {};
  return {
    ...source,
    student: source.student || source.studentRecord || null,
    payments: Array.isArray(source.payments) ? source.payments : [],
    totals: source.totals || { admissionFee: 0, paid: 0, balance: 0, status: "UNPAID" }
  };
}
function feeLookupFromSessionSheet(rows, input) {
  const headers = rows[0]?.map((value) => normalize(value)) ?? [];
  const column = (tokens, fallback) => findColumn(headers, tokens, fallback);
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
  const match = rows.slice(1).find((row) => wantedRegistration ? normalize(row[registrationIndex]) === wantedRegistration : normalize(row[nameIndex]) === wantedName);
  if (!match) return { student: null, payments: [], totals: { admissionFee: 0, paid: 0, balance: 0, status: "UNPAID" } };
  const admissionFee = Number(match[admissionIndex] || 0);
  const paid = Number(match[paidIndex] || 0);
  const balance = Math.max(0, Number(match[balanceIndex] || admissionFee - paid));
  let payments = [];
  try {
    payments = match[historyIndex] ? JSON.parse(String(match[historyIndex])) : [];
  } catch {
    payments = [];
  }
  return {
    student: { registrationNo: String(match[registrationIndex] ?? ""), name: String(match[nameIndex] ?? "") },
    payments,
    mediator: String(match[mediatorIndex] ?? ""),
    totals: {
      admissionFee,
      paid,
      balance,
      mediatorPaid: Number(match[mediatorPaidIndex] || 0),
      status: String(match[statusIndex] || (balance === 0 && admissionFee > 0 ? "FULLY PAID" : paid > 0 ? "PARTIALLY PAID" : "UNPAID"))
    }
  };
}
async function feeLookup(input) {
  const registrationNo = String(input.registrationNo || "").trim();
  const name = String(input.name || "").trim();
  const session = String(input.session || "").trim();
  const trade = String(input.trade || "").trim();
  const params = { action: "get_fee_student" };
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
  let rawResult;
  try {
    rawResult = await fetchLegacy(params);
  } catch (error) {
    if (!session || !trade || !registrationNo && !name) throw error;
    const roster = await getSheetData(normalizeSessionTrade(session, trade));
    return feeLookupFromSessionSheet(roster, { registrationNo, name, session, trade });
  }
  const result = normalizeFeeLookupResponse(rawResult);
  if (!session && !trade || !result.payments.length) return result;
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
function recentMatchingPayment(result, payload) {
  const amount = Number(payload.payment_amount || 0);
  const registrationNo = normalize(payload.registration_no);
  const latest = result.payments[result.payments.length - 1];
  if (!latest || Number(latest[7] || 0) !== amount || normalize(latest[2]) !== registrationNo) return null;
  const timestamp2 = Date.parse(String(latest[1] || ""));
  if (!Number.isNaN(timestamp2) && Math.abs(Date.now() - timestamp2) > 10 * 60 * 1e3) return null;
  return latest;
}
function matrixWriteSheetName(type) {
  if (type === "monthly_marks") return "MONTHLY MARKS";
  if (type === "quarterly_marks") return "QUARTERLY MARKS";
  if (type === "job_marks") return "JOB EVOLUTION";
  if (type === "attendance") return "ATTENDANCE";
  return null;
}
function matrixRowMatches(type, row, entry) {
  const same = (left, right) => normalize(left) === normalize(right);
  if (type === "job_marks") return same(row[0], entry[0]) && same(row[2], entry[2]) && same(row[3], entry[3]) && same(row[5], entry[5]) && same(row[6], entry[6]);
  if (type === "attendance") return same(row[0], entry[0]) && same(row[1], entry[1]) && same(row[3], entry[3]) && same(row[4], entry[4]);
  return same(row[1], entry[1]) && same(row[3], entry[3]) && same(row[4], entry[4]) && same(row[6], entry[6]) && same(row[7], entry[7]);
}
async function reconcileMatrixWrite(payload) {
  const type = String(payload.type || "");
  const sheetName = matrixWriteSheetName(type);
  const entries = Array.isArray(payload.entries) ? payload.entries : [];
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
async function reconcileFeePayment(payload, originalError) {
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
      paymentHistory: lookup.payments
    };
  } catch {
    if (originalError) return null;
    return null;
  }
}
async function writePortalData(payload) {
  try {
    const result = await postLegacy(payload);
    if (String(result?.status || "").toLowerCase() === "error") {
      return await reconcileMatrixWrite(payload) || await reconcileFeePayment(payload) || result;
    }
    return result;
  } catch (error) {
    const reconciled = await reconcileMatrixWrite(payload) || await reconcileFeePayment(payload, error);
    if (reconciled) return reconciled;
    throw error;
  }
}
function getConfiguredSheetsUrl() {
  return process.env.GOOGLE_SHEETS_API_URL || "";
}
var noticesCache;
var init_googleSheets = __esm({
  "server/googleSheets.ts"() {
    "use strict";
    noticesCache = null;
  }
});

// server/_core/index.ts
import "dotenv/config";
import express2 from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

// shared/const.ts
var COOKIE_NAME = "app_session_id";
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var AXIOS_TIMEOUT_MS = 3e4;
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";
var OAUTH_STATE_COOKIE = "__Host-oauth_state";
var decodeOAuthState = (state) => {
  let decoded;
  try {
    decoded = atob(state);
  } catch {
    return { redirectUri: "" };
  }
  try {
    const parsed = JSON.parse(decoded);
    if (parsed && typeof parsed.redirectUri === "string") return parsed;
  } catch {
  }
  return { redirectUri: decoded };
};

// server/_core/oauth.ts
import { parse as parseCookieHeader2 } from "cookie";

// server/db.ts
import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";

// drizzle/schema.ts
import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";
var users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull()
});
var admissionEnquiries = mysqlTable("admission_enquiries", {
  id: int("id").autoincrement().primaryKey(),
  applicantName: varchar("applicantName", { length: 160 }).notNull(),
  phone: varchar("phone", { length: 32 }).notNull(),
  email: varchar("email", { length: 320 }),
  trade: mysqlEnum("trade", ["Fitter", "Electrician"]).notNull(),
  qualification: varchar("qualification", { length: 120 }),
  message: text("message"),
  status: mysqlEnum("status", ["new", "contacted", "closed"]).default("new").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var auditLogs = mysqlTable("audit_logs", {
  id: int("id").autoincrement().primaryKey(),
  actor: varchar("actor", { length: 160 }).notNull(),
  actorRole: varchar("actorRole", { length: 40 }).notNull(),
  action: varchar("action", { length: 120 }).notNull(),
  entity: varchar("entity", { length: 120 }),
  details: text("details"),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});

// server/_core/env.ts
var ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? ""
};

// server/db.ts
var _db = null;
async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}
async function upsertUser(user) {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }
  const values = { openId: user.openId };
  const updateSet = {};
  const textFields = ["name", "email", "loginMethod"];
  for (const field of textFields) {
    if (user[field] !== void 0) {
      values[field] = user[field] ?? null;
      updateSet[field] = user[field] ?? null;
    }
  }
  if (user.lastSignedIn !== void 0) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== void 0) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  if (!values.lastSignedIn) values.lastSignedIn = /* @__PURE__ */ new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = /* @__PURE__ */ new Date();
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}
async function getUserByOpenId(openId) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function createAdmissionEnquiry(input) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable. Please try again shortly.");
  const result = await db.insert(admissionEnquiries).values(input);
  return { id: Number(result[0].insertId), status: "new" };
}
async function createAuditLog(input) {
  const db = await getDb();
  if (!db) {
    console.warn("[Audit] Database unavailable; action was not persisted", input.action);
    return { persisted: false };
  }
  await db.insert(auditLogs).values(input);
  return { persisted: true };
}
async function getRecentAuditLogs(limit = 100) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(Math.min(Math.max(limit, 1), 200));
}

// server/_core/cookies.ts
function isSecureRequest(req) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto.split(",");
  return protoList.some((proto) => proto.trim().toLowerCase() === "https");
}
function getSessionCookieOptions(req) {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: isSecureRequest(req)
  };
}

// shared/_core/errors.ts
var HttpError = class extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "HttpError";
  }
};
var ForbiddenError = (msg) => new HttpError(403, msg);

// server/_core/sdk.ts
import axios from "axios";
import { parse as parseCookieHeader } from "cookie";
import { SignJWT, jwtVerify } from "jose";
var isNonEmptyString = (value) => typeof value === "string" && value.length > 0;
var EXCHANGE_TOKEN_PATH = `/webdev.v1.WebDevAuthPublicService/ExchangeToken`;
var GET_USER_INFO_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfo`;
var GET_USER_INFO_WITH_JWT_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfoWithJwt`;
var OAuthService = class {
  constructor(client) {
    this.client = client;
    console.log("[OAuth] Initialized with baseURL:", ENV.oAuthServerUrl);
    if (!ENV.oAuthServerUrl) {
      console.error(
        "[OAuth] ERROR: OAUTH_SERVER_URL is not configured! Set OAUTH_SERVER_URL environment variable."
      );
    }
  }
  decodeState(state) {
    return decodeOAuthState(state).redirectUri;
  }
  async getTokenByCode(code, state) {
    const payload = {
      clientId: ENV.appId,
      grantType: "authorization_code",
      code,
      redirectUri: this.decodeState(state)
    };
    const { data } = await this.client.post(
      EXCHANGE_TOKEN_PATH,
      payload
    );
    return data;
  }
  async getUserInfoByToken(token) {
    const { data } = await this.client.post(
      GET_USER_INFO_PATH,
      {
        accessToken: token.accessToken
      }
    );
    return data;
  }
};
var createOAuthHttpClient = () => axios.create({
  baseURL: ENV.oAuthServerUrl,
  timeout: AXIOS_TIMEOUT_MS
});
var SDKServer = class {
  client;
  oauthService;
  constructor(client = createOAuthHttpClient()) {
    this.client = client;
    this.oauthService = new OAuthService(this.client);
  }
  deriveLoginMethod(platforms, fallback) {
    if (fallback && fallback.length > 0) return fallback;
    if (!Array.isArray(platforms) || platforms.length === 0) return null;
    const set = new Set(
      platforms.filter((p) => typeof p === "string")
    );
    if (set.has("REGISTERED_PLATFORM_EMAIL")) return "email";
    if (set.has("REGISTERED_PLATFORM_GOOGLE")) return "google";
    if (set.has("REGISTERED_PLATFORM_APPLE")) return "apple";
    if (set.has("REGISTERED_PLATFORM_MICROSOFT") || set.has("REGISTERED_PLATFORM_AZURE"))
      return "microsoft";
    if (set.has("REGISTERED_PLATFORM_GITHUB")) return "github";
    const first = Array.from(set)[0];
    return first ? first.toLowerCase() : null;
  }
  /**
   * Exchange OAuth authorization code for access token
   * @example
   * const tokenResponse = await sdk.exchangeCodeForToken(code, state);
   */
  async exchangeCodeForToken(code, state) {
    return this.oauthService.getTokenByCode(code, state);
  }
  /**
   * Get user information using access token
   * @example
   * const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
   */
  async getUserInfo(accessToken) {
    const data = await this.oauthService.getUserInfoByToken({
      accessToken
    });
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  parseCookies(cookieHeader) {
    if (!cookieHeader) {
      return /* @__PURE__ */ new Map();
    }
    const parsed = parseCookieHeader(cookieHeader);
    return new Map(Object.entries(parsed));
  }
  getSessionSecret() {
    const secret = ENV.cookieSecret;
    return new TextEncoder().encode(secret);
  }
  /**
   * Create a session token for a Manus user openId
   * @example
   * const sessionToken = await sdk.createSessionToken(userInfo.openId);
   */
  async createSessionToken(openId, options = {}) {
    return this.signSession(
      {
        openId,
        appId: ENV.appId,
        name: options.name || ""
      },
      options
    );
  }
  async signSession(payload, options = {}) {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1e3);
    const secretKey = this.getSessionSecret();
    return new SignJWT({
      openId: payload.openId,
      appId: payload.appId,
      name: payload.name
    }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setExpirationTime(expirationSeconds).sign(secretKey);
  }
  async verifySession(cookieValue) {
    if (!cookieValue) {
      console.warn("[Auth] Missing session cookie");
      return null;
    }
    try {
      const secretKey = this.getSessionSecret();
      const { payload } = await jwtVerify(cookieValue, secretKey, {
        algorithms: ["HS256"]
      });
      const { openId, appId, name } = payload;
      if (!isNonEmptyString(openId) || !isNonEmptyString(appId) || !isNonEmptyString(name)) {
        console.warn("[Auth] Session payload missing required fields");
        return null;
      }
      return {
        openId,
        appId,
        name
      };
    } catch (error) {
      console.warn("[Auth] Session verification failed", String(error));
      return null;
    }
  }
  async getUserInfoWithJwt(jwtToken) {
    const payload = {
      jwtToken,
      projectId: ENV.appId
    };
    const { data } = await this.client.post(
      GET_USER_INFO_WITH_JWT_PATH,
      payload
    );
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  async authenticateRequest(req) {
    const cookies = this.parseCookies(req.headers.cookie);
    let sessionToken = cookies.get(COOKIE_NAME);
    if (!sessionToken) {
      const authHeader = req.headers.authorization;
      if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
        sessionToken = authHeader.slice(7);
      }
    }
    const session = await this.verifySession(sessionToken);
    if (!session) {
      throw ForbiddenError("Invalid session cookie");
    }
    if (session.openId.startsWith(CRON_OPEN_ID_PREFIX)) {
      const userInfo = await this.getUserInfoWithJwt(sessionToken ?? "");
      const taskUid = userInfo.taskUid ?? null;
      if (!taskUid) {
        throw ForbiddenError("Cron session missing task_uid");
      }
      return buildCronUser(userInfo);
    }
    const sessionUserId = session.openId;
    const signedInAt = /* @__PURE__ */ new Date();
    let user = await getUserByOpenId(sessionUserId);
    if (!user) {
      try {
        const userInfo = await this.getUserInfoWithJwt(sessionToken ?? "");
        await upsertUser({
          openId: userInfo.openId,
          name: userInfo.name || null,
          email: userInfo.email ?? null,
          loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
          lastSignedIn: signedInAt
        });
        user = await getUserByOpenId(userInfo.openId);
      } catch (error) {
        console.error("[Auth] Failed to sync user from OAuth:", error);
        throw ForbiddenError("Failed to sync user info");
      }
    }
    if (!user) {
      throw ForbiddenError("User not found");
    }
    await upsertUser({
      openId: user.openId,
      lastSignedIn: signedInAt
    });
    return user;
  }
};
var CRON_OPEN_ID_PREFIX = "cron_";
function buildCronUser(userInfo) {
  const now = /* @__PURE__ */ new Date();
  return {
    id: -1,
    openId: userInfo.openId,
    name: userInfo.name || "Manus Scheduled Task",
    email: null,
    loginMethod: null,
    role: "user",
    createdAt: now,
    updatedAt: now,
    lastSignedIn: now,
    taskUid: userInfo.taskUid ?? void 0,
    isCron: true
  };
}
var sdk = new SDKServer();

// server/_core/oauth.ts
function getQueryParam(req, key) {
  const value = req.query[key];
  return typeof value === "string" ? value : void 0;
}
function registerOAuthRoutes(app) {
  app.get("/api/oauth/callback", async (req, res) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");
    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }
    const { nonce } = decodeOAuthState(state);
    const expectedNonce = parseCookieHeader2(req.headers.cookie ?? "")[OAUTH_STATE_COOKIE];
    if (!nonce || nonce !== expectedNonce) {
      res.status(403).json({ error: "invalid oauth state" });
      return;
    }
    res.clearCookie(OAUTH_STATE_COOKIE, { path: "/", secure: true, sameSite: "none" });
    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }
      await upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: /* @__PURE__ */ new Date()
      });
      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS
      });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}

// server/_core/storageProxy.ts
function registerStorageProxy(app) {
  app.get("/manus-storage/*", async (req, res) => {
    const key = req.params[0];
    if (!key) {
      res.status(400).send("Missing storage key");
      return;
    }
    if (!ENV.forgeApiUrl || !ENV.forgeApiKey) {
      res.status(500).send("Storage proxy not configured");
      return;
    }
    try {
      const forgeUrl = new URL(
        "v1/storage/presign/get",
        ENV.forgeApiUrl.replace(/\/+$/, "") + "/"
      );
      forgeUrl.searchParams.set("path", key);
      const forgeResp = await fetch(forgeUrl, {
        headers: { Authorization: `Bearer ${ENV.forgeApiKey}` }
      });
      if (!forgeResp.ok) {
        const body = await forgeResp.text().catch(() => "");
        console.error(`[StorageProxy] forge error: ${forgeResp.status} ${body}`);
        res.status(502).send("Storage backend error");
        return;
      }
      const { url } = await forgeResp.json();
      if (!url) {
        res.status(502).send("Empty signed URL from backend");
        return;
      }
      res.set("Cache-Control", "no-store");
      res.redirect(307, url);
    } catch (err) {
      console.error("[StorageProxy] failed:", err);
      res.status(502).send("Storage proxy error");
    }
  });
}

// server/routers.ts
import { z as z2 } from "zod";

// shared/admissionEnquiry.ts
function buildAdmissionEnquirySheetPayload(input) {
  return {
    type: "admission_enquiry",
    applicant_name: input.applicantName,
    phone: input.phone,
    email: input.email || "",
    trade: input.trade,
    qualification: input.qualification || "",
    message: input.message || ""
  };
}

// server/_core/systemRouter.ts
import { z } from "zod";

// server/_core/notification.ts
import { TRPCError } from "@trpc/server";
var TITLE_MAX_LENGTH = 1200;
var CONTENT_MAX_LENGTH = 2e4;
var trimValue = (value) => value.trim();
var isNonEmptyString2 = (value) => typeof value === "string" && value.trim().length > 0;
var buildEndpointUrl = (baseUrl) => {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(
    "webdevtoken.v1.WebDevService/SendNotification",
    normalizedBase
  ).toString();
};
var validatePayload = (input) => {
  if (!isNonEmptyString2(input.title)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title is required."
    });
  }
  if (!isNonEmptyString2(input.content)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification content is required."
    });
  }
  const title = trimValue(input.title);
  const content = trimValue(input.content);
  if (title.length > TITLE_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`
    });
  }
  if (content.length > CONTENT_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`
    });
  }
  return { title, content };
};
async function notifyOwner(payload) {
  const { title, content } = validatePayload(payload);
  if (!ENV.forgeApiUrl) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service URL is not configured."
    });
  }
  if (!ENV.forgeApiKey) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service API key is not configured."
    });
  }
  const endpoint = buildEndpointUrl(ENV.forgeApiUrl);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1"
      },
      body: JSON.stringify({ title, content })
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Notification] Failed to notify owner (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
      );
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[Notification] Error calling notification service:", error);
    return false;
  }
}

// server/_core/trpc.ts
import { initTRPC, TRPCError as TRPCError2 } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError2({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError2({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);

// server/_core/systemRouter.ts
var systemRouter = router({
  health: publicProcedure.input(
    z.object({
      timestamp: z.number().min(0, "timestamp cannot be negative")
    })
  ).query(() => ({
    ok: true
  })),
  notifyOwner: adminProcedure.input(
    z.object({
      title: z.string().min(1, "title is required"),
      content: z.string().min(1, "content is required")
    })
  ).mutation(async ({ input }) => {
    const delivered = await notifyOwner(input);
    return {
      success: delivered
    };
  })
});

// server/routers.ts
init_googleSheets();
var tradeSchema = z2.enum(["Fitter", "Electrician"]);
var appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true };
    })
  }),
  portal: router({
    notices: publicProcedure.query(async () => getNotices()),
    studentRoster: publicProcedure.input(z2.object({ session: z2.string().min(1), trade: tradeSchema })).query(async ({ input }) => {
      const sheetName = normalizeSessionTrade(input.session, input.trade);
      return { sheetName, rows: await getSheetData(sheetName) };
    }),
    sheetData: publicProcedure.input(z2.object({ sheetName: z2.string().min(1) })).query(async ({ input }) => getSheetData(input.sheetName)),
    studentLogin: publicProcedure.input(z2.object({ session: z2.string().min(1), trade: tradeSchema, roll: z2.string().min(1) })).query(async ({ input }) => studentLogin(input.session, input.trade, input.roll)),
    staffLogin: publicProcedure.input(z2.object({ username: z2.string().min(1), password: z2.string().min(1) })).mutation(async ({ input }) => staffLogin(input.username, input.password)),
    staffList: publicProcedure.query(async () => {
      const { getStaffList: getStaffList2 } = await Promise.resolve().then(() => (init_googleSheets(), googleSheets_exports));
      return getStaffList2();
    }),
    feeLookup: publicProcedure.input(z2.object({ registrationNo: z2.string().optional(), name: z2.string().optional(), session: z2.string().optional(), trade: tradeSchema.optional() })).query(async ({ input }) => feeLookup(input)),
    admissionEnquiry: publicProcedure.input(z2.object({
      applicantName: z2.string().trim().min(2).max(160),
      phone: z2.string().trim().min(7).max(32),
      email: z2.string().trim().email().max(320).optional().or(z2.literal("")),
      trade: tradeSchema,
      qualification: z2.string().trim().max(120).optional(),
      message: z2.string().trim().max(2e3).optional()
    })).mutation(async ({ input }) => {
      const sheetResult = await writePortalData(buildAdmissionEnquirySheetPayload(input));
      if (String(sheetResult?.status || "").toLowerCase() === "error") throw new Error(sheetResult.message || "Admission enquiry could not be saved to Google Sheets.");
      const result = await createAdmissionEnquiry({
        applicantName: input.applicantName,
        phone: input.phone,
        email: input.email || null,
        trade: input.trade,
        qualification: input.qualification || null,
        message: input.message || null
      });
      await createAuditLog({ actor: input.applicantName, actorRole: "public", action: "admission_enquiry_created", entity: String(result.id), details: `${input.trade} enquiry submitted to Google Sheets` });
      return { ...result, sheetSaved: true };
    }),
    auditLogs: publicProcedure.input(z2.object({ limit: z2.number().int().min(1).max(200).optional() }).optional()).query(async ({ input }) => getRecentAuditLogs(input?.limit ?? 100)),
    auditEvent: publicProcedure.input(z2.object({ actor: z2.string().min(1), actorRole: z2.string().min(1), action: z2.string().min(1), entity: z2.string().optional(), details: z2.string().optional() })).mutation(async ({ input }) => createAuditLog(input)),
    write: publicProcedure.input(z2.object({
      type: z2.string().min(1),
      entries: z2.array(z2.array(z2.union([z2.string(), z2.number(), z2.null()]))).optional(),
      username: z2.string().optional(),
      password: z2.string().optional(),
      name: z2.string().optional(),
      trade: tradeSchema.optional(),
      unit: z2.string().optional(),
      title: z2.string().optional(),
      content: z2.string().optional(),
      staff_username: z2.string().optional(),
      actor_role: z2.string().optional(),
      registration_no: z2.string().optional(),
      student_name: z2.string().optional(),
      session: z2.string().optional(),
      admission_fee: z2.number().optional(),
      payment_amount: z2.number().optional(),
      payment_mode: z2.string().optional(),
      mediator: z2.string().optional(),
      mediator_paid: z2.number().optional(),
      remarks: z2.string().optional()
    })).mutation(async ({ input }) => {
      const result = await writePortalData(input);
      await createAuditLog({ actor: input.username || input.staff_username || input.student_name || "portal-user", actorRole: input.actor_role || "portal", action: input.type, entity: input.registration_no || input.staff_username || input.student_name, details: input.type === "record_fee_payment" || input.type === "fee_payment" ? "Fee payment workflow action" : "Portal write action" });
      return result;
    })
  })
});

// server/_core/context.ts
async function createContext(opts) {
  let user = null;
  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    user = null;
  }
  return {
    req: opts.req,
    res: opts.res,
    user
  };
}

// server/_core/vite.ts
import express from "express";
import fs2 from "fs";
import { nanoid } from "nanoid";
import path2 from "path";
import { createServer as createViteServer } from "vite";

// vite.config.ts
import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "vite";
import { vitePluginManusRuntime } from "vite-plugin-manus-runtime";
var PROJECT_ROOT = import.meta.dirname;
var LOG_DIR = path.join(PROJECT_ROOT, ".manus-logs");
var MAX_LOG_SIZE_BYTES = 1 * 1024 * 1024;
var TRIM_TARGET_BYTES = Math.floor(MAX_LOG_SIZE_BYTES * 0.6);
function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}
function trimLogFile(logPath, maxSize) {
  try {
    if (!fs.existsSync(logPath) || fs.statSync(logPath).size <= maxSize) {
      return;
    }
    const lines = fs.readFileSync(logPath, "utf-8").split("\n");
    const keptLines = [];
    let keptBytes = 0;
    const targetSize = TRIM_TARGET_BYTES;
    for (let i = lines.length - 1; i >= 0; i--) {
      const lineBytes = Buffer.byteLength(`${lines[i]}
`, "utf-8");
      if (keptBytes + lineBytes > targetSize) break;
      keptLines.unshift(lines[i]);
      keptBytes += lineBytes;
    }
    fs.writeFileSync(logPath, keptLines.join("\n"), "utf-8");
  } catch {
  }
}
function writeToLogFile(source, entries) {
  if (entries.length === 0) return;
  ensureLogDir();
  const logPath = path.join(LOG_DIR, `${source}.log`);
  const lines = entries.map((entry) => {
    const ts = (/* @__PURE__ */ new Date()).toISOString();
    return `[${ts}] ${JSON.stringify(entry)}`;
  });
  fs.appendFileSync(logPath, `${lines.join("\n")}
`, "utf-8");
  trimLogFile(logPath, MAX_LOG_SIZE_BYTES);
}
function vitePluginManusDebugCollector() {
  return {
    name: "manus-debug-collector",
    transformIndexHtml(html) {
      if (process.env.NODE_ENV === "production") {
        return html;
      }
      return {
        html,
        tags: [
          {
            tag: "script",
            attrs: {
              src: "/__manus__/debug-collector.js",
              defer: true
            },
            injectTo: "head"
          }
        ]
      };
    },
    configureServer(server) {
      server.middlewares.use("/__manus__/logs", (req, res, next) => {
        if (req.method !== "POST") {
          return next();
        }
        const handlePayload = (payload) => {
          if (payload.consoleLogs?.length > 0) {
            writeToLogFile("browserConsole", payload.consoleLogs);
          }
          if (payload.networkRequests?.length > 0) {
            writeToLogFile("networkRequests", payload.networkRequests);
          }
          if (payload.sessionEvents?.length > 0) {
            writeToLogFile("sessionReplay", payload.sessionEvents);
          }
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true }));
        };
        const reqBody = req.body;
        if (reqBody && typeof reqBody === "object") {
          try {
            handlePayload(reqBody);
          } catch (e) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: String(e) }));
          }
          return;
        }
        let body = "";
        req.on("data", (chunk) => {
          body += chunk.toString();
        });
        req.on("end", () => {
          try {
            const payload = JSON.parse(body);
            handlePayload(payload);
          } catch (e) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: String(e) }));
          }
        });
      });
    }
  };
}
var plugins = [react(), tailwindcss(), jsxLocPlugin(), vitePluginManusRuntime(), vitePluginManusDebugCollector()];
var vite_config_default = defineConfig({
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  publicDir: path.resolve(import.meta.dirname, "client", "public"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    host: true,
    // The managed preview serves the app through a reverse proxy that does not expose
    // Vite's localhost HMR socket reliably. Disable HMR to prevent the browser from
    // attempting the broken localhost:5173 WebSocket; page reloads remain available.
    hmr: false,
    allowedHosts: [
      ".manuspre.computer",
      ".manus.computer",
      ".manus-asia.computer",
      ".manuscomputer.ai",
      ".manusvm.computer",
      "localhost",
      "127.0.0.1"
    ],
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/_core/vite.ts
async function setupVite(app, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    server: serverOptions,
    appType: "custom"
  });
  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );
      let template = await fs2.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app) {
  const distPath = process.env.NODE_ENV === "development" ? path2.resolve(import.meta.dirname, "../..", "dist", "public") : path2.resolve(import.meta.dirname, "public");
  if (!fs2.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app.use(express.static(distPath));
  app.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/_core/index.ts
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}
async function findAvailablePort(startPort = 3e3) {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}
async function startServer() {
  const app = express2();
  const server = createServer(app);
  app.use(express2.json({ limit: "50mb" }));
  app.use(express2.urlencoded({ limit: "50mb", extended: true }));
  registerStorageProxy(app);
  registerOAuthRoutes(app);
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext
    })
  );
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);
  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }
  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}
startServer().catch(console.error);
