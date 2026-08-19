import { describe, expect, it } from "vitest";
import { canAccessWorkspace } from "@shared/roleAccess";

describe("portal workspace role access", () => {
  it("denies access before authentication", () => {
    expect(canAccessWorkspace("student", null)).toBe(false);
    expect(canAccessWorkspace("admin", null)).toBe(false);
  });

  it("allows only the matching authenticated role", () => {
    expect(canAccessWorkspace("student", "student")).toBe(true);
    expect(canAccessWorkspace("staff", "staff")).toBe(true);
    expect(canAccessWorkspace("admin", "admin")).toBe(true);
  });

  it("denies cross-role workspace access", () => {
    expect(canAccessWorkspace("student", "staff")).toBe(false);
    expect(canAccessWorkspace("staff", "admin")).toBe(false);
    expect(canAccessWorkspace("admin", "student")).toBe(false);
  });
});
