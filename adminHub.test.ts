import { describe, expect, it } from "vitest";
import { resolveAdminModule } from "@shared/adminHub";

describe("Admin Hub module selection", () => {
  it("uses the empty overview by default", () => {
    expect(resolveAdminModule("#admin-hub")).toBe("overview");
  });

  it("maps distinct report targets to distinct right-panel modules", () => {
    expect(resolveAdminModule("#attendance-report")).toBe("attendanceReport");
    expect(resolveAdminModule("#monthly-report")).toBe("monthlyReport");
    expect(resolveAdminModule("#quarterly-report")).toBe("quarterlyReport");
    expect(resolveAdminModule("#job-report")).toBe("jobReport");
  });

  it("maps sidebar targets to the correct right-panel module", () => {
    expect(resolveAdminModule("#staff-management")).toBe("staff");
    expect(resolveAdminModule("#publish-notice")).toBe("notice");
    expect(resolveAdminModule("#student-invoice")).toBe("fees");
    expect(resolveAdminModule("#monthly-marks")).toBe("monthlyMarks");
    expect(resolveAdminModule("#quarterly-marks")).toBe("quarterlyMarks");
    expect(resolveAdminModule("#job-evolution")).toBe("jobEvolution");
    expect(resolveAdminModule("#reports-library")).toBe("records");
    expect(resolveAdminModule("#fitter-card")).toBe("fitterCard");
    expect(resolveAdminModule("#electrician-card")).toBe("electricianCard");
    expect(resolveAdminModule("#staff-certificate")).toBe("staffCertificate");
    expect(resolveAdminModule("#audit-log")).toBe("audit");
    expect(resolveAdminModule("#security")).toBe("security");
  });
});
