import { useEffect, useMemo, useState } from "react";
import { Download, FileDown, FileText, Loader2, Printer, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { buildPrintDocumentHtml } from "@shared/printDocument";
import { filterReportRows, filterRosterRows, filterRowsByRoster } from "@shared/reportFilters";
import { buildReportCsv, buildReportPrintBody } from "@shared/reportExport";
import { buildBulkMarkEntries, validateBulkMarkScores, SCORE_FIELDS, SCORE_LIMITS, getBulkMarkTotal, clampBulkMarkValue, MARK_MONTHS, MARK_YEARS, QUARTERS, JOB_WEEKS, SESSIONS, type BulkMarkScores } from "@shared/bulkMarks";
import { buildAdminFilterSnapshot, isAdminFilterReady } from "@shared/adminFilterSnapshot";
import { buildReportTableModel, normalizeReportResponse, normalizeReportMatrix, preserveLoadedReportRows, reportHeadersFor } from "@shared/reportState";
import { filterReportTableRows, summarizeReportRows } from "@shared/reportSummary";
import { marksReportFiltersForSheet } from "@shared/marksReportFilters";
import { friendlyPortalError } from "@shared/portalErrors";
import type { AdminNotificationState } from "@/components/AdminNotification";
import { buildExperienceCertificateText, CERTIFICATE_DESIGNATIONS, type ExperiencePeriod } from "@shared/certificate";
import { buildElectricianProgressCardMarkup, buildProgressCardMarkup, buildProgressBatchMarkup } from "@shared/progressCard";
import { ELECTRICIAN_EXERCISES } from "@shared/electricianExercises";
import { FITTER_EXERCISES } from "@shared/fitterExercises";
import { ProgressCardEditor } from "@/components/ProgressCardEditor";

type Trade = "Fitter" | "Electrician";
type Filters = { roll: string; session: string; trade: string; unit: string; date: string; month: string; quarter: string; week: string; year: string };

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="space-y-2 text-xs font-bold uppercase tracking-wider text-[#16283f]/55"><span className="block">{label}</span>{children}</label>;
}

function FetchProgress({ label }: { label: string }) {
  return <div role="status" aria-live="polite" className="rounded-xl border border-[#d4ad32]/30 bg-[#fffaf0] p-4"><div className="flex items-center gap-3 text-sm font-bold text-[#77551d]"><Loader2 className="size-5 animate-spin" />{label}</div><div className="mt-3 h-2 overflow-hidden rounded-full bg-[#d4ad32]/20"><div className="h-full w-1/2 animate-[pulse_1.2s_ease-in-out_infinite] rounded-full bg-[#d4ad32]" /></div><p className="mt-2 text-[11px] font-semibold text-[#77551d]/70">Reading the selected students and live records. Please keep this page open.</p></div>;
}

function printDocument(title: string, body: string, autoPrint = false, landscape = false, options: { letterhead?: boolean; progressCard?: boolean; topBlankMm?: number; progressLeftMarginMm?: number; autoPrint?: boolean } = {}) {
  const popup = window.open("about:blank", "_blank");
  if (!popup) { window.alert("Please allow pop-ups for JYOTI ITC to print this document."); return; }
  const html = buildPrintDocumentHtml(title, body, { landscape, ...options });
  popup.document.open(); popup.document.write(html); popup.document.close(); popup.focus();
  if (autoPrint) window.setTimeout(() => popup.print(), 350);
}

