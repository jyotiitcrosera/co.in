# Live Monthly Marks contract findings — 2026-08-16

The live `MONTHLY MARKS` endpoint returns a raw matrix with headers:
`DATE, ROLL, NAME, TRADE, MONTH NAME, PRACTICAL 49, THEORY 19, WCS 09, DRAWING 19, TOTAL`.

For August, rows use plain Trade values such as `Electrician` and `Fitter`, not combined Session+Trade. They contain actual component marks and Total values. The August Electrician rows have rolls 21 through 40 and include values such as Practical 50, Theory 20, WCS 10, Drawing 20, Total 100.

The sheet has no Session or Unit columns. Session and Unit must therefore come from the authoritative selected roster, while the report sheet is filtered by Trade, Month, and roster roll set. The current report flow already clears Session/Unit before sheet filtering and joins by roster rolls; regression coverage must lock this live shape.
