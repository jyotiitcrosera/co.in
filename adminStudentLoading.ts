export type StudentLoadSelection = {
  session: string;
  trade: string;
  unit: string;
};

export function buildStudentRosterQuery(selection: StudentLoadSelection) {
  return {
    session: selection.session.trim(),
    trade: selection.trade.trim(),
  };
}

export function shouldRenderLoadedRoster(isLoaded: boolean, rows: unknown[][]) {
  return isLoaded && rows.length > 0;
}

export function describeStudentLoad(selection: StudentLoadSelection, count: number) {
  return `${count} students loaded for Session ${selection.session}, ${selection.trade}, Unit ${selection.unit}.`;
}
