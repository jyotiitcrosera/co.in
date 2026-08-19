# Organized Marks Sheet Schema

The three marks sheets should use explicit identity and academic dimensions so the workbook remains readable and reports do not depend only on roster joins.

## Monthly Marks

Use this header order:

`DATE | ROLL | NAME | SESSION | TRADE | UNIT | YEAR | MONTH NAME | PRACTICAL 50 | THEORY 20 | WCS 10 | DRAWING 20 | TOTAL`

## Quarterly Marks

Use this header order:

`DATE | ROLL | NAME | SESSION | TRADE | UNIT | YEAR | QUARTERLY NO | PRACTICAL 50 | THEORY 20 | WCS 10 | DRAWING 20 | TOTAL`

The `QUARTERLY NO` values must be `Quarterly 1` through `Quarterly 12`. Do not use month names in this sheet.

## Job Evolution

Use this header order:

`ROLL NO | NAME | SESSION | TRADE | UNIT | YEAR | WEEK NO | A (10) | B (15) | C (7) | D (8) | E (10) | TOTAL`

The `YEAR` values must be exactly `1st Year` or `2nd Year`. `SESSION` must contain values such as `2025-27`, `TRADE` values such as `Fitter` or `Electrician`, and `UNIT` values such as `1` or `2`.

## Existing data migration

Insert the new `SESSION`, `UNIT`, and `YEAR` columns before the period and score columns. Do not merely rename an existing score column. Every existing row should be backfilled with its correct session, trade, unit, and year before using the new report filters.

## Apps Script requirement

The portal’s bridge sends `entries` as positional arrays in the exact orders above. The deployed Code.gs must append the received `entries` to the named sheet without rewriting or dropping fields. If Code.gs currently uses fixed old indexes or a hard-coded six/ten-column mapping, update it to use the new header order or a header-name map. Its read action must return the complete first header row followed by complete data rows, including SESSION, TRADE, UNIT, YEAR, period, all score components, and TOTAL.

No frontend-only change can create missing columns in the live Google Sheet. The sheet headers and the deployed Apps Script write/read mapping must be updated first, then the portal can write and filter the new records correctly.

## Findings from the supplied legacy Code.gs

The supplied source requires three changes before redeployment. First, `SpreadsheetApp.penById` is a typo and must be `SpreadsheetApp.openById`. Second, the `doPost` handlers currently accept 10 columns for Monthly and Quarterly and 11 for Job Evolution; the organized schema requires 13 columns for each marks sheet. Third, the live workbook must have the new headers before the corrected append widths are deployed.

The remaining read actions use `getDataRange().getDisplayValues()` and therefore preserve complete header rows and data rows automatically. The existing fee, notice, staff, attendance, login, and enquiry actions do not need to change for this marks-schema update.
