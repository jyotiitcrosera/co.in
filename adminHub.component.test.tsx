import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/AdminRecords", () => ({
  default: ({ mode = "records" }: { mode?: string }) => <div data-testid="admin-records">Records module: {mode}</div>,
}));

import { AdminWorkspaceModule } from "@/pages/Portal";

const baseProps = {
  activeModule: "overview",
  staffList: { data: [], isLoading: false },
  newStaff: { username: "", password: "", name: "", trade: "Fitter", unit: "1" },
  setNewStaff: () => undefined,
  createStaff: () => undefined,
  updateUnit: () => undefined,
  deleteStaff: () => undefined,
  notice: { title: "", content: "" },
  setNotice: () => undefined,
  publish: () => undefined,
  feeSearch: { registrationNo: "", name: "" },
  setFeeSearch: () => undefined,
  feeQuery: { data: null, isFetching: false },
  lookupFee: () => undefined,
  feePayment: { admissionFee: "", paymentAmount: "", trade: "Fitter", session: "2025-27", mediator: "", mediatorPaid: "", remarks: "" },
  setFeePayment: () => undefined,
  recordPayment: () => undefined,
  feeReceipt: null,
  printFeeReceipt: () => undefined,
  credentials: { username: "", password: "" },
  setCredentials: () => undefined,
  save: () => undefined,
  write: { isPending: false },
  feeStatus: { tone: "", message: "" },
  adminActionStatus: { tone: "", message: "" },
  auditLogs: { data: [] },
} as any;

describe("Admin Hub workspace renderer", () => {
  it("renders the empty System Dashboard for the default overview", () => {
    const html = renderToStaticMarkup(<AdminWorkspaceModule {...baseProps} activeModule="overview" />);
    expect(html).toContain("System Dashboard");
    expect(html).toContain("Select a module from the sidebar");
  });

  it("renders only the selected notice module in the right workspace", () => {
    const html = renderToStaticMarkup(<AdminWorkspaceModule {...baseProps} activeModule="notice" />);
    expect(html).toContain("Publish notice");
    expect(html).not.toContain("System Dashboard");
  });

  it("renders distinct Data Entry subview headings and modes", () => {
    for (const [module, heading] of [["monthlyMarks", "Monthly Marks"], ["quarterlyMarks", "Quarterly Marks"], ["jobEvolution", "Job Evolution"]] as const) {
      const html = renderToStaticMarkup(<AdminWorkspaceModule {...baseProps} activeModule={module} />);
      expect(html).toContain(heading);
      expect(html).toContain(`Records module: ${module}`);
    }
  });
});
