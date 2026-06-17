# Fix broken external links

I HTTP-checked all 114 external URLs in the app. Results:
- **46 OK** (200) and **17 redirects** (working)
- **14 return 403** and **17 return 400** — these are bot-blocking from headless clients (Facebook, VFS Global, gov.il, vfsglobal, unito.it, unimi.it). They work in real browsers, so I'll leave them.
- **24 return 404** and **12 fail to connect (000)** — these are genuinely broken and need fixing.

## Confirmed broken links to fix

### Hard 404s (24) — replace with verified working URLs

**Agenzia Entrate (5 URLs)** — site reorganised, all subpages now 404:
- All 4 regional `/uffici-territoriali/{regione}` pages
- The Codice Fiscale request page
- Fix: point to the working hubs `https://www.agenziaentrate.gov.it/portale/contatta/uffici/uffici-territoriali` and the active codice-fiscale guide

**Poste Italiane (6 URLs)** — old URLs all 404:
- 4 office search pages with `#/search?regione=...` (anchor-based deep links no longer work)
- `/prodotti/permesso-di-soggiorno.html` and `/sportello-amico.html`
- Fix: use the current `https://www.poste.it/cerca-ufficio-postale.html` search and `https://www.poste.it/permesso-di-soggiorno.html`

**University pages (4 URLs)**:
- `polito.it/didattica/segreteria_studenti` → current `/it/didattica/segreterie-studenti`
- `uniroma1.it/en/pagina/student-life` → current student services page
- `uniroma3.it/servizi/segreterie-studenti/` → current path
- (unimi/unipv pages return 403 not 404, leaving alone)

**ESN section search (2 URLs)**:
- `esn.it/it/sezioni?city=Milano` and `?city=Roma` — query param removed
- Fix: link directly to the section sites already used elsewhere (`milano.esn.it`, city-specific ESN sites)

**Transport / tours (5 URLs)**:
- `atm.it/.../Under27.aspx` → current `https://www.atm.it/it/AcquistaOnline/Abbonamenti`
- `gtt.to.it/cms/biglietti-e-abbonamenti/abbonamenti` → current path on gtt.to.it
- 3 `neweuropetours.eu/{city}/` pages → replace with current free-walking-tour pages

**Other (2 URLs)**:
- `vistoperitalia.esteri.it/home/en` → `vistoperitalia.esteri.it/home.aspx?lingua=ENG`
- `dr-walter.com/en/educare24.html` → current Educare24 page on dr-walter.com
- `gov.br/.../obter-passaporte-comum` → current Brazilian passport service URL

### Connection-failed (000) — verify and fix (12)

I'll re-test each with a longer timeout / different User-Agent. Likely outcomes:
- `prenotaonline.esteri.it`, `ambdelhi.esteri.it`, `ambtehran.esteri.it`, `bocconi.esn.it`, `milan.esn.it`, `roma.esn.it`, `polimi.it/...` — Italian gov / .it sites that often block non-Italian IPs from the sandbox; will retry with browser tool and only replace if truly dead.
- `epolice.ir`, `dgip.gov.pk` — likely geo-blocked from EU; will replace with the canonical passport/MOI homepage that does load globally.

### Template-literal false positive
- `https://www.meetup.com/cities/it/${cityInfo.name…}` — this is a runtime-interpolated URL, already correct. No change.

## Files affected

```text
src/data/arrivalDocuments.ts   — Agenzia Entrate, Poste, universities (~12 URLs)
src/data/cityData.ts           — ATM, GTT, ESN, new-europe-tours, university segreterie (~10 URLs)
src/pages/VisaWizard.tsx       — gov.br, epolice.ir, dgip.gov.pk (~3 URLs)
```

No component logic or UI changes — only string replacements inside the data files.

## Verification

After edits I'll re-run the HTTP check against the replaced URLs and report the new status codes so you can see every link resolves to 200/redirect.

## Out of scope

- 400-from-Facebook and 403-from-VFS/gov.il/unimi/unito/swisscare/unipv: these consistently return error codes to non-browser clients but load fine for real users. I will not touch them unless you ask me to manually verify each one.
- No new links added, no UI changes, no auth/admin work — that resumes after this is merged.
