# Project TODO

- [x] Establish Scandinavian visual system: pale cool gray background, bold black sans-serif typography, thin subtitles, pastel blue and blush pink geometric accents
- [x] Build public landing page with institute content and key statistics
- [x] Add Fitter and Electrician trade descriptions using the exact trade names
- [x] Add campus photo gallery
- [x] Add director message section
- [x] Add digital notice board
- [x] Implement strictly separated Student, Staff, and Admin login flows
- [x] Implement Student login with roll number, session, and trade
- [x] Implement Staff login with username and password
- [x] Implement locally managed Admin username and password
- [x] Implement Student dashboard with attendance history
- [x] Implement Student dashboard with Monthly Assessment, Quarterly Assessment, and Job Evolution marks
- [x] Connect student attendance and marks reads exclusively through the Google Sheets API boundary
- [x] Implement Staff attendance marking dashboard
- [x] Enforce staff attendance access only to the Admin-assigned unit
- [x] Enforce the hard maximum of 20 students per attendance unit
- [x] Implement Admin Monthly Marks, Quarterly Marks, and Job Evolution entry tools
- [x] Implement Admin notice publishing
- [x] Implement Admin attendance and marks history filters
- [x] Implement Admin staff create and delete workflows
- [x] Implement Admin staff trade and unit assignment
- [x] Implement Admin update of existing staff unit assignments
- [x] Persist and return staff unit assignment through the backend integration boundary
- [x] Implement printable Fitter Progress Card
- [x] Implement printable Electrician Progress Card
- [x] Implement printable Staff Experience Certificate
- [x] Add responsive layouts and accessible loading, empty, error, and success states
- [x] Add Vitest coverage for role access, unit enforcement, 20-student cap, and key data contracts
- [x] Run type checks, tests, and responsive visual verification
- [x] Save final checkpoint after all completed items are marked [x]

- [x] Map the supplied legacy Google Apps Script `/exec` backend URL into the project integration configuration
- [x] Inspect JYOTIPORTAL.xlsx sheet names, headers, and row structures
- [x] Document workbook-to-portal field mappings for students, attendance, monthly marks, quarterly marks, job evolution, notices, and staff
- [x] Verify legacy backend action names and response shapes against the workbook structure
- [x] Implement compatibility for the supplied legacy Google Sheets backend
- [x] Implement and verify legacy backend procedures for attendance writes, monthly marks writes, quarterly marks writes, job evolution writes, notice publishing, and staff create/update/delete
- [x] Extend the legacy Apps Script and STAFF_DB schema to persist and return staff unit assignment in get_staff_list and staff_login
- [x] Add Vitest and integration coverage for Student login and Staff login response contracts

- [x] Define a new Apps Script API contract for all portal read and write actions
- [x] Add required Google Sheet schema changes, including STAFF_DB unit assignment
- [x] Write the complete replacement Apps Script source code
- [x] Write deployment and sheet-setup instructions for the user
- [x] Validate the Apps Script source against the JYOTIPORTAL.xlsx workbook mappings
- [x] Replace the portal integration URL after the user deploys the new Apps Script

- [x] Add a fee ledger sheet for admission fee, payment history, invoice number, registration number, and receipt status
- [x] Add Apps Script fee lookup and payment-recording actions
- [x] Enforce that a payment cannot exceed the outstanding balance
- [x] Generate a printable invoice for every recorded payment
- [x] Generate a printable Fully Paid receipt when the balance reaches zero
- [x] Add Admin invoice lookup and payment form using student name and registration number
- [x] Add fee calculation tests for first payment, repeat payment, overpayment, and fully-paid state

- [x] Replace the portal Google Sheets endpoint with the newly deployed Apps Script URL
- [x] Verify live get_notices, get_staff_list, staff_login, get_sheet_data, and get_fee_student responses
- [x] Verify the live FEE_LEDGER header and STAFF_DB UNIT column
- [x] Verify safe live fee workflow behavior without creating test payment data
- [x] Re-run portal checks after the new endpoint is configured
- [x] Call the live staff_login action and verify the response shape, including unit
- [x] Open the rebuilt portal after endpoint update and verify a public read and one portal read flow in the browser
- [x] Verify the live notice board loads from the new Apps Script URL in the browser
- [x] Complete one real Student or Staff portal login and verify its dashboard reads live data
- [x] Recheck the browser console after the post-update public and portal flow verification

- [x] Fix homepage `TRPCClientError: fetch failed` on the public notice query
- [x] Verify the homepage notice request has a visible fallback and no uncaught runtime error
- [x] Add automated live staff_login integration coverage with status, name, trade, and unit assertions
- [x] Add automated live student login/read integration coverage with dashboard contract assertions
- [x] Re-run the targeted login integration suite before marking login coverage complete

- [x] Audit all currently paused TODO items against the actual implemented project state
- [x] Verify the new Google Sheets API endpoint and live action contract again
- [x] Verify the fee installment lookup, cumulative balance, invoice, and fully-paid receipt workflow
- [x] Run a complete live-preview regression pass across public, Student, Staff, and Admin routes
- [x] Record any feature that is not operational because of missing live sheet data or backend deployment

- [x] Implement structured Admin history filters for session, trade, unit, date, month, quarter, and week
- [x] Replace manual progress-card forms with data-driven Fitter and Electrician student record generators
- [x] Generate staff experience certificates from live staff records
- [x] Run mobile responsive verification for public, Student, Staff, and Admin screens
- [x] Execute interactive live regression for Student login, Staff attendance submit, Admin staff CRUD, notice publish, fee installment/receipt, and reports

- [x] Add visible empty, error, and success states for Admin reports, progress-card loading, certificate loading, staff list, fee lookup/payment, and write actions
- [x] Print actual attendance and marks details in progress cards for both Fitter and Electrician records
- [x] Strengthen the experience certificate content from live staff data and verify its load-and-print workflow
- [x] Verify both trade progress-card print flows and certificate print flow in the browser
- [x] Implement field-aware Admin history filtering mapped to the correct columns for each sheet
- [x] Verify each Admin report filter independently and in combination with real sheet data in the browser

- [x] Fix Admin fee payment success response so invoice or Fully Paid receipt renders visibly after save
- [x] Verify the receipt payload contains invoice number, student, payment, total paid, balance, and payment status
- [x] Add deterministic test coverage for payment-response normalization and receipt state selection
- [x] Add a deterministic unit test for fee payment response normalization covering raw/data/result wrappers, invoice mapping, partial payment, and fully paid state
- [x] Run the Admin portal fee payment against TEST-001 and verify the receipt card appears with invoice number, totals, balance, and print action
- [x] Document and assert the exact live payment mutation response shape

- [x] Add mediator name and mediator-paid fields to FEE_LEDGER and its setup documentation
- [x] Make cumulative mediator-paid totals visible in fee lookup and payment responses
- [x] Make Admin reports auto-fetch by roll number and record type from the correct sheet columns
- [x] Fix blank print tabs by using reliable print document rendering and blocked-popup feedback
- [x] Verify fee mediator tracking, Admin auto-fetch, and every print workflow with deterministic tests and preview checks

- [x] Verify the current mediator-enabled Code.gs source and migrated workbook copy
- [x] Document exact FEE_LEDGER headers and safe mediator payment test rows
- [x] Validate and package the updated Apps Script source for redeployment
- [x] Deliver updated Code.gs, workbook, and setup instructions to the user

- [x] Verify the redeployed endpoint returns mediator fields in fee lookup and payment responses
- [x] Confirm the portal is using the latest deployed Apps Script URL
- [x] Run a safe live lookup for TEST-001 and verify mediator totals without creating another payment
- [x] Verify Admin report roll filtering and print output after redeployment
- [x] Run a portal-side fee lookup through the configured Google Sheets adapter and verify mediator-enabled TEST-001 data

- [x] Allow Admin fee lookup results to print the latest existing receipt without recording another payment
- [x] Verify Admin fee receipt, progress card, and staff certificate print popups in the browser
- [x] Verify Admin report auto-fetch by roll number against live sheet data
- [x] Add opt-in live integration tests for Student and Staff login flows
- [x] Complete full regression pass for Student, Staff, and Admin dashboards before the 17th deadline

- [x] Implement true Admin report auto-fetch when roll/session/record type filters change
- [x] Add deterministic tests for field-aware report filtering across Attendance and academic sheets
- [x] Browser-verify roll-based retrieval for each Admin report type

- [x] Add deterministic tests for actual Student, Staff, and Admin workspace access separation
- [x] Add visible in-page staff-list loading/error/empty and write-action status feedback
- [x] Browser-verify trade, unit, date, month, quarter, and week report filters independently and in combinations

- [x] Add CSV export for the currently filtered Admin report rows
- [x] Add PDF/print export for the currently filtered Admin report rows
- [x] Align the public portal home screen with the supplied JYOTI reference website
- [x] Align the Admin panel visual theme with the supplied JYOTI reference website
- [x] Verify exports and visual changes in the browser and save a new checkpoint

- [x] Refactor the public home structure to more closely mirror the supplied reference site’s hero, trade, notice, director, gallery, and footer composition
- [x] Apply the reference navy/gold/white visual system consistently across AdminRecords cards, fields, report controls, and status surfaces
- [x] Re-verify the refined home/Admin visuals and save a post-change checkpoint

- [x] Replace the public Home composition with a materially reference-aligned hero, trade showcase, notice/director block, gallery, portal CTA, and footer structure
- [x] Capture final Home and Admin screenshots after the structural refactor and save a checkpoint created after those edits

