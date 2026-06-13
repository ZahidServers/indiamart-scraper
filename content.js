// IndiaMart Lead Scraper v7 — SPA mode (no page reload)
// The page is a React SPA - clicking Next updates DOM in-place, no reload
(function () {
  'use strict';

  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const S = {
    get:   ()  => new Promise(r => chrome.storage.local.get('ims', d => r(d.ims || null))),
    set:   (v) => new Promise(r => chrome.storage.local.set({ ims: v }, r)),
    clear: ()  => new Promise(r => chrome.storage.local.remove('ims', r)),
  };

  // ── DOM helpers ───────────────────────────────────────────────────────────
  function getNextBtn() {
    // span containing the Next_Pg_LV_Icon SVG
    const use = document.querySelector('use[href="#Next_Pg_LV_Icon"]');
    return use ? use.closest('span') || use.closest('button') : null;
  }

  function getPrevBtn() {
    const use = document.querySelector('use[href="#Prev_Pg_LV_Icon"]');
    return use ? use.closest('span') || use.closest('button') : null;
  }

  function isNextDisabled() {
    const btn = getNextBtn();
    if (!btn) return true;
    const style = window.getComputedStyle(btn);
    const op = parseFloat(style.opacity);
    const cursor = style.cursor;
    return op < 0.5 || cursor === 'not-allowed' || btn.hasAttribute('disabled');
  }

  function getFirstRowId() {
    return document.querySelector('.ag-center-cols-container [role="row"]')
      ?.getAttribute('row-id') || '';
  }

  function getPageText() {
    const el = document.querySelector('.fs13.fwb.pd1310');
    return el ? el.textContent.trim() : 'Page ?';
  }

  function getTotalLeads() {
    const el = document.querySelector('.lv_lead_funnel_tab_active .lv_lead_funnel_count');
    if (el) { const m = el.textContent.replace(/,/g, '').match(/\d+/); if (m) return +m[0]; }
    const drop = document.querySelector('#lv_hdr_drpdwn');
    if (drop) { const m = drop.textContent.replace(/,/g, '').match(/\d+/); if (m) return +m[0]; }
    return 0;
  }

  // ── Wait for rows to change (SPA update) ─────────────────────────────────
  async function waitForRowChange(prevRowId, timeoutMs = 8000) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      await sleep(200);
      const cur = getFirstRowId();
      if (cur && cur !== prevRowId) return true;
    }
    return false;
  }

  // ── Wait for grid to have rows ────────────────────────────────────────────
  async function waitForGrid(timeoutMs = 12000) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      if (document.querySelector('.ag-center-cols-container [role="row"]')) return true;
      await sleep(300);
    }
    return false;
  }

  // ── Scrape current visible rows ───────────────────────────────────────────
  function scrapeCurrentPage() {
    const container = document.querySelector('.ag-center-cols-container');
    if (!container) return [];
    const rows = container.querySelectorAll('[role="row"]');
    const results = [];
    rows.forEach(row => {
      try {
        const c = id => row.querySelector(`[col-id="${id}"]`);
        const src = c('source'), req = c('requirement'),
              snd = c('sender'), loc = c('location'),
              dt  = c('datetime'), msg = c('messages');
        const lead = {
          'Source':     src?.querySelector('[title]')?.getAttribute('title') || '',
          'Product':    req?.querySelector('.requirement-product')?.getAttribute('title') || req?.querySelector('.requirement-product')?.innerText.trim() || '',
          'Quantity':   req?.querySelector('.requirement-qty')?.innerText.trim() || '',
          'Buyer Name': snd?.querySelector('.sender-name')?.getAttribute('title') || snd?.querySelector('.sender-name')?.innerText.trim() || '',
          'Mobile':     snd?.querySelector('.moblv')?.innerText.trim() || '',
          'City':       loc?.querySelector('[title]')?.getAttribute('title') || loc?.innerText.trim() || '',
          'Date/Time':  dt?.querySelector('.date-cell')?.innerText.trim() || '',
          'Message':    msg?.querySelector('[title]')?.getAttribute('title') || msg?.innerText.trim().split('\n')[0] || '',
          '_id':        row.getAttribute('row-id') || '',
        };
        if (lead['Buyer Name'] || lead['Product'] || lead['Mobile']) results.push(lead);
      } catch (e) {}
    });
    return results;
  }

  // ── Main loop — SPA, no reload needed ────────────────────────────────────
  let running = false;
  let paused  = false;

  async function runLoop() {
    running = true; paused = false;

    // Load existing state
    let state = await S.get() || { leads: [], seenIds: [], total: 0 };
    const seenIds = new Set(state.seenIds || []);
    let leads = state.leads || [];

    // Wait for grid
    const ready = await waitForGrid();
    if (!ready) {
      await S.set({ ...state, running: false, done: false, paused: true,
        lastLog: '⚠️ Grid not found. Make sure you are on List View.' });
      running = false; return;
    }

    const total = getTotalLeads();
    await S.set({ ...state, running: true, paused: false, done: false, total, lastLog: 'Scraping started...' });

    let pageNum = 0;

    while (running && !paused) {
      await sleep(600);

      const rows = scrapeCurrentPage();
      let added = 0;
      for (const row of rows) {
        const id = row._id;
        if (id && seenIds.has(id)) continue;
        if (id) seenIds.add(id);
        const { _id, ...clean } = row;
        leads.push(clean);
        added++;
      }

      pageNum++;
      const pageLabel = getPageText();
      const logMsg = `${pageLabel}: +${added} new → ${leads.length} total`;

      // Save progress every page
      await S.set({
        running: true, paused: false, done: false,
        leads, seenIds: [...seenIds], total,
        lastLog: logMsg
      });

      // Check if last page
      if (isNextDisabled()) {
        await S.set({ running: false, paused: false, done: true, leads, seenIds: [...seenIds], total,
          lastLog: `✅ All done! ${leads.length} leads collected.` });
        running = false; return;
      }

      // Click next
      const prevRowId = getFirstRowId();
      const btn = getNextBtn();
      if (!btn) {
        await S.set({ running: false, paused: true, done: false, leads, seenIds: [...seenIds], total,
          lastLog: `⚠️ Next button not found. Paused at ${leads.length} leads.` });
        running = false; return;
      }

      btn.click();

      // Wait for SPA to update rows
      const changed = await waitForRowChange(prevRowId, 8000);
      if (!changed) {
        // Retry once
        btn.click();
        const changed2 = await waitForRowChange(prevRowId, 5000);
        if (!changed2) {
          await S.set({ running: false, paused: true, done: false, leads, seenIds: [...seenIds], total,
            lastLog: `⚠️ Page not changing. Paused at ${leads.length} leads. Click Resume to retry.` });
          running = false; return;
        }
      }

      // Small pause to let React finish rendering
      await sleep(300);
    }

    // Paused by user
    const s = await S.get();
    await S.set({ ...s, running: false, lastLog: `⏸ Paused at ${leads.length} leads.` });
    running = false;
  }

  // ── CSV export (no library needed) ───────────────────────────────────────
  function toCSV(leads) {
    if (!leads.length) return '';
    const cols = Object.keys(leads[0]);
    const escape = v => '"' + String(v || '').replace(/"/g, '""') + '"';
    const header = cols.map(escape).join(',');
    const rows   = leads.map(r => cols.map(c => escape(r[c])).join(','));
    return [header, ...rows].join('\r\n');
  }

  function downloadBlob(content, filename, mime) {
    const blob = new Blob([content], { type: mime });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 1000);
  }

  // ── XLSX export (bundled) ─────────────────────────────────────────────────
  async function loadXLSX() {
    if (window.XLSX) return window.XLSX;
    return new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = chrome.runtime.getURL('xlsx.min.js');
      s.onload = () => res(window.XLSX);
      s.onerror = rej;
      document.head.appendChild(s);
    });
  }

  // ── Public API ────────────────────────────────────────────────────────────
  window.__imScraper = {
    async start() {
      await S.set({ running: true, paused: false, done: false, leads: [], seenIds: [], total: 0, lastLog: 'Starting...' });
      runLoop();
    },
    async resume() {
      if (running) return;
      runLoop();
    },
    async pause() {
      paused = true;
    },
    async stop() {
      running = false; paused = false;
      const s = await S.get() || {};
      await S.set({ ...s, running: false, done: true, lastLog: `Stopped. ${(s.leads||[]).length} leads saved.` });
    },
    async exportCSV() {
      const s = await S.get();
      const leads = s?.leads || [];
      if (!leads.length) { alert('No leads yet!'); return; }
      const csv = toCSV(leads);
      const date = new Date().toISOString().slice(0, 10);
      downloadBlob(csv, `IndiaMart_Leads_${date}.csv`, 'text/csv;charset=utf-8;');
      await S.set({ ...s, lastLog: `✅ CSV downloaded! ${leads.length} leads.` });
    },
    async exportXLSX() {
      const s = await S.get();
      const leads = s?.leads || [];
      if (!leads.length) { alert('No leads yet!'); return; }
      try {
        const XLSX = await loadXLSX();
        const ws = XLSX.utils.json_to_sheet(leads);
        ws['!cols'] = Object.keys(leads[0]).map(k => ({ wch: Math.max(k.length + 4, 20) }));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'IndiaMart Leads');
        const date = new Date().toISOString().slice(0, 10);
        XLSX.writeFile(wb, `IndiaMart_Leads_${date}.xlsx`);
        await S.set({ ...s, lastLog: `✅ Excel downloaded! ${leads.length} leads.` });
      } catch (e) {
        // fallback to CSV if XLSX fails
        const csv = toCSV(leads);
        downloadBlob(csv, `IndiaMart_Leads_${new Date().toISOString().slice(0,10)}.csv`, 'text/csv;charset=utf-8;');
        await S.set({ ...s, lastLog: `✅ CSV downloaded (fallback)! ${leads.length} leads.` });
      }
    },
    async getStatus() {
      const s = await S.get();
      if (!s) return { collected: 0, total: 0, running: false, paused: false, done: false };
      return {
        collected: (s.leads || []).length, total: s.total || 0,
        running: s.running || false, paused: s.paused || false,
        done: s.done || false, lastLog: s.lastLog || ''
      };
    },
    async clearAll() { await S.clear(); running = false; paused = false; },
  };

  // Auto-resume if was running before (handles any unexpected refresh)
  S.get().then(s => {
    if (s?.running && !s?.paused && !s?.done) {
      console.log('[IMScraper] Auto-resuming...');
      runLoop();
    }
  });

  console.log('[IMScraper] v7 loaded ✓ — SPA mode');
})();
