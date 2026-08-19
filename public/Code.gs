/**
 * JYOTI ITC PORTAL — Google Apps Script backend
 *
 * Install this script from Extensions → Apps Script inside the JYOTIPORTAL
 * workbook, or set SPREADSHEET_ID below when using a standalone script.
 *
 * Required STAFF_DB headers after setup:
 * ID | PASS | TRADE | NAME | UNIT
 */

const CONFIG = {
  SPREADSHEET_ID: '', // Leave blank when this script is bound to the workbook.
  STAFF_SHEET: 'STAFF_DB',
  NOTICES_SHEET: 'NOTICES',
  FEE_SHEET: 'FEE_LEDGER',
  FEE_SHEET_ALIASES: ['FEE_LEDGER', 'FEE LEDGER', 'FEES', 'FEE'],
  ADMISSION_SHEET_ALIASES: ['ADMISSION ENQUIRIES', 'ADMISSION ENQUIRY', 'ADMISSION_ENQUIRIES', 'ENQUIRIES'],
  WRITE_TOKEN_PROPERTY: 'PORTAL_WRITE_TOKEN',
};

function getWorkbook_() {
  if (CONFIG.SPREADSHEET_ID) return SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const workbook = SpreadsheetApp.getActiveSpreadsheet();
  if (!workbook) throw new Error('No workbook found. Bind this script to JYOTIPORTAL.xlsx or set SPREADSHEET_ID.');
  return workbook;
}

function json_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function error_(message, status) {
  return json_({ status: status || 'error', message: String(message) });
}

function params_(event) {
  return (event && event.parameter) || {};
}

function asText_(value) {
  return value === null || value === undefined ? '' : String(value).trim();
}

function normalize_(value) {
  return asText_(value).replace(/\s+/g, '').toUpperCase();
}

function sheet_(name) {
  const sheet = getWorkbook_().getSheetByName(name);
  if (!sheet) throw new Error('Sheet not found: ' + name);
  return sheet;
}

function firstExistingSheet_(names) {
  const workbook = getWorkbook_();
  for (var i = 0; i < names.length; i++) {
    var candidate = workbook.getSheetByName(names[i]);
    if (candidate) return candidate;
  }
  throw new Error('None of these sheets were found: ' + names.join(', '));
}

function feeSheet_() { return firstExistingSheet_(CONFIG.FEE_SHEET_ALIASES); }
function admissionSheet_() { return firstExistingSheet_(CONFIG.ADMISSION_SHEET_ALIASES); }

function displayRows_(name) {
  const target = sheet_(name);
  const range = target.getDataRange();
  if (!range || range.getNumRows() === 0) return [];
  return range.getDisplayValues();
}

function headerMap_(headers) {
  const map = {};
  headers.forEach(function (header, index) {
    map[normalize_(header)] = index;
  });
  return map;
}

function findHeader_(map, names, fallback) {
  for (var i = 0; i < names.length; i++) {
    if (map[names[i]] !== undefined) return map[names[i]];
  }
  return fallback;
}

function writeToken_() {
  return PropertiesService.getScriptProperties().getProperty(CONFIG.WRITE_TOKEN_PROPERTY) || '';
}

function authorizeWrite_(payload) {
  const configured = writeToken_();
  if (configured && asText_(payload.token) !== configured) {
    throw new Error('Invalid write token');
  }
}

function doGet(event) {
  try {
    const params = params_(event);
    const action = asText_(params.action);
    if (action === 'get_notices') return json_(getNotices_());
    if (action === 'get_sheet_data') return json_(displayRows_(asText_(params.sheet_name)));
    if (action === 'get_staff_list') return json_(getStaffList_());
    if (action === 'staff_login') return json_(staffLogin_(params.id, params.pass));
    if (action === 'get_question_bank') return json_(displayRows_('QUESTION BANK'));
    if (action === 'get_fee_student') return json_(getFeeStudent_(params));
    return error_('Invalid Action', 'error');
  } catch (err) {
    return error_(err.message || err, 'error');
  }
}