- [x] Rebuild Home layout to closely reproduce the reference website’s exact navigation, hero, typography, spacing, section order, cards, and footer
- [x] Rebuild Admin shell and AdminRecords styling to use the same reference components, spacing, and responsive behavior
- [x] Compare desktop/mobile screenshots against the reference and iterate until the visual structure is closely matched
- [x] Run regression tests and save an exact-theme checkpoint

- [x] Remove mediator name and mediator-paid amount from printable fee receipts while retaining only student total paid and balance
- [x] Redesign fee receipt as a college-style A4 document with visible border, readable sizing, fee table, receipt metadata, and signature areas
- [x] Refine Admin panel styling to more closely match the supplied reference website
- [x] Verify receipt content, print borders, page sizing, and Admin visual changes in the browser
- [x] Run tests and save an updated checkpoint


- [x] Upgrade the shared AdminRecords print wrapper so progress cards and certificates retain visible A4 borders in print
- [x] Verify fee receipt, progress card, certificate, and mobile Admin layouts after the final visual pass
- [x] Run final tests/build and save the final checkpoint
- [x] Deliver the completed portal summary
- [x] Fresh Admin panel refactor applied with compact reference-aligned cards, gold accents, and serif headings
- [x] Admin login and TEST-001 lookup reverified after the refactor
- [x] Shared A4 fee receipt source confirmed for persistent borders and mediator-free printable content


# New scope: institution content and Admin Hub update
- [x] Add contact details, admission-fee information, and placement content to the public portal
- [x] Add an admission-enquiry form with validation, success/error states, and backend persistence boundary
- [x] Implement an Admin audit log for privileged actions with readable history in the Admin workspace
- [x] Add downloadable student login instructions from the public portal and/or login area
- [x] Inspect the attached Admin-panel recording and translate the Admin Hub structure/theme into the portal
- [x] Add deterministic tests for admission enquiry, audit logging, and student-instructions generation
- [x] Verify desktop/mobile UI and save a new checkpoint
- [x] Deliver the updated portal summary


# Follow-up verification gaps
- [x] Add a deterministic audit-persistence/procedure test covering an Admin action event
- [ ] Capture explicit mobile-width public and authenticated Admin screenshots — blocked until Admin credentials are supplied
- [x] Save a new checkpoint after the follow-up validation
- [x] Deliver the updated scope summary


# Admin Hub interaction correction from recording
- [x] Keep Admin navigation exclusively in the left sidebar and remove the all-modules-at-once right-side layout
- [x] Show an initially empty System Dashboard state in the right workspace panel
- [x] Open only the clicked Admin module in the right workspace panel
- [x] Preserve all existing Admin module functionality while switching modules in place
- [x] Add deterministic coverage for selected-module rendering and default empty state
- [x] Verify desktop/mobile Admin interaction and save a checkpoint
- [x] Deliver the corrected Admin Hub summary


# Admin Hub regression fixes
- [x] Map Monthly Marks, Quarterly Marks, and Job Evolution sidebar items to the correct right-panel modules
- [x] Restore full fee workflow in the selected Fees module, including mediator fields, status handling, and latest receipt print action
- [x] Add deterministic component-level coverage for the default dashboard and selected-module rendering
- [x] Re-run tests/build and save the corrected checkpoint
- [x] Deliver the corrected Admin Hub summary


# Admin Hub Data Entry subviews
- [x] Give Monthly Marks, Quarterly Marks, and Job Evolution distinct sidebar targets and selected subview state
- [x] Verify each Data Entry click opens its own right-panel content
- [x] Add deterministic tests for distinct Data Entry subviews
- [x] Re-run tests/build and save the corrected checkpoint
- [x] Deliver the corrected Admin Hub summary


# Final Admin Hub evidence gaps
- [x] Add component tests for Monthly Marks, Quarterly Marks, and Job Evolution subview headings
- [ ] Capture authenticated desktop/mobile Admin Hub evidence after the single-panel correction — blocked until Admin credentials are supplied
- [x] Document or browser-verify distinct Data Entry click behavior
- [x] Save the corrected Admin Hub checkpoint
- [x] Deliver the corrected Admin Hub summary


# Admin workflow correction: isolated data and reports
- [x] Fix Student Data fetch in the Admin workspace
- [x] Ensure Monthly Marks opens only the Monthly Marks module, not the shared all-marks view
- [x] Ensure Quarterly Marks, Reports, and Attendance each render only their own right-panel sections
- [x] Add session and unit filters that load the matching student list for marks upload and reports
- [x] Make marks upload operate on the filtered session/unit student set
- [x] Make marks reports operate on the filtered session/unit student set
- [x] Make staff attendance reports operate on the filtered session/unit student set
- [x] Restore a persistent visible Logout action in the Admin shell
- [x] Preserve progress-card and staff-experience work for the next requested scope
- [x] Add deterministic tests for section isolation and session/unit filtering
- [x] Verify the corrected Admin flows and save a checkpoint
- [x] Deliver the corrected Admin workflow summary


# Admin session/unit dataset completion
- [x] Add a session+unit roster loader for marks and report workflows with loading, empty, and error states
- [x] Change marks entry to select a student from the loaded session+unit roster
- [x] Bind marks reports to the loaded session+unit student set
- [x] Join attendance report rows with the session+unit roster so attendance filters are authoritative
- [x] Add deterministic tests for roster loading and marks/attendance session-unit filtering
- [x] Re-run tests/build and save a checkpoint
- [x] Deliver the corrected Admin workflow summary


# Fixed marks sections and bulk upload correction
- [x] Remove the Record type selector from Monthly Marks, Quarterly Marks, and Job Evolution entry screens
- [x] Load every student for the selected session, trade, and unit in the selected marks section
- [x] Add one-row-per-student bulk marks entry and upload for the selected section
- [x] Keep Monthly, Quarterly, and Job Evolution write payloads isolated
- [x] Make each report section fixed to its own sheet and show the same filtered student list
- [x] Add deterministic tests for fixed section modes and bulk marks filtering
- [x] Run tests/build and save a correction checkpoint
- [x] Deliver the focused correction summary


# Report error and workbook-format correction
- [x] Inspect the provided workbook/sheet format for Monthly Marks, Quarterly Marks, Job Evolution, and report columns
- [x] Diagnose and fix the Reports-section runtime error
- [x] Align Monthly, Quarterly, and Job Evolution entry payloads with the workbook column order
- [x] Load all matching students together when session and unit are selected in each marks section
- [x] Show all matching students together in each corresponding report section
- [x] Add deterministic tests for workbook column mapping and report grouping
- [x] Run tests/build and save the corrected report checkpoint
- [x] Deliver the focused report correction summary


# Final marks/report and Admin workspace correction
- [x] Correct Monthly/Quarterly component maximums to the workbook format and reject values above each maximum
- [x] Add live auto-calculated totals while entering Monthly and Quarterly marks
- [x] Add month dropdowns for Monthly marks upload/report and quarter dropdowns for Quarterly upload/report
- [x] Add session dropdowns to all marks/report sections
- [x] Add Job Evolution week selector with weeks 1-104 in upload and report, including automatic total calculation and limits
- [x] Remove roll-number search from reports and always load all students for selected session/unit/period
- [x] Make attendance reports session+unit filtered and date-wise for all matching students
- [x] Make marks/report workspaces expand to full available width and height
- [x] Add three-line collapsible Admin sidebar that hides after module selection and reopens on toggle
- [x] Add deterministic tests for marks limits, auto-totals, period/week filters, and attendance date grouping
- [x] Run tests/build, verify responsive behavior, and save a checkpoint
- [x] Deliver the corrected workflow summary


# Explicit student loading and workbook-vertical marks correction
- [x] Remove automatic student fetch from marks and report sections
- [x] Add explicit Load Students action after Session, Trade, Unit, and period selection
- [x] Make loaded student rows authoritative for the selected session and unit
- [x] Fix report loading to use the explicit loaded student set and selected filters
- [x] Restore workbook-style vertical marks layout instead of the current horizontal card/table layout
- [x] Keep Monthly, Quarterly, and Job Evolution component columns in workbook order
- [x] Add deterministic tests for explicit loading, session filtering, and vertical marks layout contracts
- [x] Run tests/build and save the focused checkpoint
- [x] Deliver the corrected student-loading summary


# Loaded roster visibility bug
- [x] Show the loaded 2026-28 Fitter student roster visibly after Load Students in Marks
- [x] Preserve the loaded roster across section renders so a second click does not replace it with No student found
- [x] Show the same loaded roster rows in Reports after Load Students
- [x] Show the same loaded roster rows in Attendance after Load Students, including the 17-student state
- [x] Add regression coverage for 2026-28 Fitter loaded roster visibility and duplicate-load behavior
- [x] Run tests/build and save a bug-fix checkpoint
- [x] Deliver the roster visibility correction summary


# Exact session roster correction
- [x] Verify the configured Google Sheets API URL is still present and used by the roster query
- [x] Enforce exact session matching in roster filtering so 2025-27 cannot show 2026-28 rows
- [x] Apply exact session matching before unit filtering and report joins
- [x] Add regression tests for cross-session roster contamination
- [x] Run tests/build and save a session-filter checkpoint
- [x] Deliver the exact-session correction summary


