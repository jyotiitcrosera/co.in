const base = process.argv[2];
const probes = [
  ["roster", `${base}?action=get_sheet_data&sheet_name=2025-27FITTER`],
  ["fee", `${base}?action=get_fee_student&registration_no=1&session=2025-27&trade=Fitter`],
  ["jobEvolution", `${base}?action=get_sheet_data&sheet_name=JOB%20EVOLUTION`],
  ["monthly", `${base}?action=get_sheet_data&sheet_name=MONTHLY%20MARKS`],
  ["quarterly", `${base}?action=get_sheet_data&sheet_name=QUARTERLY%20MARKS`],
  ["attendance", `${base}?action=get_sheet_data&sheet_name=ATTENDANCE`],
  ["staff", `${base}?action=get_sheet_data&sheet_name=STAFF`],
  ["notices", `${base}?action=get_sheet_data&sheet_name=NOTICE%20BOARD`],
];
const read = async ([name, url]) => {
  const started = Date.now();
  try {
    const response = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(60000) });
    const text = await response.text();
    let parsed = null;
    try { parsed = JSON.parse(text); } catch {}
    return { name, status: response.status, ms: Date.now() - started, contentType: response.headers.get("content-type"), json: Boolean(parsed), summary: parsed ? (Array.isArray(parsed.rows) ? `rows=${parsed.rows.length}` : Object.keys(parsed).slice(0, 8).join(",")) : text.slice(0, 120) };
  } catch (error) { return { name, status: "ERR", ms: Date.now() - started, error: String(error.message || error) }; }
};
console.log(JSON.stringify(await Promise.all(probes.map(read)), null, 2));