function doPost(event) {
  try {
    const payload = JSON.parse((event && event.postData && event.postData.contents) || '{}');
    authorizeWrite_(payload);
    const type = asText_(payload.type);
    if (type === 'admission_enquiry') return json_(createAdmissionEnquiry_(payload));
    if (type === 'attendance') {
      validateAttendanceEntries_(payload);
      return json_(appendRows_('ATTENDANCE', payload.entries, 6));
    }
    if (type === 'monthly_marks') return json_(appendRows_('MONTHLY MARKS', payload.entries, 13));
    if (type === 'quarterly_marks') return json_(appendRows_('QUARTERLY MARKS', payload.entries, 13));
    if (type === 'job_marks') return json_(appendRows_('JOB EVOLUTION', payload.entries, 13));
    if (type === 'notice') return json_(publishNotice_(payload));
    if (type === 'create_staff') return json_(createStaff_(payload));
    if (type === 'update_staff_unit') return json_(updateStaffUnit_(payload));
    if (type === 'delete_staff') return json_(deleteStaff_(payload));
    if (type === 'record_fee_payment') return json_(recordFeePayment_(payload));
    return error_('Invalid write type', 'error');
  } catch (err) {
    return error_(err.message || err, 'error');
  }
}

function getFeeStudent_(params) {
  const registrationNo = normalize_(params.registration_no || params.registrationNo || params.registration);
  const name = normalize_(params.name || params.student_name || params.studentName);
  const requestedSession = normalize_(params.session);
  const requestedTrade = normalize_(params.trade);
  if (!registrationNo && !name) throw new Error('Registration number or student name is required');
  const rows = feeSheet_().getDataRange().getDisplayValues();
  if (rows.length < 2) return { student: null, payments: [], totals: { admissionFee: 0, paid: 0, balance: 0, status: 'UNPAID' } };
  const map = headerMap_(rows[0]);
  const regIndex = findHeader_(map, ['REGISTRATIONNO', 'REGNO', 'REGISTRATIONNUMBER'], 2);
  const nameIndex = findHeader_(map, ['STUDENTNAME', 'NAME'], 3);
  const admissionIndex = findHeader_(map, ['ADMISSIONFEE', 'TOTALFEE'], 6);
  const paymentIndex = findHeader_(map, ['PAYMENTAMOUNT', 'PAID'], 7);
  const balanceIndex = findHeader_(map, ['BALANCE', 'REMAINING'], 9);
  const statusIndex = findHeader_(map, ['PAYMENTSTATUS', 'STATUS'], 10);
  const mediatorIndex = findHeader_(map, ['MEDIATOR', 'AGENT'], 13);
  const mediatorPaidIndex = findHeader_(map, ['MEDIATORPAID', 'AGENTPAID'], 14);
  const sessionIndex = findHeader_(map, ['SESSION', 'BATCH'], 5);
  const tradeIndex = findHeader_(map, ['TRADE'], 4);
  const matches = rows.slice(1).filter(function (row) {
    var identityMatch = (registrationNo && normalize_(row[regIndex]) === registrationNo) || (!registrationNo && normalize_(row[nameIndex]) === name);
    if (!identityMatch) return false;
    var rowSession = normalize_(row[sessionIndex]);
    var rowTrade = normalize_(row[tradeIndex]);
    var sessionMatch = !requestedSession || !rowSession || rowSession === requestedSession;
    var tradeMatch = !requestedTrade || !rowTrade || rowTrade === requestedTrade || rowTrade.indexOf(requestedSession + requestedTrade) >= 0 || rowTrade.indexOf(requestedTrade) >= 0;
    return sessionMatch && tradeMatch;
  });
  if (!matches.length) return { student: null, payments: [], totals: { admissionFee: 0, paid: 0, balance: 0, status: 'UNPAID' } };
  const last = matches[matches.length - 1];
  const admissionFee = Number(last[admissionIndex] || 0);
  const paid = matches.reduce(function (sum, row) { return sum + Number(row[paymentIndex] || 0); }, 0);
  const mediatorPaid = matches.reduce(function (sum, row) { return sum + Number(row[mediatorPaidIndex] || 0); }, 0);
  const balance = Math.max(0, admissionFee - paid);
  return {
    student: { registrationNo: asText_(last[regIndex]), name: asText_(last[nameIndex]) },
    payments: matches,
    mediator: asText_(last[mediatorIndex]),
    totals: { admissionFee: admissionFee, paid: paid, balance: balance, mediatorPaid: mediatorPaid, status: balance === 0 ? 'FULLY PAID' : (paid > 0 ? 'PARTIALLY PAID' : 'UNPAID'), lastStatus: asText_(last[statusIndex]) },
  };
}