# Hard-coded session loading-state correction
- [x] Remove hard-coded 2026-28/Fitter/Unit 1 loading text and fallback values from Admin roster loading
- [x] Bind loading status text to the currently selected session, trade, and unit
- [x] Clear loaded students and reports when the selected filter changes before a new Load Students click
- [x] Ensure roster query, report query, and visible rows use the same selected filter snapshot
- [x] Add regression coverage for non-2026-28 sessions and dynamic future sessions
- [x] Run tests/build and save the selected-session checkpoint
- [x] Deliver the selected-session correction summary


# Load Students form-state correction
- [x] Ensure visible Session, Trade, and Unit controls write to the same selected-filter state used by Load Students
- [x] Show the selected filter snapshot before loading and use that snapshot for the roster query
- [x] Prevent the false Select Session/Trade/Unit validation when the visible controls have values
- [x] Add regression coverage for selected-filter state construction and validation
- [x] Run tests/build and save a form-state checkpoint
- [x] Deliver the form-state correction summary


# All-session Google Sheets roster fetch correction
- [x] Inspect the actual Google Sheets student response and workbook session/trade/unit columns
- [x] Verify the active Apps Script URL boundary is still used for student roster reads
- [x] Normalize all supported backend response wrappers into one student matrix
- [x] Match selected session, trade, and unit against the correct workbook columns for every session
- [x] Remove any stale roster/default fallback that can mask a failed or empty fetch
- [x] Add regression tests with multiple sessions and trades proving correct roster isolation
- [x] Run end-to-end validation and save a checkpoint
- [x] Deliver the verified all-session roster-fetch summary


# Reports delayed disappearance correction
- [x] Trace the effect or refresh path that clears report rows after a successful Load Students response
- [x] Keep loaded report roster/count state separate from later report-data refresh state
- [x] Preserve report rows and student count after the initial load completes
- [x] Prevent an empty follow-up response from overwriting a successful loaded report without an explicit filter change
- [x] Add deterministic regression coverage for delayed report-state overwrite
- [x] Run tests/build and save a Reports fix checkpoint
- [x] Deliver the Reports persistence correction summary


# Reports delayed disappearance correction — completed
- [x] Traced the delayed report-state overwrite path.
- [x] Separated persistent report roster rows from transient report matrix rows.
- [x] Preserved loaded students and count when a follow-up report response is empty or wrapped.
- [x] Added safe normalization for raw and rows-wrapped report responses.
- [x] Validated TypeScript, 56 deterministic tests, and production build successfully.
- [x] Deliver the Reports persistence correction summary.


# Reports delayed disappearance correction — final validation
- [x] Extract report response normalization and loaded-row preservation into shared helpers.
- [x] Add regression tests for raw/rows-wrapped responses and delayed empty-result fallback.
- [x] Validate TypeScript, 58 deterministic tests, and production build successfully.
- [x] Deliver the Reports persistence correction summary.


# Complete report tables and A4 print redesign
- [x] Render Attendance reports with explicit headers and values for Roll, Name, Trade, Session, Unit, Date, and attendance status.
- [x] Render Monthly Marks reports with workbook-ordered component columns and Total values.
- [x] Render Quarterly Marks reports with workbook-ordered component columns and Total values.
- [x] Render Job Evolution reports with Week, A–E component columns, and Total values.
- [x] Keep roster-only fallback clearly labeled and do not present it as a marks/attendance report.
- [x] Replace compact report text rows with responsive row-and-column tables and visible report metadata.
- [x] Redesign report print/PDF output as a styled A4 bordered document with readable table sizing and institute header.
- [x] Add deterministic tests for report column mapping and complete values.
- [x] Run tests/build and save a report-table checkpoint.
- [x] Deliver the complete report-table and A4 print update.


# Complete report tables and A4 print redesign — completed
- [x] Attendance reports now expose explicit Date, Roll, Name, Trade/Session, Unit, and Status columns when supplied by the workbook.
- [x] Monthly and Quarterly reports now render workbook-ordered Practical, Theory, WCS, Drawing, and Total columns.
- [x] Job Evolution reports now render Week No, A–E components, and Total columns.
- [x] Roster-only fallback is labeled as a student roster preview and is not treated as exportable report data.
- [x] Reports now use responsive row-and-column tables with metadata and readable institutional styling.
- [x] A4 print output now includes a bordered institute document, report metadata, table headers, alternating rows, and compact readable sizing.
- [x] Added report-export regression assertions for headers and values.
- [x] TypeScript, 58 deterministic tests, and production build passed.
- [x] Deliver the complete report-table and A4 print update.


# Report search and summary enhancement
- [x] Add a live search field above every Admin report table for Roll, Name, Trade, and Session.
- [x] Filter displayed report rows by the search query without changing the loaded backend dataset.
- [x] Add Attendance summary cards for total rows, Present, Absent, and attendance percentage.
- [x] Add Monthly, Quarterly, and Job Evolution summary cards for student count, component averages, and average Total.
- [x] Make summary values update with the search-filtered rows.
- [x] Add deterministic tests for report search filtering and summary calculations.
- [x] Run tests/build and save a checkpoint.
- [x] Deliver the search and summary update.


# Report search and summary enhancement — completed
- [x] Added a live search field above every Admin report table for Roll, Name, Trade, and Session.
- [x] Filtered displayed, CSV, and print rows using the current search query without changing the backend-loaded dataset.
- [x] Added Attendance summary cards for total rows, Present, Absent, and attendance percentage.
- [x] Added Monthly, Quarterly, and Job Evolution summary cards for student count, component averages, and average Total.
- [x] Made summary values update with the search-filtered rows.
- [x] Added deterministic tests for report search filtering and summary calculations.
- [x] TypeScript, 62 deterministic tests, and production build passed.
- [x] Deliver the search and summary update.


# Data integrity and portal display correction
- [x] Trace why Attendance report rows show only student identity fields instead of attendance status values.
- [x] Trace why Monthly, Quarterly, and Job Evolution reports show only student identity fields instead of marks and totals.
- [x] Ensure every report row maps the actual Google Sheets source columns into the visible table.
- [x] Ensure Attendance writes preserve Trade and Session together in the workbook-compatible field.
- [x] Ensure Monthly, Quarterly, and Job Evolution writes preserve Trade and Session together where required by the workbook.
- [x] Verify the Google Sheets write response and failure handling for all affected writes.
- [x] Enable continuous auto-scrolling for the public Notice Board with pause-on-hover/focus behavior.
- [x] Ensure Admission Enquiry submission persists to the configured Google Sheets backend and reports a real save failure.
- [x] Add deterministic regression tests for report value mapping, Trade+Session payloads, notice scrolling, and enquiry persistence.
- [x] Run full validation and save a corrective checkpoint.
- [x] Deliver the complete data integrity and display correction summary.


# Data integrity and portal display correction — completed
- [x] Normalized wrapped Google Sheets report responses with explicit headers and data rows.
- [x] Corrected Attendance and Marks report mapping so actual status, component scores, and totals are preserved in table rows.
- [x] Updated Admin bulk Monthly, Quarterly, and Job Evolution writes to store combined Session+Trade workbook identifiers.
- [x] Added explicit Google Sheets Admission Enquiry payload construction and routed submission through the configured backend before success is returned.
- [x] Added Notice Board looping auto-scroll with pause-on-hover/focus and reduced-motion support.
- [x] Added deterministic coverage for combined Trade+Session marks payloads and Admission Enquiry Sheets payloads.
- [x] TypeScript, 63 deterministic tests, and production build passed.
- [x] Deliver the complete data integrity and display correction summary.


# Live Google Sheets contract verification after failed fix
- [x] Capture the actual live Apps Script response shape for Attendance, Monthly, Quarterly, and Job Evolution sheets.
- [ ] Capture the actual live Apps Script write response and accepted action/field names.
- [x] Reproduce why live report rows still show only identity fields and why values are not visible.
- [ ] Reproduce why live marks writes still do not preserve Session+Trade in the sheet.
- [ ] Reproduce why live Admission Enquiry submits without a Google Sheets row.
- [x] Fix the exact live backend/frontend contract mismatch, including any required Apps Script instructions.
- [ ] Verify live report values, live Session+Trade write behavior, and live enquiry persistence.
- [x] Add regression coverage for the discovered live contract.
- [x] Run validation and save a verified checkpoint.
- [x] Deliver only the verified live-contract correction summary.


# Screenshot-confirmed report fallback bug
- [x] Reproduce the screenshot state where selected filters load 17 roster students but no real report rows.
- [x] Match live Attendance rows by date, combined Session+Trade, unit, and roster roll without losing STATUS.
- [x] Match Monthly, Quarterly, and Job Evolution rows by combined Session+Trade, roll, unit, and selected period.
- [x] Prevent roster-only fallback from being shown as a successful report when live rows should match.
- [x] Add regression tests using the exact live Attendance matrix shape and screenshot filter values.
- [x] Run validation, save checkpoint, and deliver the verified correction.


# Screenshot-confirmed report fallback bug — completed
- [x] Reproduced the screenshot state where 17 roster students loaded but no report rows matched.
- [x] Confirmed the live Attendance sheet uses dates such as 8/8/2026 while the browser filter sends ISO 2026-08-08.
- [x] Normalized ISO, slash, and zero-padded date formats for report filtering.
- [x] Verified live-shaped Attendance rows preserve P/A status after filtering by 2025-27, Fitter, Unit 1, and 2026-08-08.
- [x] Prevented the false roster-only fallback for the screenshot filter state when real rows match.
- [x] Full validation passed: TypeScript, 64 deterministic tests, and production build.
- [x] Deliver the verified report matching correction.


