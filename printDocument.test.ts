import { describe, expect, it } from "vitest";
import { buildPrintDocumentHtml } from "../shared/printDocument";

describe("buildPrintDocumentHtml", () => {
  it("renders a bordered A4 institutional printable document shell", () => {
    const html = buildPrintDocumentHtml("Progress Card", "<p>Student record</p>");
    expect(html).toContain("<title>Progress Card</title>");
    expect(html).toContain("Student record");
    expect(html).toContain("window.print()");
    expect(html).toContain("@page{size:A4 portrait");
    expect(html).toContain("border:2px solid #172238");
    expect(html).toContain("border:1px solid #d1a62e");
    expect(html).toContain("data-top-margin-mm=\"0\"");
    expect(html).toContain("class=\"page");
    expect(html).toContain("Computer generated document");
  });

  it("propagates a custom Progress Card binding margin and clamps unsafe values", () => {
    const custom = buildPrintDocumentHtml("Progress Card", '<section class="pc-page">Card</section>', { progressCard: true, progressLeftMarginMm: 44.5 });
    expect(custom).toContain("padding:4mm 4mm 7.62mm 44.5mm");
    expect(custom).toContain("padding-left:44.5mm");
    const clamped = buildPrintDocumentHtml("Progress Card", '<section class="pc-page">Card</section>', { progressCard: true, progressLeftMarginMm: 100 });
    expect(clamped).toContain("padding-left:60mm");
  });

  it("uses an exact A4 progress-card print shell with page-break support", () => {
    const html = buildPrintDocumentHtml("Progress Card", '<div class="electrician-progress-card"><section class="pc-page" data-page="1">Page 1</section><section class="pc-page" data-page="2">Page 2</section><section class="pc-page" data-page="3">Page 3</section><section class="pc-page" data-page="4">Page 4</section></div>', { progressCard: true });
    expect(html).toContain('class="page  progress-card-print"');
    expect(html).toContain("@page{size:A4 portrait;margin:0}");
    expect(html).toContain("width:210mm;height:297mm;min-height:297mm;page-break-after:always");
    expect(html).toContain("break-after:page");
    expect(html).toContain("border:1px solid #172238");
    expect(html).toContain("padding:4mm 4mm 7.62mm");
    expect(html).toContain("left:var(--pc-left-margin);border:1px solid #172238");
    expect((html.match(/data-page=\"[1-4]\"/g) || []).length).toBe(4);
    expect(html).toContain("<title></title>");
    expect(html).not.toContain("Computer generated document");
    expect(html).not.toContain("JYOTI ITC · Official institutional document");
  });
});