function createAdmissionEnquiry_(payload) {
  var applicantName = asText_(payload.applicant_name || payload.applicantName);
  var phone = asText_(payload.phone);
  var email = asText_(payload.email);
  var trade = asText_(payload.trade);
  var qualification = asText_(payload.qualification);
  var message = asText_(payload.message);
  if (!applicantName || !phone || !trade) throw new Error('Applicant name, phone, and trade are required');
  var target = admissionSheet_();
  var headers = target.getDataRange().getDisplayValues()[0] || [];
  var row = [new Date(), applicantName, phone, email, trade, qualification, message, 'NEW'];
  if (headers.length >= row.length) {
    while (row.length < headers.length) row.push('');
    target.getRange(target.getLastRow() + 1, 1, 1, headers.length).setValues([row]);
  } else {
    target.appendRow(row);
  }
  return { status: 'success', message: 'Admission enquiry saved to Google Sheets', rowsAdded: 1 };
}

function recordFeePayment_(payload) {
  const registrationNo = asText_(payload.registration_no);
  const name = asText_(payload.student_name);
  const trade = asText_(payload.trade);
  const session = asText_(payload.session);
  const paymentAmount = Number(payload.payment_amount || 0);
  const mediator = asText_(payload.mediator);
  const mediatorPaid = Number(payload.mediator_paid || 0);
  if (!registrationNo || !name || !paymentAmount || paymentAmount <= 0) throw new Error('Registration number, student name, and a positive payment amount are required');
  if (mediatorPaid < 0) throw new Error('Mediator paid amount cannot be negative');
  const existing = getFeeStudent_({ registration_no: registrationNo, session: session, trade: trade });
  const admissionFee = Number(payload.admission_fee || existing.totals.admissionFee || 0);
  if (!admissionFee || admissionFee <= 0) throw new Error('Admission fee is required for the first payment');
  if (paymentAmount > admissionFee - existing.totals.paid) throw new Error('Payment cannot exceed the outstanding balance');
  const totalPaid = existing.totals.paid + paymentAmount;
  const balance = Math.max(0, admissionFee - totalPaid);
  const status = balance === 0 ? 'FULLY PAID' : 'PARTIALLY PAID';
  const invoiceNo = nextInvoiceNumber_();
  const target = feeSheet_();
  target.appendRow([invoiceNo, new Date(), registrationNo, name, trade, session, admissionFee, paymentAmount, totalPaid, balance, status, asText_(payload.payment_mode) || 'CASH', asText_(payload.remarks), mediator, mediatorPaid]);
  return { status: 'success', invoiceNo: invoiceNo, registrationNo: registrationNo, studentName: name, admissionFee: admissionFee, paymentAmount: paymentAmount, totalPaid: totalPaid, balance: balance, mediator: mediator, mediatorPaid: mediatorPaid, totalMediatorPaid: existing.totals.mediatorPaid + mediatorPaid, paymentStatus: status, fullyPaid: balance === 0 };
}

function nextInvoiceNumber_() {
  const rows = feeSheet_().getDataRange().getDisplayValues();
  const prefix = 'JYOTI-' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd') + '-';
  const count = rows.slice(1).filter(function (row) { return asText_(row[0]).indexOf(prefix) === 0; }).length + 1;
  return prefix + ('000' + count).slice(-4);
}