# Screenshot-confirmed Monthly Marks mismatch
- [x] Inspect live Monthly Marks headers and rows for 2025-27, Electrician, Unit 2, August.
- [x] Identify the exact mismatch causing 20 loaded students but zero matching marks rows.
- [x] Correct Monthly Marks session/trade/unit/month filtering and actual score/Total mapping.
- [x] Add a regression test using the screenshot filter combination and live-shaped Monthly Marks rows.
- [x] Run full validation and save a Monthly Marks checkpoint.
- [x] Deliver the verified Monthly Marks report correction.


# Shared marks reports correction
- [x] Inspect live Quarterly Marks and Job Evolution contracts alongside the live Monthly contract.
- [x] Build one shared roster-joined marks matching helper for Monthly, Quarterly, and Job Evolution.
- [x] Match marks rows by selected roster rolls, trade, and period/week while preserving all score columns and Total.
- [x] Prevent any of the three marks reports from rendering a roster preview when actual score rows match.
- [x] Add live-shaped regression tests for all three marks report types.
- [x] Run full validation and save a shared marks-report checkpoint.
- [x] Deliver the verified shared marks-report correction.


# Shared marks reports correction — completed
- [x] Confirmed live Monthly, Quarterly, and Job Evolution sheets contain actual score rows but omit some Session/Unit dimensions.
- [x] Added common report filter isolation so Monthly keeps Month, Quarterly keeps Quarter, Job Evolution keeps Week, and stale Attendance Date is cleared.
- [x] Preserved roster-roll joins and actual component/Total mapping for all three marks reports.
- [x] Added regression tests for all three report filter types and live-shaped report behavior.
- [x] Full validation passed: TypeScript, 67 deterministic tests, and production build.
- [x] Deliver the verified shared marks-report correction.


# A4 report export and download actions
- [x] Inspect current report print/export handlers and filtered row data flow.
- [x] Add explicit Download PDF action for the current filtered report.
- [x] Add explicit Download CSV action for the current filtered report.
- [x] Optimize report print HTML for A4 portrait/landscape, readable columns, repeated table headers, and bordered institute styling.
- [x] Disable exports for roster-only fallback previews and empty results.
- [x] Add regression coverage for PDF/CSV export content and current filtered rows.
- [x] Run full validation and save an A4 export checkpoint.
- [x] Deliver the A4 report export update.


# A4 report export and download actions — completed
- [x] Inspected current report print/export handlers and filtered row data flow.
- [x] Added explicit Download PDF action for the current filtered report.
- [x] Added explicit Download CSV action with the current report headers and filtered rows.
- [x] Optimized report print HTML for A4 landscape, readable wide columns, bordered institute styling, and report metadata.
- [x] Disabled exports for roster-only fallback previews and empty results.
- [x] Added regression coverage for CSV headers, print metadata, and escaped report values.
- [x] Full validation passed: TypeScript, 67 deterministic tests, and production build.
- [x] Deliver the A4 report export update.


# Staff Experience certificate and letterhead update
- [x] Replace staff-record name selection with manual Teacher Full Name and Father’s Name inputs.
- [x] Add Designation & Trade selection with the requested instructor and principal options.
- [x] Add employment From/To period fields with Add Another Period support.
- [x] Remove username and staff-account wording from generated certificate text.
- [x] Generate the requested formal EXPERIENCE CERTIFICATE wording with teacher name, father name, designation/trade, and all employment periods.
- [x] Add Till Date handling when the current employment period has no end date.
- [x] Optimize Print on Letterhead for A4 with configurable top blank space and bordered certificate layout.
- [x] Add deterministic certificate text/form/print regression tests.
- [x] Run full validation and save a certificate checkpoint.
- [x] Deliver the Staff Experience certificate update.


# Staff Experience certificate and letterhead update — completed
- [x] Replaced staff-record name selection with manual Teacher Full Name and Father's Name inputs.
- [x] Added Designation & Trade selection with Instructor, Workshop Instructor, and Principal options.
- [x] Added employment From/To period fields with Add Another Period and Remove support.
- [x] Removed username and staff-account wording from generated certificate text.
- [x] Generated the requested formal EXPERIENCE CERTIFICATE wording with teacher name, father name, designation/trade, and periods.
- [x] Added Till Date handling for an open current employment period.
- [x] Added letterhead-aware A4 print output with configurable 38mm top blank space.
- [x] Added deterministic certificate text and multiple-period regression tests.
- [x] Full validation passed: TypeScript, 69 deterministic tests, and production build.
- [x] Deliver the Staff Experience certificate update.


# Staff Experience preview, PDF/email, and reference print format
- [x] Inspect the supplied EXPERIENCE CERTIFICATE reference PDF structure and dimensions.
- [x] Add a Preview Certificate button beside Generate Text and Print on Letterhead.
- [x] Make preview use the same borderless reference certificate layout as printing.
- [x] Remove side borders and the horizontal line above EXPERIENCE CERTIFICATE in letterhead print output.
- [x] Add a dynamic top-margin control for different letterhead header heights.
- [x] Preserve the selected top margin in preview and print output.
- [x] Add a direct Save/Download PDF action for the generated certificate.
- [x] Add a real email-to-staff flow or clearly report the required mail configuration instead of showing fake success.
- [x] Add deterministic tests for preview markup, margin propagation, borderless print rules, PDF action state, and email validation.
- [x] Run full validation and save a certificate preview/export checkpoint.
- [x] Deliver the verified certificate preview/export update.


# Staff Experience preview, PDF/email, and reference print format — completed
- [x] Inspected the supplied EXPERIENCE CERTIFICATE reference PDF structure and dimensions.
- [x] Added a Preview Certificate button beside Generate Text and Print on Letterhead.
- [x] Made preview use the same borderless reference certificate layout as printing.
- [x] Removed side borders and the horizontal line above EXPERIENCE CERTIFICATE in letterhead print output.
- [x] Added a dynamic 0–80mm top-margin slider for different letterheads.
- [x] Preserved the selected top margin in preview and print output.
- [x] Added Save as PDF / Print action for the generated certificate.
- [x] Added validated email-draft action using the staff email address and truthful mailto behavior.
- [x] Added deterministic tests for preview markup, margin propagation, borderless print rules, and certificate text.
- [x] Full validation passed: TypeScript, 71 deterministic tests, and production build.
- [x] Deliver the verified certificate preview/export update.


# Final Progress Card correction
- [x] Inspect the current Progress Card query, student join logic, and print template.
- [x] Ensure Progress Card loads only the selected student’s session/trade/roll data.
- [x] Render Attendance records with date and status values.
- [x] Render Monthly and Quarterly marks with component scores and totals.
- [x] Render Job Evolution weeks with A–E components and totals.
- [x] Add clear empty states for sections with no records without mixing other students.
- [x] Optimize the Progress Card for a readable bordered A4 print layout.
- [x] Add deterministic Progress Card data-join and print regression tests.
- [x] Run full validation and save a final Progress Card checkpoint.
- [x] Deliver the final Progress Card correction.


# Original Progress Card template preservation
- [x] Receive the user-provided original Progress Card form/template.
- [x] Inspect its exact headings, boxes, columns, field order, and print dimensions.
- [x] Revert or replace any newly invented Progress Card layout with the supplied original format.
- [x] Map the selected student’s records into the original template without changing its visual structure.
- [x] Preserve the original template in Admin fill mode, preview, and print output.
- [x] Add template-specific regression tests after the source format is supplied.
- [x] Validate and save a final Progress Card template checkpoint.
- [x] Deliver the corrected original-format Progress Card.


# Marks change request intake — completed for Year/Quarterly scope
- [x] Recorded the requested Year addition exactly as provided by the user.
- [x] Recorded the requested Quarterly month replacement exactly as provided by the user.
- [x] Inspected the current workbook headers before changing the Marks contract.
- [x] Confirmed the changes apply to Monthly Marks, Quarterly Marks, Job Evolution, and their Reports.
- [x] Implemented only the confirmed Year and Quarterly changes; other Marks changes remain outside this scope.


# Marks Year dimension and Quarterly 1–12 update
- [x] Inspect current Monthly, Quarterly, and Job Evolution headers before adding Year.
- [x] Add Year choices `1st Year` and `2nd Year` to all three marks entry forms.
- [x] Replace Quarterly month choices with `Quarterly 1` through `Quarterly 12`.
- [x] Add Year to all three marks write payloads and preserve it in Google Sheets.
- [x] Add Year to all three marks report filters and visible report columns.
- [x] Define and document the safe Google Sheet Year column position without shifting existing score columns unexpectedly.
- [x] Add regression tests for Year payloads, Quarterly 1–12 values, and Year-aware report matching.
- [x] Run validation and save a Year-dimension checkpoint.
- [x] Deliver the Year and Quarterly update with the exact Sheet layout instructions.


