# Super-Cube® company profile (PDF)

`public/super-cube-company-profile.pdf` is generated, not hand-edited.

```bash
npm run profile:pdf                      # writes public/super-cube-company-profile.pdf
node scripts/company-profile/build.mjs --out /tmp/profile.pdf --html /tmp/profile.html
```

- **Content** comes straight from `src/lib/*.ts` (faces, skills, programmes and
  their colours, prices, seat packs, research gains, testimonials, the 8-week
  pilot calendar, SDG text) and the About/Learn page copy. Change the site, then
  re-run the script.
- **Rendering** is Chromium print-to-PDF via Playwright (A4, tagged, with
  outline). Run `npx playwright install chromium` once, or set
  `CHROME_PATH=/path/to/chrome`.
- **Fonts**: static Inter / Inter Display instances in `fonts/` (SIL OFL,
  see `fonts/OFL.txt`), embedded as TrueType.
- **Metadata**: title, author, subject and keywords are written into the PDF
  Info dictionary after rendering.
- **QA**: render the pages (`pdftoppm -r 110 -png profile.pdf page`) and check
  each for overflow before committing.

The old overview deck (`public/downloads/super-cube-overview.pptx`, built by
`scripts/generate-overview-pptx.mjs`) is kept but no longer linked from the site.
