export function buildPrintDocumentHtml(title: string, body: string, options: { landscape?: boolean; letterhead?: boolean; progressCard?: boolean; topBlankMm?: number; progressLeftMarginMm?: number; autoPrint?: boolean } = {}) {
  const landscape = Boolean(options.landscape);
  const letterhead = Boolean(options.letterhead);
  const progressCard = Boolean(options.progressCard);
  const topBlankMm = Math.max(0, options.topBlankMm ?? 0);
  const progressLeftMarginMm = Math.min(60, Math.max(0, options.progressLeftMarginMm ?? 35.56));
  const autoPrint = options.autoPrint !== false;
  const pageSize = landscape ? "A4 landscape" : "A4 portrait";
  const pageMargin = letterhead || progressCard ? "0" : "10mm";
  const pageWidth = landscape ? "277mm" : "190mm";
  const pageHeight = landscape ? "190mm" : "277mm";
  const topPadding = letterhead ? "0" : "8mm";
  return `<!doctype html><html><head><meta charset="utf-8"><title>${letterhead || progressCard ? "" : title}</title><style>
  @page{size:${pageSize};margin:${pageMargin}}
  *{box-sizing:border-box}
  body{font-family:Arial,Helvetica,sans-serif;color:#172238;margin:0;background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact}
  .page{width:${pageWidth};min-height:${pageHeight};margin:0 auto;border:2px solid #172238;padding:${topPadding} 8mm 8mm;position:relative;background:#fff}
  .letterhead-spacer{display:none;height:0}
  .letterhead.page .body{padding-top:${letterhead ? `${topBlankMm}mm` : "0"}}
  .letterhead .eyebrow,.letterhead .brand{display:none}
  .letterhead .title{margin-top:0;border:0;text-decoration:underline;text-underline-offset:2px;margin-bottom:8mm}
  .letterhead.page{border:0!important;padding-top:0}
  .letterhead.page:before{display:none!important}
  .letterhead .footer{display:none!important}
  .certificate-copy{max-width:168mm;margin:0 auto;font-family:Georgia,serif;font-size:14px;line-height:1.75;color:#172238}
  .certificate-copy h2{text-align:center;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.35;margin:0 0 9mm}
  .certificate-copy p{margin:0 0 7mm;text-align:justify}
  .certificate-copy p:first-of-type{text-indent:0}
  .certificate-copy .certificate-signature{text-align:right;margin-top:22mm;white-space:pre-line;font-weight:700;font-size:13px;line-height:1.5}
  .letterhead .footer{border-top:0}
  .progress-card{font-family:Arial,Helvetica,sans-serif;color:#172238}
  .electrician-progress-card{font-family:Arial,Helvetica,sans-serif;color:#172238}
  .progress-card-print{width:210mm;margin:0;background:#fff}
  .progress-card-print.page{width:210mm;min-height:297mm;margin:0;padding:0;border:0}
  .progress-card-print.page:before{display:none!important}
  .progress-card-print .body{width:210mm;margin:0;padding:0}
  .progress-card-print .pc-page{position:relative;box-sizing:border-box;width:210mm;height:297mm;min-height:297mm;page-break-after:always;break-after:page;padding:4mm 4mm 7.62mm ${progressLeftMarginMm}mm;background:#fff;border:0;--pc-left-margin:${progressLeftMarginMm}mm;overflow:hidden}
  .progress-card-print .pc-page:last-child{page-break-after:auto;break-after:auto}
  .progress-card-print .pc-page:before{content:"";position:absolute;top:0;right:0;bottom:0;left:var(--pc-left-margin);border:1px solid #172238;pointer-events:none;z-index:0}
  .pc-page:last-child{page-break-after:auto}
  .pc-header{border-bottom:2px solid #172238;margin-bottom:4mm;padding-bottom:3mm}
  .pc-header h1{text-align:center;text-transform:uppercase;font-family:Georgia,serif;font-size:20px;margin:0 0 4mm}
  .pc-info{display:grid;grid-template-columns:repeat(2,1fr);gap:2mm 6mm;font-size:9px;line-height:1.35}
  .pc-section{break-inside:avoid;margin:2.5mm 0}
  .pc-section h3{font-family:Georgia,serif;font-size:13px;text-transform:uppercase;background:#eef3f7;border-left:3px solid #d1a62e;padding:2mm;margin:0 0 2mm}
  .pc-table{width:100%;border-collapse:collapse;table-layout:fixed;font-size:6.2px;line-height:1.08}
  .pc-table th{background:#17283f;color:#fff;text-transform:uppercase;font-size:6.5px}
  .pc-table th,.pc-table td{border:1px solid #8d98a8;padding:0.75mm 0.65mm;vertical-align:middle;overflow-wrap:anywhere;word-break:break-word}
  .pc-table th:first-child,.pc-table td:first-child{width:12mm}
  .pc-weekly th:nth-child(1),.pc-weekly td:nth-child(1),.pc-weekly th:nth-child(6),.pc-weekly td:nth-child(6){width:6%}.pc-weekly th:nth-child(2),.pc-weekly td:nth-child(2),.pc-weekly th:nth-child(7),.pc-weekly td:nth-child(7){width:20%;text-align:left}.pc-weekly th:nth-child(3),.pc-weekly td:nth-child(3),.pc-weekly th:nth-child(8),.pc-weekly td:nth-child(8){width:7%}.pc-weekly th:nth-child(4),.pc-weekly td:nth-child(4),.pc-weekly th:nth-child(9),.pc-weekly td:nth-child(9){width:9%}.pc-weekly th:nth-child(5),.pc-weekly td:nth-child(5),.pc-weekly th:nth-child(10),.pc-weekly td:nth-child(10){width:8%}.pc-weekly tbody tr:last-child td{border-bottom:1px solid #8d98a8}.pc-last-exercise-line{height:0;border-top:1px solid #172238;margin-top:0.8mm;width:100%}
  .pc-table td:not(:nth-child(2)){text-align:center;min-height:7mm}.pc-weekly tbody tr{height:10.5mm}.pc-weekly tbody td{height:10.5mm}
  .pc-table tfoot td{font-weight:700;background:#f4e5ad}
  .pc-signatures{display:flex;justify-content:space-between;align-items:end;gap:20mm;margin:12mm 12mm 0;text-align:center;font-size:9px;font-weight:700}
  .pc-signatures>div{flex:1;min-height:20mm;display:flex;flex-direction:column;justify-content:end;align-items:center}
  .pc-sign{max-width:35mm;max-height:15mm;object-fit:contain;margin-bottom:2mm}.pc-inline-sign{display:block;width:14mm;height:6mm;object-fit:contain;margin:0 auto}
  .pc-sign-placeholder{height:15mm;display:flex;align-items:end;justify-content:center;color:#667085;font-size:8px;margin-bottom:2mm}
  .pc-principal-line{display:block;width:35mm;height:15mm;border-bottom:1px solid #172238;margin-bottom:2mm}
  .pc-page-footer{position:absolute;bottom:1mm;left:4mm;right:4mm;display:flex;justify-content:space-between;border-top:0;padding-top:1.5mm;font-size:7px;color:#667085;z-index:3;white-space:nowrap}
  .pc-remarks{margin:7mm 0 0;border:1px solid #8d98a8;min-height:14mm;padding:2mm;font-size:9px}
  .progress-card-heading{border-bottom:2px solid #d1a62e;padding-bottom:4mm;margin-bottom:5mm}
  .progress-kicker{text-align:center;letter-spacing:.18em;font-size:9px;font-weight:700;color:#667085;margin:0 0 2mm}
  .progress-card h2{text-align:center;font-family:Georgia,serif;font-size:20px;letter-spacing:.08em;margin:0 0 4mm}
  .progress-student-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:2mm 5mm;font-size:10px}
  .progress-student-grid p{margin:0}
  .progress-section{break-inside:avoid;margin:4mm 0}
  .progress-section h3{font-family:Georgia,serif;font-size:14px;color:#172238;border-left:3px solid #d1a62e;padding-left:3mm;margin:0 0 2mm}
  .progress-section table{width:100%;border-collapse:collapse;table-layout:auto;font-size:7.5px;line-height:1.2}
  .progress-section th{background:#17283f;color:#fff;text-transform:uppercase;font-size:7px;letter-spacing:.04em}
  .progress-section th,.progress-section td{border:1px solid #aeb7c5;padding:1.5mm 1.2mm;vertical-align:top;overflow-wrap:anywhere}
  .progress-section tr:nth-child(even) td{background:#f4f6f8}
  .progress-empty{font-size:10px;color:#667085;font-style:italic;margin:2mm 0}
  .progress-signature{margin:10mm 0 0 auto;width:48mm;border-top:1px solid #172238;padding-top:2mm;text-align:center;font-size:9px;font-weight:700;line-height:1.5}
  .page:before{content:"";position:absolute;inset:4mm;border:1px solid #d1a62e;pointer-events:none}
  .page>*{position:relative;z-index:1}
  .eyebrow{font-size:10px;letter-spacing:.2em;color:#667085;text-transform:uppercase;text-align:center}
  .brand{font-family:Georgia,serif;font-size:29px;font-weight:700;text-align:center;margin:4px 0 5mm}
  .title{font-size:19px;font-weight:800;text-align:center;text-transform:uppercase;letter-spacing:.1em;border-top:2px solid #172238;border-bottom:1px solid #c7ccd4;padding:5mm 0;margin-bottom:7mm}
  .body{line-height:1.55;font-size:11px}
  .body .report-meta{display:flex;justify-content:space-between;gap:8mm;border:1px solid #d1a62e;background:#f7f2df;padding:3mm;margin-bottom:5mm;font-size:10px}
  .body table{width:100%;border-collapse:collapse;table-layout:fixed;font-size:${landscape ? "8.5px" : "8px"};line-height:1.2}
  .body th{background:#172238;color:#fff;font-weight:700;text-transform:uppercase;letter-spacing:.04em}
  .body th,.body td{border:1px solid #aeb7c5;padding:1.7mm 1.2mm;vertical-align:top;overflow-wrap:anywhere}
  .body tr:nth-child(even) td{background:#f7f9fb}
  .body h3{font-family:Georgia,serif;font-size:15px;margin:6mm 0 2mm;color:#172238}
  .body ul{margin:2mm 0 0;padding-left:6mm}
  .body li{margin:1.5mm 0}
  .signature{display:flex;justify-content:space-between;gap:24mm;margin-top:28mm;font-size:10px;text-align:center}
  .signature span{display:block;flex:1;border-top:1px solid #172238;padding-top:3mm}
  .footer{position:absolute;bottom:8mm;left:10mm;right:10mm;border-top:1px solid #c7ccd4;padding-top:3mm;display:flex;justify-content:space-between;font-size:9px;color:#667085}
  @media print{body{background:#fff}.page{margin:0;width:${pageWidth};min-height:${pageHeight};border:2px solid #172238;box-shadow:none}.letterhead.page{border:0!important}.letterhead.page:before{display:none!important}.letterhead .footer{display:none!important}.body table{font-size:${landscape ? "8px" : "7.5px"}}.progress-card-print{width:210mm}.progress-card-print.page{width:210mm;min-height:297mm;border:0}.progress-card-print.page:before{display:none!important}.progress-card-print .body{width:210mm;margin:0;padding:0}.progress-card-print .pc-page{box-sizing:border-box;width:210mm;height:297mm;min-height:297mm;page-break-after:always;break-after:page;padding-left:${progressLeftMarginMm}mm;border:0;--pc-left-margin:${progressLeftMarginMm}mm;overflow:hidden}.progress-card-print .pc-page:last-child{page-break-after:auto;break-after:auto}.progress-card-print .pc-page:before{content:"";position:absolute;top:0;right:0;bottom:0;left:var(--pc-left-margin);border:1px solid #172238;pointer-events:none;z-index:0}.pc-table{font-size:6.2px;line-height:1.08}.pc-page-footer{position:absolute;bottom:2mm;z-index:3;white-space:nowrap}}
  @media screen{.pc-page{border:0;box-shadow:0 2px 10px rgba(23,34,56,.08);margin-bottom:6mm}}
  </style></head><body><main data-top-margin-mm="${letterhead ? topBlankMm : 0}" class="page ${letterhead ? "letterhead" : ""} ${progressCard ? "progress-card-print" : ""}"><div class="letterhead-spacer"></div>${letterhead || progressCard ? "" : "<div class=\"eyebrow\">JYOTI ITC · ROSERA, BIHAR</div><div class=\"brand\">JYOTI ITC</div><div class=\"title\">" + title + "</div>"}<div class="body">${body}</div>${letterhead || progressCard ? "" : "<div class=\"signature\"><span>Computer generated document</span><span>Authorized signature</span></div><div class=\"footer\"><span>JYOTI ITC · Official institutional document</span><span>Keep for records</span></div>"}</main>${autoPrint ? "<script>window.addEventListener('load',()=>setTimeout(()=>window.print(),200))<\\/script>" : ""}</body></html>`;
}

export function printDocumentMarkup(html: string) {
  return { hasA4: /@page\\{size:A4 portrait/.test(html), hasOuterBorder: /border:2px solid #172238/.test(html), hasInnerGoldBorder: /border:1px solid #d1a62e/.test(html) };
}
