import { describe, expect, it } from "vitest";
import { filterStudyMaterial, parseMockQuestions, scoreMockTest } from "./mockTest";

describe("student Study Material and Mock Tests", () => {
  it("parses numbered PDF text with options and answer keys", () => {
    const questions = parseMockQuestions("1. PPE is required for?\nA. Safety\nB. Decoration\nC. None\nD. Other\nAnswer: A\n2. ITI means?\nA. One\nB. Two\nAnswer: B");
    expect(questions).toHaveLength(2);
    expect(questions[0]).toMatchObject({ question: "PPE is required for?", answer: 0 });
    expect(questions[1]).toMatchObject({ answer: 1 });
  });

  it("scores a submitted mock test", () => {
    const questions = parseMockQuestions("1. One?\nA. Yes\nB. No\nAnswer: A\n2. Two?\nA. Yes\nB. No\nAnswer: B");
    expect(scoreMockTest(questions, { "q-1": 0, "q-2": 0 })).toMatchObject({ total: 2, answered: 2, correct: 1, percentage: 50 });
  });

  it("filters material by student session, trade, and roll", () => {
    const rows = [["Title", "Session", "Trade", "Roll", "URL"], ["Fitter PDF", "2025-27", "Fitter", "1", "https://example.com/fitter"], ["Other", "2025-27", "Electrician", "1", "https://example.com/other"]];
    expect(filterStudyMaterial(rows, "2025-27", "Fitter", "1")).toHaveLength(1);
  });
});
