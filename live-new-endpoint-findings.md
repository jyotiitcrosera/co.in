# New Apps Script endpoint live findings — 2026-08-16

The new endpoint responds successfully and `get_notices` returns JSON notices.

`MONTHLY MARKS` now returns the intended 13 headers: `DATE, ROLL, NAME, SESSION, TRADE, UNIT, YEAR, MONTH NAME, PRACTICAL 50, THEORY 20, WCS 10, DRAWING 20, TOTAL`.

However, the existing rows are not fully migrated: `SESSION`, `UNIT`, and `YEAR` are blank in the returned rows, while some old Trade cells still contain combined values such as `2026-28ELECTRICIAN` and `2025-27FITTER`. Newer rows contain plain Trade values. Scores and Total are present.

The deployed endpoint is therefore using the new header shape, but historical data backfill is still required before Year/Session/Unit-specific filtering can return complete results for old rows.


`QUARTERLY MARKS` now returns 13 headers including SESSION, TRADE, UNIT, YEAR, and QUARTERLY NO. Existing rows have blank SESSION, UNIT, and YEAR; older rows use combined Trade values such as `2026-28ELECTRICIAN` and `2025-27FITTER`. Quarter labels are mixed between `Q1` and `Quarter 1`. Scores and Total are present.

`JOB EVOLUTION` now returns 13 headers including SESSION, TRADE, UNIT, YEAR, WEEK NO, A-E, and TOTAL. Existing rows have blank SESSION and YEAR; Trade still contains combined values such as `2026-28ELECTRICIAN`, and Unit is populated. Week and A-E/Total values are present.

The new deployment has the correct header widths and read contract, but historical rows require Session/Unit/Year backfill and normalized Quarterly labels before Year-aware filtering can work completely. No uncontrolled write was sent during verification.


A non-mutating POST probe (`monthly_marks` with an empty entries array) was sent to the new endpoint. The endpoint returned a Google redirect and the preserved-POST follow-up ended with HTTP 405 `Method Not Allowed` at the googleusercontent target. No production row was inserted. This means GET/read is working, but the deployed write path is not currently verifiable or usable from the portal until the Apps Script web-app deployment exposes `doPost` correctly. The user should redeploy the latest Code.gs as a Web app with the intended access setting and provide the resulting `/exec` URL; then write verification can be repeated safely.
