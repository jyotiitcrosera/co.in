const base = process.argv[2];
const payload = { type: "repair_fee_payment_history", registration_no: "1", session: "2025-27", trade: "Fitter", invoice_no: "JYOTI-20260819-0001", payment_timestamp: "2026-08-19T05:13:25.620Z", payment_amount: 10000 };
const response = await fetch(base, { method: "POST", redirect: "follow", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload), signal: AbortSignal.timeout(60000) });
const text = await response.text();
console.log(JSON.stringify({ status: response.status, contentType: response.headers.get("content-type"), body: text.slice(0, 5000) }, null, 2));
