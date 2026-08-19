import { describe, expect, it } from "vitest";
import { friendlyPortalError } from "@shared/portalErrors";

describe("friendly portal errors", () => {
  it("hides raw HTML for Google Sheets HTTP 405 failures", () => {
    expect(friendlyPortalError(new Error("Google Sheets backend returned 405: <!DOCTYPE html>"), "Fallback")).toContain("Existing Sheet data is safe");
    expect(friendlyPortalError(new Error("Google Sheets backend returned 405: <!DOCTYPE html>"), "Fallback")).not.toContain("<!DOCTYPE html>");
  });

  it("preserves a useful non-Sheets error", () => {
    expect(friendlyPortalError(new Error("Student was not found"), "Fallback")).toBe("Student was not found");
    expect(friendlyPortalError(null, "Fallback")).toBe("Fallback");
  });
});
