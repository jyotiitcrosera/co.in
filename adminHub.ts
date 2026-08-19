export type AdminModule = "overview" | "staff" | "notice" | "fees" | "reminderLog" | "monthlyMarks" | "quarterlyMarks" | "jobEvolution" | "attendanceReport" | "monthlyReport" | "quarterlyReport" | "jobReport" | "records" | "fitterCard" | "electricianCard" | "staffCertificate" | "audit" | "security";

export function resolveAdminModule(href: string): AdminModule {
  if (href.includes("staff-certificate")) return "staffCertificate";
  if (href.includes("staff")) return "staff";
  if (href.includes("notice")) return "notice";
  if (href.includes("student-invoice")) return "fees";
  if (href.includes("reminder-log")) return "reminderLog";
  if (href.includes("monthly-marks")) return "monthlyMarks";
  if (href.includes("quarterly-marks")) return "quarterlyMarks";
  if (href.includes("job-evolution")) return "jobEvolution";
  if (href.includes("attendance-report")) return "attendanceReport";
  if (href.includes("monthly-report")) return "monthlyReport";
  if (href.includes("quarterly-report")) return "quarterlyReport";
  if (href.includes("job-report")) return "jobReport";
  if (href.includes("reports") || href.includes("marks-entry")) return "records";
  if (href.includes("fitter-card")) return "fitterCard";
  if (href.includes("electrician-card")) return "electricianCard";
  if (href.includes("progress") || href.includes("certificate")) return "staffCertificate";
  if (href.includes("security")) return "security";
  if (href.includes("audit")) return "audit";
  return "overview";
}
