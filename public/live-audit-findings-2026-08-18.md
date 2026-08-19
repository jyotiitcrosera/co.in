# Live Google Sheets audit findings — 2026-08-18

Source endpoint: `https://script.google.com/macros/s/AKfycbwwlPYXS2UmhxoBradM9XJHpq2SXrWYeG85Q8ejyKecfXH-DhyhVX_r8Cg3UgcD0F23Gg/exec?action=get_sheet_data&sheet_name=MONTHLY%20MARKS`

The live endpoint returned a JSON matrix successfully. The header row contains `DATE`, `ROLL`, `NAME`, `SESSION`, `TRADE`, `UNIT`, `YEAR`, `MONTH NAME`, `PRACTICAL 50`, `THEORY 20`, `WCS 10`, `DRAWING 20`, and `TOTAL`. The response includes actual marks and totals, for example rows with Practical 50, Theory 20, WCS 10, Drawing 20, Total 100; and non-perfect rows such as 20/20/10/20/70 and 45/13/8/20/86.

The live workbook also contains legacy rows where Session, Unit, and Year are blank, while newer rows contain values such as Session `2025-27`, Trade `Fitter`, Unit `2`, Year `1st Year`, and actual marks. This confirms that the report fallback must use selected roster scope for legacy blank metadata while still rendering the full marks columns. The current AdminRecords table renders report headers and every row cell, and the normalization/filtering path includes a roster-authoritative fallback for these legacy rows.

The live response demonstrates that the backend is returning actual marks, not only roster names. Remaining live verification should cover ATTENDANCE and Fee Ledger with the same endpoint and should confirm that the user’s current deployed Apps Script supports writes for each action.

## Attendance endpoint

The live ATTENDANCE response also returned a complete matrix successfully. Headers are `DATE`, `ROLL`, `NAME`, `TRADE`, `UNIT`, and `STATUS`; the `TRADE` column contains combined session-trade values such as `2025-27ELECTRICIAN` and `2026-28FITTER`, and STATUS contains actual `P` and `A` values. The live data includes multiple dates, units, and sessions, confirming that attendance reports can display actual Present/Absent data when filtered by the selected roster scope. The current report table renders every returned header and cell, while the attendance summary derives Present, Absent, and percentage from the filtered rows.

## Fee Ledger endpoint

The live `get_fee_student` response for registration `TEST-001`, Session `2025-27`, Trade `Fitter` returned a student record, three payment rows, and cumulative totals. The response returned admission fee 10000, paid 10000, balance 0, mediatorPaid 2000, and status FULLY PAID. Payment rows preserve Session and Trade, and mediator fields are present in the backend response for records but remain excluded from printed receipt logic in the portal. This confirms the live fee lookup contract returns full payment history and cumulative totals.

## Live POST audit

An approved non-mutating POST audit was attempted with an intentionally unsupported write type. The Apps Script URL returned HTTP 302 with a `script.googleusercontent.com` location. Re-posting the same body to that redirect returned a Google Drive “Sorry, unable to open the file at present” HTML page rather than structured JSON. No valid write payload was submitted and no Sheet row was created by this audit. The app’s server bridge already uses manual redirect handling and preserves POST bodies; the live redirect target itself remains unsuitable for direct POST verification in this environment. Existing adapter tests cover redirect-preserved POST behavior and reject HTTP failures instead of treating them as saved.

## New deployment probe

The newly supplied deployment URL is reachable. A root request without an action returns the structured JSON error `{"status":"error","message":"Invalid Action"}`, which is expected for this API. The live request `action=get_sheet_data&sheet_name=2026-28FITTER` returned `[ ["ROLL NO","NAME","TRADE","UNIT"], ["1","RAM","FITTER","1"] ]`, confirming the new deployment can read the session-trade roster.

## New deployment report probes

The new deployment returned actual Monthly Marks data with headers `PRACTICAL 50`, `THEORY 20`, `WCS 10`, `DRAWING 20`, and `TOTAL`, including populated values such as 50, 20, 10, 20, and 100. It also returned Attendance rows with `DATE`, `ROLL`, `NAME`, `TRADE`, `UNIT`, and `STATUS`, including both `P` and `A` values for session-trade records such as `2026-28FITTER` and `2025-27FITTER`.

## New deployment Fee Ledger probe

The new deployment returned a valid session/trade-filtered Fee Ledger response for `TEST-001`, `2025-27`, `Fitter`. It returned two cumulative payment rows, admission fee 10000, paid 10000, balance 0, mediator-paid total 2000, and `FULLY PAID` status. Mediator fields remain present in the backend response for records, while receipt privacy remains a frontend concern.


## New deployment 2030-32 session-sheet probe

The new deployment successfully returned `2030-32FITTER`. Its headers are `ROLL NO`, `NAME`, `TRADE`, `UNIT`, `Mobile No`, `Admission Fee`, `Paid Amount`, `Balance`, `Mediator Name`, and `Mediator Paid`. The session roster currently has no populated student row in the response, but the fee columns are present and correctly positioned after the original roster columns.


