export const admissionContacts = [
  { display: "+91 97095 06515", tel: "+919709506515", whatsapp: "919709506515" },
  { display: "+91 79799 7374", tel: "+91797997374", whatsapp: "91797997374" },
] as const;

export const admissionWhatsAppMessage = "Hello JYOTI ITC Rosera Admission Desk, I would like to enquire about admission. Please share details about available trades (Fitter/Electrician), eligibility, fees, required documents, and the current session. Thank you.";

export function admissionWhatsAppUrl(number: string) {
  return `https://wa.me/${number}?text=${encodeURIComponent(admissionWhatsAppMessage)}`;
}