# Marks Year dimension and Quarterly 1–12 update — completed
- [x] Inspected current Monthly, Quarterly, and Job Evolution headers before adding Year.
- [x] Added Year choices `1st Year` and `2nd Year` to all three marks entry forms.
- [x] Replaced Quarterly month choices with `Quarterly 1` through `Quarterly 12`.
- [x] Added Year to all three marks write payloads and Year-aware report matching.
- [x] Added Year to all three marks report filters, visible report columns, summaries, CSV, and PDF metadata.
- [x] Defined the Google Sheet Year placement as a new `YEAR` column immediately after `TRADE` for Monthly/Quarterly and after `UNIT` for Job Evolution, before period/score columns.
- [x] Added regression tests for Year payloads, Quarterly 1–12 values, Year-aware report matching, and summary indexes.
- [x] Full validation passed: TypeScript, 74 deterministic tests, and production build.
- [x] Deliver the Year and Quarterly update with the exact Sheet layout instructions.


# Organized marks-sheet Session and Unit schema
- [x] Inspect the live Monthly Marks, Quarterly Marks, and Job Evolution headers and current Code.gs write mapping.
- [x] Define explicit Session and Unit columns for all three marks sheets alongside Year.
- [x] Decide the exact column order without losing existing score data.
- [x] Align Admin marks payloads to write Session, Trade, Unit, Year, and period values explicitly.
- [x] Align report normalization and filtering to use sheet Session and Unit columns directly.
- [x] Determine whether Code.gs must be updated for header-based reads/writes and document the exact change.
- [x] Add schema-contract and payload regression tests.
- [x] Validate, save a checkpoint, and provide exact Google Sheet and Code.gs instructions.


# Organized marks-sheet Session and Unit schema — completed in code
- [x] Inspected the live Monthly Marks, Quarterly Marks, and Job Evolution headers and current portal write bridge.
- [x] Defined explicit Session and Unit columns for all three marks sheets alongside Year.
- [x] Set the organized column order without losing score fields.
- [x] Aligned Admin bulk and single-record marks payloads to write Session, Trade, Unit, Year, period, scores, and Total explicitly.
- [x] Aligned report normalization and filtering to use explicit Session and Unit columns when present.
- [x] Documented the required Code.gs behavior: preserve complete entry arrays and return complete header/data rows; fixed-index Code.gs must be updated.
- [x] Added schema-contract and payload regression coverage.
- [x] Full validation passed: TypeScript, 74 deterministic tests, and production build.
- [ ] Apply the new headers and any required Code.gs changes to the live Google Sheet deployment.


# Legacy Code.gs schema compatibility review
- [x] Read the supplied Code.gs and list every supported action and sheet write path.
- [x] Identify fixed column assumptions for Monthly Marks, Quarterly Marks, Job Evolution, Attendance, and enquiries.
- [x] Compare Code.gs writes with the organized Session/Trade/Unit/Year sheet headers.
- [x] Update the Apps Script source if it drops, reorders, or misreads the new identity fields.
- [x] Preserve existing fee, notice, staff, admission, and attendance actions while updating marks actions.
- [x] Add or update contract notes/tests for the final Apps Script payload shape.
- [x] Deliver exact copy-paste Code.gs instructions and required Sheet headers.


# Legacy Code.gs schema compatibility review — completed in source guidance
- [x] Read the supplied Code.gs and mapped supported GET/POST actions and sheet writes.
- [x] Identified the `SpreadsheetApp.penById` typo and fixed it to `openById` in the corrected copy.
- [x] Updated Monthly, Quarterly, and Job Evolution append widths from 10/10/11 to 13 columns.
- [x] Compared Code.gs writes with the organized Session/Trade/Unit/Year marks headers.
- [x] Preserved fee, notice, staff, admission, and attendance actions unchanged.
- [x] Added exact copy-paste source at `docs/Code.gs.updated` and migration guidance at `docs/marks-sheet-schema.md`.
- [x] Corrected Code.gs syntax passed JavaScript syntax validation.
- [ ] User must update the live workbook headers, paste the corrected Code.gs, redeploy the Apps Script web app, and provide the new endpoint for live verification.


# New Apps Script endpoint live verification
- [x] Query the new endpoint’s Monthly Marks headers and sample rows.
- [x] Query the new endpoint’s Quarterly Marks headers and sample rows.
- [x] Query the new endpoint’s Job Evolution headers and sample rows.
- [x] Compare live headers with explicit Session, Trade, Unit, Year, period, score, and Total schema.
- [x] Verify write response shape safely without inserting uncontrolled production test data.
- [x] Document any remaining Code.gs or sheet-header mismatch.
- [x] Save a live-contract verification checkpoint.


# Vite HMR WebSocket correction
- [x] Inspect current vite.config.ts HMR/server settings and dev-server logs.
- [x] Identify why the browser client targets localhost:5173 instead of the proxied preview host.
- [x] Correct HMR host/protocol/port settings for managed preview without hardcoding production ports.
- [x] Restart the development server and verify the preview no longer logs WebSocket connection failure.
- [x] Run TypeScript/tests/build and save a corrective checkpoint.
- [x] Deliver the Vite HMR correction summary.


# Vite HMR WebSocket correction — completed
- [x] Inspected vite.config.ts and dev-server/browser logs.
- [x] Confirmed managed preview was advertising the broken localhost:5173 HMR socket.
- [x] Disabled unreliable Vite HMR for the managed preview so the browser no longer attempts the failing WebSocket; normal page reload remains available.
- [x] Restarted the development server and verified the public preview loads.
- [x] Verified no new Vite WebSocket error appears after the fresh preview reload.
- [x] Full validation passed: TypeScript, 74 tests, and production build.
- [x] Deliver the Vite HMR correction summary.


# Admission Enquiry live Sheet persistence blocker
- [x] Trace the current Admission Enquiry local-save and Google Sheets write sequence.
- [x] Confirm the deployed Apps Script doPost 405 response and accepted action name.
- [x] Ensure the portal does not report full persistence when the Sheet write fails.
- [x] Provide exact Code.gs deployment settings and redeploy instructions for doPost.
- [ ] Re-test a real Admission Enquiry after the user redeploys the Apps Script endpoint.
- [ ] Verify the new enquiry appears in the live Google Sheet.
- [x] Save a persistence verification checkpoint and deliver the truthful status.


# Admission Enquiry live Sheet persistence blocker — code-side correction
- [x] Traced the local database and Google Sheets write sequence.
- [x] Confirmed the deployed endpoint returns HTTP 405 for POST while GET works.
- [x] Updated the Apps Script POST bridge to preserve POST bodies across Google redirects.
- [x] Ensured final non-2xx Sheet responses reject the mutation before local enquiry success is returned.
- [x] Added regression tests for redirect-preserving POST and final write failure.
- [x] Validation passed: TypeScript, 76 tests, and production build.
- [ ] User must redeploy Code.gs as a Web app with working doPost access, then live enquiry persistence must be re-tested.


# Admission Enquiry endpoint re-verification
- [x] Probe the newly supplied endpoint GET response.
- [x] Probe its doPost behavior with an empty, non-mutating batch.
- [x] Verify the Admission Enquiry action response without uncontrolled test data.
- [x] Compare the live response with the server write bridge.
- [x] Save a live persistence verification checkpoint or document the remaining deployment blocker.


# Latest Apps Script deployment verification
- [x] Verify GET action response from the latest supplied URL.
- [x] Verify redirect-preserving POST response from the latest supplied URL.
- [x] Confirm whether doPost is now active before attempting any real enquiry write.
- [x] Record the latest live verification result in the project checkpoint.


# Direct Admission Enquiry contact actions
- [x] Confirm the institute admission phone/WhatsApp number and country format.
- [x] Replace or de-emphasize the unreliable Sheet enquiry form on the public Home page.
- [x] Add a direct Call Now action using a tel link.
- [x] Add a WhatsApp enquiry action with a professional pre-filled admission message.
- [x] Verify desktop/mobile button layout and WhatsApp URL encoding.
- [x] Save a checkpoint after the contact-action update.


# Admission fee correction
- [x] Change the public admission fee display from ₹10,000 to ₹30,000.
- [x] Search related public fee copy for stale ₹10,000 admission values.
- [x] Run tests, production build, and browser verification for the corrected fee.
- [x] Save a corrected fee checkpoint.


# Admin HTTP 405 despite existing Sheet data
- [x] Trace which Admin query or write action produced the visible HTTP 405.
- [x] Compare the configured endpoint’s GET/read behavior with the failing portal action.
- [x] Confirm existing Sheet rows are preserved and are not treated as missing data.
- [x] Add regression coverage for the corrected error/read behavior.
- [x] Verify the Admin route renders cleanly after the safe correction and save a checkpoint; authenticated module interaction remains credential-dependent.


# Admin top notifications and loading feedback
- [x] Trace Admin fetch/update status messages and mutation loading states.
- [x] Replace the upper inline status banner with a dismissible top notification containing an OK button.
- [x] Show loading spinners during Admin fetch, save, update, delete, publish, and report actions.
- [x] Show clear success and error notifications for completed Admin actions.
- [x] Add deterministic notification behavior tests.
- [x] Verify desktop/mobile Admin notification visuals and save a checkpoint; authenticated visual interaction remains credential-dependent.


# Experience Certificate clean letterhead output
- [x] Inspect the current certificate preview/print/PDF template and attached reference output.
- [x] Remove all unwanted top and bottom text from letterhead mode.
- [x] Remove all borders, horizontal rules, and decorative framing from letterhead mode.
- [x] Keep only the requested EXPERIENCE CERTIFICATE content and signature text.
- [x] Validate preview, print CSS, and PDF output with deterministic tests.
- [x] Save a corrected certificate checkpoint.


