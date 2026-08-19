import React from "react";
import { Input } from "@/components/ui/input";

type RowEdit = { grading?: string; remarks?: string };

type Props = {
  progressData: any;
  exercises: Array<{ week: number; text: string }>;
  rowEdits: Record<string, RowEdit>;
  onRowEdit: (key: string, field: "grading" | "remarks", value: string) => void;
};

function headerIndex(matrix: any[][], tokens: string[]) {
  const headers = (matrix?.[0] || []).map((value: unknown) => String(value ?? "").toUpperCase().replace(/[^A-Z0-9]/g, ""));
  return headers.findIndex((header: string) => tokens.some((token) => header.includes(token)));
}

function valueAt(row: any[], matrix: any[][], tokens: string[]) {
  const index = headerIndex(matrix, tokens);
  return index >= 0 ? String(row[index] ?? "") : "";
}

function markRows(matrix: any[][], year: string) {
  if (!matrix?.length) return [];
  const yearIndex = headerIndex(matrix, ["YEAR", "CLASS"]);
  return matrix.slice(1).filter((row) => !yearIndex || String(row[yearIndex] ?? "").toLowerCase().replace(/[^a-z0-9]/g, "").includes(year === "1" ? "1" : "2"));
}

function EditCell({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) {
  return <Input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="h-8 min-w-[110px] bg-white text-xs" />;
}

export function ProgressCardEditor({ progressData, exercises, rowEdits, onRowEdit }: Props) {
  const monthly = progressData?.monthlyMarks || [];
  const quarterly = progressData?.quarterlyMarks || [];
  const pageExercises = (start: number, end: number) => exercises.filter((exercise) => exercise.week >= start && exercise.week <= end);
  const assessmentRows = (matrix: any[][], year: string) => markRows(matrix, year);
  const assessmentPage = (year: string, prefix: string) => {
    const monthlyRows = assessmentRows(monthly, year);
    const quarterlyRows = assessmentRows(quarterly, year);
    const table = (title: string, rows: any[][], matrix: any[][], keyPrefix: string) => <div className="overflow-x-auto rounded-lg border border-[#16283f]/15 bg-white"><h4 className="border-b border-[#16283f]/10 bg-[#eef3f7] px-3 py-2 font-serif text-sm font-bold text-[#16283f]">{title}</h4><table className="min-w-[880px] w-full border-collapse text-xs"><thead><tr className="bg-[#16283f] text-left text-[10px] uppercase tracking-wide text-white"><th className="px-2 py-2">Period</th><th className="px-2 py-2">Practical</th><th className="px-2 py-2">Theory</th><th className="px-2 py-2">Total</th><th className="px-2 py-2">Percentage</th><th className="px-2 py-2">Grade</th><th className="px-2 py-2">Remarks</th></tr></thead><tbody>{rows.length ? rows.map((row, index) => { const key = `${keyPrefix}-${index}`; const edit = rowEdits[key] || {}; return <tr key={key} className="border-b border-[#16283f]/10"><td className="px-2 py-2 font-semibold">{valueAt(row, matrix, ["MONTH", "QUARTER", "PERIOD", "LABEL"]) || index + 1}</td><td className="px-2 py-2">{valueAt(row, matrix, ["PRACTICAL", "PRAC"])}</td><td className="px-2 py-2">{valueAt(row, matrix, ["THEORY"])}</td><td className="px-2 py-2">{valueAt(row, matrix, ["TOTAL"])}</td><td className="px-2 py-2">{valueAt(row, matrix, ["PERCENTAGE", "PERCENT"])}</td><td className="px-2 py-2"><EditCell value={edit.grading || ""} onChange={(value) => onRowEdit(key, "grading", value)} placeholder="Grade" /></td><td className="px-2 py-2"><EditCell value={edit.remarks || ""} onChange={(value) => onRowEdit(key, "remarks", value)} placeholder="Remarks" /></td></tr>; }) : <tr><td colSpan={7} className="px-3 py-5 text-center text-sm italic text-[#16283f]/50">No {title.toLowerCase()} data for this year.</td></tr>}</tbody></table></div>;
    return <div className="space-y-4">{table(`Monthly · Year ${year}`, monthlyRows, monthly, `monthly-y${year}`)}{table(`Quarterly · Year ${year}`, quarterlyRows, quarterly, `quarterly-y${year}`)}</div>;
  };
  const weeklyPage = (start: number, end: number, page: number) => <div className="overflow-x-auto rounded-lg border border-[#16283f]/15 bg-white"><h4 className="border-b border-[#16283f]/10 bg-[#eef3f7] px-3 py-2 font-serif text-sm font-bold text-[#16283f]">Page {page} · Exercises {start}–{end}</h4><table className="min-w-[880px] w-full border-collapse text-xs"><thead><tr className="bg-[#16283f] text-left text-[10px] uppercase tracking-wide text-white"><th className="px-2 py-2">Week</th><th className="px-2 py-2">Exercise</th><th className="px-2 py-2">Grade</th><th className="px-2 py-2">Remarks</th></tr></thead><tbody>{pageExercises(start, end).map((exercise) => { const key = `week-${exercise.week}`; const edit = rowEdits[key] || {}; return <tr key={key} className="border-b border-[#16283f]/10"><td className="px-2 py-2 font-semibold">{exercise.week}</td><td className="px-2 py-2 text-left">{exercise.text}</td><td className="px-2 py-2"><EditCell value={edit.grading || ""} onChange={(value) => onRowEdit(key, "grading", value)} placeholder="Grade" /></td><td className="px-2 py-2"><EditCell value={edit.remarks || ""} onChange={(value) => onRowEdit(key, "remarks", value)} placeholder="Remarks" /></td></tr>; })}</tbody></table></div>;
  return <section className="space-y-5 rounded-xl border-2 border-[#d4ad32]/60 bg-[#f7f9fb] p-4" aria-label="Four-page editable progress card"><div className="flex flex-wrap items-center justify-between gap-2"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#77551d]">Editable four-page card</p><p className="text-sm font-semibold text-[#16283f]/65">Exercise देखकर Grade और Remarks इसी panel में भरें।</p></div><span className="rounded-full bg-[#d4ad32]/25 px-3 py-1 text-xs font-bold text-[#16283f]">Pages 1–4</span></div><div className="rounded-xl border border-[#16283f]/15 bg-white p-3"><h3 className="mb-3 font-serif text-lg font-bold text-[#16283f]">Page 1 · First-year practical exercises</h3>{weeklyPage(1, 52, 1)}</div><div className="rounded-xl border border-[#16283f]/15 bg-white p-3"><h3 className="mb-3 font-serif text-lg font-bold text-[#16283f]">Page 2 · First-year Monthly and Quarterly</h3>{assessmentPage("1", "")}</div><div className="rounded-xl border border-[#16283f]/15 bg-white p-3"><h3 className="mb-3 font-serif text-lg font-bold text-[#16283f]">Page 3 · Second-year practical exercises</h3>{weeklyPage(53, 104, 3)}</div><div className="rounded-xl border border-[#16283f]/15 bg-white p-3"><h3 className="mb-3 font-serif text-lg font-bold text-[#16283f]">Page 4 · Second-year Monthly and Quarterly</h3>{assessmentPage("2", "")}</div></section>;
}
