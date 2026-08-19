import { useMemo, useState } from "react";
import { BookOpen, CheckCircle2, FileUp, Loader2, PlayCircle, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { filterStudyMaterial, parseMockQuestions, scoreMockTest, type MockQuestion, type MockAttemptResult } from "@shared/mockTest";

type Props = { student: { roll: string; name: string; session: string; trade: string } };

export default function StudentLearningHub({ student }: Props) {
  const materialQuery = trpc.portal.sheetData.useQuery({ sheetName: "QUESTION BANK" }, { retry: false, staleTime: 60_000 });
  const [questions, setQuestions] = useState<MockQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<MockAttemptResult | null>(null);
  const [fileName, setFileName] = useState("");
  const [fileError, setFileError] = useState("");
  const [attempts, setAttempts] = useState<MockAttemptResult[]>(() => JSON.parse(localStorage.getItem(`jyoti-mock-attempts-${student.session}-${student.trade}-${student.roll}`) || "[]"));
  const materials = useMemo(() => filterStudyMaterial((materialQuery.data || []) as unknown[][], student.session, student.trade, student.roll), [materialQuery.data, student.session, student.trade, student.roll]);

  async function handlePdf(file?: File) {
    if (!file) return;
    setFileError(""); setFileName(file.name); setResult(null); setQuestions([]); setAnswers({});
    try {
      const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
      const data = new Uint8Array(await file.arrayBuffer());
      const pdf = await pdfjs.getDocument({ data }).promise;
      let text = "";
      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
        const page = await pdf.getPage(pageNumber);
        const content = await page.getTextContent();
        text += `${content.items.map((item: any) => item.str).join(" ")}\n`;
      }
      const parsed = parseMockQuestions(text);
      if (!parsed.length) throw new Error("No MCQ questions found. Use numbered questions with A-D options.");
      setQuestions(parsed);
    } catch (error) { setFileError(error instanceof Error ? error.message : "PDF could not be read."); }
  }

  function submitTest() {
    const scored = scoreMockTest(questions, answers);
    setResult(scored);
    const next = [scored, ...attempts].slice(0, 10);
    setAttempts(next);
    localStorage.setItem(`jyoti-mock-attempts-${student.session}-${student.trade}-${student.roll}`, JSON.stringify(next));
  }

  return <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_1.4fr]">
    <div className="space-y-5">
      <Card className="border-[#16283f]/10 border-l-4 border-l-[#2f7d59] bg-white shadow-sm"><CardHeader><CardTitle className="flex items-center gap-2 font-serif text-2xl"><BookOpen size={20} /> Study Material</CardTitle></CardHeader><CardContent>
        {materialQuery.isLoading && <div className="flex items-center gap-2 text-sm text-[#16283f]/60"><Loader2 className="animate-spin" size={16} /> Loading material…</div>}
        {materialQuery.isError && <p className="rounded-lg bg-[#fff5f2] p-3 text-sm text-[#a33a2b]">Question Bank sheet is not available yet. Ask admin to add the `QUESTION BANK` tab.</p>}
        {!materialQuery.isLoading && !materialQuery.isError && !materials.length && <p className="text-sm text-[#16283f]/55">No material is assigned for this student yet.</p>}
        <div className="space-y-2">{materials.map((row, index) => <div key={index} className="flex items-center justify-between gap-3 rounded-lg border border-[#16283f]/10 p-3"><div><p className="text-sm font-bold">{String(row[0] || row[1] || `Material ${index + 1}`)}</p><p className="text-xs text-[#16283f]/55">{row.slice(1).filter(Boolean).join(" · ")}</p></div><Button size="sm" variant="outline" onClick={() => { const url = row.find((value) => String(value).startsWith("http")); if (url) window.open(String(url), "_blank", "noopener,noreferrer"); }}>Open</Button></div>)}</div>
      </CardContent></Card>
      <Card className="border-[#16283f]/10 bg-white shadow-sm"><CardHeader><CardTitle className="flex items-center gap-2 font-serif text-xl"><Trophy size={19} /> Previous Scores</CardTitle></CardHeader><CardContent>{attempts.length ? <div className="space-y-2">{attempts.map((attempt, index) => <div key={index} className="flex justify-between rounded-lg bg-[#f6f8fb] p-3 text-sm"><span>{new Date(attempt.submittedAt).toLocaleString()}</span><b>{attempt.correct}/{attempt.total} · {attempt.percentage}%</b></div>)}</div> : <p className="text-sm text-[#16283f]/55">No mock-test attempts yet.</p>}</CardContent></Card>
    </div>
    <Card className="border-[#16283f]/10 border-l-4 border-l-[#d4ad32] bg-white shadow-sm"><CardHeader><CardTitle className="flex items-center gap-2 font-serif text-2xl"><PlayCircle size={20} /> Online Mock Test</CardTitle><p className="text-sm text-[#16283f]/55">Upload a question PDF with numbered questions and A-D options.</p></CardHeader><CardContent>
      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#d4ad32]/60 bg-[#fffaf0] p-6 text-sm font-bold"><FileUp size={18} /> {fileName || "Choose PDF question paper"}<input type="file" accept="application/pdf" className="hidden" onChange={(event) => handlePdf(event.target.files?.[0])} /></label>
      {fileError && <p className="mt-3 rounded-lg bg-[#fff5f2] p-3 text-sm text-[#a33a2b]">{fileError}</p>}
      {questions.length > 0 && <div className="mt-5 space-y-5">{questions.map((question, index) => <div key={question.id} className="rounded-xl border border-[#16283f]/10 p-4"><p className="text-sm font-bold">{index + 1}. {question.question}</p><div className="mt-3 grid gap-2 sm:grid-cols-2">{question.options.map((option, optionIndex) => <label key={optionIndex} className={`cursor-pointer rounded-lg border p-3 text-sm ${answers[question.id] === optionIndex ? "border-[#d97706] bg-[#fff0d6]" : "border-[#16283f]/10"}`}><input type="radio" name={question.id} checked={answers[question.id] === optionIndex} onChange={() => setAnswers({ ...answers, [question.id]: optionIndex })} className="mr-2" />{option}</label>)}</div></div>)}<Button onClick={submitTest} className="w-full rounded-full bg-[#d97706] text-white hover:bg-[#b45309]">Submit Test & Check Score</Button></div>}
      {result && <div className="mt-5 rounded-xl bg-[#e8f5ec] p-5"><div className="flex items-center gap-2 text-lg font-black text-[#245b2b]"><CheckCircle2 size={20} /> Score: {result.correct}/{result.total} ({result.percentage}%)</div><p className="mt-2 text-sm text-[#245b2b]/80">Answered {result.answered} of {result.total} questions.</p><Badge className="mt-3 bg-[#2f7d59] text-white">Result saved on this device</Badge></div>}
    </CardContent></Card>
  </div>;
}
