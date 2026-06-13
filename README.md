# IndiaMart Lead Manager Scraper

**Version 7.0** — A free Chrome extension that automatically scrapes all leads from IndiaMart Lead Manager and exports them to Excel (XLSX) or CSV.

**Author:** Mohammed Zahid Imtiyaz Wadiwale  
**Company:** [Webaon](http://www.webaon.com/)  
**Contact:** [info@webaon.com](mailto:info@webaon.com) · [ceo@webaon.com](mailto:ceo@webaon.com)

---

## Features

- Automatically pages through all leads in IndiaMart Lead Manager (List View)
- Scrapes: Source, Product, Quantity, Buyer Name, Mobile, City, Date/Time, Message
- Exports to **CSV** or **Excel (XLSX)**
- **Pause & Resume** — stop mid-scrape and continue later without losing data
- Progress bar with live lead count and page tracking
- Deduplication — never double-counts leads across sessions
- Auto-resume if the page unexpectedly refreshes
- Works entirely in your browser — no data leaves your machine

---

## Installation

This extension is not on the Chrome Web Store. Install it manually:

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions`
3. Enable **Developer mode** (toggle in the top-right corner)
4. Click **Load unpacked**
5. Select the `indiamart-scraper` folder
6. The extension icon will appear in your toolbar

---

## How to Use

1. Log in to your IndiaMart seller account and go to **Lead Manager**
2. Switch to **List View** (the grid/table layout)
3. Click the extension icon in Chrome's toolbar
4. Click **Start** — the scraper will automatically page through all your leads
5. Monitor progress via the live stats (Collected / Total / Progress %)
6. Once complete (or at any time), click **CSV** or **Excel** to download

### Controls

| Button | Action |
|--------|--------|
| Start | Begin scraping from the first page |
| Stop | Stop and mark as complete — data is preserved |
| Pause | Pause mid-scrape — data is preserved; click Resume later |
| Resume | Continue from where you paused |
| CSV | Download all collected leads as a CSV file |
| Excel | Download all collected leads as an XLSX file |
| Clear & Reset | Erase all collected data and start fresh |

---

## Exported Fields

| Column | Description |
|--------|-------------|
| Source | Lead source (e.g., IndiaMart, direct) |
| Product | Product/service the buyer enquired about |
| Quantity | Requested quantity |
| Buyer Name | Name of the enquiring buyer |
| Mobile | Buyer's mobile number |
| City | Buyer's city/location |
| Date/Time | Date and time of the enquiry |
| Message | Buyer's enquiry message |

---

## Requirements

- Google Chrome (or any Chromium-based browser)
- An active IndiaMart seller account with Lead Manager access
- Navigate to `seller.indiamart.com/messagecentre` before clicking Start

---

## Permissions Used

| Permission | Reason |
|------------|--------|
| `activeTab` | Read the current IndiaMart tab's content |
| `scripting` | Inject the scraper into the page |
| `storage` | Persist collected leads across popup opens |

The extension only runs on `https://seller.indiamart.com/*` and never communicates with any external server.

---

## License

This software is **freeware**. See [LICENSE](LICENSE) for full terms.

---

## Privacy

This extension does not collect, transmit, or store any data outside your local browser. See the [Privacy Policy](docs/privacy.html) for full details.

---

## Support & Custom Tools

Need a custom automation tool, scraper, or CRM integration for your business?

**Webaon** builds automation tools, web apps, Android apps, and digital solutions tailored to your needs.

- Website: [webaon.com](http://www.webaon.com/)
- Email: [info@webaon.com](mailto:info@webaon.com)
- CEO: [ceo@webaon.com](mailto:ceo@webaon.com)
