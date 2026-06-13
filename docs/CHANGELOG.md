# Changelog

All notable changes to the IndiaMart Lead Manager Scraper are documented here.

---

## [7.0] — June 2026

### Added
- Full SPA (Single Page Application) mode — no page reloads required; the extension now detects IndiaMart's React-based DOM updates in-place
- Pause & Resume functionality — stop mid-scrape and continue later with all data intact
- Auto-resume on unexpected page refresh — scraping continues automatically if the page reloads
- Deduplication via row ID tracking — leads are never counted twice across sessions
- Real-time progress bar with animated gradient
- Three-stat dashboard: Collected / Total / Progress %
- Status badge with four states: Idle, Scraping, Paused, Complete
- Live scrolling activity log
- Excel (XLSX) export using bundled SheetJS — no external dependency required
- CSV export with BOM for correct encoding in Excel
- Fallback from XLSX to CSV if Excel export fails
- "Clear & Reset" with confirmation dialog
- Download buttons always available once leads are collected (not locked behind completion)
- Dark UI with Inter font, gradient accents, and smooth transitions
- About tab with Webaon services showcase and CTA

### Changed
- Complete rewrite from page-reload-based scraping to SPA-aware DOM polling
- Storage architecture unified under a single `ims` key for reliability
- UI rebuilt from scratch with improved layout, typography, and button states

---

## [6.x and earlier]

Legacy versions used page-reload-based navigation and are no longer supported.

---

*Developed by Mohammed Zahid Imtiyaz Wadiwale / [Webaon](http://www.webaon.com/)*
