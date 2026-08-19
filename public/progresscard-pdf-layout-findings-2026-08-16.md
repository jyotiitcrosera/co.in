# Progress Card PDF layout findings — 2026-08-16

Observed from `/home/ubuntu/upload/ProgressCard·Electrician.pdf` pages 1–4:

1. The output currently contains an extra wrapper cover/header page before the actual four card pages, so the PDF total is 6 pages instead of the intended 4 pages.
2. Page 1 shows only the institutional wrapper heading and student header; the expected exercise table content is missing from that page.
3. The first visible exercise table is displaced to the next page and begins mid-layout, which indicates the wrapper shell and card page content are stacking incorrectly.
4. Exercise table text is clipped and overlapping in the left columns; rows are too compressed for long exercise descriptions.
5. Page 2 Monthly/Quarterly sections render mostly blank grid rows and are visually compressed, suggesting column widths and font sizes are too small for stable PDF rendering.
6. Page 3 exercise rows are present, but the footer overlaps the table bottom and long descriptions remain cramped.
7. The preview/print shells are not visually identical: the print/PDF output still includes outer document heading and footer framing that should not interfere with the four explicit card pages.

Repair targets:
- Remove the extra wrapper page/frame from progress-card print mode.
- Ensure only the four explicit `.pc-page` sections render as A4 pages.
- Give exercise-description columns more width and predictable wrapping.
- Prevent footer overlap at the bottom of exercise pages.
- Use PDF-safe font sizing and row spacing for monthly/quarterly tables.
