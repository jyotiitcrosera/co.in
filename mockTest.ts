export type MockQuestion = {
  id: string;
  question: string;
  options: string[];
  answer?: number;
};

export type MockAttemptResult = {
  total: number;
  answered: number;
  correct: number;
  score: number;
  percentage: number;
  submittedAt: string;
};

export function parseMockQuestions(text: string): MockQuestion[] {
  const normalized = text.replace(/\r/g, "").replace(/[ \t]+/g, " ");
  const blocks = normalized.split(/(?=\n\s*(?:Q(?:uestion)?\s*)?\d+[.)\s])/i).filter(Boolean);
  return blocks.map((block, index) => {
    const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
    const questionLine = lines.shift() || `Question ${index + 1}`;
    const question = questionLine.replace(/^\s*(?:Q(?:uestion)?\s*)?\d+[.)\-:]?\s*/i, "").trim();
    const options = lines.filter((line) => /^[A-D][.)\-:]/i.test(line)).map((line) => line.replace(/^[A-D][.)\-:]\s*/i, "").trim()).slice(0, 4);
    const answerLine = lines.find((line) => /^(?:answer|ans)\s*[:\-]/i.test(line));
    const answerLetter = answerLine?.match(/^(?:answer|ans)\s*[:\-]\s*([A-D])/i)?.[1];
    const answer = answerLetter ? answerLetter.toUpperCase().charCodeAt(0) - 65 : undefined;
    return { id: `q-${index + 1}`, question, options, ...(answer !== undefined && answer < options.length ? { answer } : {}) };
  }).filter((item) => item.question && item.options.length >= 2);
}

export function scoreMockTest(questions: MockQuestion[], answers: Record<string, number>): MockAttemptResult {
  const answered = questions.filter((question) => answers[question.id] !== undefined).length;
  const correct = questions.filter((question) => question.answer !== undefined && answers[question.id] === question.answer).length;
  const total = questions.length;
  const score = correct;
  return { total, answered, correct, score, percentage: total ? Math.round((correct / total) * 100) : 0, submittedAt: new Date().toISOString() };
}

export function filterStudyMaterial(rows: unknown[][], session: string, trade: string, roll: string) {
  if (!rows.length) return [];
  const headers = rows[0].map((value) => String(value ?? "").toLowerCase());
  const sessionIndex = headers.findIndex((value) => value.includes("session"));
  const tradeIndex = headers.findIndex((value) => value.includes("trade"));
  const rollIndex = headers.findIndex((value) => value.includes("roll") || value.includes("registration"));
  return rows.slice(1).filter((row) => {
    const sessionOk = sessionIndex < 0 || !row[sessionIndex] || String(row[sessionIndex]).replace(/\s/g, "").toLowerCase() === session.replace(/\s/g, "").toLowerCase();
    const tradeOk = tradeIndex < 0 || !row[tradeIndex] || String(row[tradeIndex]).toLowerCase().includes(trade.toLowerCase());
    const rollOk = rollIndex < 0 || !row[rollIndex] || String(row[rollIndex]) === roll;
    return sessionOk && tradeOk && rollOk;
  });
}