# Experience Certificate final content cleanup
- [x] Inspect certificate body markup for date, heading, and bottom About/blank content.
- [x] Remove date and EXPERIENCE CERTIFICATE heading from letterhead output.
- [x] Remove bottom About/blank content from letterhead output.
- [x] Keep only the requested certificate body and signature.
- [x] Add regression assertions and rerun certificate/full validation.
- [x] Save the final certificate cleanup checkpoint.


# Experience Certificate top-margin correction
- [x] Trace why the selected top-margin value is not visibly changing certificate output.
- [x] Apply the selected top margin consistently to preview and print markup.
- [x] Show the active margin value in the certificate controls/preview state.
- [x] Add regression tests for multiple margin values and output propagation.
- [x] Run full validation and save a top-margin correction checkpoint.


# Experience Certificate readability update
- [x] Inspect current certificate body font, line-height, paragraph spacing, and signature spacing.
- [x] Increase certificate body text size for readable A4 output.
- [x] Tune heading, paragraph, and signature spacing without reintroducing borders or extra text.
- [x] Add typography regression assertions and rerun full validation.
- [x] Save a readable certificate checkpoint.


# Supplied Electrician Progress Card template
- [x] Inspect the supplied `progresscard1page.docx` headings, page count, boxes, tables, field order, and dimensions.
- [x] Preserve the supplied spelling/text where correct and fix visible spelling errors without changing the intended format.
- [x] Load the selected student by roll number with session/trade isolation and show the student name.
- [x] Map Year 1 Monthly and Quarterly marks to page 2.
- [x] Map Year 2 Monthly and Quarterly marks to page 4, leaving missing-year sections blank.
- [x] Auto-calculate totals, percentages, and other derived fields after fetch.
- [x] Keep remaining fields manually editable in the Admin panel before printing.
- [x] Add institute-sign upload for INST positions and leave Principal signature blank.
- [x] Rebuild the designed multi-page A4 print/preview using the supplied format.
- [x] Add template-specific tests and complete browser/build validation; authenticated print-click verification remains session-dependent.
- [x] Save a checkpoint for the supplied Progress Card implementation.


# Progress Card data-isolation hardening
- [x] Normalize report sheet headers dynamically for Session, Trade, Unit, Year, Roll, and Name.
- [x] Filter Monthly, Quarterly, and Job Evolution rows by the selected session, trade, unit, and roll.
- [x] Preserve compatibility with legacy combined Trade values and sheets without Year columns.
- [x] Add mixed-session/unit regression coverage and rerun full validation.
- [x] Save a hardened Progress Card data-join checkpoint.


# Separate certificate and Progress Card Admin modules
- [x] Trace current Admin sidebar labels and active module mode mapping.
- [x] Add independent Staff Experience module routing.
- [x] Add independent Fitter Progress Card module routing.
- [x] Add independent Electrician Progress Card module routing.
- [x] Ensure only the selected module renders in the right workspace panel.
- [x] Add regression coverage for module mapping and one-panel rendering.
- [x] Verify desktop/mobile navigation and save a checkpoint; authenticated click-through remains session-dependent.


# Progress Card grading, marks fetch, and exact four-page print
- [x] Add manual grading and remarks fields to the Progress Card Admin panel.
- [x] Pass grading/remarks values into both preview and print output.
- [x] Trace and fix Monthly and Quarterly marks fetch for the selected roll/session/trade/year.
- [x] Preserve blank sections when no monthly or quarterly records exist.
- [x] Make preview and print/PDF use the same four explicit A4 pages and page breaks.
- [x] Add regression tests for manual fields, marks mapping, and exact page count.
- [x] Save a corrected Progress Card checkpoint.


# Editable four-page Electrician Progress Card workspace
- [x] Show four distinct editable Progress Card pages inside the Admin panel.
- [x] Show page-specific exercises and Monthly/Quarterly sections in the panel.
- [x] Add editable Grade and Remarks controls on the relevant rows/pages.
- [x] Pass panel-entered values into preview and print without losing them.
- [x] Keep panel preview and print synchronized as exactly four A4 pages.
- [x] Add regression coverage and save a checkpoint.


# Progress Card PDF layout repair
- [x] Inspect why exercise text is missing from generated preview/PDF.
- [x] Fix exercise table sizing, wrapping, and row alignment on pages 1 and 3.
- [x] Prevent Monthly/Quarterly text overlap and page overflow on pages 2 and 4.
- [x] Make Admin preview and print/PDF use the same stable four-page layout.
- [x] Add regression checks for exercise visibility, overlap-prone CSS, and page structure.
- [x] Validate the repaired PDF layout and save a checkpoint; authenticated generated-PDF click-through remains session-dependent.


# Progress Card exercise initials and pagination repair
- [x] Ensure exercise rows 48–52 and 96–104 are included in print output.
- [x] Print the uploaded Instructor Initial sign for every exercise row.
- [x] Add separate upload controls for Drg. Inst. Initial, Math Inst. Initial, and G.I.S. Initial, used only in exercise tables.
- [x] Remove the extra horizontal line/border artifact after the final exercise row on pages 1 and 3.
- [x] Align the exercise table columns and preserve all four A4 pages.
- [x] Add regression tests for row ranges, initials, sign placement, and final-row borders.
- [x] Save a corrected checkpoint after validation.


# Progress Card signature-control cleanup
- [x] Remove the obsolete generic Institute Sign upload from the Progress Card form.
- [x] Keep only Exercise Inst. Initial, Drg. Inst. Initial, Math Inst. Initial, and G.I.S. Initial upload controls.
- [x] Ensure the generic Institute Sign value cannot silently replace the exercise initial sign.
- [x] Add a regression assertion for the four distinct upload labels and rerun validation.


# Progress Card complete exercise and marks calculation repair
- [x] Print every exercise row, including ranges 43–52 and 90–104, allowing extra pages when needed.
- [x] Render uploaded exercise initials only when that row has Grade or Marks; keep blank rows blank.
- [x] Apply a 1.4-inch left margin to the Progress Card print pages.
- [x] Fetch Monthly and Quarterly WCS from sheet column 3 and show it in the WCS column.
- [x] Correct Quarterly total/max-mark and percentage calculations.
- [x] Add regression coverage for all requested ranges, conditional signs, WCS, margin, and percentages.
- [x] Save a corrected checkpoint after validation.


# Progress Card batch export and configurable binding margin
- [x] Add multi-student Progress Card selection and batch export/download.
- [x] Add a user-adjustable left-margin control with a safe printer-friendly range.
- [x] Propagate the selected margin through Progress Card preview and print output.
- [x] Add deterministic tests for batch export and margin propagation.
- [x] Validate the new flows and save a checkpoint.


# Quarterly percentage and Exercise print border correction
- [x] Calculate Quarterly percentage using a 100-mark total.
- [x] Restore a visible border around every printed Exercise page, including batch output.
- [x] Add regression tests for 100-mark Quarterly percentage and Exercise-page borders.
- [x] Run full validation and save a corrected checkpoint.


# Progress Card A4 fit and automatic exercise remarks
- [x] Fit exercise pages to A4 with no unnecessary bottom whitespace while preserving readable rows.
- [x] Keep the underline/line beneath the last exercise on every exercise page.
- [x] Add automatic remarks for populated graded rows: A Excellent, B Good, C Pass, D Fail.
- [x] Add regression tests for A4 layout, final-row underline, and grade remarks.
- [x] Run full validation and save a corrected checkpoint.


# PPPPP.pdf bottom-space correction
- [x] Inspect supplied PPPPP.pdf and compare its vertical layout with current Progress Card output.
- [x] Reduce excessive bottom whitespace while keeping all exercise rows and the final exercise line.
- [x] Add regression coverage for the corrected vertical layout.
- [x] Run full validation and save a corrected checkpoint.


# Monthly Marks maximum score validation
- [x] Enforce Practical maximum 50 and all other Monthly heading limits in the Admin inputs.
- [x] Enforce the same maximum limits before upload so invalid values cannot reach Google Sheets.
- [x] Add regression tests for clamping and payload validation.
- [x] Run full validation and save a corrected checkpoint.


# Fitter catalog, batch download, and print spacing update
- [x] Replace only the Fitter Progress Card exercise catalog with the supplied 1–76 list.
- [x] Preserve the shared Progress Card marks, grade, initials, WCS, remarks, and print behavior.
- [x] Verify batch download/print export for multiple selected students.
- [x] Reduce Progress Card print bottom space to approximately 0.3 inch without clipping content.
- [x] Add regression tests and save a validated checkpoint.

- [x] Use the Progress Card print shell for single-student Fitter printing, not only Fitter batch export.


# Electrician Progress Card parity update
- [x] Confirm Electrician print pages use approximately 0.3 inch bottom spacing.
- [x] Confirm Electrician single and batch export flows are both available.
- [x] Add parity regression coverage and save a validated checkpoint.


# Progress Card border, spacing, and Fitter sign controls
- [x] Make the print border begin after the left binding margin in both Fitter and Electrician cards.
- [x] Reduce remaining bottom whitespace in both Progress Card print layouts.
- [x] Show Fitter Exercise, Drg., Math, and G.I.S. initial upload controls.
- [x] Verify populated-row sign rendering and add regression coverage.
- [x] Run full validation and save a corrected checkpoint.


# Fee Ledger and receipt reference update
- [x] Restore Fee Ledger as an explicit Admin panel module.
- [x] Preserve existing fee lookup, installment, invoice, and fully-paid receipt actions.
- [x] Rebuild the fee receipt to match the supplied Lakshya Pvt. ITI receipt structure.
- [x] Add receipt and Fee Ledger regression coverage and validate print output.
- [x] Save a corrected checkpoint.


