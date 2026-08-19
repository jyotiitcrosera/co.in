import type { FormEvent } from "react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, CalendarCheck, CheckCircle2, ChevronRight, ClipboardList, FileText, LayoutDashboard, Loader2, LogOut, Menu, MessageCircle, Settings, ShieldCheck, UsersRound } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import AdminRecords from "@/components/AdminRecords";
import StudentLearningHub from "@/components/StudentLearningHub";
import { AdminNotification, type AdminNotificationState } from "@/components/AdminNotification";
import { normalizeFeeReceipt } from "@shared/feeReceipt";
import { calculateFeeState } from "@shared/fee";
import { buildFeeReceiptHtml } from "@shared/feeReceiptPrint";
import { validateStaffAttendanceBatch } from "@shared/attendanceRules";
import { canAccessWorkspace } from "@shared/roleAccess";
import { formatAuditAction, formatAuditActor } from "@shared/auditLog";
import { resolveAdminModule, type AdminModule } from "@shared/adminHub";

type Role = "student" | "staff" | "admin";
type Trade = "Fitter" | "Electrician";

const sessions = ["2025-27", "2026-28", "2027-29", "2028-30"];
const roles: Array<{ id: Role; label: string; caption: string }> = [
  { id: "student", label: "Student", caption: "Attendance, marks, study material" },
  { id: "staff", label: "Staff", caption: "Attendance and unit workspace" },
  { id: "admin", label: "Admin", caption: "Operations and records" },
];

