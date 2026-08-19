export type AdmissionEnquiryInput = { applicantName: string; phone: string; email?: string; trade: "Fitter" | "Electrician"; qualification?: string; message?: string };

export function validateAdmissionEnquiry(input: AdmissionEnquiryInput) {
  const errors: string[] = [];
  if (input.applicantName.trim().length < 2) errors.push("Applicant name is required.");
  if (input.phone.trim().length < 7) errors.push("A valid phone number is required.");
  if (input.email && !/^\S+@\S+\.\S+$/.test(input.email.trim())) errors.push("Email address is invalid.");
  if (!["Fitter", "Electrician"].includes(input.trade)) errors.push("Select a supported trade.");
  if (input.message && input.message.length > 2000) errors.push("Message is too long.");
  return errors;
}


export function buildAdmissionEnquirySheetPayload(input: AdmissionEnquiryInput) {
  return {
    type: "admission_enquiry",
    applicant_name: input.applicantName,
    phone: input.phone,
    email: input.email || "",
    trade: input.trade,
    qualification: input.qualification || "",
    message: input.message || "",
  } as const;
}