# Fee receipt mediator privacy correction
- [x] Confirm mediator name and mediator-paid amount never appear in receipt preview or print HTML.
- [x] Preserve mediator fields only in the Fee Ledger/Google Sheet write payload.
- [x] Add privacy regression coverage and save a corrected checkpoint.


# Fee receipt registration and immediate download correction
- [x] Print Registration No. in the receipt Roll No. field.
- [x] Make the fee save response immediately receipt-ready without a second fetch.
- [x] Open/download the receipt immediately after a successful Sheet save and suppress false save errors.
- [x] Add regression coverage and save a corrected checkpoint.


# Fee Ledger Google Sheets lookup repair
- [x] Fix Registration No. and Name student lookup from Google Sheets.
- [x] Normalize header-aware fee responses and preserve payment history/totals.
- [x] Prevent false no-record messages while loading or when the endpoint errors.
- [x] Add regression coverage, validate, and save a corrected checkpoint.


# Public campus gallery label correction
- [x] Change the gallery label “Campus” to “Smart Class”.
- [x] Change the gallery label “Training” to “Campus”.
- [x] Validate the public page and save a checkpoint.


# Skill India banner and active login flow
- [x] Add the supplied Skill India banner above the Shaping Careers hero.
- [x] Keep the Shaping Careers hero below the new banner responsively.
- [x] Add a Skill India tab that becomes visibly active when selected.
- [x] Open a Skill India selection modal with Learner/Participant, Partner, DGT Ecosystem, and ITI Result options.
- [x] Make login/result actions open directly from the selected modal option.
- [x] Validate responsive behavior and save a checkpoint.


# Official Skill India link routing
- [x] Connect Skill India action to https://www.skillindiadigital.gov.in/home.
- [x] Connect ITI Result action to https://dgt.skillindiadigital.gov.in/result.
- [x] Validate external-link behavior and save a checkpoint.


# All Skill India modal options use official home link
- [x] Route Learner/Participant, Partner, DGT Ecosystem, and ITI Result to https://www.skillindiadigital.gov.in/home.
- [x] Remove the separate DGT result/local portal routing from these four modal options.
- [x] Validate all four actions and save a checkpoint.


# Official links and bright login redesign
- [x] Restore ITI Result to https://dgt.skillindiadigital.gov.in/result.
- [x] Add DET Bihar Admission after Admin Area at https://det.bihar.gov.in/index.html.
- [x] Rename Student, Staff, and Admin access buttons to direct login labels and preserve direct routing.
- [x] Redesign the login screen with a bright Skill India-inspired theme and responsive login cards.
- [x] Validate links and login flows, then save a checkpoint.


# Cumulative Fee Ledger payment status
- [x] Aggregate previous payments for the same student and calculate cumulative total paid.
- [x] Show FULLY PAID when cumulative paid reaches the admission fee; otherwise show PARTIALLY PAID and balance.
- [x] Display admission fee, total paid, and balance in Fee Ledger and fee receipt without mediator details.
- [x] Add regression tests, validate calculations, and save a checkpoint.


# Redeployed Apps Script live read integration
- [x] Verify the supplied endpoint returns actual report, marks, attendance, and fee data.
- [x] Ensure the portal uses the supplied redeployed endpoint for all read paths.
- [x] Normalize report rows so marks and attendance values display, not only student names.
- [x] Repair Fee Ledger lookup against the same endpoint and response contract.
- [x] Add regression tests, validate live-safe reads, and save a checkpoint.


# Fetch UX and session-aware Fee Ledger
- [x] Add polished loading animation or progress feedback while reports fetch.
- [x] Add polished loading animation or progress feedback while Fee Ledger fetches.
- [x] Add session and trade filters to Fee Ledger student lookup.
- [x] Support Fee Ledger lookup against session/trade student sheets while preserving cumulative payment history.
- [x] Keep future session/trade sheets compatible without hardcoding only one session.
- [x] Add regression tests, validate the integration, and save a checkpoint.


# Clarified Fee Ledger roster source
- [x] Fetch Fee Ledger students from the selected session-trade roster tab, such as 2025-27FITTER or 2026-28ELECTRICIAN.
- [x] Use the roster student’s registration/roll and name as the fee lookup identity.
- [x] Save each payment with the selected session and trade and preserve cumulative history.
- [x] Keep the flow dynamic for future session-trade tabs and add regression coverage.


# Fee Ledger summaries, search, and exports
- [x] Add selected session-trade total collected and pending fee summary cards.
- [x] Add Fee Ledger student search by name or roll number.
- [x] Add Fee Ledger PDF export for the selected/filtered records.
- [x] Add Fee Ledger Excel-compatible export for the selected/filtered records.
- [x] Add a download/export action for filtered report data in PDF and Excel-compatible formats.
- [x] Add regression tests, validate export output, and save a checkpoint.


# Fee Ledger visual analytics and student detail
- [x] Add a collected-versus-pending pie chart beside the Fee Ledger summary cards.
- [x] Make Fee Ledger student rows clickable.
- [x] Add a student detail modal with complete session-trade payment history and cumulative totals.
- [x] Add regression tests, validate chart/modal behavior, and save a checkpoint.


# Pending fee reminders
- [x] Map the roster student mobile/WhatsApp number into Fee Ledger rows when available.
- [x] Add All, Pending Only, and Fully Paid dropdown filtering to the Fee Ledger student list.
- [x] Add a Send Reminder action for pending students with a professional WhatsApp payment message.
- [x] Avoid sending or opening a reminder link when a student has no valid mobile number.
- [x] Add regression tests, validate WhatsApp links/filtering, and save a checkpoint.


# Bulk pending-fee WhatsApp reminders
- [x] Add a Bulk Send button for all visible pending-fee students.
- [x] Reuse one exact message builder that pre-fills each student name and pending amount.
- [x] Skip missing/invalid mobile numbers and report how many reminders were skipped.
- [x] Add regression tests, validate bulk reminder behavior and build, and save a checkpoint.


# Reminder history, templates, and bulk confirmation
- [x] Display and retain a Last Reminder Sent date/time per student row after a reminder is opened.
- [x] Add an editable WhatsApp reminder template with supported student placeholders.
- [x] Add a Bulk Send confirmation modal showing total pending, valid-number, and skipped-number counts.
- [x] Add regression tests, validate reminder interactions and build, and save a checkpoint.


# Reminder Log and quick payment action
- [x] Add an Admin Reminder Log section with sent reminder history and status.
- [x] Record student, session/trade, pending amount, reminder date/time, mobile state, and reminder status.
- [x] Add a pending-row quick Mark Paid action using the existing cumulative fee-save flow.
- [x] Require payment confirmation/amount before marking a student paid and prevent duplicate action while saving.
- [x] Add regression tests, validate log/payment behavior and build, and save a checkpoint.


# Full live integration and error audit
- [ ] Audit every Admin, Student, Staff, public, report, document, reminder, and fee feature for runtime errors.
- [ ] Verify every data-fetch and save path uses the live Google Sheets backend and reports backend errors accurately.
- [x] Verify reports display actual marks, attendance, session, trade, unit, and period data rather than roster names only.
- [x] Verify report filters isolate the selected session/trade/unit and preserve marks/attendance values.
- [x] Run full tests, build, targeted live-safe checks, and UI verification before saving a checkpoint.


# New complete Google Apps Script deployment
- [x] Inventory frontend Google Sheets GET/POST payloads and expected response shapes.
- [x] Prepare a complete replacement Code.gs with session-trade roster, reports, attendance, marks, Fee Ledger, admission enquiry, and write support.
- [x] Validate the new Code.gs against current portal contracts and document required sheet headers/deployment settings.
- [x] Deliver the copy-paste Code.gs source and redeployment instructions.


# New Apps Script URL verification
- [x] Update GOOGLE_SHEETS_API_URL to the newly supplied `/exec` deployment.
- [x] Verify the new deployment returns the 2026-28 Fitter roster, Monthly Marks, Attendance, and session-trade Fee Ledger data.
- [x] Add and pass a lightweight Vitest endpoint probe for the configured secret.
- [x] Run TypeScript validation and production build after the URL switch.


# Automatic Paid fee receipt PDF
- [x] Generate an institutional PDF fee receipt from the successful Mark Paid payment response.
- [x] Trigger the PDF download automatically after a successful Paid action.
- [x] Include student identity, session/trade, admission fee, current payment, total paid, balance, invoice/date, and status.
- [x] Keep mediator name and mediator-paid amount hidden from the receipt.
- [x] Add regression tests, validate the PDF/download flow, and save a checkpoint.


# Cumulative installment fee receipts
- [x] Include all previous and current installment rows with payment date, invoice, and amount in every new receipt.
- [x] Show admission fee, total paid to date, current payment, and remaining balance on every receipt.
- [x] Show final Fully Paid status and balance zero when cumulative payments complete admission fee.
- [x] Add regression tests for first, second, and final installment receipts and save a checkpoint.


