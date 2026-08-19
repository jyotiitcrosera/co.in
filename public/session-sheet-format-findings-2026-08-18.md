# Session-sheet format findings — 2026-08-18

The live `2025-27FITTER` sheet currently returns only four columns: `ROLL NO`, `NAME`, `TRADE`, and `UNIT`. Representative rows include roll numbers 1–21, student names, Fitter trade, and units 1 or 2.

The live `2026-28FITTER` sheet also currently returns only four columns: `ROLL NO`, `NAME`, `TRADE`, and `UNIT`. Its representative data contains one row: roll 1, RAM, FITTER, unit 1.

Conclusion so far: mobile, admission fee, paid amount, balance, mediator, and payment-history columns do not yet exist in these two live session sheets. The replacement backend must add compatible columns without changing the existing first four columns or their order.


The live `2025-27ELECTRICIAN` sheet also uses exactly four columns: `ROLL NO`, `NAME`, `TRADE`, and `UNIT`, with representative rows through roll 40 and units 1 and 2. No fee, mobile, mediator, or history columns exist.

The requested `2027-29FITTER` tab does not currently exist in the live workbook; the endpoint returned `{"status":"error","message":"Sheet not found: 2027-29FITTER"}`. Therefore, future session tabs must be created with the same four roster columns first, after which the replacement Code.gs can append the fee columns automatically.

Verified minimum existing format for available session sheets: Column A `ROLL NO`, Column B `NAME`, Column C `TRADE`, Column D `UNIT`. Do not insert fee fields before these four columns.
