import { describe, expect, it } from "vitest";
import { buildElectricianProgressCardMarkup, buildProgressCardMarkup, buildProgressSectionMarkup, buildProgressBatchMarkup } from "@shared/progressCard";
import { FITTER_EXERCISES } from "@shared/fitterExercises";

describe("Progress Card formatter", () => {
  it("renders the selected student and all four actual data sections as tables", () => {
    const html = buildProgressCardMarkup({
      student: { name: "Ram", roll: "7", trade: "Fitter", session: "2025-27", unit: "1" },
      attendance: [["DATE", "STATUS"], ["8/8/2026", "P"]],
      monthlyMarks: [["MONTH", "PRACTICAL", "TOTAL"], ["August", 45, 82]],
      quarterlyMarks: [["QUARTER", "TOTAL"], ["Q1", 160]],
      jobEvolution: [["WEEK NO", "A", "TOTAL"], ["1", 8, 40]],
    });
    expect(html).toContain("STUDENT PROGRESS CARD");
    expect(html).toContain("Ram");
    expect(html).toContain("8/8/2026");
    expect(html).toContain("August");
    expect(html).toContain("160");
    expect(html).toContain("WEEK NO");
    expect(html.match(/<table>/g)?.length).toBe(4);
  });

  it("keeps Electrician cards compatible with the shared batch export flow", () => {
    const html = buildElectricianProgressCardMarkup({
      student: { name: "Ankit", roll: "7", trade: "Electrician", session: "2025-27", unit: "1" },
      attendance: [["DATE", "STATUS"]],
      monthlyMarks: [["YEAR", "MONTH", "TOTAL"]],
      quarterlyMarks: [["YEAR", "QUARTER", "TOTAL"]],
      jobEvolution: [["WEEK NO", "GRADING", "REMARKS"]],
    }, Array.from({ length: 104 }, (_, index) => ({ week: index + 1, text: `Electrician exercise ${index + 1}` })));
    const batch = buildProgressBatchMarkup([html, html]);
    expect(html).toContain("Electrician exercise 104");
    expect(html.match(/data-page="/g)?.length).toBe(5);
    expect(batch).toContain('data-card-count="2"');
  });

  it("renders the complete supplied Fitter catalog with the shared card behavior", () => {
    expect(FITTER_EXERCISES).toHaveLength(76);
    expect(FITTER_EXERCISES[0]).toEqual({ week: 1, text: "IMPORTANCE OF TRADE TRAINING, LIST OF TOOLS" });
    expect(FITTER_EXERCISES[75]).toEqual({ week: 76, text: "MAKING DOUBLE SQUARE FITTING" });
    const html = buildElectricianProgressCardMarkup({
      student: { name: "Ravi", roll: "12", trade: "Fitter", session: "2025-27", unit: "1" },
      attendance: [["DATE", "STATUS"]],
      monthlyMarks: [["YEAR", "MONTH", "TOTAL"]],
      quarterlyMarks: [["YEAR", "QUARTER", "TOTAL"]],
      jobEvolution: [["WEEK NO", "GRADING", "REMARKS"]],
    }, FITTER_EXERCISES);
    expect(html).toContain("IMPORTANCE OF TRADE TRAINING, LIST OF TOOLS");
    expect(html).toContain("MAKING DOUBLE SQUARE FITTING");
    expect(html.match(/data-page="/g)?.length).toBe(4);
  });

  it("renders the supplied four-page Electrician format with year-split assessments and institute sign", () => {
    const html = buildElectricianProgressCardMarkup({
      student: { name: "Ankit", roll: "7", trade: "Electrician", session: "2025-27", unit: "1" },
      attendance: [["DATE", "STATUS"]],
      monthlyMarks: [["YEAR", "MONTH", "PRACTICAL", "THEORY", "TOTAL"], ["1", "August", 45, 18, 90], ["2", "August", 40, 20, 80]],
      quarterlyMarks: [["YEAR", "QUARTER", "PRACTICAL", "THEORY", "TOTAL"], ["1", "Quarterly 1", 80, 45, 130], ["2", "Quarterly 1", 70, 35, 110]],
      jobEvolution: [["WEEK NO", "GRADING", "REMARKS"], ["1", "A", "Good"]],
    }, [{ week: 1, text: "VISIT VARIOUS SECTION" }, { week: 53, text: "SECOND YEAR EXERCISE" }], { instituteSignUrl: "data:image/png;base64,sign", manual: { grading: "A", remarks: "Very good" } });
    expect(html.match(/data-page="/g)?.length).toBe(3);
    expect(html).toContain("Monthly Test · Year 1");
    expect(html).toContain("Monthly Test · Year 2");
    expect(html).toContain("90%");
    expect(html).toContain("data:image/png;base64,sign");
    expect(html).toContain("Principal Signature");
    expect(html).toContain("Inst. Initial");
    expect(html).toContain("Drg. Inst. Initial");
    expect(html).toContain("Math Inst. Initial");
    expect(html).toContain("G.I.S. Initial");
    expect(html).toContain("VISIT VARIOUS SECTION");
    expect(html).toContain("SECOND YEAR EXERCISE");
    expect(html).toContain(">A</td>");
    expect(html).toContain("Very good");
    expect(html.match(/Monthly Assessment Year 1/g)?.length).toBe(1);
    expect(html.match(/Monthly Assessment Year 2/g)?.length).toBe(1);
  });

  it("prints every exercise and signs only rows with Grade or Remarks", () => {
    const exercises = Array.from({ length: 104 }, (_, index) => ({ week: index + 1, text: `Exercise ${index + 1}` }));
    const html = buildElectricianProgressCardMarkup({
      student: { name: "Ram", roll: "8", trade: "Electrician", session: "2025-27" },
      attendance: [["DATE", "STATUS"]],
      monthlyMarks: [["YEAR", "MONTH", "PRACTICAL", "THEORY", "TOTAL"]],
      quarterlyMarks: [["YEAR", "QUARTER", "PRACTICAL", "THEORY", "TOTAL"]],
      jobEvolution: [["WEEK NO", "GRADING", "REMARKS"], [43, "A", "Done"], [90, "", ""]],
    }, exercises, { exerciseSignUrl: "sign.png" });
    expect(html).toContain(">Exercise 43<");
    expect(html).toContain(">Exercise 52<");
    expect(html).toContain(">Exercise 90<");
    expect(html).toContain(">Exercise 104<");
    expect(html.match(/data-page="/g)?.length).toBe(5);
    expect(html.match(/alt="Instructor initial"/g)?.length).toBe(1);
  });

  it("adds automatic remarks for populated grades and keeps the final exercise line", () => {
    const exercises = Array.from({ length: 52 }, (_, index) => ({ week: index + 1, text: `Exercise ${index + 1}` }));
    const html = buildElectricianProgressCardMarkup({
      student: { name: "Ram", roll: "8", trade: "Electrician", session: "2025-27" },
      attendance: [["DATE", "STATUS"]],
      monthlyMarks: [["YEAR", "MONTH", "TOTAL"]],
      quarterlyMarks: [["YEAR", "QUARTER", "TOTAL"]],
      jobEvolution: [["WEEK NO", "GRADING", "REMARKS"], [1, "A", ""], [2, "B", ""], [3, "C", ""], [4, "D", ""]],
    }, exercises);
    expect(html).toContain(">Excellent</td>");
    expect(html).toContain(">Good</td>");
    expect(html).toContain(">Pass</td>");
    expect(html).toContain(">Fail</td>");
    expect(html.match(/pc-last-exercise-line/g)?.length).toBe(2);
  });

  it("fetches WCS from column 3 and calculates Quarterly percentage from 100", () => {
    const html = buildElectricianProgressCardMarkup({
      student: { name: "Ram", roll: "8", trade: "Electrician", session: "2025-27" },
      attendance: [["DATE", "STATUS"]],
      monthlyMarks: [["YEAR", "MONTH", "PRACTICAL", "THEORY", "TOTAL"]],
      quarterlyMarks: [["YEAR", "QUARTER", "PRACTICAL", "THEORY", "WCS", "ENGG DRG", "TOTAL"], ["1", "I", 100, 20, 10, 20, 75]],
      jobEvolution: [["WEEK NO", "GRADING", "REMARKS"]],
    }, []);
    expect(html).toContain(">10<");
    expect(html).toContain("75%");
  });

  it("leaves Year 2 assessment rows blank when legacy marks have no YEAR column", () => {
    const html = buildElectricianProgressCardMarkup({
      student: { name: "Ram", roll: "8", trade: "Electrician", session: "2025-27" },
      attendance: [["DATE", "STATUS"]],
      monthlyMarks: [["MONTH", "TOTAL"], ["August", 80]],
      quarterlyMarks: [["QUARTER", "TOTAL"], ["I", 120]],
      jobEvolution: [["WEEK NO", "GRADING"]],
    }, [{ week: 1, text: "EXERCISE" }]);
    expect(html).toContain("Monthly Test · Year 1");
    expect(html).toContain("Monthly Test · Year 2");
    expect(html).toContain("data-page=\"3\"");
  });

  it("assembles only valid student cards into a batch export document", () => {
    const html = buildProgressBatchMarkup(["<article>Student A</article>", "", "<article>Student B</article>"]);
    expect(html).toContain('data-card-count="2"');
    expect(html).toContain("Student A");
    expect(html).toContain("Student B");
    expect(html).not.toContain('data-card-count="3"');
  });

  it("shows a clear empty state and escapes unsafe cell values", () => {
    const empty = buildProgressSectionMarkup("Attendance History", [["DATE", "STATUS"]], "No attendance records found.");
    expect(empty).toContain("No attendance records found.");
    const escaped = buildProgressSectionMarkup("Marks", [["NAME"], ["<script>alert(1)</script>"]], "Empty");
    expect(escaped).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
    expect(escaped).not.toContain("<script>alert");
  });
});
