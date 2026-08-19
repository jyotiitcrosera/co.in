const base = process.argv[2];
const payload = { type: "repair_fee_payment_history", registration_no: "1", session: "2025-27", trade: "Fitter", invoice_no: "NON_MATCHING_PROBE", payment_timestamp: "2099-01-01T00:00:00.000Z", payment_amount: 1 };
const response = await fetch(base, { method: "POST", redirect: "follow", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload), signal: AbortSignal.timeout(60000) });
const text = await response.text();
console.log(JSON.stringify({ status: response.status, contentType: response.headers.get("content-type"), body: text.slice(0, 2000) }, null, 2));
