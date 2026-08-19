import { describe, expect, it } from "vitest";
import { admissionContacts, admissionWhatsAppMessage, admissionWhatsAppUrl } from "@shared/admissionContacts";

describe("direct admission contact actions", () => {
  it("keeps both supplied call and WhatsApp numbers configured", () => {
    expect(admissionContacts.map((contact) => contact.tel)).toEqual(["+919709506515", "+91797997374"]);
    expect(admissionContacts.map((contact) => contact.whatsapp)).toEqual(["919709506515", "91797997374"]);
  });

  it("builds a WhatsApp URL with an encoded professional admission message", () => {
    const url = admissionWhatsAppUrl(admissionContacts[0].whatsapp);
    expect(url.startsWith("https://wa.me/919709506515?text=")).toBe(true);
    expect(decodeURIComponent(url.split("?text=")[1])).toBe(admissionWhatsAppMessage);
    expect(admissionWhatsAppMessage).toContain("admission");
    expect(admissionWhatsAppMessage).toContain("Fitter/Electrician");
  });
});
