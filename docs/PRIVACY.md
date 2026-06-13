# Privacy Policy

**IndiaMart Lead Manager Scraper**  
**Developed by:** Mohammed Zahid Imtiyaz Wadiwale / Webaon  
**Effective Date:** June 2026  
**Contact:** [info@webaon.com](mailto:info@webaon.com) · [http://www.webaon.com/](http://www.webaon.com/)

---

## Summary

This extension does **not** collect, transmit, sell, or share any of your data. All data stays in your browser.

---

## 1. Data We Collect

This extension does not collect any data about you or your usage.

The extension reads lead information from the IndiaMart Lead Manager page that is already visible in your browser (Buyer Name, Mobile, Product, City, Message, etc.) and stores it temporarily in your browser's local storage (`chrome.storage.local`) so you can export it. This data:

- Never leaves your device
- Is never sent to any server (including Webaon's servers)
- Is not shared with any third party

---

## 2. Data Storage

Lead data collected during a scraping session is stored in Chrome's local extension storage (`chrome.storage.local`) on your device only. This storage is:

- Local to your browser profile on your machine
- Cleared when you click **Clear & Reset** in the extension
- Not synced across devices (Chrome Sync is not used)

---

## 3. Permissions Explained

| Permission | Why It Is Needed |
|------------|-----------------|
| `activeTab` | To read lead data from the IndiaMart page currently open in your browser |
| `scripting` | To inject the scraper script into the IndiaMart tab |
| `storage` | To save collected leads in your browser so they survive popup opens/closes |

The extension's host permission (`https://seller.indiamart.com/*`) restricts all activity exclusively to IndiaMart's seller portal. No other website is accessed.

---

## 4. Network Requests

This extension makes **no network requests** to any external server. The only outbound connection is loading the Inter font from Google Fonts in the popup UI, which is a standard browser request subject to [Google's Privacy Policy](https://policies.google.com/privacy).

---

## 5. Third-Party Libraries

This extension bundles [SheetJS (xlsx.min.js)](https://sheetjs.com/) for Excel export. This library runs entirely in your browser and makes no network requests.

---

## 6. Children's Privacy

This extension is not directed at children under 13 and does not knowingly collect any information from children.

---

## 7. Changes to This Policy

If this privacy policy changes, the updated version will be included in the next release of the extension. Continued use of the extension after changes constitutes acceptance of the updated policy.

---

## 8. Contact

For privacy questions or concerns, contact:

- **Email:** [info@webaon.com](mailto:info@webaon.com)
- **CEO:** [ceo@webaon.com](mailto:ceo@webaon.com)
- **Website:** [http://www.webaon.com/](http://www.webaon.com/)
