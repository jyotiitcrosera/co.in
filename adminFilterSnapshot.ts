export type AdminFilterSnapshot = {
  session: string;
  trade: string;
  unit: string;
};

export function buildAdminFilterSnapshot(input: Partial<AdminFilterSnapshot>): AdminFilterSnapshot {
  return {
    session: String(input.session ?? "").trim(),
    trade: String(input.trade ?? "").trim(),
    unit: String(input.unit ?? "").trim(),
  };
}

export function isAdminFilterReady(snapshot: AdminFilterSnapshot) {
  return Boolean(snapshot.session && snapshot.trade && snapshot.unit);
}
