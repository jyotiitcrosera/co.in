import type { ReportFilters } from "@shared/reportFilters";

export function marksReportFiltersForSheet(filters: ReportFilters, sheetName: string): ReportFilters {
  const name = String(sheetName).toLowerCase();
  return {
    ...filters,
    session: "",
    unit: name.includes("job") || name.includes("evolution") ? filters.unit : "",
    date: name.includes("attendance") ? filters.date : "",
    month: name.includes("monthly") ? filters.month : "",
    quarter: name.includes("quarterly") ? filters.quarter : "",
    week: name.includes("job") || name.includes("evolution") ? filters.week : "",
    year: filters.year,
  };
}
