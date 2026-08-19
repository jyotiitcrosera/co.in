# Live marks-sheet contract findings — 2026-08-16

## Quarterly Marks
Headers are `DATE, ROLL, NAME, TRADE, QUARTERLY NO, PRACTICAL 50, THEORY 20, WCS 10, DRAWING 20, TOTAL`.
The live matrix has no Session or Unit columns. Trade may be combined, such as `2025-27FITTER`, or plain, such as `Fitter`. Period values may be `Q1` or `Quarter 1`. Actual score components and Total are present.

## Job Evolution
Headers are `ROLL NO, NAME, TRADE, UNIT, WEEK NO, A (10), B(15), C(7), D(8), E(10), TOTAL`.
The live matrix has a Unit column but no Session column. Trade may be combined, such as `2025-27FITTER`. Actual Week, A-E components, and Total values are present.

## Shared implication
Session and selected roster membership must be authoritative for Monthly/Quarterly. Job Evolution must match the selected roster by roll, filter Unit and Week, and accept combined Session+Trade. Period labels must normalize `Q1`/`Quarter 1` consistently. All three reports contain real score values in the live backend; roster-only output is caused by application-side matching.