function getNotices_() {
  const rows = displayRows_(CONFIG.NOTICES_SHEET);
  if (rows.length < 2) return [];
  return rows.slice(1).filter(function (row) {
    return row.some(function (cell) { return asText_(cell) !== ''; });
  }).map(function (row) {
    return { date: asText_(row[0]), type: asText_(row[1]) || 'INFO', content: asText_(row[2]) };
  }).filter(function (notice) { return notice.content; }).reverse();
}

function getStaffList_() {
  const rows = displayRows_(CONFIG.STAFF_SHEET);
  if (rows.length < 2) return [];
  const map = headerMap_(rows[0]);
  const idIndex = findHeader_(map, ['ID', 'USERNAME'], 0);
  const passIndex = findHeader_(map, ['PASS', 'PASSWORD'], 1);
  const tradeIndex = findHeader_(map, ['TRADE'], 2);
  const nameIndex = findHeader_(map, ['NAME', 'FULLNAME'], 3);
  const unitIndex = findHeader_(map, ['UNIT', 'UNITNO', 'ASSIGNEDUNIT'], 4);
  return rows.slice(1).filter(function (row) { return asText_(row[idIndex]) !== ''; }).map(function (row) {
    return {
      username: asText_(row[idIndex]),
      password: '****',
      trade: asText_(row[tradeIndex]),
      name: asText_(row[nameIndex]),
      unit: asText_(row[unitIndex]),
    };
  });
}

function staffLogin_(username, password) {
  const rows = displayRows_(CONFIG.STAFF_SHEET);
  if (rows.length < 2) return { status: 'error', message: 'No staff records found' };
  const map = headerMap_(rows[0]);
  const idIndex = findHeader_(map, ['ID', 'USERNAME'], 0);
  const passIndex = findHeader_(map, ['PASS', 'PASSWORD'], 1);
  const tradeIndex = findHeader_(map, ['TRADE'], 2);
  const nameIndex = findHeader_(map, ['NAME', 'FULLNAME'], 3);
  const unitIndex = findHeader_(map, ['UNIT', 'UNITNO', 'ASSIGNEDUNIT'], 4);
  const record = rows.slice(1).find(function (row) {
    return asText_(row[idIndex]) === asText_(username) && asText_(row[passIndex]) === asText_(password);
  });
  if (!record) return { status: 'error', message: 'Invalid Staff Credentials' };
  return { status: 'success', username: asText_(record[idIndex]), name: asText_(record[nameIndex]), trade: asText_(record[tradeIndex]), unit: asText_(record[unitIndex]) };
}

function validateAttendanceEntries_(payload) {
  if (!Array.isArray(payload.entries) || payload.entries.length === 0) throw new Error('No attendance entries supplied');
  const actorRole = asText_(payload.actor_role).toLowerCase();
  if (actorRole === 'admin') return;

  const username = asText_(payload.staff_username);
  if (!username) throw new Error('Staff username is required for attendance writes');
  const staff = findStaffRecord_(username);
  if (!staff) throw new Error('Staff account not found');
  if (!staff.unit) throw new Error('No unit is assigned to this staff account');
  if (payload.entries.length > 20) throw new Error('A staff member can mark attendance for a maximum of 20 students per unit');

  const units = payload.entries.map(function (entry) { return asText_(entry[4]); });
  if (units.some(function (unit) { return unit !== staff.unit; })) throw new Error('Staff can mark attendance only for the assigned unit');
  if (new Set(units).size !== 1) throw new Error('Attendance batch must contain one unit only');
}

function findStaffRecord_(username) {
  const rows = displayRows_(CONFIG.STAFF_SHEET);
  if (rows.length < 2) return null;
  const map = headerMap_(rows[0]);
  const idIndex = findHeader_(map, ['ID', 'USERNAME'], 0);
  const passIndex = findHeader_(map, ['PASS', 'PASSWORD'], 1);
  const tradeIndex = findHeader_(map, ['TRADE'], 2);
  const nameIndex = findHeader_(map, ['NAME', 'FULLNAME'], 3);
  const unitIndex = findHeader_(map, ['UNIT', 'UNITNO', 'ASSIGNEDUNIT'], 4);
  const row = rows.slice(1).find(function (candidate) { return asText_(candidate[idIndex]) === username; });
  if (!row) return null;
  return { username: asText_(row[idIndex]), password: asText_(row[passIndex]), trade: asText_(row[tradeIndex]), name: asText_(row[nameIndex]), unit: asText_(row[unitIndex]) };
}