# Session-sheet Fee Ledger persistence
- [ ] Add/ensure Mobile No., Admission Fee, Total Paid, Balance/Unpaid, Mediator Name, and Mediator Paid columns in each session-trade student sheet.
- [ ] Persist each fee installment in the selected session-trade student sheet, not only a separate Fee Ledger.
- [ ] Recalculate Paid and Balance cumulatively for every new installment without exceeding Admission Fee.
- [ ] Preserve every payment date/time, invoice, amount, and receipt history in the session sheet.
- [ ] Keep Fee Ledger UI, summaries, reminders, and receipts reading from the session-sheet fee fields.
- [ ] Add regression tests for first, subsequent, and final payments and save a checkpoint.

- [x] Prepare and contract-test the session-sheet Fee Ledger Code.gs replacement; live Sheet persistence remains pending until redeployment.


# Verify session-sheet format before Fee Ledger change
- [x] Inspect existing headers and representative rows for 2025-27, 2026-28, and 2027-29 session-trade sheets.
- [x] Compare Fitter and Electrician sheet formats and identify existing fee/mobile/mediator columns.
- [x] Define only the required compatible additions after reviewing the live format.
- [x] Revise and validate Code.gs only after the verified format comparison.


# Dynamic sessions through 2030-32 and timestamped fee history
- [x] Support any selected session-trade sheet through 2030-32 and future sessions without a fixed allowlist.
- [x] Add each new payment to the existing Paid Amount in the session-sheet row.
- [x] Reduce Balance by the exact new payment and prevent overpayment beyond Admission Fee.
- [x] Log exact date and time, invoice, installment amount, cumulative paid, and balance in Payment History.
- [x] Validate and deliver a new copy-paste Code.gs with deployment instructions.


# New 2030-32 deployment verification
- [x] Switch GOOGLE_SHEETS_API_URL to the user-provided deployment.
- [x] Verify the 2030-32FITTER response and session-sheet fee headers.
- [x] Pass the new live endpoint Vitest probe.
- [x] Verify one real student payment write after confirming a populated student row in the selected session sheet.


# 2025-27 live format correction
- [x] Detect the existing `Paid Amount` header as `PAIDAMOUNT` to prevent another duplicate on the next deployment.
- [x] Remove the already-created duplicate `Paid Amount` column from the live 2025-27 sheet after confirming which column is empty.
- [x] Redeploy the corrected Code.gs and verify a populated 2025-27 student fee lookup/write.


# Active Fee Lookup repair
- [x] Fix live get_fee_student redirect so session-specific fee lookup returns JSON
- [x] Verify Fee Ledger lookup fields: Paid Amount, Balance, Payment History, and Payment Status
- [x] Run safe cumulative payment verification or document why a real write cannot be performed


# Final Apps Script deployment verification
- [x] Configure the portal to use the user's final Apps Script deployment URL
- [x] Verify final deployment get_sheet_data returns the selected session roster and fee headers
- [x] Verify final deployment get_fee_student returns JSON for a populated 2025-27 Fitter student
- [x] Verify the portal Fee Ledger lookup through the final deployment
- [x] Perform or safely document cumulative payment write verification


# Cross-module Google Sheets fetch stability
- [x] Reproduce Fee Ledger time-aborted fetch against the final deployment
- [x] Verify and harden all GET read actions against Apps Script redirects and transient timeouts
- [x] Probe session rosters, marks, attendance, reports, staff, notices, and fee lookup from the final deployment
- [x] Fix any module-specific response or timeout failures and add regression coverage
- [x] Run full validation and save a stabilized Google Sheets checkpoint


# Post-Job-Evolution redeploy verification
- [x] Verify the final deployment now returns the exact JOB EVOLUTION matrix
- [x] Re-run all major live module probes after the new sheet was created
- [x] Fix any new response-shape, timeout, or filtering issue caused by the new tab
- [x] Run full tests/build and save the updated checkpoint


# Newest final Apps Script deployment verification
- [x] Configure GOOGLE_SHEETS_API_URL to the newest user-supplied deployment
- [x] Verify the newest deployment returns JSON for Job Evolution and all major modules
- [x] Verify the portal bridge uses the newest deployment without timeout/error messages
- [x] Run full tests, TypeScript validation, live probes, and production build
- [x] Save the final verified checkpoint and report any remaining backend-only issue


# Final complete Code.gs replacement
- [x] Inspect every current portal Apps Script action and required sheet contract
- [x] Produce one synchronized complete Code.gs source including JOB EVOLUTION
- [x] Validate source syntax and all action contracts against the portal bridge
- [x] Deliver the final copy-paste Code.gs with exact deployment settings


# Last deployment end-to-end verification
- [x] Configure GOOGLE_SHEETS_API_URL to the user's last deployment URL
- [x] Verify roster, Fee Lookup, Job Evolution, marks, attendance, reports, notices, and staff responses
- [x] Verify the portal bridge and fetch UX against the last deployment
- [x] Run full tests, TypeScript validation, and production build
- [x] Save the final verified checkpoint and report exact remaining status


# Latest direct backend verification
- [x] Configure the portal to the latest Apps Script key supplied by the user
- [x] Directly probe Job Evolution, Fee Lookup, marks, attendance, roster, notices, and staff without fallback masking
- [x] Record exact pass/fail results and fix only portal-side issues that are actually reproducible
- [x] Run validation and save a final truthful checkpoint or document the backend blocker


# Fee Ledger speed and payment flow improvement
- [x] Inspect current Fee Ledger fetch/search and Mark Paid implementation
- [x] Add fast cached session/trade reads and instant client-side search
- [x] Route Mark Paid to the Pay Fee form and preserve selected student context
- [x] Auto-open the receipt after a successful payment save
- [x] Improve backend retry/error handling without hiding real save failures
- [x] Add regression tests, run live Fee Ledger verification, and save a checkpoint


# Fee payment save acknowledgement and receipt fix
- [x] Inspect current POST redirect/response behavior and payment receipt handling
- [x] Make payment save acknowledgement resilient without retrying a possibly successful write
- [x] Verify the saved payment before showing success and generate the receipt from confirmed data
- [x] Add regression tests for saved-sheet/error-response and receipt generation behavior
- [x] Run full validation and save a checkpoint


# WhatsApp and marks save reliability
- [x] Inspect reminder mobile-number source and session/trade row mapping
- [x] Make reminders use the selected session/trade roster mobile field only
- [x] Inspect marks/attendance/report write response handling for HTTP 405 after successful saves
- [x] Reconcile successful writes and refresh report data quickly without duplicate requests
- [x] Add regression tests and run full validation/live probes before checkpoint


# Confirmed duplicate fee-entry repair
- [x] Verify the exact third ₹10,000 history entry and invoice for 2025-27 Fitter Roll 1
- [x] Prepare a narrowly scoped repair that preserves the ₹2,000 and ₹28,000 installments
- [x] Apply the confirmed repair without touching other students or payments
- [x] Re-read the live record and verify Paid ₹30,000, Balance ₹0, and two history entries
- [x] Save a repair checkpoint


# New deployment duplicate-repair verification
- [x] Configure the portal repair target to the newly supplied Apps Script URL
- [x] Verify the exact Roll 1 duplicate history and repair action on the new deployment
- [x] Apply one exact repair request only if the action is available
- [x] Verify Paid ₹30,000, Balance ₹0, and two history entries
- [x] Save the repair checkpoint


# Newest final deployment verification
- [x] Configure the portal to the newest Apps Script deployment URL
- [x] Verify direct JSON for roster, Fee, Job Evolution, Marks, Attendance, Reports, Staff, and Notices
- [x] Confirm the exact duplicate repair action is available before any write
- [x] Apply only the exact confirmed ₹10,000 duplicate repair
- [x] Re-read totals and save final checkpoint


# Final Quarterly deployment verification
- [x] Configure the portal to the newest Quarterly-capable Apps Script deployment
- [x] Verify Quarterly Marks returns JSON and actual rows
- [x] Recheck all remaining live module endpoints
- [x] Run final validation and save the final checkpoint


# Requested live-flow verification
- [x] Verify fee payment save acknowledgement and receipt generation without creating a new payment
- [x] Verify WhatsApp reminder uses the selected session/trade sheet mobile number
- [x] Verify marks save reconciliation and response latency without creating a new marks record
- [x] Report exact pass/fail status and any mutation test limitation


# Student Study Material and Mock Tests
- [x] Inspect Student area, existing Study Material data, upload/storage, and role access
- [x] Connect student-wise Study Material to the live backend flow
- [x] Add PDF-based Mock Test creation and online attempt UI
- [x] Add automatic scoring, result display, and attempt history
- [x] Add tests for student access, scoring, and material/test contracts
- [x] Save a feature checkpoint


# Student Learning Hub follow-up
- [x] Fix PDF Mock Test question-block parsing without losing line boundaries
- [x] Parse explicit Answer/Ans keys from uploaded PDF text
- [x] Calculate instant mock-test score and percentage from parsed answer keys
- [x] Add deterministic tests for parser, scoring, and session/trade/roll Study Material filtering
- [x] Run TypeScript validation and production build after the parser fix
- [x] Audit public landing-page visual integration in the live preview
- [ ] Perform an authenticated Student Learning Hub walkthrough with a real student login and live Study Material rows
- [ ] Perform a manual PDF upload walkthrough with a representative answer-key PDF


# QUESTION BANK Study Material source update
- [x] Map Student Study Material reads to the Google Sheets `QUESTION BANK` tab
- [x] Preserve session, trade, unit, and student-visibility filtering for QUESTION BANK rows
- [x] Add regression coverage for the QUESTION BANK tab contract and fallback behavior
- [x] Validate the updated Student Learning Hub with type checks and production build
