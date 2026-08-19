export type ExperiencePeriod = { from: string; to: string };

export type ExperienceCertificateInput = {
  teacherName: string;
  fatherName: string;
  designation: string;
  trade: string;
  periods: ExperiencePeriod[];
};

export const CERTIFICATE_DESIGNATIONS = [
  "Instructor (Fitter)",
  "Instructor (Electrician)",
  "Workshop Instructor (Fitter)",
  "Workshop Instructor (Electrician)",
  "Principal",
] as const;

function clean(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export function formatCertificateDate(value: string) {
  if (!value) return "till date";
  const [year, month, day] = value.split("-");
  return year && month && day ? `${day}/${month}/${year}` : value;
}

export function formatEmploymentPeriods(periods: ExperiencePeriod[]) {
  const valid = periods.filter((period) => clean(period.from) || clean(period.to));
  if (!valid.length) return "from the date of joining to till date";
  return valid.map((period) => `from ${formatCertificateDate(clean(period.from)) || "the date of joining"} to ${formatCertificateDate(clean(period.to))}`).join("; ");
}

export function buildExperienceCertificateText(input: ExperienceCertificateInput) {
  const teacher = clean(input.teacherName) || "________________";
  const father = clean(input.fatherName) || "________________";
  const designation = clean(input.designation) || "Instructor";
  const trade = clean(input.trade) || "the assigned trade";
  return {
    title: "EXPERIENCE CERTIFICATE",
    salutation: "TO WHOMSOEVER IT MAY CONCERN",
    paragraphs: [
      `This is to certify that Mr./Ms. ${teacher}, S/o Sh. ${father}, has been employed as an ${designation} at JYOTI ITC, Rosera, Bihar.`,
      `He/She worked diligently with this institute ${formatEmploymentPeriods(input.periods)}.`,
      `During his/her tenure, the above-named proved to be a dedicated, knowledgeable, and responsible ${designation}. He/She has been instrumental in providing theoretical and practical training to students of the ${trade} trade, maintaining high teaching standards, and contributing significantly to the academic growth of the ITI. His/Her character, conduct, and professional performance have been exemplary.`,
      "We wish him/her the very best for future endeavors.",
    ],
    signature: "Authorized Signatory\n[Signature & Stamp]",
  };
}