## New deployment Fee Ledger checks

A 2030-32 Fitter lookup for registration `1` returned a structured empty result with `UNPAID` totals because the 2030-32 sheet currently has headers but no populated student row. This is expected and confirms no false student match.

A lookup for the earlier known test registration `TEST-001` with `2025-27` and `Fitter` also returned a structured empty result on the new deployment, indicating that this new Code.gs deployment is reading its workbook but does not contain that test record in the selected session sheet. No write was performed.


## 2025-27 Fitter live session-sheet check

A direct read of the newly deployed `2025-27FITTER` tab returned populated students with the original A-D roster columns and appended fee fields. It also exposed one compatibility issue: the header row contains a duplicate `Paid Amount` because the deployed helper matched `PAID` too narrowly and appended another `Paid Amount` column instead of recognizing the existing `PAIDAMOUNT` header. The replacement source must add `PAIDAMOUNT` as an exact alias before the next deployment; existing values remain blank and no payment write was performed.


## Corrected deployment 2025-27 Fitter probe

The corrected deployment returns exactly one `Paid Amount` header for `2025-27FITTER`. The full header row is now `ROLL NO`, `NAME`, `TRADE`, `UNIT`, `Mobile No`, `Admission Fee`, `Paid Amount`, `Balance`, `Mediator Name`, `Mediator Paid`, `Payment History`, and `Payment Status`, with populated roster rows and blank fee values ready for payment entry. The duplicate header issue is fixed in the new deployment; no payment write was performed.


## Post-cleanup verification

After the user removed the duplicate column, `2025-27FITTER` returns exactly one `Paid Amount` plus `Payment History` and `Payment Status`, with all roster rows present. A browser Fee Lookup request for roll `1`, session `2025-27`, trade `Fitter` redirected to a Google Drive error page in this environment instead of returning JSON. The sheet GET remains healthy; no payment write was attempted.


## Final deployment verification — 2026-08-19

The user supplied the final deployment URL. `get_sheet_data` for `2025-27FITTER` returned the populated roster with exactly one `Paid Amount` header and the expected `Balance`, `Payment History`, and `Payment Status` columns. Roll `1` is NITISH KUMAR with mobile `7479511134`, admission fee `30000`, balance `30000`, mediator record `NIKET SINGH`, and status `UNPAID`.

The final deployment's `get_fee_student` action now returns valid JSON for registration `1`, session `2025-27`, trade `Fitter`: student NITISH KUMAR, sheet `2025-27FITTER`, row 2, admission fee `30000`, paid `0`, balance `30000`, payment history empty, mediator paid `0`, status `UNPAID`. Direct Fee Lookup is repaired. No payment write has been submitted.


## Confirmed live payment write — 2026-08-19

With the user's explicit confirmation, one payment of ₹2,000 was submitted for Roll/Registration `1`, NITISH KUMAR, session `2025-27`, trade `Fitter`. The Apps Script returned an invoice `JYOTI-20260819-0001` and a timestamped payment at `2026-08-19T02:40:24.283Z`. A subsequent Fee Lookup returned exactly one history entry, admission fee `30000`, paid `2000`, balance `28000`, status `PARTIALLY PAID`, and mediator-paid total `0`. The portal bridge live test passed after explicit GET redirect handling was added. No duplicate payment was submitted.


## Cross-module fetch stability probe — 2026-08-19

Using the final deployment, the session roster returned populated data in approximately 7.5 seconds and Monthly Marks returned in approximately 4.1 seconds. Quarterly Marks returned in approximately 71.5 seconds, which exceeds the previous 12-second bridge timeout but succeeds under the hardened 45-second retry policy only after a retry. Job Evolution returned HTTP 404 after retries; a direct browser request reached the Google Drive error page. Notices and staff list returned valid JSON. Fee Lookup can return valid JSON but is intermittent when the redirected Googleusercontent response is stale. This indicates both a bridge timeout issue and a final-deployment/backend sheet mapping issue for Job Evolution.


## Latest final deployment direct verification — 2026-08-19

The user's latest Apps Script deployment returned HTTP 200 JSON for every direct action tested. `2025-27FITTER` returned one `Paid Amount` header and NITISH KUMAR roll 1 with paid 2000 and balance 28000. `JOB EVOLUTION` returned actual rows with the expected 13-column matrix, including `ROLL NO`, `NAME`, `SESSION`, `TRADE`, `UNIT`, `YEAR`, `WEEK NO`, A-E marks, and `TOTAL`. Monthly Marks, Quarterly Marks, Attendance, Notices, Staff, and Fee Lookup all returned valid JSON. Quarterly Marks was the slowest direct read at approximately 18.8 seconds; the portal bridge passed all modules in approximately 5.3 seconds on the final probe. Deterministic tests, TypeScript validation, and production build also passed.