export default function Portal() {
  const params = new URLSearchParams(window.location.search);
  const [role, setRole] = useState<Role>((params.get("role") as Role) || "student");
  const [activeRole, setActiveRole] = useState<Role | null>(null);
  const [error, setError] = useState("");
  const [studentInput, setStudentInput] = useState({ session: "2025-27", trade: "Fitter" as Trade, roll: "" });
  const [staffInput, setStaffInput] = useState({ username: "", password: "" });
  const [adminInput, setAdminInput] = useState({ username: "", password: "" });
  const [studentResult, setStudentResult] = useState<any>(null);
  const [staffResult, setStaffResult] = useState<any>(null);
  const studentLogin = trpc.portal.studentLogin.useQuery(studentInput, { enabled: false, retry: false });
  const staffLogin = trpc.portal.staffLogin.useMutation();

  const title = useMemo(() => activeRole ? `${activeRole.charAt(0).toUpperCase()}${activeRole.slice(1)} workspace` : `${role.charAt(0).toUpperCase()}${role.slice(1)} Login`, [activeRole, role]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    try {
      if (role === "student") {
        if (!studentInput.roll.trim()) throw new Error("Enter your roll number.");
        const result = await studentLogin.refetch();
        if (!result.data) throw new Error("Roll number was not found in the selected session and trade.");
        setStudentResult(result.data);
        setActiveRole("student");
      } else if (role === "staff") {
        if (!staffInput.username || !staffInput.password) throw new Error("Enter username and password.");
        const result = await staffLogin.mutateAsync(staffInput);
        if (result.status !== "success") throw new Error(result.message || "Invalid staff credentials.");
        setStaffResult(result);
        setActiveRole("staff");
      } else {
        const saved = JSON.parse(localStorage.getItem("jyotiAdminCredentials") || '{"username":"admin","password":"12345"}');
        if (adminInput.username !== saved.username || adminInput.password !== saved.password) throw new Error("Invalid admin credentials.");
        setActiveRole("admin");
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to sign in.");
    }
  }

  if (canAccessWorkspace("student", activeRole) && studentResult) return <StudentDashboard data={studentResult} onLogout={() => setActiveRole(null)} />;
  if (canAccessWorkspace("staff", activeRole) && staffResult) return <StaffDashboard data={staffResult} onLogout={() => setActiveRole(null)} />;
  if (canAccessWorkspace("admin", activeRole)) return <AdminDashboard onLogout={() => setActiveRole(null)} />;

  return <div className="min-h-screen bg-[linear-gradient(135deg,#fff9ed_0%,#f5f9ff_52%,#effaf5_100%)] px-5 py-8 text-[#102a43] lg:px-8"><div className="mx-auto max-w-6xl"><a href="/" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#102a43]/55 hover:text-[#d97706]"><ArrowLeft size={15} /> Back to JYOTI ITC</a><div className="mt-10 grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:items-start"><div className="rounded-3xl bg-white/60 p-6 shadow-sm ring-1 ring-white/80"><p className="inline-flex rounded-full bg-[#fff0d6] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-[#b45309]">Skill India inspired access</p><h1 className="mt-5 text-6xl font-black leading-[0.9] tracking-[-0.1em] text-[#102a43]">Your work,<br /><span className="text-[#d97706]">in one place.</span></h1><p className="mt-8 max-w-sm text-sm leading-7 text-[#102a43]/65">Choose your role to open the workspace connected to the JYOTI ITC records system.</p></div><Card className="rounded-[2rem] border-white border-t-4 border-t-[#d97706] bg-white shadow-[0_18px_60px_rgba(16,42,67,0.12)]"><CardContent className="p-7 lg:p-10"><div className="grid gap-2 sm:grid-cols-3">{roles.map((item) => <button key={item.id} onClick={() => { setRole(item.id); setError(""); }} className={`rounded-lg border p-4 text-left transition ${role === item.id ? "border-[#d97706] bg-[#fff0d6] text-[#102a43] shadow-sm" : "border-[#102a43]/10 bg-white hover:border-[#d97706]/60 hover:bg-[#fffaf2]"}`}><p className="text-sm font-black">{item.label}</p><p className={`mt-2 text-[11px] leading-4 ${role === item.id ? "text-[#b45309]" : "text-[#102a43]/50"}`}>{item.caption}</p></button>)}</div><form onSubmit={submit} className="mt-8 space-y-5" aria-label={`${role} login form`}><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#b45309]"><ShieldCheck size={15} /> {title}</div>{role === "student" && <><div className="grid gap-4 sm:grid-cols-2"><Field label="Session"><select value={studentInput.session} onChange={(event) => setStudentInput({ ...studentInput, session: event.target.value })} className="h-10 w-full rounded-md border border-[#16283f]/15 bg-white px-3 text-sm"><option value="2025-27">2025-27</option><option value="2026-28">2026-28</option><option value="2027-29">2027-29</option><option value="2028-30">2028-30</option></select></Field><Field label="Trade"><select value={studentInput.trade} onChange={(event) => setStudentInput({ ...studentInput, trade: event.target.value as Trade })} className="h-10 w-full rounded-md border border-[#16283f]/15 bg-white px-3 text-sm"><option>Fitter</option><option>Electrician</option></select></Field></div><Field label="Roll number"><Input value={studentInput.roll} onChange={(event) => setStudentInput({ ...studentInput, roll: event.target.value })} placeholder="Enter roll number" /></Field></>}{role === "staff" && <><Field label="Username"><Input value={staffInput.username} onChange={(event) => setStaffInput({ ...staffInput, username: event.target.value })} placeholder="Enter staff username" /></Field><Field label="Password"><Input type="password" value={staffInput.password} onChange={(event) => setStaffInput({ ...staffInput, password: event.target.value })} placeholder="Enter password" /></Field></>}{role === "admin" && <><Field label="Admin username"><Input value={adminInput.username} onChange={(event) => setAdminInput({ ...adminInput, username: event.target.value })} placeholder="Enter admin username" /></Field><Field label="Admin password"><Input type="password" value={adminInput.password} onChange={(event) => setAdminInput({ ...adminInput, password: event.target.value })} placeholder="Enter admin password" /></Field></>}{error && <p role="alert" className="rounded-xl border border-[#f4b4a8] bg-[#fff1ef] px-4 py-3 text-sm font-medium text-[#a33a2b]">{error}</p>}<Button type="submit" className="w-full rounded-full bg-[#d97706] py-6 text-white shadow-md hover:bg-[#b45309]" disabled={studentLogin.isFetching || staffLogin.isPending}>{studentLogin.isFetching || staffLogin.isPending ? "Checking access…" : "Continue to workspace"}<ChevronRight size={16} /></Button></form></CardContent></Card></div></div></div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <div className="space-y-2"><Label className="text-xs font-bold uppercase tracking-wider text-[#16283f]/55">{label}</Label>{children}</div>; }

function downloadTextFile(filename: string, content: string, type = "text/csv;charset=utf-8") { const blob = new Blob([content], { type }); const url = URL.createObjectURL(blob); const anchor = document.createElement("a"); anchor.href = url; anchor.download = filename; anchor.click(); URL.revokeObjectURL(url); }
function escapeHtml(value: unknown) { return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;"); }
function printFeeLedger(rows: any[], session: string, trade: string) { const popup = window.open("about:blank", "_blank"); if (!popup) { window.alert("Please allow pop-ups to export the Fee Ledger PDF."); return; } const body = rows.map((row) => `<tr><td>${escapeHtml(row.registrationNo)}</td><td>${escapeHtml(row.name)}</td><td>${escapeHtml(row.session)}</td><td>${escapeHtml(row.trade)}</td><td>₹${escapeHtml(row.admissionFee)}</td><td>₹${escapeHtml(row.paid)}</td><td>₹${escapeHtml(row.balance)}</td><td>${escapeHtml(row.status)}</td></tr>`).join(""); popup.document.write(`<!doctype html><html><head><title>JYOTI ITC Fee Ledger</title><style>@page{size:A4 landscape;margin:10mm}body{font-family:Arial;color:#16283f}h1{text-align:center;color:#16283f}p{text-align:center;color:#667085}table{width:100%;border-collapse:collapse;font-size:11px}th{background:#16283f;color:#fff}th,td{border:1px solid #aeb7c5;padding:7px;text-align:left}tr:nth-child(even){background:#f5f7fa}</style></head><body><h1>JYOTI ITC · Fee Ledger</h1><p>${escapeHtml(session)} · ${escapeHtml(trade)} · ${rows.length} students</p><table><thead><tr><th>Roll/Registration</th><th>Student</th><th>Session</th><th>Trade</th><th>Admission Fee</th><th>Total Collected</th><th>Pending</th><th>Status</th></tr></thead><tbody>${body}</tbody></table><script>window.addEventListener('load',()=>setTimeout(()=>window.print(),200))<\/script></body></html>`); popup.document.close(); }


function Shell({ role, children, onLogout }: { role: string; children: React.ReactNode; onLogout: () => void }) { return <div className="min-h-screen bg-[#f7f8fb] text-[#16283f]"><header className="border-b-4 border-[#d4ad32] bg-white px-5 py-5 lg:px-8"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#16283f]/45">JYOTI ITC · {role}</p><h1 className="mt-1 font-serif text-3xl font-bold">Workspace</h1></div><div className="flex gap-2"><a href="/" className="rounded-md border border-[#16283f]/20 px-4 py-2 text-xs font-bold uppercase tracking-wider">Public site</a><Button variant="outline" className="rounded-md border-[#16283f]/20" onClick={onLogout}><LogOut size={15} /> Sign out</Button></div></div></header><main className="mx-auto max-w-7xl px-5 py-8 lg:px-8">{children}</main></div>; }

function StudentDashboard({ data, onLogout }: { data: any; onLogout: () => void }) { const student = data.student; return <Shell role="Student dashboard" onLogout={onLogout}><div className="mt-10 grid gap-5 lg:grid-cols-[0.8fr_1.2fr]"><Card className="rounded-lg border-0 bg-[#16283f] text-white"><CardContent className="p-7"><p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/45">Signed in student</p><h2 className="mt-5 text-4xl font-black tracking-[-0.08em]">{student.name}</h2><p className="mt-3 text-sm text-white/55">Roll {student.roll} · {student.trade} · {student.session}</p><div className="mt-10 grid grid-cols-2 gap-3"><Stat label="Unit" value={student.unit || "—"} /><Stat label="Attendance rows" value={String(data.attendance.length)} /></div></CardContent></Card><Card className="rounded-lg border-[#16283f]/10 border-l-4 border-l-[#d4ad32] bg-white shadow-sm"><CardHeader><CardTitle className="flex items-center gap-2 font-serif text-2xl font-bold"><CalendarCheck size={20} /> Attendance history</CardTitle></CardHeader><CardContent><DataTable rows={data.attendance} empty="No attendance records found." /></CardContent></Card></div><div className="mt-5 grid gap-5 lg:grid-cols-3"><RecordCard title="Monthly Assessment" icon={<FileText size={18} />} rows={data.monthlyMarks} /><RecordCard title="Quarterly Assessment" icon={<FileText size={18} />} rows={data.quarterlyMarks} /><RecordCard title="Job Evolution" icon={<CheckCircle2 size={18} />} rows={data.jobEvolution} /></div><StudentLearningHub student={{ roll: student.roll, name: student.name, session: student.session, trade: student.trade }} /></Shell>; }

function StaffDashboard({ data, onLogout }: { data: any; onLogout: () => void }) {
  const [session, setSession] = useState("2025-27");
  const [date, setDate] = useState("");
  const [loaded, setLoaded] = useState(false);
  const roster = trpc.portal.studentRoster.useQuery({ session, trade: data.trade === "Electrician" ? "Electrician" : "Fitter" }, { enabled: false, retry: false });
  const write = trpc.portal.write.useMutation();
  const [statuses, setStatuses] = useState<Record<string, string>>({});
  const [attendanceError, setAttendanceError] = useState("");
  const rows = (roster.data?.rows || []).slice(1).filter((row: any[]) => String(row[3] || "") === String(data.unit || ""));
  async function load() { if (!data.unit) { setAttendanceError("No unit is assigned to this staff account."); return; } setAttendanceError(""); await roster.refetch(); setLoaded(true); }
  async function submit() {
    setAttendanceError("");
    if (!date) { setAttendanceError("Select an attendance date before saving."); return; }
    const entries = rows.map((row: any[]) => [date, row[0], row[1], roster.data?.sheetName || "", row[3], statuses[String(row[0])] || "P"]);
    const validationError = validateStaffAttendanceBatch(entries, String(data.unit || ""));
    if (validationError) { setAttendanceError(validationError); return; }
    try { await write.mutateAsync({ type: "attendance", staff_username: data.username, entries }); alert("Attendance saved successfully."); }
    catch (caught) { setAttendanceError(caught instanceof Error ? caught.message : "Attendance could not be saved."); }
  }
  return <Shell role="Staff dashboard" onLogout={onLogout}><div className="mt-10 grid gap-5 lg:grid-cols-[0.8fr_1.2fr]"><Card className="rounded-lg border-0 bg-[#eef3f7] shadow-sm"><CardContent className="p-7"><p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#16283f]/50">Assigned workspace</p><h2 className="mt-5 text-4xl font-black tracking-[-0.08em]">{data.name}</h2><p className="mt-3 text-sm text-[#16283f]/60">{data.trade} · Unit {data.unit || "Not assigned"}</p><div className="mt-10 rounded-lg bg-white/50 p-4 text-sm font-bold">Attendance cap: 20 students</div></CardContent></Card><Card className="rounded-lg border-[#16283f]/10 border-l-4 border-l-[#d4ad32] bg-white shadow-sm"><CardHeader><CardTitle className="flex items-center gap-2 font-serif text-2xl font-bold"><UsersRound size={20} /> Attendance marking</CardTitle></CardHeader><CardContent><div className="grid gap-3 sm:grid-cols-2"><Field label="Session"><select value={session} onChange={(event) => setSession(event.target.value)} className="h-10 w-full rounded-md border border-[#16283f]/15 bg-white px-3 text-sm">{sessions.map((item) => <option key={item}>{item}</option>)}</select></Field><Field label="Date"><Input type="date" value={date} onChange={(event) => setDate(event.target.value)} /></Field></div><div className="mt-5 flex flex-wrap items-center gap-3"><Button onClick={load} className="rounded-full bg-[#16283f] text-white" disabled={roster.isFetching || !data.unit}>{roster.isFetching ? "Loading…" : `Load Unit ${data.unit || "—"} students`}</Button>{loaded && <span className="text-xs font-bold text-[#16283f]/45">{rows.length} students loaded</span>}</div>{attendanceError && <p role="alert" className="mt-4 rounded-xl bg-[#f4e5ad] px-4 py-3 text-sm font-bold text-[#7b263d]">{attendanceError}</p>}{loaded && rows.length > 20 && <p className="mt-4 rounded-xl bg-[#f4e5ad] px-4 py-3 text-sm font-bold text-[#7b263d]">This unit has {rows.length} students. Attendance is blocked because the hard limit is 20.</p>}{loaded && rows.length > 0 && rows.length <= 20 && <div className="mt-6 space-y-2">{rows.map((row: any[]) => <div key={String(row[0])} className="flex items-center justify-between rounded-xl bg-white/70 px-4 py-3"><span className="text-sm font-bold">{row[0]} · {row[1]}</span><select value={statuses[String(row[0])] || "P"} onChange={(event) => setStatuses({ ...statuses, [String(row[0])]: event.target.value })} className="rounded-md border border-[#16283f]/15 bg-white px-2 py-2 text-xs font-bold"><option value="P">Present</option><option value="A">Absent</option></select></div>)}<Button onClick={submit} disabled={write.isPending || !date} className="mt-4 w-full rounded-full bg-[#16283f] text-white">{write.isPending ? "Saving…" : "Save attendance"}</Button></div>}</CardContent></Card></div></Shell>;
}

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [newStaff, setNewStaff] = useState({ username: "", password: "", name: "", trade: "Fitter" as Trade, unit: "1" });
  const [notice, setNotice] = useState({ title: "", content: "" });
  const [feeSearch, setFeeSearch] = useState({ registrationNo: "", name: "", session: "2025-27", trade: "Fitter" as Trade });
  const [feePayment, setFeePayment] = useState({ admissionFee: "", paymentAmount: "", trade: "Fitter" as Trade, session: "2025-27", paymentMode: "CASH", mediator: "", mediatorPaid: "", remarks: "" });
  const [feeReceipt, setFeeReceipt] = useState<any>(null);
  const [feeLookupData, setFeeLookupData] = useState<any>(null);
  const [feeLedgerRows, setFeeLedgerRows] = useState<any[]>([]);
  const [feeLedgerSearch, setFeeLedgerSearch] = useState("");
  const [selectedFeeStudent, setSelectedFeeStudent] = useState<any>(null);
  const [feeLedgerStatusFilter, setFeeLedgerStatusFilter] = useState("all");
  const [reminderTemplate, setReminderTemplate] = useState("Dear {name}, this is a friendly reminder from JYOTI ITC, Rosera. Your fee balance for {session} {trade} is ₹{pendingAmount}. Please contact the institute office to complete your payment. Roll/Registration: {registrationNo}. Thank you.");
  const [lastReminderSent, setLastReminderSent] = useState<Record<string, string>>({});
  const [bulkReminderOpen, setBulkReminderOpen] = useState(false);
  const [reminderLog, setReminderLog] = useState<any[]>([]);
  const [feeStatus, setFeeStatus] = useState({ tone: "", message: "" });
  const [adminActionStatus, setAdminActionStatus] = useState({ tone: "", message: "" });
  const [adminNotification, setAdminNotification] = useState<AdminNotificationState>({ tone: "info", message: "" });
  const notifyAdmin = useCallback((next: AdminNotificationState) => setAdminNotification(next), []);
  const staffList = trpc.portal.staffList.useQuery();
  const feeQuery = trpc.portal.feeLookup.useQuery(feeSearch, { enabled: false, retry: false, staleTime: 120000, gcTime: 300000 });
  const feeRosterQuery = trpc.portal.studentRoster.useQuery({ session: feeSearch.session, trade: feeSearch.trade }, { enabled: false, retry: false, staleTime: 120000, gcTime: 300000 });
  const utils = trpc.useUtils();
  const write = trpc.portal.write.useMutation();
  const auditEvent = trpc.portal.auditEvent.useMutation();
  const auditLogs = trpc.portal.auditLogs.useQuery({ limit: 50 });
  useEffect(() => {
    if (adminActionStatus.message) notifyAdmin({ tone: adminActionStatus.tone === "error" ? "error" : adminActionStatus.tone === "" ? "loading" : "success", message: adminActionStatus.message });
  }, [adminActionStatus, notifyAdmin]);
  useEffect(() => {
    if (feeStatus.message) notifyAdmin({ tone: feeStatus.tone === "error" ? "error" : feeStatus.tone === "" ? "loading" : "success", message: feeStatus.message });
  }, [feeStatus, notifyAdmin]);
  function save() { if (!credentials.username || !credentials.password) { setAdminActionStatus({ tone: "error", message: "Enter both a new admin username and password." }); return; } localStorage.setItem("jyotiAdminCredentials", JSON.stringify(credentials)); void auditEvent.mutateAsync({ actor: "admin", actorRole: "admin", action: "admin_credentials_updated", entity: "local_security", details: "Local Admin credentials updated" }); setAdminActionStatus({ tone: "success", message: "Admin credentials updated locally." }); }
  async function createStaff() { try { setAdminActionStatus({ tone: "", message: "Creating staff account…" }); await write.mutateAsync({ type: "create_staff", ...newStaff }); setNewStaff({ username: "", password: "", name: "", trade: "Fitter", unit: "1" }); await staffList.refetch(); setAdminActionStatus({ tone: "success", message: "Staff account created." }); } catch (error) { setAdminActionStatus({ tone: "error", message: error instanceof Error ? error.message : "Staff account could not be created." }); } }
  async function updateUnit(username: string, unit: string) { try { setAdminActionStatus({ tone: "", message: "Updating staff unit…" }); await write.mutateAsync({ type: "update_staff_unit", username, unit }); await staffList.refetch(); setAdminActionStatus({ tone: "success", message: "Staff unit updated." }); } catch (error) { setAdminActionStatus({ tone: "error", message: error instanceof Error ? error.message : "Staff unit could not be updated." }); } }
  async function deleteStaff(username: string) { if (!window.confirm(`Delete ${username}?`)) return; try { setAdminActionStatus({ tone: "", message: "Deleting staff account…" }); await write.mutateAsync({ type: "delete_staff", username }); await staffList.refetch(); setAdminActionStatus({ tone: "success", message: "Staff account deleted." }); } catch (error) { setAdminActionStatus({ tone: "error", message: error instanceof Error ? error.message : "Staff account could not be deleted." }); } }
  async function publish() { try { setAdminActionStatus({ tone: "", message: "Publishing notice…" }); await write.mutateAsync({ type: "notice", title: notice.title, content: notice.content }); setNotice({ title: "", content: "" }); setAdminActionStatus({ tone: "success", message: "Notice published." }); } catch (error) { setAdminActionStatus({ tone: "error", message: error instanceof Error ? error.message : "Notice could not be published." }); } }
  async function lookupFee() {
    setFeeStatus({ tone: "", message: `Loading ${feeSearch.session} ${feeSearch.trade} students…` });
    setFeeReceipt(null);
    try {
      const rosterResult = await feeRosterQuery.refetch();
      const rosterMatrix = Array.isArray(rosterResult.data?.rows) ? rosterResult.data.rows : [];
      const headers = (rosterMatrix[0] || []).map((value: unknown) => String(value ?? "").trim().toLowerCase());
      const indexOf = (...names: string[]) => { const index = headers.findIndex((header: string) => names.some((name) => header.includes(name))); return index >= 0 ? index : -1; };
      const rollIndex = Math.max(0, indexOf("roll", "registration"));
      const nameIndex = Math.max(0, indexOf("name"));
      const mobileIndex = indexOf("mobile", "whatsapp", "phone", "contact");
      const admissionIndex = indexOf("admission fee", "total fee", "fee");
      const paidIndex = indexOf("paid amount", "total paid", "amount paid", "paid");
      const balanceIndex = indexOf("balance", "unpaid", "pending");
      const mediatorIndex = indexOf("mediator name", "mediator", "agent");
      const mediatorPaidIndex = indexOf("mediator paid", "agent paid");
      const historyIndex = indexOf("payment history", "fee history", "installment history");
      const statusIndex = indexOf("payment status", "status");
      const students = rosterMatrix.slice(1).filter((row: any[]) => String(row[rollIndex] ?? "").trim() || String(row[nameIndex] ?? "").trim());
      if (!students.length) throw new Error(`No students were found in ${feeSearch.session} ${feeSearch.trade}.`);
      const loadedRows = students.map((row: any[]) => {
        const registrationNo = String(row[rollIndex] ?? "").trim();
        const name = String(row[nameIndex] ?? "").trim();
        const admissionFee = Number(row[admissionIndex] || 0);
        const paid = Number(row[paidIndex] || 0);
        const balance = Math.max(0, Number(row[balanceIndex] || admissionFee - paid));
        let payments: any[] = [];
        try { payments = historyIndex >= 0 && row[historyIndex] ? JSON.parse(String(row[historyIndex])) : []; } catch { payments = []; }
        const status = String(row[statusIndex] || (balance === 0 && admissionFee > 0 ? "FULLY PAID" : paid > 0 ? "PARTIALLY PAID" : "UNPAID"));
        const data = { student: { registrationNo, name, mobile: mobileIndex >= 0 ? String(row[mobileIndex] || "") : "", session: feeSearch.session, trade: feeSearch.trade }, payments, totals: { admissionFee, paid, balance, mediatorPaid: Number(row[mediatorPaidIndex] || 0), status }, rowNumber: 0, sheetName: rosterResult.data?.sheetName || (feeSearch.session + feeSearch.trade.toUpperCase()) };
        const latest = payments[payments.length - 1];
        return { registrationNo, name, mobile: data.student.mobile, session: feeSearch.session, trade: feeSearch.trade, admissionFee, paid, balance, status, data, latest, mediator: mediatorIndex >= 0 ? String(row[mediatorIndex] || "") : "" };
      });
      setFeeLedgerRows(loadedRows);
      setFeePayment((current) => ({ ...current, session: feeSearch.session, trade: feeSearch.trade }));
      const wantedRegistration = feeSearch.registrationNo.trim().toLowerCase();
      const wantedName = feeSearch.name.trim().toLowerCase();
      const selected = loadedRows.find((row) => (!wantedRegistration && !wantedName) || (wantedRegistration && row.registrationNo.toLowerCase() === wantedRegistration) || (wantedName && row.name.toLowerCase() === wantedName));
      if (selected?.data?.student) {
        setFeeSearch((current) => ({ ...current, registrationNo: selected.registrationNo, name: selected.name }));
        setFeeLookupData(selected.data);
        if (selected.latest) {
          const latest = selected.latest;
          setFeeReceipt(normalizeFeeReceipt({ invoiceNo: latest[0], registrationNo: selected.registrationNo, studentName: selected.name, trade: latest[4] || selected.trade, session: latest[5] || selected.session, admissionFee: latest[6], paymentAmount: latest[7], totalPaid: latest[8], balance: latest[9], paymentStatus: latest[10], fullyPaid: String(latest[10] || "").toUpperCase() === "FULLY PAID", paymentMode: latest[11], mediator: latest[13], mediatorPaid: latest[14], totalMediatorPaid: selected.data.totals.mediatorPaid }, { registrationNo: selected.registrationNo, studentName: selected.name, admissionFee: selected.admissionFee, paymentAmount: Number(latest[7] || 0) }));
        } else setFeeReceipt(null);
      } else if (wantedRegistration || wantedName) {
        setFeeLookupData(null);
        setFeeStatus({ tone: "error", message: "No matching student found in the selected session and trade." });
        return;
      } else setFeeLookupData(null);
      setFeeStatus({ tone: "success", message: loadedRows.length + " students loaded instantly from " + feeSearch.session + " " + feeSearch.trade + ". Search is now local." });
    } catch (error) {
      setFeeLedgerRows([]);
      setFeeLookupData(null);
      setFeeStatus({ tone: "error", message: error instanceof Error ? error.message : "Fee lookup failed. Please retry." });
    }
  }
  function addReminderLog(entry: any) { setReminderLog((current) => [{ ...entry, id: `${Date.now()}-${entry.registrationNo}`, status: entry.status || "Opened", sentAt: entry.sentAt || new Date().toISOString() }, ...current]); }
  async function quickMarkPaid(row: any) {
    const amount = Number(row.balance || 0);
    if (!amount) { setAdminActionStatus({ tone: "error", message: "This student has no pending balance." }); return; }
    setFeeSearch({ session: row.session, trade: row.trade, registrationNo: row.registrationNo, name: row.name });
    setFeeLookupData(row.data || null);
    setFeePayment((current) => ({ ...current, session: row.session, trade: row.trade, registrationNo: row.registrationNo, studentName: row.name, admissionFee: String(row.admissionFee || ""), paymentAmount: String(amount), mediator: "", mediatorPaid: "", remarks: "Mark Paid" }));
    setAdminActionStatus({ tone: "success", message: `Pay Fee form ready for ${row.name}. Review the amount ₹${amount.toLocaleString("en-IN")} and click Save payment.` });
    setActiveModule("fees");
    window.setTimeout(() => document.getElementById("fee-payment-form")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  }
  async function recordPayment() {
    const lookup = feeLookupData; const student = lookup?.student;
    if (!student || !lookup) { setFeeStatus({ tone: "error", message: "Find a student fee record first." }); return; }
    const admissionFee = Number(feePayment.admissionFee || lookup.totals.admissionFee);
    const paymentAmount = Number(feePayment.paymentAmount);
    if (Number(lookup.totals.paid || 0) >= admissionFee || Number(lookup.totals.balance || 0) <= 0) {
      setFeeStatus({ tone: "error", message: "This student is already Fully Paid; no additional payment is allowed." });
      return;
    }
    let feeState;
    try {
      feeState = calculateFeeState(admissionFee, Number(lookup.totals.paid || 0), paymentAmount);
    } catch (error) {
      setFeeStatus({ tone: "error", message: error instanceof Error ? error.message : "Invalid fee payment." });
      return;
    }
    const receiptWindow = window.open("about:blank", "_blank");
    try {
      setFeeStatus({ tone: "", message: "Saving payment and generating invoice…" });
      const raw = await write.mutateAsync({ type: "record_fee_payment", registration_no: student.registrationNo, student_name: student.name, trade: feePayment.trade, session: feePayment.session, admission_fee: admissionFee, payment_amount: paymentAmount, payment_mode: feePayment.paymentMode, mediator: feePayment.mediator, mediator_paid: Number(feePayment.mediatorPaid || 0), remarks: feePayment.remarks });
      const result = normalizeFeeReceipt(raw, { registrationNo: student.registrationNo, studentName: student.name, admissionFee, paymentAmount, totalPaid: feeState.paid, balance: feeState.balance, paymentStatus: feeState.status, fullyPaid: feeState.status === "FULLY PAID", paymentMode: feePayment.paymentMode, mediator: feePayment.mediator, mediatorPaid: Number(feePayment.mediatorPaid || 0) });
      if (result.status && result.status !== "success") throw new Error(result.message || "Payment was not accepted by the backend.");
      if (!result.invoiceNo) result.invoiceNo = `FEE-${Date.now()}`;
      result.registrationNo = result.registrationNo || student.registrationNo;
      if (!result.paymentHistory?.length) result.paymentHistory = [...(lookup.payments || []), [result.invoiceNo, new Date().toLocaleString("en-IN"), student.registrationNo, student.name, feePayment.trade, feePayment.session, admissionFee, paymentAmount, result.totalPaid, result.balance, result.paymentStatus]];
      setFeeReceipt(result);
      setFeeStatus({ tone: "success", message: result.fullyPaid ? "Payment saved. Fully Paid receipt is ready." : "Payment saved. Invoice is ready to print." });
      setFeePayment({ ...feePayment, admissionFee: String(result.admissionFee || ""), paymentAmount: "", mediatorPaid: "", remarks: "" });
      printFeeReceipt(result, receiptWindow);
      void feeQuery.refetch();
    } catch (error) {
      if (receiptWindow && !receiptWindow.closed) receiptWindow.close();
      setFeeStatus({ tone: "error", message: error instanceof Error ? error.message : "Payment could not be saved." });
    }
  }
  const [activeModule, setActiveModule] = useState<AdminModule>("overview");
  function selectModule(module: AdminModule) {
    setAdminActionStatus({ tone: "", message: "" });
    setFeeStatus({ tone: "", message: "" });
    setActiveModule(module);
  }
  const workspaceProps: AdminWorkspaceProps = { activeModule, staffList, newStaff, setNewStaff, createStaff, updateUnit, deleteStaff, notice, setNotice, publish, feeSearch, setFeeSearch, feeQuery, feeRosterQuery, feeLookupData, feeLedgerRows, feeLedgerSearch, setFeeLedgerSearch, feeLedgerStatusFilter, setFeeLedgerStatusFilter, reminderTemplate, setReminderTemplate, lastReminderSent, setLastReminderSent, bulkReminderOpen, setBulkReminderOpen, reminderLog, addReminderLog, quickMarkPaid, selectedFeeStudent, setSelectedFeeStudent, lookupFee, feePayment, setFeePayment, recordPayment, feeReceipt, printFeeReceipt, credentials, setCredentials, save, write, feeStatus, adminActionStatus, auditLogs, onNotify: notifyAdmin };
  return <Shell role="Admin dashboard" onLogout={onLogout}><AdminNotification notification={adminNotification} onDismiss={() => setAdminNotification({ tone: "info", message: "" })} /><AdminHubLayout onLogout={onLogout} activeModule={activeModule} onSelect={selectModule}><div className="mt-6" /><div className="mt-6"><AdminWorkspaceModule {...workspaceProps} /></div></AdminHubLayout></Shell>;
}

type AdminWorkspaceProps = {
  activeModule: AdminModule;
  staffList: any;
  newStaff: any;
  setNewStaff: (value: any) => void;
  createStaff: () => void;
  updateUnit: (username: string, unit: string) => void;
  deleteStaff: (username: string) => void;
  notice: any;
  setNotice: (value: any) => void;
  publish: () => void;
  feeSearch: any;
  setFeeSearch: (value: any) => void;
  feeQuery: any;
  feeRosterQuery: any;
  feeLookupData: any;
  feeLedgerRows: any[];
  feeLedgerSearch: string;
  setFeeLedgerSearch: (value: string) => void;
  feeLedgerStatusFilter: string;
  setFeeLedgerStatusFilter: (value: string) => void;
  reminderTemplate: string;
  setReminderTemplate: (value: string) => void;
  lastReminderSent: Record<string, string>;
  setLastReminderSent: (value: Record<string, string>) => void;
  bulkReminderOpen: boolean;
  setBulkReminderOpen: (value: boolean) => void;
  reminderLog: any[];
  addReminderLog: (entry: any) => void;
  quickMarkPaid: (row: any) => void;
  selectedFeeStudent: any;
  setSelectedFeeStudent: (value: any) => void;
  lookupFee: () => void;
  feePayment: any;
  setFeePayment: (value: any) => void;
  recordPayment: () => void;
  feeReceipt: any;
  printFeeReceipt: (receipt: any) => void;
  credentials: any;
  setCredentials: (value: any) => void;
  save: () => void;
  write: any;
  feeStatus: any;
  adminActionStatus: any;
  auditLogs: any;
  onNotify?: (notification: AdminNotificationState) => void;
};

export function AdminWorkspaceModule(props: AdminWorkspaceProps) {
  const { activeModule } = props;
  const feeLedgerRows = props.feeLedgerRows || [];
  const feeLedgerSearch = props.feeLedgerSearch || "";
  const visibleFeeRows = feeLedgerRows.filter((row) => { const query = feeLedgerSearch.trim().toLowerCase(); const matchesSearch = !query || String(row.name).toLowerCase().includes(query) || String(row.registrationNo).toLowerCase().includes(query); const status = String(row.status || "UNPAID").toUpperCase(); const matchesStatus = props.feeLedgerStatusFilter === "all" || (props.feeLedgerStatusFilter === "pending" && status !== "FULLY PAID") || (props.feeLedgerStatusFilter === "paid" && status === "FULLY PAID"); return matchesSearch && matchesStatus; });
  const feeCollected = visibleFeeRows.reduce((sum, row) => sum + Number(row.paid || 0), 0);
  const feePending = visibleFeeRows.reduce((sum, row) => sum + Number(row.balance || 0), 0);
  const feePieData = [{ name: "Collected", value: feeCollected, color: "#2f7d59" }, { name: "Pending", value: feePending, color: "#d4ad32" }].filter((item) => item.value > 0);
  const buildFeeReminderUrl = (row: any) => { const digits = String(row.mobile || row.data?.student?.mobile || "").replace(/\D/g, ""); if (digits.length < 10) return null; const number = digits.startsWith("91") ? digits : `91${digits.slice(-10)}`; const replacements: Record<string, string> = { name: String(row.name || ""), pendingAmount: Number(row.balance || 0).toLocaleString("en-IN"), session: String(row.session || ""), trade: String(row.trade || ""), registrationNo: String(row.registrationNo || "") }; const message = props.reminderTemplate.replace(/\{(name|pendingAmount|session|trade|registrationNo)\}/g, (_match: string, key: string) => replacements[key] || ""); return `https://wa.me/${number}?text=${encodeURIComponent(message)}`; };
  const markReminderSent = (row: any) => { const sentAt = new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }); props.setLastReminderSent({ ...props.lastReminderSent, [`${row.session}-${row.trade}-${row.registrationNo}`]: sentAt }); props.addReminderLog({ registrationNo: row.registrationNo, name: row.name, session: row.session, trade: row.trade, amount: row.balance, mobile: row.mobile || row.data?.student?.mobile || "", status: "Opened", sentAt }); };
  const sendFeeReminder = (row: any) => { const url = buildFeeReminderUrl(row); if (!url) { window.alert("This student does not have a valid mobile/WhatsApp number in the roster sheet."); return; } window.open(url, "_blank", "noopener,noreferrer"); markReminderSent(row); };
  const bulkPendingRows = visibleFeeRows.filter((row) => String(row.status || "UNPAID").toUpperCase() !== "FULLY PAID");
  const bulkValidRows = bulkPendingRows.filter((row) => Boolean(buildFeeReminderUrl(row)));
  const bulkSendFeeReminders = () => { if (!bulkValidRows.length) { window.alert("No pending student has a valid mobile/WhatsApp number."); return; } props.setBulkReminderOpen(true); };
  const confirmBulkSendFeeReminders = () => { props.setBulkReminderOpen(false); bulkValidRows.forEach((row, index) => { const url = buildFeeReminderUrl(row); if (url) window.setTimeout(() => { window.open(url, "_blank", "noopener,noreferrer"); markReminderSent(row); }, index * 250); }); };
  const exportFeeCsv = () => downloadTextFile(`jyoti-fee-ledger-${props.feeSearch.session}-${props.feeSearch.trade}.xls`, ["Roll/Registration,Student,Session,Trade,Admission Fee,Total Collected,Pending,Status", ...visibleFeeRows.map((row) => [row.registrationNo, row.name, row.session, row.trade, row.admissionFee, row.paid, row.balance, row.status].map((value) => `\"${String(value ?? "").replace(/\"/g, "\"\"")}\"`).join(","))].join("\\n"), "application/vnd.ms-excel;charset=utf-8");
  if (activeModule === "overview") return <div className="flex min-h-[480px] items-center justify-center rounded-xl border border-dashed border-[#12233d]/15 bg-white p-8 text-center"><div><div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#eef3f7] text-[#12233d]"><ShieldCheck size={32} /></div><h2 className="mt-5 text-3xl font-black text-[#12233d]">System Dashboard</h2><p className="mt-2 max-w-md text-sm leading-6 text-[#12233d]/55">Select a module from the sidebar to manage institution operations. The workspace stays clear until you choose a module.</p></div></div>;
  if (activeModule === "staff") return <Card id="staff-management" className="border-[#16283f]/10 border-l-4 border-l-[#d4ad32] bg-white shadow-sm"><CardHeader><CardTitle className="font-serif text-2xl font-bold">Manage staff</CardTitle></CardHeader><CardContent className="space-y-4"><div className="grid gap-3 sm:grid-cols-2"><Field label="Username"><Input value={props.newStaff.username} onChange={(event) => props.setNewStaff({ ...props.newStaff, username: event.target.value })} /></Field><Field label="Password"><Input type="password" value={props.newStaff.password} onChange={(event) => props.setNewStaff({ ...props.newStaff, password: event.target.value })} /></Field><Field label="Full name"><Input value={props.newStaff.name} onChange={(event) => props.setNewStaff({ ...props.newStaff, name: event.target.value })} /></Field><Field label="Trade"><select value={props.newStaff.trade} onChange={(event) => props.setNewStaff({ ...props.newStaff, trade: event.target.value as Trade })} className="h-10 w-full rounded-md border border-[#16283f]/15 bg-white px-3 text-sm"><option>Fitter</option><option>Electrician</option></select></Field><Field label="Unit"><select value={props.newStaff.unit} onChange={(event) => props.setNewStaff({ ...props.newStaff, unit: event.target.value })} className="h-10 w-full rounded-md border border-[#16283f]/15 bg-white px-3 text-sm"><option value="1">Unit 1</option><option value="2">Unit 2</option></select></Field></div><Button onClick={props.createStaff} disabled={props.write.isPending} className="rounded-full bg-[#16283f] text-white">Create staff account</Button><div className="space-y-2 pt-3">{props.staffList.isLoading && <p role="status" className="text-sm text-[#16283f]/45">Loading staff records…</p>}{props.staffList.data?.map((staff: any) => <div key={staff.username} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#f8fafc] px-3 py-3"><div><p className="text-sm font-bold">{staff.name}</p><p className="text-xs text-[#16283f]/45">{staff.username} · {staff.trade}</p></div><div className="flex items-center gap-2"><select value={staff.unit || ""} onChange={(event) => props.updateUnit(staff.username, event.target.value)} className="rounded-md border border-[#16283f]/15 bg-white px-2 py-2 text-xs"><option value="">No unit</option><option value="1">Unit 1</option><option value="2">Unit 2</option></select><button onClick={() => props.deleteStaff(staff.username)} className="text-xs font-bold text-[#7b263d]">Delete</button></div></div>)}</div></CardContent></Card>;
  if (activeModule === "notice") return <Card id="publish-notice" className="border-[#16283f]/10 border-l-4 border-l-[#d4ad32] bg-white shadow-sm"><CardHeader><CardTitle className="font-serif text-2xl font-bold">Publish notice</CardTitle></CardHeader><CardContent className="space-y-4"><Field label="Notice type"><Input value={props.notice.title} onChange={(event) => props.setNotice({ ...props.notice, title: event.target.value })} placeholder="ADMIN" /></Field><Field label="Content"><textarea value={props.notice.content} onChange={(event) => props.setNotice({ ...props.notice, content: event.target.value })} className="min-h-32 w-full rounded-md border border-[#16283f]/15 bg-white px-3 py-2 text-sm" /></Field><Button onClick={props.publish} disabled={props.write.isPending || !props.notice.content} className="rounded-full bg-[#16283f] text-white">Publish notice</Button></CardContent></Card>;
  if (activeModule === "reminderLog") return <ReminderLogCard logs={props.reminderLog} />;
  if (activeModule === "fees") return <Card id="fee-payment-form" className="border-[#16283f]/10 border-l-4 border-l-[#d4ad32] bg-white shadow-sm"><CardHeader><CardTitle className="font-serif text-2xl font-bold">Fee Ledger & Student Receipt</CardTitle></CardHeader><CardContent className="space-y-4"><p className="text-sm leading-6 text-[#16283f]/55">Select the student session and trade first. Payments remain cumulative within that session and trade.</p><div className="grid gap-3 sm:grid-cols-2"><Field label="Session"><select value={props.feeSearch.session} onChange={(event) => props.setFeeSearch({ ...props.feeSearch, session: event.target.value })} className="h-10 w-full rounded-md border border-[#16283f]/15 bg-white px-3 text-sm">{sessions.map((value) => <option key={value}>{value}</option>)}</select></Field><Field label="Trade"><select value={props.feeSearch.trade} onChange={(event) => props.setFeeSearch({ ...props.feeSearch, trade: event.target.value as Trade })} className="h-10 w-full rounded-md border border-[#16283f]/15 bg-white px-3 text-sm"><option>Fitter</option><option>Electrician</option></select></Field><Field label="Registration number"><Input value={props.feeSearch.registrationNo} onChange={(event) => props.setFeeSearch({ ...props.feeSearch, registrationNo: event.target.value })} /></Field><Field label="Student name"><Input value={props.feeSearch.name} onChange={(event) => props.setFeeSearch({ ...props.feeSearch, name: event.target.value })} /></Field></div>{(props.feeQuery.isFetching || props.feeRosterQuery.isFetching) && <div className="rounded-xl border border-[#d4ad32]/30 bg-[#fffaf0] p-4" role="status" aria-live="polite"><div className="flex items-center gap-3 text-sm font-bold text-[#77551d]"><Loader2 className="size-5 animate-spin" /> Fetching {props.feeSearch.session} {props.feeSearch.trade} student and fee record…</div><div className="mt-3 h-2 overflow-hidden rounded-full bg-[#d4ad32]/20"><div className="h-full w-1/2 animate-[pulse_1.2s_ease-in-out_infinite] rounded-full bg-[#d4ad32]" /></div></div>}<Button onClick={props.lookupFee} disabled={props.feeQuery.isFetching || props.feeRosterQuery.isFetching} className="rounded-full bg-[#16283f] text-white">{props.feeQuery.isFetching || props.feeRosterQuery.isFetching ? "Loading…" : "Load session fee ledger"}</Button>{feeLedgerRows.length > 0 && <><div className="grid gap-3 sm:grid-cols-3"><div className="rounded-2xl border border-[#16283f]/10 bg-[#eef3f7] p-4"><p className="text-xs font-bold uppercase tracking-wider text-[#16283f]/55">Students loaded</p><p className="mt-1 font-serif text-2xl font-bold">{visibleFeeRows.length}</p></div><div className="rounded-2xl border border-[#2f7d59]/20 bg-[#e8f5ec] p-4"><p className="text-xs font-bold uppercase tracking-wider text-[#245b2b]/70">Total collected</p><p className="mt-1 font-serif text-2xl font-bold text-[#245b2b]">₹{feeCollected.toLocaleString("en-IN")}</p></div><div className="rounded-2xl border border-[#d4ad32]/30 bg-[#fff9df] p-4"><p className="text-xs font-bold uppercase tracking-wider text-[#77551d]/70">Pending fees</p><p className="mt-1 font-serif text-2xl font-bold text-[#77551d]">₹{feePending.toLocaleString("en-IN")}</p></div></div><div className="grid gap-4 lg:grid-cols-[1fr_260px]"><div className="flex flex-wrap items-end gap-3 rounded-xl border border-[#16283f]/10 bg-[#f7f9fb] p-4"><div className="min-w-[240px] flex-1"><Field label="Search student by name or roll number"><Input value={feeLedgerSearch} onChange={(event) => props.setFeeLedgerSearch?.(event.target.value)} placeholder="Type student name or roll number" /></Field><Field label="Fee status"><select value={props.feeLedgerStatusFilter} onChange={(event) => props.setFeeLedgerStatusFilter(event.target.value)} className="h-10 w-full rounded-md border border-[#16283f]/15 bg-white px-3 text-sm"><option value="all">All Students</option><option value="pending">Pending Only</option><option value="paid">Fully Paid Only</option></select></Field></div><div className="w-full rounded-xl border border-[#16283f]/10 bg-white p-3"><Field label="WhatsApp reminder template"><textarea value={props.reminderTemplate} onChange={(event) => props.setReminderTemplate(event.target.value)} className="min-h-20 w-full rounded-md border border-[#16283f]/15 bg-white px-3 py-2 text-xs" placeholder="Use {name}, {pendingAmount}, {session}, {trade}, {registrationNo}" /><p className="mt-1 text-[11px] text-[#16283f]/50">Placeholders: {'{name}'} · {'{pendingAmount}'} · {'{session}'} · {'{trade}'} · {'{registrationNo}'}</p></Field></div><Button type="button" onClick={bulkSendFeeReminders} disabled={!visibleFeeRows.some((row) => String(row.status || "UNPAID").toUpperCase() !== "FULLY PAID")} className="rounded-full bg-[#25d366] text-white hover:bg-[#1da851]">Bulk Send</Button><Button type="button" variant="outline" onClick={exportFeeCsv} disabled={!visibleFeeRows.length} className="rounded-full border-[#caa52d]/60 bg-white">Download Excel</Button><Button type="button" variant="outline" onClick={() => printFeeLedger(visibleFeeRows, props.feeSearch.session, props.feeSearch.trade)} disabled={!visibleFeeRows.length} className="rounded-full border-[#caa52d]/60 bg-white">Download PDF</Button></div><div className="rounded-xl border border-[#16283f]/10 bg-white p-3"><p className="text-xs font-bold uppercase tracking-wider text-[#16283f]/55">Collected vs pending</p><div className="mt-2 h-40"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={feePieData.length ? feePieData : [{ name: "No data", value: 1, color: "#dbe3ea" }]} dataKey="value" nameKey="name" innerRadius={38} outerRadius={62} paddingAngle={3}>{(feePieData.length ? feePieData : [{ name: "No data", value: 1, color: "#dbe3ea" }]).map((item) => <Cell key={item.name} fill={item.color} />)}</Pie><Tooltip formatter={(value: number) => `₹${Number(value).toLocaleString("en-IN")}`} /></PieChart></ResponsiveContainer></div><div className="flex justify-center gap-3 text-[11px] font-bold"><span className="text-[#2f7d59]">● Collected</span><span className="text-[#77551d]">● Pending</span></div></div></div><div className="overflow-auto rounded-xl border border-[#16283f]/10"><table className="min-w-full border-collapse text-xs"><thead className="bg-[#16283f] text-left font-bold uppercase tracking-wider text-white"><tr><th className="px-3 py-3">Roll</th><th className="px-3 py-3">Student</th><th className="px-3 py-3">Admission</th><th className="px-3 py-3">Collected</th><th className="px-3 py-3">Pending</th><th className="px-3 py-3">Status</th><th className="px-3 py-3">Last Reminder Sent</th><th className="px-3 py-3">Action</th></tr></thead><tbody>{visibleFeeRows.map((row) => <tr key={`${row.session}-${row.trade}-${row.registrationNo}`} onClick={() => props.setSelectedFeeStudent(row)} className="cursor-pointer border-b border-[#16283f]/10 odd:bg-white even:bg-[#f7f9fb] hover:bg-[#fff9df]" title="Open payment history"><td className="px-3 py-3 font-bold">{row.registrationNo}</td><td className="px-3 py-3 font-bold">{row.name}</td><td className="px-3 py-3">₹{row.admissionFee}</td><td className="px-3 py-3 text-[#245b2b]">₹{row.paid}</td><td className="px-3 py-3 text-[#77551d]">₹{row.balance}</td><td className="px-3 py-3">{row.status}</td><td className="px-3 py-3 text-[11px] text-[#16283f]/60">{props.lastReminderSent[`${row.session}-${row.trade}-${row.registrationNo}`] || "Not sent"}</td><td className="px-3 py-3">{String(row.status || "").toUpperCase() !== "FULLY PAID" && <div className="flex flex-wrap gap-2"><Button type="button" size="sm" onClick={(event) => { event.stopPropagation(); sendFeeReminder(row); }} className="rounded-full bg-[#25d366] px-3 text-white hover:bg-[#1da851]">Send Reminder</Button><Button type="button" size="sm" onClick={(event) => { event.stopPropagation(); props.quickMarkPaid(row); }} className="rounded-full bg-[#2f7d59] px-3 text-white hover:bg-[#245b2b]">Mark Paid</Button></div>}</td></tr>)}</tbody></table></div></>}{props.feeLookupData?.student && <div className="rounded-lg bg-[#eef3f7]/55 p-4"><p className="font-black">{props.feeLookupData.student.name}</p><p className="text-xs text-[#16283f]/50">{props.feeLookupData.student.registrationNo}</p><div className="mt-4 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4"><span>Admission<br /><b>₹{props.feeLookupData.totals.admissionFee}</b></span><span>Paid<br /><b>₹{props.feeLookupData.totals.paid}</b></span><span>Balance<br /><b>₹{props.feeLookupData.totals.balance}</b></span><span>Status<br /><b>{props.feeLookupData.totals.status}</b></span></div></div>}<div className="grid gap-3 sm:grid-cols-2"><Field label="Admission fee"><Input type="number" value={props.feePayment.admissionFee} onChange={(event) => props.setFeePayment({ ...props.feePayment, admissionFee: event.target.value })} /></Field><Field label="Payment amount"><Input type="number" value={props.feePayment.paymentAmount} onChange={(event) => props.setFeePayment({ ...props.feePayment, paymentAmount: event.target.value })} /></Field><Field label="Trade"><select value={props.feePayment.trade} onChange={(event) => props.setFeePayment({ ...props.feePayment, trade: event.target.value as Trade })} className="h-10 w-full rounded-md border border-[#16283f]/15 bg-white px-3 text-sm"><option>Fitter</option><option>Electrician</option></select></Field><Field label="Session"><Input value={props.feePayment.session} onChange={(event) => props.setFeePayment({ ...props.feePayment, session: event.target.value })} /></Field><Field label="Mediator"><Input value={props.feePayment.mediator} onChange={(event) => props.setFeePayment({ ...props.feePayment, mediator: event.target.value })} placeholder="Mediator name" /></Field><Field label="Mediator paid"><Input type="number" value={props.feePayment.mediatorPaid} onChange={(event) => props.setFeePayment({ ...props.feePayment, mediatorPaid: event.target.value })} placeholder="Amount paid" /></Field><Field label="Remarks"><Input value={props.feePayment.remarks} onChange={(event) => props.setFeePayment({ ...props.feePayment, remarks: event.target.value })} placeholder="Optional" /></Field></div><Button onClick={props.recordPayment} disabled={props.write.isPending || !props.feeLookupData?.student || !props.feePayment.paymentAmount} className="w-full rounded-full bg-[#16283f] text-white">Save payment + generate invoice</Button>{props.feeReceipt && <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-[#f4e5ad] p-4"><p className="text-sm font-black">{props.feeReceipt.invoiceNo} · Admission ₹{props.feeReceipt.admissionFee || 0} · Total paid ₹{props.feeReceipt.totalPaid || 0} · Balance ₹{props.feeReceipt.balance || 0} · {props.feeReceipt.paymentStatus || (props.feeReceipt.fullyPaid ? "FULLY PAID" : "PARTIALLY PAID")}</p><Button variant="outline" onClick={() => props.printFeeReceipt(props.feeReceipt)} className="rounded-full border-[#16283f]/20 bg-transparent">Print receipt</Button></div>}<Dialog open={Boolean(props.selectedFeeStudent)} onOpenChange={(open) => { if (!open) props.setSelectedFeeStudent(null); }}><DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto"><DialogHeader><DialogTitle className="font-serif text-2xl">Fee payment history</DialogTitle></DialogHeader>{props.selectedFeeStudent && <div className="space-y-4"><div className="rounded-xl bg-[#eef3f7] p-4"><p className="text-lg font-black">{props.selectedFeeStudent.name}</p><p className="text-sm text-[#16283f]/60">Roll/Registration: {props.selectedFeeStudent.registrationNo} · {props.selectedFeeStudent.session} · {props.selectedFeeStudent.trade}</p><div className="mt-3 grid grid-cols-3 gap-2 text-xs"><span>Admission<br /><b>₹{props.selectedFeeStudent.admissionFee}</b></span><span>Collected<br /><b className="text-[#245b2b]">₹{props.selectedFeeStudent.paid}</b></span><span>Pending<br /><b className="text-[#77551d]">₹{props.selectedFeeStudent.balance}</b></span></div></div><div className="overflow-auto rounded-xl border border-[#16283f]/10"><table className="min-w-full border-collapse text-xs"><thead className="bg-[#16283f] text-left font-bold text-white"><tr><th className="px-3 py-3">Invoice</th><th className="px-3 py-3">Date</th><th className="px-3 py-3">Payment</th><th className="px-3 py-3">Cumulative paid</th><th className="px-3 py-3">Balance</th><th className="px-3 py-3">Status</th></tr></thead><tbody>{(props.selectedFeeStudent.data?.payments || []).map((payment: any[], index: number) => <tr key={`${payment[0]}-${index}`} className="border-b border-[#16283f]/10"><td className="px-3 py-3">{payment[0] || "—"}</td><td className="px-3 py-3">{payment[1] || "—"}</td><td className="px-3 py-3">₹{payment[7] || 0}</td><td className="px-3 py-3">₹{payment[8] || 0}</td><td className="px-3 py-3">₹{payment[9] || 0}</td><td className="px-3 py-3">{payment[10] || "UNPAID"}</td></tr>)}</tbody></table></div></div>}</DialogContent></Dialog><Dialog open={props.bulkReminderOpen} onOpenChange={props.setBulkReminderOpen}><DialogContent className="max-w-md"><DialogHeader><DialogTitle className="font-serif text-2xl">Confirm bulk WhatsApp reminders</DialogTitle></DialogHeader><div className="space-y-3"><p className="text-sm leading-6 text-[#16283f]/70">You are about to open WhatsApp reminders for all pending students currently visible in the selected filter.</p><div className="grid grid-cols-3 gap-2"><div className="rounded-xl bg-[#fff9df] p-3 text-center"><p className="text-xs font-bold uppercase text-[#77551d]/70">Pending</p><p className="mt-1 text-2xl font-black text-[#77551d]">{bulkPendingRows.length}</p></div><div className="rounded-xl bg-[#e8f5ec] p-3 text-center"><p className="text-xs font-bold uppercase text-[#245b2b]/70">Will send</p><p className="mt-1 text-2xl font-black text-[#245b2b]">{bulkValidRows.length}</p></div><div className="rounded-xl bg-[#f8e8e8] p-3 text-center"><p className="text-xs font-bold uppercase text-[#9c3d3d]/70">Skipped</p><p className="mt-1 text-2xl font-black text-[#9c3d3d]">{bulkPendingRows.length - bulkValidRows.length}</p></div></div><div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => props.setBulkReminderOpen(false)} className="rounded-full">Cancel</Button><Button type="button" onClick={confirmBulkSendFeeReminders} className="rounded-full bg-[#25d366] text-white hover:bg-[#1da851]">Confirm & Open WhatsApp</Button></div></div></DialogContent></Dialog></CardContent></Card>;
  if (activeModule === "monthlyMarks" || activeModule === "quarterlyMarks" || activeModule === "jobEvolution") { const title = activeModule === "monthlyMarks" ? "Monthly Marks" : activeModule === "quarterlyMarks" ? "Quarterly Marks" : "Job Evolution"; return <div id={activeModule}><Card className="mb-5 border-[#16283f]/10 border-l-4 border-l-[#d4ad32] bg-white shadow-sm"><CardHeader><CardTitle className="font-serif text-2xl font-bold">{title}</CardTitle><p className="text-sm text-[#16283f]/55">Open the selected academic module in the records workspace.</p></CardHeader></Card><AdminRecords mode={activeModule} onNotify={props.onNotify} /></div>; }
  if (activeModule === "attendanceReport" || activeModule === "monthlyReport" || activeModule === "quarterlyReport" || activeModule === "jobReport") { const title = activeModule === "attendanceReport" ? "Attendance Report" : activeModule === "monthlyReport" ? "Monthly Marks Report" : activeModule === "quarterlyReport" ? "Quarterly Marks Report" : "Job Evolution Report"; return <div id={activeModule}><Card className="mb-5 border-[#16283f]/10 border-l-4 border-l-[#d4ad32] bg-white shadow-sm"><CardHeader><CardTitle className="font-serif text-2xl font-bold">{title}</CardTitle><p className="text-sm text-[#16283f]/55">Filter by session, unit, trade, and student before loading this report.</p></CardHeader></Card><AdminRecords mode={activeModule} onNotify={props.onNotify} /></div>; }
  if (activeModule === "records") return <div id="reports-library"><AdminRecords mode="records" onNotify={props.onNotify} /></div>;
  if (activeModule === "fitterCard") return <div id="fitter-card"><AdminRecords mode="fitterCard" onNotify={props.onNotify} /></div>;
  if (activeModule === "electricianCard") return <div id="electrician-card"><AdminRecords mode="electricianCard" onNotify={props.onNotify} /></div>;
  if (activeModule === "staffCertificate") return <div id="staff-certificate"><AdminRecords mode="certificate" onNotify={props.onNotify} /></div>;
  if (activeModule === "audit") return <AuditLogCard logs={props.auditLogs.data || []} />;
  if (activeModule === "security") return <Card id="security" className="border-[#16283f]/10 border-l-4 border-l-[#d4ad32] bg-white shadow-sm"><CardHeader><CardTitle className="font-serif text-2xl font-bold">Security settings</CardTitle></CardHeader><CardContent className="space-y-4"><Field label="New admin username"><Input value={props.credentials.username} onChange={(event) => props.setCredentials({ ...props.credentials, username: event.target.value })} /></Field><Field label="New admin password"><Input type="password" value={props.credentials.password} onChange={(event) => props.setCredentials({ ...props.credentials, password: event.target.value })} /></Field><Button onClick={props.save} className="rounded-full bg-[#16283f] text-white">Save locally</Button></CardContent></Card>;
  return null;
}

function AdminHubLayout({ children, onLogout, activeModule, onSelect }: { children: React.ReactNode; onLogout: () => void; activeModule: AdminModule; onSelect: (module: AdminModule) => void }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const moduleForHref = resolveAdminModule;
  const selectModule = (module: AdminModule) => { onSelect(module); setSidebarOpen(false); };
  const navigationGroups = [
    { title: "Data Entry", items: [{ label: "Monthly Marks", href: "#monthly-marks", icon: FileText }, { label: "Quarterly Marks", href: "#quarterly-marks", icon: FileText }, { label: "Job Evolution", href: "#job-evolution", icon: FileText }, { label: "Fee Ledger", href: "#student-invoice", icon: FileText }, { label: "Reminder Log", href: "#reminder-log", icon: ClipboardList }, { label: "Publish Notice", href: "#publish-notice", icon: ClipboardList }] },
    { title: "Reports Library", items: [{ label: "Attendance", href: "#attendance-report", icon: LayoutDashboard }, { label: "Monthly Marks", href: "#monthly-report", icon: FileText }, { label: "Quarterly Marks", href: "#quarterly-report", icon: FileText }, { label: "Job Evolution", href: "#job-report", icon: FileText }] },
    { title: "Certificates", items: [{ label: "Fitter Card", href: "#fitter-card", icon: FileText }, { label: "Electrician Card", href: "#electrician-card", icon: FileText }, { label: "Staff Experience", href: "#staff-certificate", icon: CheckCircle2 }] },
    { title: "System Config", items: [{ label: "Manage Staff", href: "#staff-management", icon: UsersRound }, { label: "Security", href: "#security", icon: Settings }, { label: "Audit Log", href: "#audit-log", icon: ClipboardList }] },
  ];
  return <div id="admin-hub" className={`${sidebarOpen ? "lg:grid-cols-[220px_1fr]" : "lg:grid-cols-1"} grid gap-6`}>
    {sidebarOpen && <aside className="self-start rounded-xl bg-[#12233d] p-4 text-white shadow-lg lg:sticky lg:top-6">
      <div className="border-b border-white/10 px-3 pb-5"><div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#e2b938]">JYOTI ITC</p><h2 className="mt-2 font-serif text-2xl font-bold">Admin Hub</h2><p className="mt-1 text-xs text-white/55">Operations control centre</p></div><button onClick={() => setSidebarOpen(false)} className="rounded-md p-2 text-white/70 hover:bg-white/10 hover:text-[#e2b938]" aria-label="Hide Admin navigation"><Menu size={18} /></button></div></div>
      <nav className="mt-4 grid gap-5" aria-label="Admin Hub navigation"><button onClick={() => selectModule("overview")} className={`flex items-center gap-3 rounded-md px-3 py-3 text-left text-sm font-bold ${activeModule === "overview" ? "bg-black text-white" : "text-white/70 hover:bg-white/10 hover:text-[#e2b938]"}`}><LayoutDashboard size={17} />Admin Hub</button>{navigationGroups.map((group) => <div key={group.title}><p className="px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">{group.title}</p><div className="mt-1 grid gap-1">{group.items.map(({ label, href, icon: Icon }, index) => { const module = moduleForHref(href); return <button key={`${href}-${label}-${index}`} onClick={() => selectModule(module)} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-xs font-semibold transition ${activeModule === module ? "bg-white/10 text-[#e2b938]" : "text-white/70 hover:bg-white/10 hover:text-[#e2b938]"}`}><Icon size={15} />{label}</button>; })}</div></div>)}</nav>
      <button onClick={onLogout} className="mt-5 flex w-full items-center gap-3 rounded-lg border border-[#e2b938]/50 px-3 py-3 text-left text-sm font-bold text-[#e2b938] hover:bg-[#e2b938] hover:text-[#12233d]"><LogOut size={17} />Sign out</button>
    </aside>}
    <div className="min-w-0"><div className="mb-4 flex items-center justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#d09f1f]">Admin workspace</p><p className="text-xs text-[#12233d]/55">{activeModule === "overview" ? "Choose a module to begin" : "Selected module is open"}</p></div>{!sidebarOpen && <button onClick={() => setSidebarOpen(true)} className="inline-flex items-center gap-2 rounded-lg bg-[#12233d] px-3 py-2 text-xs font-bold text-white shadow-sm" aria-label="Show Admin navigation"><Menu size={16} /> Menu</button>}</div><div className="mb-5 flex min-h-40 flex-col items-center justify-center rounded-xl border border-[#12233d]/10 bg-white px-6 py-8 text-center shadow-sm"><div className="grid h-14 w-14 place-items-center rounded-full bg-[#eef3f7] text-[#12233d]"><ShieldCheck size={28} /></div><p className="mt-4 text-[10px] font-bold uppercase tracking-[0.22em] text-[#d09f1f]">Admin Hub / Overview</p><h2 className="mt-2 text-3xl font-black tracking-tight text-[#12233d]">System Dashboard</h2><p className="mt-2 text-sm text-[#12233d]/55">Select a module from the sidebar to manage institution operations.</p></div>{children}<footer className="mt-8 rounded-xl bg-[#184c42] px-6 py-5 text-center text-white"><p className="font-serif text-xl font-bold">JYOTI ITC</p><p className="mt-1 text-xs text-white/70">Rosera, Samastipur, Bihar · Enterprise Portal Elite</p><p className="mt-3 text-[10px] text-white/45">© 2026 All Rights Reserved</p></footer></div>
  </div>;
}

function ReminderLogCard({ logs }: { logs: any[] }) { return <Card id="reminder-log" className="rounded-xl border-[#16283f]/10 border-l-4 border-l-[#25d366] bg-white shadow-sm"><CardHeader><CardTitle className="flex items-center gap-2 font-serif text-2xl font-bold"><MessageCircle size={20} /> Reminder Log</CardTitle></CardHeader><CardContent>{logs.length ? <div className="overflow-auto rounded-xl border border-[#16283f]/10"><table className="min-w-full border-collapse text-xs"><thead className="bg-[#16283f] text-left font-bold uppercase tracking-wider text-white"><tr><th className="px-3 py-3">Date &amp; time</th><th className="px-3 py-3">Student</th><th className="px-3 py-3">Roll</th><th className="px-3 py-3">Session / Trade</th><th className="px-3 py-3">Pending amount</th><th className="px-3 py-3">Mobile</th><th className="px-3 py-3">Status</th></tr></thead><tbody>{logs.map((log, index) => <tr key={log.id || index} className="border-b border-[#16283f]/10 odd:bg-white even:bg-[#f7f9fb]"><td className="px-3 py-3">{log.sentAt ? new Date(log.sentAt).toLocaleString("en-IN") : "Recent"}</td><td className="px-3 py-3 font-bold">{log.name}</td><td className="px-3 py-3">{log.registrationNo}</td><td className="px-3 py-3">{log.session} · {log.trade}</td><td className="px-3 py-3 text-[#77551d]">₹{Number(log.amount || 0).toLocaleString("en-IN")}</td><td className="px-3 py-3">{log.mobile || "Not available"}</td><td className="px-3 py-3"><span className="rounded-full bg-[#e8f5ec] px-2 py-1 font-bold text-[#245b2b]">{log.status || "Opened"}</span></td></tr>)}</tbody></table></div> : <div className="rounded-xl bg-[#f7f9fb] p-6 text-sm text-[#16283f]/55">No reminders have been sent in this Admin session yet.</div>}</CardContent></Card>; }

function AuditLogCard({ logs }: { logs: any[] }) { return <Card id="audit-log" className="rounded-xl border-[#16283f]/10 border-l-4 border-l-[#d4ad32] bg-white shadow-sm lg:col-span-2"><CardHeader><CardTitle className="flex items-center gap-2 font-serif text-2xl font-bold"><ClipboardList size={20} /> Audit log</CardTitle></CardHeader><CardContent>{logs.length ? <div className="max-h-72 space-y-2 overflow-auto">{logs.slice(0, 50).map((log, index) => <div key={log.id || index} className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-[#f8fafc] px-4 py-3 text-sm"><div><p className="font-bold text-[#12233d]">{formatAuditAction(String(log.action || "activity"))}</p><p className="mt-1 text-xs text-[#12233d]/50">{formatAuditActor(String(log.actor || "system"), String(log.actorRole || "portal"))}{log.entity ? ` · ${log.entity}` : ""}</p></div><time className="text-xs font-semibold text-[#12233d]/45">{log.createdAt ? new Date(log.createdAt).toLocaleString() : "Recent"}</time></div>)}</div> : <p className="text-sm text-[#12233d]/50">No audit events have been recorded yet.</p>}</CardContent></Card>; }

function Stat({ label, value }: { label: string; value: string }) { return <div className="rounded-lg bg-white/10 p-4"><p className="text-[10px] font-bold uppercase tracking-wider text-white/45">{label}</p><p className="mt-2 text-2xl font-black">{value}</p></div>; }
function RecordCard({ title, icon, rows }: { title: string; icon: React.ReactNode; rows: any[] }) { return <Card className="rounded-lg border-[#16283f]/10 border-l-4 border-l-[#d4ad32] bg-white shadow-sm"><CardHeader><CardTitle className="flex items-center gap-2 text-xl font-black tracking-[-0.05em]">{icon}{title}</CardTitle></CardHeader><CardContent><DataTable rows={rows} empty="No records found." /></CardContent></Card>; }
function DataTable({ rows, empty }: { rows: any[]; empty: string }) { if (!rows.length) return <p className="text-sm text-[#16283f]/45">{empty}</p>; return <div className="space-y-2">{rows.slice(0, 6).map((row, index) => <div key={index} className="flex items-center justify-between rounded-xl bg-white/70 px-3 py-3 text-xs"><span className="font-bold">{String(row[0] ?? "Record")}</span><span className="text-[#16283f]/50">{String(row[row.length - 1] ?? "")}</span></div>)}</div>; }

function printFeeReceipt(receipt: any, existingWindow?: Window | null) {
  const printWindow = existingWindow || window.open("about:blank", "_blank");
  if (!printWindow) { window.alert("Please allow pop-ups for JYOTI ITC to print this receipt."); return; }
  printWindow.document.open();
  printWindow.document.write(buildFeeReceiptHtml(receipt));
  printWindow.document.close();
  printWindow.focus();
}
