const $ = id => document.getElementById(id);
let polling = null, lastLogSeen = '';

// Tab switching via event listeners (no inline onclick — blocked by CSP)
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('panel-' + tab.dataset.tab).classList.add('active');
  });
});

const els = {
  count: $('count'), total: $('total'), pct: $('pct'),
  progress: $('progress'), badge: $('badge'), log: $('log'),
  start: $('btnStart'), stop: $('btnStop'),
  pause: $('btnPause'), resume: $('btnResume'),
  csv: $('btnCSV'), xlsx: $('btnXLSX'), clear: $('btnClear')
};

function addLog(msg) {
  if (!msg || msg === lastLogSeen) return;
  lastLogSeen = msg;
  els.log.innerHTML += msg + '<br>';
  els.log.scrollTop = els.log.scrollHeight;
}

// Read DIRECTLY from storage — single source of truth
async function readState() {
  const d = await chrome.storage.local.get('ims');
  const s = d.ims || {};
  // Always compute collected from actual leads array length
  const n = (s.leads || []).length;
  const t = s.total || 0;
  return { ...s, collected: n, total: t };
}

function updateUI(s) {
  const n = s.collected || 0;
  const t = s.total || 0;

  els.count.textContent = n.toLocaleString();
  els.total.textContent = t > 0 ? t.toLocaleString() : '–';
  const pct = t > 0 ? Math.min(100, Math.round(n / t * 100)) : 0;
  els.pct.textContent = pct + '%';
  els.progress.style.width = pct + '%';
  if (s.lastLog) addLog(s.lastLog);

  // Download buttons — ALWAYS enabled if any leads, regardless of state
  els.csv.disabled  = n === 0;
  els.xlsx.disabled = n === 0;

  // Control buttons based on state
  if (s.done) {
    els.badge.className = 'badge b-done'; els.badge.textContent = '✅ Complete!';
    els.start.disabled = false; els.stop.disabled = true;
    els.pause.disabled = true;  els.resume.disabled = true;
  } else if (s.paused) {
    els.badge.className = 'badge b-paused'; els.badge.textContent = '⏸ Paused — ' + n.toLocaleString() + ' leads saved';
    els.start.disabled = true;  els.stop.disabled = false;
    els.pause.disabled = true;  els.resume.disabled = false;
  } else if (s.running) {
    els.badge.className = 'badge b-run'; els.badge.textContent = '⚡ Scraping... ' + n.toLocaleString() + ' leads';
    els.start.disabled = true;  els.stop.disabled = false;
    els.pause.disabled = false; els.resume.disabled = true;
  } else {
    els.badge.className = 'badge b-idle';
    els.badge.textContent = n > 0 ? ('Idle — ' + n.toLocaleString() + ' leads saved') : 'Idle — ready to start';
    els.start.disabled = false; els.stop.disabled = true;
    els.pause.disabled = true;  els.resume.disabled = true;
  }
}

function stopPolling() { clearInterval(polling); polling = null; }

function startPolling() {
  if (polling) return;
  polling = setInterval(async () => {
    const s = await readState();
    updateUI(s);
    if (!s.running && !s.paused) stopPolling();
  }, 800);
}

async function getTab() {
  const [t] = await chrome.tabs.query({ active: true, currentWindow: true });
  return t;
}

async function exec(fn) {
  const tab = await getTab();
  if (!tab) return null;
  try {
    const r = await chrome.scripting.executeScript({ target: { tabId: tab.id }, func: fn });
    return r[0]?.result;
  } catch (e) { addLog('❌ ' + e.message); return null; }
}

// CSV download straight from popup storage — no content script, always works
async function downloadCSV() {
  const s = await readState();
  const leads = s.leads || [];
  if (!leads.length) { addLog('❌ No leads collected yet'); return; }
  const cols = Object.keys(leads[0]);
  const esc  = v => '"' + String(v || '').replace(/"/g, '""') + '"';
  const rows = leads.map(r => cols.map(c => esc(r[c])).join(','));
  const csv  = [cols.map(esc).join(','), ...rows].join('\r\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url;
  a.download = `IndiaMart_${leads.length}_leads_${new Date().toISOString().slice(0,10)}.csv`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 1000);
  addLog(`✅ CSV downloaded! ${leads.length} leads.`);
}

async function downloadXLSX() {
  // Try via content script first
  const tab = await getTab();
  if (tab?.url?.includes('seller.indiamart.com')) {
    const result = await exec(() => window.__imScraper?.exportXLSX());
    if (result !== null) { addLog('✅ Excel download triggered!'); return; }
  }
  // Fallback to CSV
  addLog('⚠️ Falling back to CSV...');
  await downloadCSV();
}

els.start.addEventListener('click', async () => {
  const tab = await getTab();
  if (!tab?.url?.includes('seller.indiamart.com/messagecentre')) {
    addLog('❌ Open seller.indiamart.com/messagecentre first'); return;
  }
  addLog('🚀 Starting...');
  await exec(() => window.__imScraper?.start());
  startPolling();
});

els.stop.addEventListener('click', async () => {
  await exec(() => window.__imScraper?.stop());
  // Also update storage directly so popup reflects immediately
  const d = await chrome.storage.local.get('ims');
  if (d.ims) await chrome.storage.local.set({ ims: { ...d.ims, running: false, paused: false, done: true } });
  stopPolling();
  const s = await readState();
  updateUI(s);
  addLog('⏹ Stopped. ' + s.collected + ' leads saved.');
});

els.pause.addEventListener('click', async () => {
  await exec(() => window.__imScraper?.pause());
  // Update storage directly so popup shows paused immediately
  const d = await chrome.storage.local.get('ims');
  if (d.ims) await chrome.storage.local.set({ ims: { ...d.ims, paused: true, running: false } });
  const s = await readState();
  updateUI(s);
  addLog('⏸ Paused. ' + s.collected + ' leads saved. You can download now or Resume.');
});

els.resume.addEventListener('click', async () => {
  const tab = await getTab();
  if (!tab?.url?.includes('seller.indiamart.com/messagecentre')) {
    addLog('❌ Go to seller.indiamart.com/messagecentre to resume'); return;
  }
  // Update storage to mark as running before calling resume
  const d = await chrome.storage.local.get('ims');
  if (d.ims) await chrome.storage.local.set({ ims: { ...d.ims, paused: false, running: true } });
  await exec(() => window.__imScraper?.resume());
  addLog('▶ Resuming...');
  startPolling();
});

els.csv.addEventListener('click', downloadCSV);
els.xlsx.addEventListener('click', downloadXLSX);

els.clear.addEventListener('click', async () => {
  const s = await readState();
  if (s.collected > 0 && !confirm(`Delete all ${s.collected.toLocaleString()} collected leads? Cannot be undone.`)) return;
  await chrome.storage.local.remove('ims');
  stopPolling(); lastLogSeen = '';
  updateUI({ collected: 0, total: 0, running: false, paused: false, done: false });
  addLog('🗑 Cleared. Ready to start fresh.');
});

// Always start polling on open + immediately read state
(async () => {
  const s = await readState();
  updateUI(s);
  startPolling(); // always poll — stops itself when idle
})();
