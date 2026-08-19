# Live verification notes

- Admin fee lookup for TEST-001 loaded TEST STUDENT with admission ₹10000, paid ₹10000, balance ₹0, mediator paid ₹1000.
- After the lookup enhancement, the UI shows “Latest receipt is ready to print” and a “Print receipt” button for invoice JYOTI-20260815-0002.
- Captured receipt print HTML was non-empty and contained FULLY PAID RECEIPT, TEST STUDENT, invoice JYOTI-20260815-0002, and Mediator paid.
- Live Admin progress-card lookup for session 2026-28, Electrician, roll 1 loaded ANKIT with 2 attendance and 2 monthly records. Captured progress-card HTML was non-empty and contained ANKIT, Electrician, Attendance history, and Monthly Assessment.
- Live staff record lookup loaded NIKET PRASAD SINGH, Fitter, Unit 1. Captured certificate HTML was non-empty and contained the staff name, Fitter, and Experience Certificate.
- Admin Attendance report filter with roll 1 and session 2026-28 completed but returned “No rows match the selected filters.” This needs diagnosis against the live sheet headers/values before marking report verification complete.

- After the field-aware filtering fix, the live Admin Attendance report with roll 1 and session 2026-28 returned 5 matching rows, including two ANKIT Electrician 2026-28 rows and three additional matching roll/session rows present in the live sheet.

- With no manual report click, entering roll 1 triggered automatic Attendance loading and returned 16 live rows.
- Switching the report type to MONTHLY MARKS automatically reloaded 6 live rows for roll 1.
- Switching to QUARTERLY MARKS automatically reloaded 5 live rows for roll 1.
- Switching to JOB EVOLUTION automatically reloaded 4 live rows for roll 1.
- The shared print capture checks and report auto-fetch checks were completed in the Admin browser session without creating further payment writes.

- A live Attendance report with roll 1 and trade Electrician auto-fetched 4 rows.
- Adding unit 2 to that report narrowed it to the same 4 matching live rows, each showing unit 2; this verified a combined roll+trade+unit filter.
- The Admin staff list displayed live staff records and assigned units after loading.
- The deployed login integration suite passed both staff-login and student-dashboard contract tests when RUN_LIVE_INTEGRATION=1 was enabled.
- Deterministic tests now cover attendance cap/unit enforcement and cross-role workspace access.

- Fitter roll 1 (RAM) loaded successfully from the live 2026-28 Fitter roster. Directly captured print HTML was 1,593 characters and contained RAM, Fitter, Attendance history, and Monthly Assessment content; the print document was non-blank.
- The earlier Electrician progress-card and staff certificate captures were also populated; the fee receipt capture contained the expected invoice/payment content.

- After extending the auto-fetch effect to include all filter fields, live Monthly Marks with roll 1, Electrician, and January returned 2 rows (ANKIT and RAM).
- Live Quarterly Marks with roll 1, Electrician, and Q1 returned 1 row (ANKIT).
- Live Job Evolution with roll 1, Electrician, Unit 2, and Week 1 returned 1 row (ANKIT).
- Live Attendance trade/unit/date checks had already returned matching rows; the complete filter set is now covered by live reads plus deterministic tests.

- Independent live filter checks after the dependency fix passed: Attendance date 2026-03-12 returned 1 row and excluded 2026-03-13; Attendance Unit 2 returned 1 row; Monthly Marks January returned 1 row; Quarterly Marks Q1 returned 1 row; Job Evolution Week 1 returned 1 row. Earlier combined checks covered roll/trade/unit/date and all four sheet types.

- The temporary REGRESSION-20260815 staff account was created successfully, assigned Unit 1 successfully, and is no longer present in the live STAFF sheet after cleanup verification. No persistent temporary staff record remains.

- Final release checks passed: 9 deterministic test files passed, 25 tests passed, and 4 opt-in live suites remained skipped (Google Sheets integration, fee live mutation, and role-login live integration). The production Vite and server build completed successfully; only the standard client chunk-size warning was emitted.

- Live Staff regression succeeded: NIKET authenticated, Unit 1 loaded one Fitter student (RAM), and the 2026-08-15 attendance submission returned a successful ATTENDANCE write with rowsAdded: 1.
- Live Admin notice regression succeeded: the clearly labeled REGRESSION NOTICE 2026-08-15 published successfully, and the same title was confirmed through the live get_notices read path.

- The supplied reference site uses a white/pale-slate surface, deep navy typography and navigation, muted gold accents, compact uppercase labels, rounded cards, and a large photographic hero. The portal home and Admin entry/dashboard were rethemed to that direction.
- Live Admin export verification succeeded for 17 filtered Attendance rows: CSV downloaded as jyoti-attendance-report.csv, and the controlled PDF print document contained JYOTI ITC branding, ATTENDANCE, RAM, 2026-03-12, and a populated table.