function appendRows_(sheetName, entries, expectedColumns) {
  if (!Array.isArray(entries) || entries.length === 0) throw new Error('No entries supplied');
  const normalized = entries.map(function (entry) {
    if (!Array.isArray(entry) || entry.length < expectedColumns) throw new Error('Invalid row for ' + sheetName);
    return entry.slice(0, expectedColumns);
  });
  const target = sheet_(sheetName);
  target.getRange(target.getLastRow() + 1, 1, normalized.length, expectedColumns).setValues(normalized);
  return { status: 'success', sheet: sheetName, rowsAdded: normalized.length };
}

function publishNotice_(payload) {
  const title = asText_(payload.title);
  const content = asText_(payload.content);
  if (!content) throw new Error('Notice content is required');
  const target = sheet_(CONFIG.NOTICES_SHEET);
  target.appendRow([new Date(), title || 'ADMIN', content]);
  return { status: 'success', message: 'Notice published' };
}

function createStaff_(payload) {
  const username = asText_(payload.username);
  const password = asText_(payload.password);
  const trade = asText_(payload.trade);
  const name = asText_(payload.name);
  const unit = asText_(payload.unit);
  if (!username || !password || !trade || !name || !unit) throw new Error('Username, password, trade, name, and unit are required');
  const target = sheet_(CONFIG.STAFF_SHEET);
  const rows = displayRows_(CONFIG.STAFF_SHEET);
  const map = headerMap_(rows[0] || []);
  const idIndex = findHeader_(map, ['ID', 'USERNAME'], 0);
  if (rows.slice(1).some(function (row) { return asText_(row[idIndex]) === username; })) throw new Error('Username already exists');
  ensureStaffUnitColumn_(target, rows[0] || []);
  target.appendRow([username, password, trade, name, unit]);
  return { status: 'success', message: 'Staff created', username: username, unit: unit };
}

function ensureStaffUnitColumn_(target, headers) {
  const normalized = headers.map(normalize_);
  if (normalized.indexOf('UNIT') === -1) {
    target.getRange(1, target.getLastColumn() + 1).setValue('UNIT');
  }
}

function updateStaffUnit_(payload) {
  const username = asText_(payload.username);
  const unit = asText_(payload.unit);
  if (!username || !unit) throw new Error('Username and unit are required');
  const target = sheet_(CONFIG.STAFF_SHEET);
  const rows = displayRows_(CONFIG.STAFF_SHEET);
  ensureStaffUnitColumn_(target, rows[0] || []);
  const freshRows = displayRows_(CONFIG.STAFF_SHEET);
  const map = headerMap_(freshRows[0] || []);
  const idIndex = findHeader_(map, ['ID', 'USERNAME'], 0);
  const unitIndex = findHeader_(map, ['UNIT', 'UNITNO', 'ASSIGNEDUNIT'], 4);
  const rowIndex = freshRows.slice(1).findIndex(function (row) { return asText_(row[idIndex]) === username; });
  if (rowIndex < 0) throw new Error('Staff username not found');
  target.getRange(rowIndex + 2, unitIndex + 1).setValue(unit);
  return { status: 'success', message: 'Staff unit updated', username: username, unit: unit };
}

function deleteStaff_(payload) {
  const username = asText_(payload.username);
  if (!username) throw new Error('Username is required');
  const target = sheet_(CONFIG.STAFF_SHEET);
  const rows = displayRows_(CONFIG.STAFF_SHEET);
  const map = headerMap_(rows[0] || []);
  const idIndex = findHeader_(map, ['ID', 'USERNAME'], 0);
  const rowIndex = rows.slice(1).findIndex(function (row) { return asText_(row[idIndex]) === username; });
  if (rowIndex < 0) throw new Error('Staff username not found');
  target.deleteRow(rowIndex + 2);
  return { status: 'success', message: 'Staff deleted', username: username };
}
