export type PortalRole = "student" | "staff" | "admin";

export function canAccessWorkspace(requestedRole: PortalRole, activeRole: PortalRole | null) {
  return activeRole !== null && requestedRole === activeRole;
}
