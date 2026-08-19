import { describe, expect, it } from "vitest";
import { buildAdmissionEnquirySheetPayload, validateAdmissionEnquiry } from "@shared/admissionEnquiry";
import { formatAuditAction, formatAuditActor } from "@shared/auditLog";
import { buildStudentLoginInstructionsHtml } from "@shared/studentInstructions";

describe("admission enquiry validation", () => {
  it("accepts a valid Fitter enquiry", () => {
    expect(validateAdmissionEnquiry({ applicantName: "Ravi Kumar", phone: "9876543210", email: "ravi@example.com", trade: "Fitter", qualification: "10th Pass", message: "Please share documents." })).toEqual([]);
  });

  it("reports missing applicant and invalid contact details", () => {
    expect(validateAdmissionEnquiry({ applicantName: " ", phone: "123", email: "not-an-email", trade: "Electrician" })).toEqual(["Applicant name is required.", "A valid phone number is required.", "Email address is invalid."]);
  });

  it("builds a Google Sheets Admission Enquiry payload", () => {
    expect(buildAdmissionEnquirySheetPayload({ applicantName: "Ankit Singh", phone: "9876543210", trade: "Fitter", qualification: "10th Pass", message: "Fees details" })).toEqual({ type: "admission_enquiry", applicant_name: "Ankit Singh", phone: "9876543210", email: "", trade: "Fitter", qualification: "10th Pass", message: "Fees details" });
  });
});

describe("audit labels", () => {
  it("turns action codes into readable labels", () => {
    expect(formatAuditAction("record_fee_payment")).toBe("Record Fee Payment");
    expect(formatAuditActor("admin", "admin")).toBe("admin · admin");
  });
});

describe("student instructions", () => {
  it("contains the branded A4 document and supported login steps", () => {
    const html = buildStudentLoginInstructionsHtml();
    expect(html).toContain("Student Login Instructions");
    expect(html).toContain("Fitter");
    expect(html).toContain("Electrician");
    expect(html).toContain("@page{size:A4 portrait");
    expect(html).toContain("Need help?");
  });
});
