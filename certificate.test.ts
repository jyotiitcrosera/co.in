import { describe, expect, it } from "vitest";
import { buildExperienceCertificateText, formatEmploymentPeriods } from "@shared/certificate";

describe("experience certificate", () => {
  it("formats the requested formal text without username fields", () => {
    const certificate = buildExperienceCertificateText({
      teacherName: "RAM",
      fatherName: "darshratt",
      designation: "Instructor (Fitter)",
      trade: "Fitter",
      periods: [{ from: "2026-08-26", to: "" }],
    });
    expect(certificate.title).toBe("EXPERIENCE CERTIFICATE");
    expect(certificate.salutation).toBe("TO WHOMSOEVER IT MAY CONCERN");
    expect(certificate.paragraphs[0]).toContain("RAM, S/o Sh. darshratt");
    expect(certificate.paragraphs[0]).toContain("Instructor (Fitter)");
    expect(certificate.paragraphs[1]).toContain("26/08/2026 to till date");
    expect(certificate.paragraphs.join(" ")).not.toContain("username");
  });

  it("supports multiple employment periods", () => {
    expect(formatEmploymentPeriods([
      { from: "2020-01-02", to: "2021-03-04" },
      { from: "2022-05-06", to: "" },
    ])).toBe("from 02/01/2020 to 04/03/2021; from 06/05/2022 to till date");
  });
});
