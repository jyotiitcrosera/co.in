import { describe, expect, it } from "vitest";
import { buildPrintDocumentHtml } from "@shared/printDocument";

describe("certificate letterhead print and preview", () => {
  it("uses a borderless certificate page with no line above the heading", () => {
    const html = buildPrintDocumentHtml("EXPERIENCE CERTIFICATE", "<div class=\"certificate-copy\"><h2>TO WHOMSOEVER IT MAY CONCERN</h2></div>", { letterhead: true, topBlankMm: 42, autoPrint: false });
    expect(html).toContain("@page{size:A4 portrait;margin:0}");
    expect(html).toContain("<title></title>");
    expect(html).toContain(".letterhead.page{border:0!important");
    expect(html).toContain(".certificate-copy{max-width:168mm");
    expect(html).toContain("font-size:14px;line-height:1.75");
    expect(html).toContain("font-size:15px;line-height:1.35");
    expect(html).toContain("font-size:13px;line-height:1.5");
    expect(html).not.toContain("<div class=\"eyebrow\">");
    expect(html).not.toContain("<div class=\"brand\">");
    expect(html).not.toContain("<div class=\"title\">");
    expect(html).not.toContain("class=\"footer\"");
    expect(html).toContain("padding-top:42mm");
    expect(html).toContain("data-top-margin-mm=\"42\"");
    expect(html).not.toContain("window.print()");
  });

  it("propagates a changed top margin to print output", () => {
    const html = buildPrintDocumentHtml("EXPERIENCE CERTIFICATE", "<p>Certificate</p>", { letterhead: true, topBlankMm: 65 });
    expect(html).toContain("padding-top:65mm");
    expect(html).toContain("data-top-margin-mm=\"65\"");
    expect(html).toContain("padding:0 8mm 8mm");
    expect(html).toContain("window.print()");
  });
});
