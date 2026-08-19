# JYOTI ITC Portal — New Code.gs deployment

Use the attached `Code.gs` as the complete replacement source. In the Google Sheet, open **Extensions → Apps Script**, select the existing script content, delete it, paste the complete file, and save.

The script is designed for a bound spreadsheet. Leave `SPREADSHEET_ID` blank when Apps Script is opened from the correct JYOTIPORTAL workbook. If the script is standalone, put the spreadsheet ID into `SPREADSHEET_ID`.

The workbook should contain the portal tabs `STAFF_DB`, `NOTICES`, `ATTENDANCE`, `MONTHLY MARKS`, `QUARTERLY MARKS`, and `JOB EVOLUTION`. Student roster tabs are dynamic and must use the pattern `2025-27FITTER`, `2025-27ELECTRICIAN`, `2026-28FITTER`, `2026-28ELECTRICIAN`, and the same pattern for future sessions. Fee sheets are detected from `FEE_LEDGER`, `FEE LEDGER`, `FEES`, or `FEE`. Admission enquiry sheets are detected from `ADMISSION ENQUIRIES`, `ADMISSION ENQUIRY`, `ADMISSION_ENQUIRIES`, or `ENQUIRIES`.

For a new deployment, choose **Deploy → New deployment → Web app**. Set **Execute as: Me** and **Who has access: Anyone**, click Deploy, authorize if Google asks, and copy the URL ending in `/exec`. Replace the portal’s Apps Script URL with this new URL.

The replacement adds the missing `admission_enquiry` POST action, accepts both camelCase and snake_case fee lookup parameters, filters fee history by selected session/trade, preserves cumulative paid/balance/status calculations, and returns structured `{status:'error', message:'...'}` responses for invalid requests. Do not use the `/dev` URL in the portal; use the deployed `/exec` URL.

After deployment, first test these read URLs in a browser:

```text
?action=get_sheet_data&sheet_name=2026-28FITTER
?action=get_sheet_data&sheet_name=MONTHLY%20MARKS
?action=get_sheet_data&sheet_name=ATTENDANCE
?action=get_fee_student&registration_no=TEST-001&session=2025-27&trade=Fitter
```

Then test one portal write from the Admin UI and confirm the response is a JSON success object before using production records.


## Session-sheet Fee Ledger mode

The updated source uses the selected session-trade sheet first, such as `2025-27FITTER` or `2026-28ELECTRICIAN`. On lookup or payment, it adds these headers when missing: `Mobile No.`, `Admission Fee`, `Paid Amount`, `Balance`, `Mediator Name`, `Mediator Paid`, `Payment History`, and `Payment Status`.

Each payment updates the matching student row in place. `Paid Amount` increases by the new installment, `Balance` decreases from Admission Fee, and the row becomes `FULLY PAID` when the balance reaches zero. `Payment History` stores invoice number, ISO date/time, registration number, name, trade, session, admission fee, installment amount, cumulative paid, balance, and status. The portal uses this history to print all previous and current payments on the next receipt.

After pasting the updated source, create a new Web app deployment. The portal can continue using the configured `/exec` URL only after that deployment contains this updated code.


## Exact existing session-sheet format verified live

The available `2025-27FITTER`, `2025-27ELECTRICIAN`, and `2026-28FITTER` tabs currently have exactly these first four headers and they must remain unchanged:

| Column | Header | What to enter |
|---|---|---|
| A | `ROLL NO` | Existing student roll number |
| B | `NAME` | Existing student name |
| C | `TRADE` | `Fitter` or `Electrician` |
| D | `UNIT` | Existing unit number |

For the new session-sheet fee mode, append these columns starting at E. The replacement Code.gs also creates them automatically if they are missing, so you do not need to manually add them before deployment:

| Column | Header | What is stored |
|---|---|---|
| E | `Mobile No.` | Student WhatsApp/mobile number |
| F | `Admission Fee` | Total admission fee, for example `30000` |
| G | `Paid Amount` | Cumulative amount paid so far |
| H | `Balance` | Admission Fee minus Paid Amount |
| I | `Mediator Name` | Mediator record, hidden from receipts |
| J | `Mediator Paid` | Cumulative mediator-paid record, hidden from receipts |
| K | `Payment History` | Internal JSON history of every installment |
| L | `Payment Status` | `UNPAID`, `PARTIALLY PAID`, or `FULLY PAID` |

For an existing session tab, you may add only the headers E–L in row 1 and leave the new student cells blank; the portal/Code.gs will fill them during the first fee lookup or payment. For a future tab such as `2027-29FITTER`, first create the sheet with A–D exactly as above and add student rows. The Code.gs will append or detect E–L automatically.


## Sessions through 2030-32

No session allowlist is used. A selected session such as `2025-27`, `2026-28`, `2027-29`, `2028-30`, `2029-31`, or `2030-32` is combined with the selected trade and matched against the normalized sheet name, such as `2030-32FITTER` or `2030-32ELECTRICIAN`. Future session tabs follow the same pattern automatically.

When `record_fee_payment` runs, it reads the current row values, calculates `newPaid = oldPaid + paymentAmount`, calculates `newBalance = admissionFee - newPaid`, rejects an amount larger than the current balance, and writes the updated values back to the same row. It appends a Payment History entry containing an ISO date-time, invoice number, installment amount, cumulative paid amount, remaining balance, session, trade, roll/registration number, and payment status.
