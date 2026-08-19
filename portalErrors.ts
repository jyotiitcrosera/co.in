export function friendlyPortalError(error: unknown, fallback: string) {
  const message = error instanceof Error ? error.message : String(error || "");
  if (/Google Sheets backend returned 405/i.test(message) || /Method Not Allowed/i.test(message)) {
    return "Google Sheets write service is unavailable (HTTP 405). Existing Sheet data is safe; redeploy the Apps Script Web app with doPost enabled before saving new records.";
  }
  if (/Google Sheets backend returned 5\d\d/i.test(message)) {
    return "Google Sheets backend is temporarily unavailable. Existing Sheet data is safe; please try again shortly.";
  }
  return message || fallback;
}
