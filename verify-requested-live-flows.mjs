import { readFile } from "node:fs/promises";
const base = process.env.GOOGLE_SHEETS_API_URL;
if (!base) throw new Error("GOOGLE_SHEETS_API_URL is not configured");
const get = async (url) => { const started = Date.now(); const r = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(60_000) }); const text = await r.text(); let json; try { json = JSON.parse(text); } catch {} return { status: r.status, ms: Date.now() - started, contentType: r.headers.get("content-type"), json }; };
const fee = await get(`${base}?action=get_fee_student&registration_no=1&session=2025-27&trade=Fitter`);
const roster = await get(`${base}?action=get_sheet_data&sheet_name=2025-27FITTER`);
const portal = await readFile("client/src/pages/Portal.tsx", "utf8");
const records = await readFile("client/src/components/AdminRecords.tsx", "utf8");
const bridge = await readFile("server/googleSheets.ts", "utf8");
const rows = Array.isArray(roster.json) ? roster.json : roster.json?.rows || [];
const header = rows[0] || [];
const firstStudent = rows.find((row) => String(row?.[0] ?? "") === "1");
console.log(JSON.stringify({
  fee: { status: fee.status, ms: fee.ms, contentType: fee.contentType, student: fee.json?.student, totals: fee.json?.totals, paymentCount: fee.json?.payments?.length, receiptHistoryAvailable: Array.isArray(fee.json?.payments) },
  roster: { status: roster.status, ms: roster.ms, contentType: roster.contentType, mobileHeaderIndex: header.findIndex((h) => String(h).toLowerCase().replace(/[^a-z]/g, "").includes("mobile")), firstStudentMobile: firstStudent?.[header.findIndex((h) => String(h).toLowerCase().replace(/[^a-z]/g, "").includes("mobile"))] },
  contracts: { receiptPrint: portal.includes("printFeeReceipt(result, receiptWindow)"), fullPaidGuard: portal.includes("already Fully Paid"), selectedRowMobileFallback: portal.includes("row.mobile || row.data?.student?.mobile"), marks405Reconciliation: bridge.includes("verify") && bridge.includes("405") || bridge.includes("reconcile") , reportBackgroundRefresh: records.includes("invalidate") || records.includes("background") }
}, null, 2));