function downloadCsv(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export default function AdminRecords({ mode = "records", onNotify }: { mode?: string; onNotify?: (notification: AdminNotificationState) => void }) {
  const marksMode = mode === "monthlyMarks" ? "monthly_marks" : mode === "quarterlyMarks" ? "quarterly_marks" : mode === "jobEvolution" ? "job_marks" : null;
  const marksLabel = mode === "monthlyMarks" ? "Monthly Marks" : mode === "quarterlyMarks" ? "Quarterly Marks" : mode === "jobEvolution" ? "Job Evolution" : "Marks Entry";
  const scoreFields = SCORE_FIELDS[marksMode || "monthly_marks"];
  const showMarks = Boolean(marksMode);
  const showReports = mode === "attendanceReport" || mode === "monthlyReport" || mode === "quarterlyReport" || mode === "jobReport";
  const showProgress = mode === "progress" || mode === "fitterCard" || mode === "electricianCard";
  const fixedProgressTrade: Trade | null = mode === "fitterCard" ? "Fitter" : mode === "electricianCard" ? "Electrician" : null;
  const showCertificate = mode === "certificate";

  const fixedReportSheet = mode === "attendanceReport" ? "ATTENDANCE" : mode === "monthlyReport" ? "MONTHLY MARKS" : mode === "quarterlyReport" ? "QUARTERLY MARKS" : mode === "jobReport" ? "JOB EVOLUTION" : null;
  const [record, setRecord] = useState({ kind: "monthly_marks", date: "", roll: "", name: "", trade: "Fitter" as Trade, session: "", unit: "", label: "January", year: "1st Year", score: "" });
  const [studentUnit, setStudentUnit] = useState("");
  const [bulkScores, setBulkScores] = useState<BulkMarkScores>({});
  const [report, setReport] = useState({ sheetName: fixedReportSheet || "ATTENDANCE", filters: { roll: "", session: "", trade: "Fitter", unit: "", date: "", month: "", quarter: "", week: "", year: "" } as Filters });
  const [reportRows, setReportRows] = useState<any[][]>([]);
  const [reportHeaders, setReportHeaders] = useState<string[]>([]);
  const [reportSearch, setReportSearch] = useState("");
  const [loadedRosterRows, setLoadedRosterRows] = useState<any[][]>([]);
  const [reportRosterRows, setReportRosterRows] = useState<any[][]>([]);
  const [studentsLoaded, setStudentsLoaded] = useState(false);
  const [progressInput, setProgressInput] = useState({ session: "", trade: "Fitter" as Trade, roll: "" });
  const [progressData, setProgressData] = useState<any>(null);
  const [progressExerciseSign, setProgressExerciseSign] = useState("");
  const [progressDrawingSign, setProgressDrawingSign] = useState("");
  const [progressMathSign, setProgressMathSign] = useState("");
  const [progressGisSign, setProgressGisSign] = useState("");
  const [progressManual, setProgressManual] = useState({ admissionDate: "", leavingDate: "", qualification: "", grading: "", remarks: "" });
  const [progressRowEdits, setProgressRowEdits] = useState<Record<string, { grading?: string; remarks?: string }>>({});
  const [progressLeftMarginMm, setProgressLeftMarginMm] = useState("35.56");
  const [progressBatchSelected, setProgressBatchSelected] = useState<string[]>([]);
  const [certificateForm, setCertificateForm] = useState({ teacherName: "", fatherName: "", designation: "Instructor (Fitter)", trade: "Fitter" });
  const [certificatePeriods, setCertificatePeriods] = useState<ExperiencePeriod[]>([{ from: "", to: "" }]);
  const [certificateData, setCertificateData] = useState<ReturnType<typeof buildExperienceCertificateText> | null>(null);
  const [certificateTopMargin, setCertificateTopMargin] = useState("38");
  const [certificateEmail, setCertificateEmail] = useState("");
  const [status, setStatus] = useState({ tone: "", message: "" });
  const write = trpc.portal.write.useMutation();
  const utils = trpc.useUtils();
  const reportQuery = trpc.portal.sheetData.useQuery({ sheetName: report.sheetName }, { enabled: false, retry: false, staleTime: 120000, gcTime: 300000 });
  const rosterSession = report.filters.session || record.session;
  const rosterTrade = (report.filters.trade || record.trade) === "Electrician" ? "Electrician" : "Fitter";
  const rosterQuery = trpc.portal.studentRoster.useQuery({ session: rosterSession, trade: rosterTrade }, { enabled: false, retry: false, staleTime: 120000, gcTime: 300000 });
  const rosterUnit = mode.endsWith("Report") || mode === "records" ? report.filters.unit : studentUnit;
  const rosterRows = filterRosterRows(loadedRosterRows, rosterUnit, rosterSession, { sourceScoped: true });
  const rosterRolls = new Set(rosterRows.map((row: any[]) => String(row[0] || "")).filter(Boolean));
  const studentQuery = trpc.portal.studentLogin.useQuery(progressInput, { enabled: false, retry: false });
  const staffList = trpc.portal.staffList.useQuery();
  useEffect(() => {
    if (!status.message || !onNotify) return;
    onNotify({ tone: status.tone === "error" ? "error" : status.tone === "success" ? "success" : status.tone === "empty" ? "info" : "loading", message: status.message });
  }, [status, onNotify]);
  useEffect(() => {
    if (fixedReportSheet && report.sheetName !== fixedReportSheet) setReport((current) => ({ ...current, sheetName: fixedReportSheet }));
    const selectedKind = mode === "quarterlyMarks" ? "quarterly_marks" : mode === "jobEvolution" ? "job_marks" : mode === "monthlyMarks" ? "monthly_marks" : null;
    if (selectedKind && record.kind !== selectedKind) setRecord((current) => ({ ...current, kind: selectedKind }));
    if (fixedProgressTrade && progressInput.trade !== fixedProgressTrade) setProgressInput((current) => ({ ...current, trade: fixedProgressTrade }));
  }, [fixedProgressTrade, fixedReportSheet, mode, report.sheetName, record.kind, progressInput.trade]);

  useEffect(() => {
    setLoadedRosterRows([]);
    setReportRosterRows([]);
    setStudentsLoaded(false);
    setReportRows([]);
    setReportHeaders([]);
    setReportSearch("");
    setBulkScores({});
  }, [rosterSession, rosterTrade, rosterUnit, mode, report.filters.month, report.filters.quarter, report.filters.week, report.filters.date]);

  async function loadMarkStudent() {
    try { setStatus({ tone: "", message: "Finding student record…" }); setProgressInput({ session: record.session, trade: record.trade, roll: record.roll }); const result = await utils.portal.studentLogin.fetch({ session: record.session, trade: record.trade, roll: record.roll }); if (!result) throw new Error("Student was not found for this session, trade, and roll number."); setRecord({ ...record, name: result.student.name, unit: result.student.unit || record.unit }); setStatus({ tone: "success", message: `Loaded ${result.student.name}; marks will be saved against roll ${record.roll}.` }); }
    catch (error) { setStatus({ tone: "error", message: friendlyPortalError(error, "Student lookup failed.") }); }
  }

  const bulkStudents = useMemo(() => rosterRows.map((row: any[]) => ({ roll: String(row[0] || ""), name: String(row[1] || ""), unit: String(row[3] || studentUnit) })).filter((student) => student.roll), [rosterRows, studentUnit]);

  async function loadStudents(selected?: { session?: string; trade?: string; unit?: string }): Promise<any[][]> {
    const filterSnapshot = buildAdminFilterSnapshot({ session: selected?.session ?? rosterSession, trade: selected?.trade ?? rosterTrade, unit: selected?.unit ?? rosterUnit });
    if (!isAdminFilterReady(filterSnapshot)) {
      setLoadedRosterRows([]);
      setStudentsLoaded(false);
      setReportRows([]);
      setReportHeaders([]);
      setStatus({ tone: "error", message: "Select Session, Trade, and Unit before clicking Load Students." });
      return [];
    }
    try {
      setStatus({ tone: "", message: `Loading students for Session ${filterSnapshot.session}, ${filterSnapshot.trade}, Unit ${filterSnapshot.unit}…` });
      const result = await utils.portal.studentRoster.fetch({ session: filterSnapshot.session, trade: filterSnapshot.trade as Trade });
      const matrix = Array.isArray(result) ? result : Array.isArray((result as { rows?: unknown[][] } | undefined)?.rows) ? (result as { rows: unknown[][] }).rows : [];
      const rows = filterRosterRows(matrix, filterSnapshot.unit, filterSnapshot.session, { sourceScoped: Boolean((result as { sheetName?: string } | undefined)?.sheetName) });
      setLoadedRosterRows(rows);
      setStudentsLoaded(true);
      if (!rows.length) setStatus({ tone: "empty", message: "No students found for the selected Session, Trade, and Unit." });
      else setStatus({ tone: "success", message: `${rows.length} students loaded for the selected Session, Trade, and Unit.` });
      return rows;
    } catch (error) {
      setLoadedRosterRows([]);
      setStudentsLoaded(false);
      setStatus({ tone: "error", message: friendlyPortalError(error, "Student roster could not be loaded.") });
      return [];
    }
  }

  async function submitBulkMarks() {
    if (!marksMode || !bulkStudents.length) return;
    try {
      setStatus({ tone: "", message: `Uploading ${marksLabel.toLowerCase()} for ${bulkStudents.length} students…` });
      const invalidScores = validateBulkMarkScores(marksMode || "monthly_marks", bulkScores);
      if (invalidScores.length) {
        const first = invalidScores[0];
        throw new Error(`${first.field} cannot exceed ${first.limit} marks for roll ${first.roll}.`);
      }
      const entries = buildBulkMarkEntries(marksMode || "monthly_marks", bulkStudents, bulkScores, { trade: record.trade, session: record.session, year: record.year, date: record.date, label: record.label });
      if (!entries.length) throw new Error("Enter at least one score before uploading.");
      await write.mutateAsync({ type: marksMode, entries });
      void utils.portal.sheetData.invalidate({ sheetName: marksMode === "monthly_marks" ? "MONTHLY MARKS" : marksMode === "quarterly_marks" ? "QUARTERLY MARKS" : "JOB EVOLUTION" });
      setBulkScores({});
      setStatus({ tone: "success", message: `${entries.length} ${marksLabel.toLowerCase()} records uploaded.` });
    } catch (error) { setStatus({ tone: "error", message: friendlyPortalError(error, "Bulk marks upload failed.") }); }
  }

  async function submitRecord() {
    try {
      setStatus({ tone: "", message: "Saving academic record…" });
      const entries = record.kind === "job_marks" ? [[record.roll, record.name, record.session, record.trade, record.unit, record.year, record.label, Number(record.score)]] : [[record.date, record.roll, record.name, record.session, record.trade, record.unit, record.year, record.label, Number(record.score)]];
      await write.mutateAsync({ type: record.kind, entries });
      void utils.portal.sheetData.invalidate({ sheetName: record.kind === "monthly_marks" ? "MONTHLY MARKS" : record.kind === "quarterly_marks" ? "QUARTERLY MARKS" : "JOB EVOLUTION" });
      setStatus({ tone: "success", message: "Academic record saved successfully." });
      setRecord({ ...record, roll: "", name: "", score: "" });
    } catch (error) { setStatus({ tone: "error", message: friendlyPortalError(error, "Academic record could not be saved.") }); }
  }

  async function loadReport() {
    try {
      setStatus({ tone: "", message: "Loading report and selected students…" });
      const selectedRows = await loadStudents({ session: report.filters.session, trade: report.filters.trade, unit: report.filters.unit });
      if (!selectedRows.length) { setReportRosterRows([]); setReportRows([]); setReportHeaders([]); return; }
      setReportRosterRows(selectedRows);
      const selectedRolls = new Set(selectedRows.map((row: any[]) => String(row[0] || "")).filter(Boolean));
      const resultData = reportQuery.data ?? (await reportQuery.refetch()).data;
      const normalizedReport = normalizeReportResponse(resultData);
      const rows = normalizedReport.rows;
      setReportHeaders(reportHeadersFor(report.sheetName, normalizedReport.headers));
      const headerTokens = normalizedReport.headers.map((header) => String(header).trim().toLowerCase());
      const firstRowTokens = rows[0]?.map((cell) => String(cell ?? "").trim().toLowerCase()) || [];
      const reportMatrix = headerTokens.length && firstRowTokens.join("|") !== headerTokens.join("|") ? [normalizedReport.headers, ...rows] : rows;
      const reportFilters = marksReportFiltersForSheet(report.filters, report.sheetName);
      const baseFiltered = filterReportRows(reportMatrix, reportFilters, report.sheetName);
      let filtered = filterRowsByRoster(baseFiltered, report.sheetName, selectedRolls);
      // The redeployed workbook contains older rows whose Session, Unit, and Year
      // cells are blank. The selected roster is the authoritative scope for this
      // report, so retry period/trade filtering without those legacy-empty fields
      // rather than falling back to a names-only roster table.
      if (!filtered.length && baseFiltered.length) {
        const relaxedFilters = { ...reportFilters, session: "", unit: "", year: "" };
        const relaxed = filterReportRows(reportMatrix, relaxedFilters, report.sheetName);
        filtered = filterRowsByRoster(relaxed, report.sheetName, selectedRolls);
      }
      setReportRows(filtered);
      setStatus({ tone: filtered.length || selectedRows.length ? "success" : "empty", message: filtered.length ? `${filtered.length} matching report rows loaded.` : selectedRows.length ? `${selectedRows.length} students loaded; no report marks match the selected period yet.` : "No rows match the selected filters." });
    } catch (error) { setStatus({ tone: "error", message: friendlyPortalError(error, "Report could not be loaded.") }); }
  }



  async function loadProgressCard() {
    try { setStatus({ tone: "", message: "Loading student record…" }); const result = await utils.portal.studentLogin.fetch({ session: progressInput.session, trade: progressInput.trade, roll: progressInput.roll }); if (!result) throw new Error("Student record was not found for this session, trade, and roll number."); setProgressData(result); setStatus({ tone: "success", message: `Loaded ${result.student.name}'s complete academic record.` }); }
    catch (error) { setProgressData(null); setStatus({ tone: "error", message: friendlyPortalError(error, "Student record could not be loaded.") }); }
  }

  async function loadProgressBatch() {
    const rows = await loadStudents({ session: progressInput.session, trade: progressInput.trade, unit: studentUnit });
    setProgressBatchSelected(rows.map((row: any[]) => String(row[0] || "")).filter(Boolean));
  }

  function progressMarkup(result: any) {
    const trade = result?.student?.trade === "Electrician" ? "Electrician" : "Fitter";
    const exercises = trade === "Electrician" ? ELECTRICIAN_EXERCISES : FITTER_EXERCISES;
    return buildElectricianProgressCardMarkup(result, exercises, { exerciseSignUrl: progressExerciseSign, drawingSignUrl: progressDrawingSign, mathSignUrl: progressMathSign, gisSignUrl: progressGisSign, rowEdits: progressRowEdits, manual: progressManual });
  }

  async function exportProgressBatch() {
    if (!progressBatchSelected.length) return;
    try {
      setStatus({ tone: "", message: `Preparing ${progressBatchSelected.length} Progress Cards…` });
      const selected = new Set(progressBatchSelected);
      const rows = rosterRows.filter((row: any[]) => selected.has(String(row[0] || "")));
      const results = [];
      for (const row of rows) {
        const roll = String(row[0] || "").trim();
        if (!roll) continue;
        const result = await utils.portal.studentLogin.fetch({ session: progressInput.session, trade: progressInput.trade, roll });
        if (result) results.push(result);
      }
      if (!results.length) throw new Error("No selected student records could be loaded.");
      printDocument(`Progress Cards · ${progressInput.trade}`, buildProgressBatchMarkup(results.map(progressMarkup)), true, false, { progressCard: true, progressLeftMarginMm: Number(progressLeftMarginMm) || 35.56, autoPrint: true });
      setStatus({ tone: "success", message: `${results.length} Progress Cards prepared for batch print/PDF.` });
    } catch (error) { setStatus({ tone: "error", message: friendlyPortalError(error, "Batch Progress Card export failed.") }); }
  }

  function generateCertificate() {
    if (!certificateForm.teacherName.trim() || !certificateForm.fatherName.trim()) {
      setCertificateData(null);
      setStatus({ tone: "error", message: "Enter the teacher full name and father's name before generating the certificate." });
      return;
    }
    setCertificateData(buildExperienceCertificateText({ ...certificateForm, periods: certificatePeriods }));
    setStatus({ tone: "success", message: "Experience certificate text generated successfully." });
  }

  function printProgress() {
    if (!progressData) return;
    const student = progressData.student;
    printDocument(`Progress Card · ${student.trade}`, progressMarkup(progressData), true, false, { progressCard: true, progressLeftMarginMm: Number(progressLeftMarginMm) || 35.56, autoPrint: true });
  }

  function certificateBodyMarkup() {
    if (!certificateData) return "";
    return `<div class="certificate-copy"><h2>${certificateData.salutation}</h2>${certificateData.paragraphs.map((paragraph) => `<p>${paragraph}</p>`).join("")}<p class="certificate-signature">${certificateData.signature.replace("\\n", "<br>")}</p></div>`;
  }

  function printCertificate(preview = false) {
    if (!certificateData) return;
    printDocument(certificateData.title, certificateBodyMarkup(), !preview, false, { letterhead: true, topBlankMm: Number(certificateTopMargin) || 0, autoPrint: !preview });
  }

  function emailCertificate() {
    if (!certificateData || !certificateEmail.trim()) {
      setStatus({ tone: "error", message: "Generate the certificate and enter the staff email address before emailing." });
      return;
    }
    const subject = encodeURIComponent(certificateData.title);
    const body = encodeURIComponent(`${certificateData.salutation}\n\n${certificateData.paragraphs.join("\n\n")}\n\n${certificateData.signature}`);
    window.location.href = `mailto:${certificateEmail.trim()}?subject=${subject}&body=${body}`;
    setStatus({ tone: "success", message: "Your email application has been opened with the certificate text attached." });
  }

  const filterKeys: Array<keyof Filters> = ["session", "trade", "unit", ...(showReports && mode !== "attendanceReport" ? ["year" as keyof Filters] : []), ...(mode === "monthlyReport" ? ["month" as keyof Filters] : mode === "quarterlyReport" ? ["quarter" as keyof Filters] : mode === "jobReport" ? ["week" as keyof Filters] : ["date" as keyof Filters])];
  const loadedReportRows = showReports ? preserveLoadedReportRows(reportRows, reportRosterRows, studentsLoaded) : preserveLoadedReportRows(reportRows, loadedRosterRows, studentsLoaded);
  const reportModel = buildReportTableModel(report.sheetName, reportRows.length ? reportHeadersFor(report.sheetName, reportHeaders) : [], loadedReportRows, report.filters.session);
  const visibleReportRows = reportModel.rows;
  const reportTableHeaders = reportModel.headers;
  const searchedReportRows = filterReportTableRows(reportModel.rows, reportSearch);
  const reportSummary = summarizeReportRows(report.sheetName, searchedReportRows);
  const reportIsRosterFallback = showReports && !reportRows.length && reportRosterRows.length > 0;
  return <div className="mt-6 grid min-h-[calc(100vh-12rem)] w-full grid-cols-1 gap-6">
    {showMarks && (<Card className="rounded-lg border-[#16283f]/10 border-l-4 border-l-[#d4ad32] bg-white shadow-sm"><CardHeader><CardTitle className="flex items-center gap-2 font-serif text-2xl font-bold"><FileText size={20} /> {marksLabel}</CardTitle><p className="text-sm text-[#16283f]/60">Fixed {marksLabel} format from the institute workbook. Select session and unit to load every student together.</p></CardHeader><CardContent className="space-y-4"><div className="grid gap-3 sm:grid-cols-2"><Field label="Session"><select value={record.session} onChange={(e) => setRecord({ ...record, session: e.target.value })} className="h-10 w-full rounded-md border border-[#16283f]/15 bg-white px-3 text-sm">{SESSIONS.map((session) => <option key={session}>{session}</option>)}</select></Field><Field label="Trade"><select value={record.trade} onChange={(e) => setRecord({ ...record, trade: e.target.value as Trade })} className="h-10 w-full rounded-md border border-[#16283f]/15 bg-white px-3 text-sm"><option>Fitter</option><option>Electrician</option></select></Field><Field label="Year"><select value={record.year} onChange={(e) => setRecord({ ...record, year: e.target.value })} className="h-10 w-full rounded-md border border-[#16283f]/15 bg-white px-3 text-sm">{MARK_YEARS.map((year) => <option key={year}>{year}</option>)}</select></Field><Field label="Unit"><select value={studentUnit} onChange={(e) => setStudentUnit(e.target.value)} className="h-10 w-full rounded-md border border-[#16283f]/15 bg-white px-3 text-sm"><option value="1">Unit 1</option><option value="2">Unit 2</option></select></Field>{marksMode !== "job_marks" && <Field label="Date"><Input type="date" value={record.date} onChange={(e) => setRecord({ ...record, date: e.target.value })} /></Field>}<Field label={marksMode === "job_marks" ? "Week No" : mode === "quarterlyMarks" ? "Quarterly No" : "Month Name"}><select value={record.label} onChange={(e) => setRecord({ ...record, label: e.target.value })} className="h-10 w-full rounded-md border border-[#16283f]/15 bg-white px-3 text-sm">{(marksMode === "job_marks" ? JOB_WEEKS : mode === "quarterlyMarks" ? QUARTERS : MARK_MONTHS).map((label) => <option key={label}>{label}</option>)}</select></Field></div><div className="flex flex-wrap items-center gap-3"><Button type="button" onClick={() => void loadStudents({ session: record.session, trade: record.trade, unit: studentUnit })} disabled={rosterQuery.isFetching} className="rounded-full bg-[#16283f] text-white">{rosterQuery.isFetching ? "Loading Students…" : "Load Students"}</Button>{studentsLoaded && !rosterRows.length && <p role="status" className="rounded-lg bg-[#f4e5ad]/60 px-3 py-2 text-xs font-semibold text-[#77551d]">No students found for this session, trade, and unit.</p>}</div>{bulkStudents.length > 0 && <div className="overflow-x-auto rounded-lg border border-[#16283f]/10 bg-[#f7f9fb] p-3"><table className="w-full min-w-[980px] border-collapse text-sm"><thead><tr className="border-b border-[#16283f]/15 text-left text-[11px] font-bold uppercase tracking-wider text-[#16283f]/60"><th className="px-3 py-3">Roll</th><th className="px-3 py-3">Student</th><th className="px-3 py-3">Unit</th>{scoreFields.map((field) => <th key={field} className="px-3 py-3">{field}</th>)}<th className="px-3 py-3">Total</th></tr></thead><tbody>{bulkStudents.map((student) => <tr key={student.roll} className="border-b border-[#16283f]/10 align-middle"><td className="px-3 py-3 font-bold text-[#16283f]">{student.roll}</td><td className="px-3 py-3 font-bold text-[#16283f]">{student.name}</td><td className="px-3 py-3 text-[#16283f]/65">{student.unit}</td>{scoreFields.map((field) => <td key={field} className="px-3 py-3"><Input className="min-w-[96px]" type="number" min={0} max={SCORE_LIMITS[marksMode || "monthly_marks"][field]} value={bulkScores[student.roll]?.[field] ?? ""} onChange={(e) => setBulkScores((current) => ({ ...current, [student.roll]: { ...(current[student.roll] || {}), [field]: clampBulkMarkValue(marksMode || "monthly_marks", field, e.target.value) } }))} placeholder={field} /></td>)}<td className="px-3 py-3"><strong className="inline-block rounded bg-[#d4ad32]/20 px-3 py-2 text-center text-[#16283f]">{getBulkMarkTotal(marksMode || "monthly_marks", bulkScores[student.roll])}</strong></td></tr>)}</tbody></table></div>}<div className="flex flex-wrap gap-3"><Button onClick={submitBulkMarks} disabled={write.isPending || !bulkStudents.length} className="rounded-full bg-[#16283f] text-white">{write.isPending ? "Uploading…" : "Upload " + marksLabel}</Button></div></CardContent></Card>)}
    {showReports && (<Card className="rounded-lg border-[#16283f]/10 border-l-4 border-l-[#d4ad32] bg-white shadow-sm"><CardHeader><CardTitle className="flex items-center gap-2 font-serif text-2xl font-bold"><Search size={20} /> Reports and filters</CardTitle></CardHeader><CardContent className="space-y-4"><div className="grid gap-3 sm:grid-cols-2">{filterKeys.map((key) => <Field key={key} label={key === "month" ? "Month" : key === "quarter" ? "Quarter" : key === "week" ? "Week" : key === "year" ? "Year" : key}>{key === "session" ? <select value={report.filters[key]} onChange={(e) => setReport({ ...report, filters: { ...report.filters, [key]: e.target.value } })} className="h-10 w-full rounded-md border border-[#16283f]/15 bg-white px-3 text-sm">{SESSIONS.map((value) => <option key={value}>{value}</option>)}</select> : key === "trade" ? <select value={report.filters[key]} onChange={(e) => setReport({ ...report, filters: { ...report.filters, [key]: e.target.value } })} className="h-10 w-full rounded-md border border-[#16283f]/15 bg-white px-3 text-sm"><option>Fitter</option><option>Electrician</option></select> : key === "unit" ? <select value={report.filters[key]} onChange={(e) => setReport({ ...report, filters: { ...report.filters, [key]: e.target.value } })} className="h-10 w-full rounded-md border border-[#16283f]/15 bg-white px-3 text-sm"><option value="1">Unit 1</option><option value="2">Unit 2</option></select> : key === "month" ? <select value={report.filters[key]} onChange={(e) => setReport({ ...report, filters: { ...report.filters, [key]: e.target.value } })} className="h-10 w-full rounded-md border border-[#16283f]/15 bg-white px-3 text-sm">{MARK_MONTHS.map((value) => <option key={value}>{value}</option>)}</select> : key === "quarter" ? <select value={report.filters[key]} onChange={(e) => setReport({ ...report, filters: { ...report.filters, [key]: e.target.value } })} className="h-10 w-full rounded-md border border-[#16283f]/15 bg-white px-3 text-sm">{QUARTERS.map((value) => <option key={value}>{value}</option>)}</select> : key === "year" ? <select value={report.filters[key]} onChange={(e) => setReport({ ...report, filters: { ...report.filters, [key]: e.target.value } })} className="h-10 w-full rounded-md border border-[#16283f]/15 bg-white px-3 text-sm">{MARK_YEARS.map((value) => <option key={value}>{value}</option>)}</select> : key === "week" ? <select value={report.filters[key]} onChange={(e) => setReport({ ...report, filters: { ...report.filters, [key]: e.target.value } })} className="h-10 w-full rounded-md border border-[#16283f]/15 bg-white px-3 text-sm">{JOB_WEEKS.map((value) => <option key={value}>{value}</option>)}</select> : <Input type={key === "date" ? "date" : "text"} value={report.filters[key]} onChange={(e) => setReport({ ...report, filters: { ...report.filters, [key]: e.target.value } })} placeholder={key === "date" ? "All dates" : `Filter ${key}`} />}</Field>)}</div>{(reportQuery.isFetching || rosterQuery.isFetching) && <FetchProgress label={rosterQuery.isFetching ? "Loading selected session-trade students…" : "Loading report records and attendance/marks…"} />}<div className="flex flex-wrap gap-3"><Button onClick={loadReport} disabled={reportQuery.isFetching || rosterQuery.isFetching} className="rounded-full bg-[#16283f] text-white">{reportQuery.isFetching || rosterQuery.isFetching ? "Loading Students…" : "Load Students and Report"}</Button><Button onClick={() => downloadCsv(`jyoti-${report.sheetName.toLowerCase().replace(/\\s+/g, "-")}-report.xls`, buildReportCsv(searchedReportRows, report.sheetName, reportTableHeaders))} disabled={!searchedReportRows.length || reportIsRosterFallback} variant="outline" className="rounded-full border-[#caa52d]/60 bg-white text-[#16283f]"><Download size={15} /> Download Excel</Button><Button onClick={() => printDocument(`JYOTI ITC · ${report.sheetName}`, buildReportPrintBody(searchedReportRows, report.sheetName, reportTableHeaders, { Session: report.filters.session, Trade: report.filters.trade, Unit: report.filters.unit, Year: report.filters.year, Period: report.filters.month || report.filters.quarter || report.filters.week || report.filters.date }), true, true)} disabled={!searchedReportRows.length || reportIsRosterFallback} variant="outline" className="rounded-full border-[#caa52d]/60 bg-white text-[#16283f]"><FileDown size={15} /> Download PDF</Button></div><div className="flex items-end gap-3 rounded-xl border border-[#16283f]/10 bg-[#f7f9fb] p-4"><div className="min-w-0 flex-1"><Field label="Search student"><Input value={reportSearch} onChange={(e) => setReportSearch(e.target.value)} placeholder="Search by roll, name, trade, or session" /></Field></div><Button type="button" variant="outline" onClick={() => setReportSearch("")} disabled={!reportSearch} className="border-[#caa52d]/60 bg-white text-[#16283f]">Clear</Button></div><div className="overflow-auto rounded-xl border border-[#16283f]/15 bg-[#f7f9fb] shadow-inner"><div className="flex items-center justify-between border-b border-[#16283f]/10 bg-white px-4 py-3"><div><p className="font-serif text-lg font-bold text-[#16283f]">{report.sheetName} report {reportIsRosterFallback ? "· Student roster preview" : ""}</p><p className="text-xs font-semibold text-[#16283f]/55">Session: {report.filters.session || "—"} · Trade: {report.filters.trade || "—"} · Unit: {report.filters.unit || "—"}{reportIsRosterFallback ? " · No matching report records" : ""}</p></div><span className="rounded-full bg-[#d4ad32]/20 px-3 py-1 text-xs font-bold text-[#16283f]">{searchedReportRows.length} rows</span></div>{searchedReportRows.length ? <table className="min-w-full border-collapse text-xs"><thead className="sticky top-0 z-10 bg-[#16283f] text-left text-[10px] font-bold uppercase tracking-wider text-white"><tr>{reportTableHeaders.map((header) => <th key={header} className="whitespace-nowrap border-r border-white/15 px-3 py-3">{header}</th>)}</tr></thead><tbody>{searchedReportRows.slice(0, 200).map((row, index) => <tr key={index} className="border-b border-[#16283f]/10 odd:bg-white even:bg-[#eef3f7]/60">{reportTableHeaders.map((_, cellIndex) => <td key={cellIndex} className="whitespace-nowrap border-r border-[#16283f]/10 px-3 py-3 font-medium text-[#16283f]">{String(row[cellIndex] ?? "—")}</td>)}</tr>)}</tbody></table> : <div className="flex min-h-48 items-center justify-center p-8 text-sm font-semibold text-[#16283f]/55">{reportSearch ? "No students match the search." : "No rows match the selected filters. Load the selected students first."}</div>}</div><div className="grid gap-3 sm:grid-cols-3">{reportSummary.kind === "attendance" ? <><div className="rounded-xl border border-[#315c45]/20 bg-[#e4f0e7] p-4"><p className="text-xs font-bold uppercase tracking-wider text-[#315c45]/70">Present</p><p className="mt-1 font-serif text-2xl font-bold text-[#315c45]">{reportSummary.present}</p></div><div className="rounded-xl border border-[#9c3d3d]/20 bg-[#f8e8e8] p-4"><p className="text-xs font-bold uppercase tracking-wider text-[#9c3d3d]/70">Absent</p><p className="mt-1 font-serif text-2xl font-bold text-[#9c3d3d]">{reportSummary.absent}</p></div><div className="rounded-xl border border-[#d4ad32]/30 bg-[#f4e5ad]/45 p-4"><p className="text-xs font-bold uppercase tracking-wider text-[#77551d]/70">Attendance</p><p className="mt-1 font-serif text-2xl font-bold text-[#77551d]">{reportSummary.percentage}%</p></div></> : <><div className="rounded-xl border border-[#16283f]/10 bg-white p-4"><p className="text-xs font-bold uppercase tracking-wider text-[#16283f]/55">Students</p><p className="mt-1 font-serif text-2xl font-bold text-[#16283f]">{reportSummary.students}</p></div>{Object.entries(reportSummary.averages).map(([label, value]) => <div key={label} className="rounded-xl border border-[#d4ad32]/25 bg-[#f4e5ad]/35 p-4"><p className="text-xs font-bold uppercase tracking-wider text-[#77551d]/75">Avg {label}</p><p className="mt-1 font-serif text-2xl font-bold text-[#16283f]">{value}</p></div>)}</>}</div></CardContent></Card>)}
    {showProgress && (<Card className="rounded-lg border-[#16283f]/10 border-l-4 border-l-[#d4ad32] bg-white shadow-sm"><CardHeader><CardTitle className="flex items-center gap-2 font-serif text-2xl font-bold"><Printer size={20} /> {fixedProgressTrade ? `${fixedProgressTrade} Progress Card` : "Data-driven Progress Card"}</CardTitle><p className="text-sm text-[#16283f]/60">{fixedProgressTrade ? `This workspace is locked to the ${fixedProgressTrade} trade.` : "Load one student record at a time for the selected trade."}</p></CardHeader><CardContent className="space-y-4"><div className="grid gap-3 sm:grid-cols-4"><Field label="Session"><select value={progressInput.session} onChange={(e) => setProgressInput({ ...progressInput, session: e.target.value })} className="h-10 w-full rounded-md border border-[#16283f]/15 bg-white px-3 text-sm"><option value="">Select session</option>{SESSIONS.map((session) => <option key={session}>{session}</option>)}</select></Field><Field label="Trade"><select value={progressInput.trade} disabled={Boolean(fixedProgressTrade)} onChange={(e) => setProgressInput({ ...progressInput, trade: e.target.value as Trade })} className="h-10 w-full rounded-md border border-[#16283f]/15 bg-white px-3 text-sm"><option>Fitter</option><option>Electrician</option></select></Field><Field label="Roll number"><Input value={progressInput.roll} onChange={(e) => setProgressInput({ ...progressInput, roll: e.target.value })} onBlur={() => { if (progressInput.roll.trim() && progressInput.session) void loadProgressCard(); }} placeholder="Enter roll number" /></Field><Field label="Unit"><select value={studentUnit} onChange={(e) => setStudentUnit(e.target.value)} className="h-10 w-full rounded-md border border-[#16283f]/15 bg-white px-3 text-sm"><option value="1">Unit 1</option><option value="2">Unit 2</option></select></Field>{(progressInput.trade === "Electrician" || progressInput.trade === "Fitter") && <><Field label="Exercise Inst. Initial"><Input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => { const file = e.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => setProgressExerciseSign(String(reader.result || "")); reader.readAsDataURL(file); }} /></Field><Field label="Drg. Inst. Initial"><Input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => { const file = e.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => setProgressDrawingSign(String(reader.result || "")); reader.readAsDataURL(file); }} /></Field><Field label="Math Inst. Initial"><Input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => { const file = e.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => setProgressMathSign(String(reader.result || "")); reader.readAsDataURL(file); }} /></Field><Field label="G.I.S. Initial"><Input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => { const file = e.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => setProgressGisSign(String(reader.result || "")); reader.readAsDataURL(file); }} /></Field></>}</div><div className="grid gap-3 sm:grid-cols-4"><Field label="Date of admission"><Input type="date" value={progressManual.admissionDate} onChange={(e) => setProgressManual({ ...progressManual, admissionDate: e.target.value })} /></Field><Field label="Date of leaving"><Input type="date" value={progressManual.leavingDate} onChange={(e) => setProgressManual({ ...progressManual, leavingDate: e.target.value })} /></Field><Field label="Educational qualification"><Input value={progressManual.qualification} onChange={(e) => setProgressManual({ ...progressManual, qualification: e.target.value })} placeholder="10th / 12th / ITI" /></Field><Field label="Grading"><Input value={progressManual.grading} onChange={(e) => setProgressManual({ ...progressManual, grading: e.target.value })} placeholder="A / B / C" /></Field><Field label="General remarks"><Input value={progressManual.remarks} onChange={(e) => setProgressManual({ ...progressManual, remarks: e.target.value })} placeholder="Optional" /></Field></div><div className="grid gap-3 rounded-xl border border-[#16283f]/10 bg-[#f7f9fb] p-4 md:grid-cols-[1fr_auto]"><Field label={`Left binding margin (${progressLeftMarginMm}mm / ${(Number(progressLeftMarginMm) / 25.4).toFixed(2)}in)`}><input aria-label="Progress Card left binding margin" type="range" min="0" max="60" step="0.5" value={progressLeftMarginMm} onChange={(e) => setProgressLeftMarginMm(e.target.value)} className="w-full accent-[#d4ad32]" /></Field><p className="self-end text-xs font-semibold text-[#16283f]/60">Used in preview and print. Default: 35.56mm (1.4in).</p></div><div className="flex flex-wrap gap-3"><Button onClick={loadProgressCard} disabled={studentQuery.isFetching || !progressInput.roll} className="rounded-full bg-[#16283f] text-white">{studentQuery.isFetching ? "Loading…" : "Load student record"}</Button><Button onClick={() => void loadProgressBatch()} disabled={rosterQuery.isFetching || !progressInput.session} variant="outline" className="rounded-full border-[#16283f]/20">{rosterQuery.isFetching ? "Loading students…" : "Load students for batch"}</Button><Button onClick={printProgress} disabled={!progressData} variant="outline" className="rounded-full border-[#16283f]/20"><Printer size={15} /> Print {progressInput.trade} card</Button></div>{studentsLoaded && rosterRows.length > 0 && <div className="space-y-3 rounded-xl border border-[#16283f]/10 bg-[#f7f9fb] p-4"><div className="flex flex-wrap items-center justify-between gap-3"><p className="font-serif text-lg font-bold text-[#16283f]">Batch Progress Card export <span className="text-sm font-sans font-semibold text-[#16283f]/55">({progressBatchSelected.length} selected)</span></p><div className="flex gap-2"><Button type="button" variant="outline" onClick={() => setProgressBatchSelected(rosterRows.map((row: any[]) => String(row[0] || "")).filter(Boolean))} className="border-[#16283f]/20">Select all</Button><Button type="button" variant="outline" onClick={() => setProgressBatchSelected([])} className="border-[#16283f]/20">Clear</Button><Button type="button" onClick={() => void exportProgressBatch()} disabled={!progressBatchSelected.length} className="bg-[#16283f] text-white"><Download size={15} /> Export selected</Button></div></div><div className="grid max-h-64 gap-2 overflow-auto sm:grid-cols-2 lg:grid-cols-3">{rosterRows.map((row: any[]) => { const roll = String(row[0] || ""); const checked = progressBatchSelected.includes(roll); return <label key={roll} className="flex cursor-pointer items-center gap-2 rounded-lg border border-[#16283f]/10 bg-white px-3 py-2 text-sm"><input type="checkbox" checked={checked} onChange={() => setProgressBatchSelected((current) => checked ? current.filter((value) => value !== roll) : [...current, roll])} /><span><b>{roll}</b> · {String(row[1] || "Student")}</span></label>; })}</div><p className="text-xs font-semibold text-[#16283f]/55">Batch export opens one print-ready document. Use the browser print dialog to save the complete set as one PDF.</p></div>}{progressData && <p className="rounded-lg bg-[#eef3f7]/55 px-4 py-3 text-sm font-bold">Loaded {progressData.student.name} · {progressData.attendance.length} attendance and {progressData.monthlyMarks.length} monthly records.</p>}{progressData && (progressInput.trade === "Electrician" || progressInput.trade === "Fitter") && <ProgressCardEditor progressData={progressData} exercises={progressInput.trade === "Electrician" ? ELECTRICIAN_EXERCISES : FITTER_EXERCISES} rowEdits={progressRowEdits} onRowEdit={(key, field, value) => setProgressRowEdits((current) => ({ ...current, [key]: { ...(current[key] || {}), [field]: value } }))} />}</CardContent></Card>)}
    {showCertificate && (<Card className="rounded-lg border-[#16283f]/10 border-l-4 border-l-[#d4ad32] bg-white shadow-sm"><CardHeader><CardTitle className="flex items-center gap-2 font-serif text-2xl font-bold"><Printer size={20} /> Staff experience certificate</CardTitle><p className="text-sm text-[#16283f]/60">Enter the teacher details exactly as they should appear on the letterhead certificate.</p></CardHeader><CardContent className="space-y-5"><div className="grid gap-3 md:grid-cols-3"><Field label="Teacher full name"><Input value={certificateForm.teacherName} onChange={(e) => { setCertificateForm({ ...certificateForm, teacherName: e.target.value }); setCertificateData(null); }} placeholder="E.g., Ankit Singh" /></Field><Field label="Father's name"><Input value={certificateForm.fatherName} onChange={(e) => { setCertificateForm({ ...certificateForm, fatherName: e.target.value }); setCertificateData(null); }} placeholder="E.g., Rajesh Singh" /></Field><Field label="Designation & trade"><select value={certificateForm.designation} onChange={(e) => { const designation = e.target.value; const trade = designation.includes("Electrician") ? "Electrician" : designation.includes("Fitter") ? "Fitter" : certificateForm.trade; setCertificateForm({ ...certificateForm, designation, trade }); setCertificateData(null); }} className="h-10 w-full rounded-md border border-[#16283f]/15 bg-white px-3 text-sm">{CERTIFICATE_DESIGNATIONS.map((value) => <option key={value}>{value}</option>)}</select></Field></div><div className="space-y-3"><p className="text-xs font-bold uppercase tracking-wider text-[#16283f]/55">Employment period(s)</p>{certificatePeriods.map((period, index) => <div key={index} className="grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end"><Field label={`From ${index + 1}`}><Input type="date" value={period.from} onChange={(e) => setCertificatePeriods((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, from: e.target.value } : item))} /></Field><Field label={`To ${index + 1}`}><Input type="date" value={period.to} onChange={(e) => setCertificatePeriods((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, to: e.target.value } : item))} placeholder="Leave blank for till date" /></Field>{index > 0 ? <Button type="button" variant="outline" onClick={() => setCertificatePeriods((current) => current.filter((_, itemIndex) => itemIndex !== index))} className="border-[#16283f]/20">Remove</Button> : <span />}</div>)}<Button type="button" variant="outline" onClick={() => setCertificatePeriods((current) => [...current, { from: "", to: "" }])} className="border-[#16283f]/20">+ Add Another Period</Button></div><div className="grid gap-3 rounded-xl border border-[#16283f]/10 bg-[#f7f9fb] p-4 md:grid-cols-[1fr_1fr]"><Field label={`Letterhead top margin (${certificateTopMargin}mm)`}><input type="range" min="0" max="80" step="1" value={certificateTopMargin} onChange={(e) => setCertificateTopMargin(e.target.value)} className="w-full accent-[#d4ad32]" /></Field><Field label="Staff email for email draft"><Input type="email" value={certificateEmail} onChange={(e) => setCertificateEmail(e.target.value)} placeholder="staff@example.com" /></Field></div><p className="text-xs font-bold text-[#16283f]/55">Preview and print top blank space: {certificateTopMargin}mm</p><div className="flex flex-wrap justify-end gap-3"><Button onClick={generateCertificate} className="rounded-full bg-[#d4ad32] text-[#16283f]">Generate Text</Button><Button onClick={() => printCertificate(true)} disabled={!certificateData} variant="outline" className="border-[#16283f]/20">Preview Certificate</Button><Button onClick={() => printCertificate(false)} disabled={!certificateData} className="rounded-full bg-[#16283f] text-white"><Printer size={15} /> Save as PDF / Print</Button><Button onClick={emailCertificate} disabled={!certificateData || !certificateEmail.trim()} variant="outline" className="border-[#16283f]/20">Email Certificate</Button></div>{certificateData && <div className="rounded-lg border border-[#d4ad32]/40 bg-[#f4e5ad]/40 p-4 text-sm"><p className="font-serif text-lg font-bold">{certificateData.title}</p><p className="mt-2 font-bold">{certificateData.salutation}</p>{certificateData.paragraphs.map((paragraph) => <p key={paragraph} className="mt-2 leading-6">{paragraph}</p>)}</div>}</CardContent></Card>)}
  </div>;
}
