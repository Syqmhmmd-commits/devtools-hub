/* ============================================
   TOOLS DATA
============================================ */
const TOOLS = [
  { id: 'base64', name: 'Base64', desc: 'Encode & decode teks', icon: '🔤', cat: 'Encoding & Data' },
  { id: 'json', name: 'JSON', desc: 'Format, minify, validate', icon: '📋', cat: 'Encoding & Data' },
  { id: 'yaml', name: 'YAML ↔ JSON', desc: 'Konversi dua arah', icon: '📄', cat: 'Encoding & Data' },
  { id: 'url', name: 'URL Parser', desc: 'Breakdown komponen URL', icon: '🔗', cat: 'Encoding & Data' },
  { id: 'mime', name: 'MIME Lookup', desc: 'Extension → MIME type', icon: '📎', cat: 'Encoding & Data' },
  { id: 'case', name: 'Case Converter', desc: '9 format teks', icon: '🔠', cat: 'Text' },
  { id: 'slug', name: 'Slug Generator', desc: 'URL-friendly slug', icon: '🐌', cat: 'Text' },
  { id: 'regex', name: 'Regex Tester', desc: 'Test + explain pattern', icon: '🔍', cat: 'Text' },
  { id: 'diff', name: 'Text Diff', desc: 'Compare 2 teks', icon: '🔀', cat: 'Text' },
  { id: 'lorem', name: 'Lorem Ipsum', desc: 'Placeholder text', icon: '📝', cat: 'Text' },
  { id: 'markdown', name: 'Markdown', desc: 'Live preview', icon: '📖', cat: 'Text' },
  { id: 'hash', name: 'Hash', desc: 'SHA-1/256/384/512', icon: '🔐', cat: 'Security' },
  { id: 'jwt', name: 'JWT Decoder', desc: 'Decode + expiry check', icon: '🎫', cat: 'Security' },
  { id: 'password', name: 'Password', desc: 'Generator + strength', icon: '🔑', cat: 'Security' },
  { id: 'timestamp', name: 'Timestamp', desc: 'Unix ↔ human date', icon: '⏰', cat: 'Time' },
  { id: 'cron', name: 'Cron Explainer', desc: 'Field + next runs', icon: '⏱️', cat: 'Time' },
  { id: 'color', name: 'Color Tools', desc: 'Palette + contrast', icon: '🎨', cat: 'Design' },
  { id: 'qr', name: 'QR Generator', desc: 'Custom warna, size, error level', icon: '📱', cat: 'Design' },
  { id: 'uuid', name: 'ID Generator', desc: 'UUID, NanoID, ULID', icon: '🆔', cat: 'Misc' },
  { id: 'semver', name: 'Semver', desc: 'Compare & bump versi', icon: '🏷️', cat: 'Misc' },
];

const CATEGORIES = ['Encoding & Data', 'Text', 'Security', 'Time', 'Design', 'Misc'];

/* Tools yang TIDAK boleh di-persist ke localStorage (sensitif) */
const SENSITIVE = new Set(['jwt', 'hash', 'password']);

/* ============================================
   STORAGE
============================================ */
const store = {
  get(key, fallback) {
    try { return JSON.parse(localStorage.getItem('dt:' + key)) ?? fallback; }
    catch { return fallback; }
  },
  set(key, val) { try { localStorage.setItem('dt:' + key, JSON.stringify(val)); } catch {} },
  remove(key) { try { localStorage.removeItem('dt:' + key); } catch {} },
};

function getFavorites() { return store.get('favorites', []); }
function getRecent() { return store.get('recent', []); }

function setFavorites(f) {
  store.set('favorites', f.slice(0, 20));
  updateFavButton();
}

function toggleFavorite(id) {
  const f = getFavorites();
  const i = f.indexOf(id);
  if (i >= 0) f.splice(i, 1);
  else f.unshift(id);
  setFavorites(f);
  renderFavs();
  renderHome();
}

function pushRecent(id) {
  const r = getRecent().filter((x) => x !== id);
  r.unshift(id);
  store.set('recent', r.slice(0, 5));
}

function getToolInput(id) {
  if (SENSITIVE.has(id)) return '';
  return store.get('input:' + id, '');
}

function saveToolInput(id, val) {
  if (SENSITIVE.has(id)) return;
  store.set('input:' + id, val);
}

/* ============================================
   THEME — no flash, color-scheme
============================================ */
function applyTheme(theme) {
  if (theme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
    document.documentElement.style.colorScheme = 'light';
  } else {
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.style.colorScheme = 'dark';
  }
}

function initTheme() {
  const saved = store.get('theme', null);
  const prefersDark = !window.matchMedia('(prefers-color-scheme: light)').matches;
  applyTheme(saved || (prefersDark ? 'dark' : 'light'));
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  const next = current === 'light' ? 'dark' : 'light';
  applyTheme(next);
  store.set('theme', next);
}

/* ============================================
   ROUTER
============================================ */
let currentTool = null;
let currentCategory = 'All';
let currentCleanup = null; // cleanup function dari tool renderer

function runCleanup() {
  if (typeof currentCleanup === 'function') {
    try { currentCleanup(); } catch {}
  }
  currentCleanup = null;
}

function showHome() {
  runCleanup();
  currentTool = null;
  document.getElementById('homeView').classList.remove('hidden');
  document.getElementById('toolView').classList.add('hidden');
  document.title = 'DevTools Hub — 20 tools developer';
  renderFavs();
  renderRecent();
  renderHome();
}

function showTool(id) {
  const tool = TOOLS.find((t) => t.id === id);
  if (!tool) return showHome();
  runCleanup();
  currentTool = id;
  pushRecent(id);

  document.getElementById('homeView').classList.add('hidden');
  document.getElementById('toolView').classList.remove('hidden');
  document.getElementById('toolTitle').textContent = tool.name;
  document.getElementById('toolDesc').textContent = tool.desc;
  document.getElementById('toolIcon').textContent = tool.icon;
  document.getElementById('bcCat').textContent = tool.cat;
  document.getElementById('bcName').textContent = tool.name;
  document.title = `${tool.name} — DevTools Hub`;

  renderRelated(tool);
  updateFavButton();

  const content = document.getElementById('toolContent');
  content.innerHTML = '';
  const renderer = TOOL_RENDERERS[id];
  if (renderer) {
    const cleanup = renderer(content);
    if (typeof cleanup === 'function') currentCleanup = cleanup;
  }

  window.scrollTo(0, 0);
}

function renderRelated(tool) {
  const related = TOOLS.filter((t) => t.cat === tool.cat && t.id !== tool.id).slice(0, 4);
  const container = document.getElementById('relatedChips');
  const section = document.getElementById('relatedSection');
  if (related.length === 0) return section.classList.add('hidden');
  section.classList.remove('hidden');
  container.innerHTML = related
    .map((t) => `<a class="related-chip" href="#/${t.id}">${t.icon} ${t.name}</a>`)
    .join('');
}

function updateFavButton() {
  if (!currentTool) return;
  const btn = document.getElementById('favBtn');
  const txt = document.getElementById('favBtnText');
  const isFav = getFavorites().includes(currentTool);
  btn.classList.toggle('active', isFav);
  btn.setAttribute('aria-pressed', String(isFav));
  btn.setAttribute('aria-label', isFav ? 'Hapus dari favorit' : 'Tambah ke favorit');
  if (txt) txt.textContent = isFav ? 'Tersimpan' : 'Favorit';
}

function handleRoute() {
  const hash = location.hash.replace(/^#\/?/, '');
  if (hash && TOOLS.find((t) => t.id === hash)) showTool(hash);
  else showHome();
}

/* ============================================
   RENDER HOME
============================================ */
function renderFavs() {
  const container = document.getElementById('favSection');
  const grid = document.getElementById('favGrid');
  const favs = getFavorites()
    .map((id) => TOOLS.find((t) => t.id === id))
    .filter(Boolean)
    .slice(0, 6);

  if (favs.length === 0) return container.classList.add('hidden');
  container.classList.remove('hidden');

  grid.innerHTML = favs.map((t) => `
    <a class="recent-item" href="#/${t.id}">
      <span class="recent-item-icon">${t.icon}</span>
      <span class="recent-item-name">${t.name}</span>
    </a>
  `).join('');
}

function renderRecent() {
  const container = document.getElementById('recentSection');
  const grid = document.getElementById('recentGrid');
  const items = getRecent()
    .map((id) => TOOLS.find((t) => t.id === id))
    .filter(Boolean)
    .slice(0, 5);

  if (items.length === 0) return container.classList.add('hidden');
  container.classList.remove('hidden');

  grid.innerHTML = items.map((t) => `
    <a class="recent-item" href="#/${t.id}">
      <span class="recent-item-icon">${t.icon}</span>
      <span class="recent-item-name">${t.name}</span>
    </a>
  `).join('');
}

function renderChips() {
  const container = document.getElementById('categoryChips');
  const cats = ['All', ...CATEGORIES];
  container.innerHTML = cats.map((c) =>
    `<button class="chip ${c === currentCategory ? 'active' : ''}" data-cat="${c}" aria-pressed="${c === currentCategory}">${c}</button>`
  ).join('');
  container.querySelectorAll('.chip').forEach((chip) =>
    chip.addEventListener('click', () => {
      currentCategory = chip.dataset.cat;
      renderChips();
      renderHome();
    })
  );
}

function renderHome() {
  const container = document.getElementById('toolsContainer');
  const cats = currentCategory === 'All' ? CATEGORIES : [currentCategory];
  const favs = getFavorites();

  container.innerHTML = cats.map((cat) => {
    const tools = TOOLS.filter((t) => t.cat === cat);
    if (tools.length === 0) return '';
    return `
      <section class="category">
        <h2 class="category-title">${cat}</h2>
        <div class="tools-grid">
          ${tools.map((t) => `
            <a class="tool-card" href="#/${t.id}" data-tool="${t.id}" aria-label="${t.name} — ${t.desc}">
              ${favs.includes(t.id) ? '<span class="card-star" aria-hidden="true">★</span>' : ''}
              <span class="tool-icon">${t.icon}</span>
              <div class="tool-name">${t.name}</div>
              <div class="tool-desc">${t.desc}</div>
            </a>
          `).join('')}
        </div>
      </section>`;
  }).join('');

  container.querySelectorAll('.tool-card').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mx', ((e.clientX - rect.left) / rect.width) * 100 + '%');
      card.style.setProperty('--my', ((e.clientY - rect.top) / rect.height) * 100 + '%');
    });
  });
}

/* ============================================
   HELPERS
============================================ */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

function toast(msg, type = 'success') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = 'toast ' + type;
  el.classList.remove('hidden');
  clearTimeout(el._timer);
  el._timer = setTimeout(() => el.classList.add('hidden'), 2000);
}

async function copy(text) {
  try {
    await navigator.clipboard.writeText(text);
    toast('Copied');
  } catch {
    toast('Gagal copy', 'error');
  }
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* Output box — data disimpan di dataset, tombol pakai event delegation */
function outputBox(id, value) {
  const empty = !value;
  const display = empty
    ? '<span style="color:var(--text-dimmer)">Output akan muncul di sini...</span>'
    : escapeHtml(value);
  return `
    <div class="output" id="${id}" data-output="1">
      <button class="copy-btn" data-copy-target="${id}" aria-label="Copy">Copy</button>
      <span data-value="${escapeHtml(value)}">${display}</span>
    </div>
  `;
}

function updateOutput(id, value) {
  const el = document.getElementById(id);
  if (!el) return;
  const span = el.querySelector('[data-value]');
  if (!span) return;
  span.dataset.value = value;
  span.innerHTML = value
    ? escapeHtml(value)
    : '<span style="color:var(--text-dimmer)">Output akan muncul di sini...</span>';
}

/* Event delegation untuk semua copy button */
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.copy-btn, [data-copy]');
  if (!btn) return;

  let text = '';
  if (btn.dataset.copy !== undefined) {
    text = btn.dataset.copy;
  } else if (btn.dataset.copyTarget) {
    const target = document.getElementById(btn.dataset.copyTarget);
    const span = target?.querySelector('[data-value]');
    text = span?.dataset.value ?? '';
  }
  if (text) copy(text);
});

function colWrap(leftHtml, rightHtml) {
  return `
    <div class="tool-2col">
      <div><div class="col-label">Input</div>${leftHtml}</div>
      <div><div class="col-label">Output</div>${rightHtml}</div>
    </div>
  `;
}

/* Row helper — pakai data-copy, bukan onclick */
function row(label, val, opts = {}) {
  const safeVal = escapeHtml(val);
  const colorStyle = opts.color ? ` style="color:${opts.color}"` : '';
  return `
    <div class="output-row">
      <span class="output-row-label">${escapeHtml(label)}</span>
      <span class="output-row-value"${colorStyle}>${safeVal}</span>
      <button class="copy-btn copy-inline" data-copy="${escapeHtml(val)}" aria-label="Copy">Copy</button>
    </div>
  `;
}

/* ============================================
   TOOL RENDERERS
============================================ */
const TOOL_RENDERERS = {};

/* ---------- BASE64 ---------- */
TOOL_RENDERERS.base64 = (root) => {
  root.innerHTML = colWrap(
    `<div class="btn-group">
      <button class="btn btn-primary" data-mode="encode">Encode</button>
      <button class="btn btn-secondary" data-mode="decode">Decode</button>
      <button class="btn btn-ghost" data-action="clear">Clear</button>
    </div>
    <textarea id="b64-in" placeholder="Ketik sesuatu..." style="min-height:200px"></textarea>`,
    `<div id="b64-out"></div>`
  );

  let mode = 'encode';
  const input = $('#b64-in');
  const output = $('#b64-out');
  input.value = getToolInput('base64');

  const encode = (s) => {
    const bytes = new TextEncoder().encode(s);
    let bin = '';
    bytes.forEach((b) => (bin += String.fromCharCode(b)));
    return btoa(bin);
  };
  const decode = (s) => {
    const bin = atob(s);
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  };

  const render = () => {
    saveToolInput('base64', input.value);
    let result = '', error = '';
    try {
      if (input.value) result = mode === 'encode' ? encode(input.value) : decode(input.value);
    } catch (e) { error = e.message; }
    output.innerHTML = error
      ? `<div class="output" style="color:var(--danger)">✗ ${escapeHtml(error)}</div>`
      : outputBox('b64-result', result);
  };

  root.querySelectorAll('[data-mode]').forEach((btn) =>
    btn.addEventListener('click', () => {
      mode = btn.dataset.mode;
      root.querySelectorAll('[data-mode]').forEach((b) =>
        b.className = 'btn ' + (b.dataset.mode === mode ? 'btn-primary' : 'btn-secondary')
      );
      render();
    })
  );
  root.querySelector('[data-action="clear"]').addEventListener('click', () => { input.value = ''; render(); });
  input.addEventListener('input', render);
  render();
};

/* ---------- JSON ---------- */
TOOL_RENDERERS.json = (root) => {
  root.innerHTML = colWrap(
    `<div class="btn-group">
      <button class="btn btn-primary" data-action="format">Format</button>
      <button class="btn btn-secondary" data-action="minify">Minify</button>
      <button class="btn btn-secondary" data-action="validate">Validate</button>
      <button class="btn btn-ghost" data-action="clear">Clear</button>
    </div>
    <textarea id="json-in" placeholder='{"hello": "world"}' style="min-height:240px"></textarea>`,
    `<div id="json-out"></div>`
  );
  const input = $('#json-in');
  const output = $('#json-out');
  input.value = getToolInput('json') || '{"hello": "world"}';

  const run = (action) => {
    saveToolInput('json', input.value);
    try {
      const parsed = JSON.parse(input.value);
      let result = '';
      if (action === 'format') result = JSON.stringify(parsed, null, 2);
      else if (action === 'minify') result = JSON.stringify(parsed);
      else if (action === 'validate') result = '✓ Valid JSON';
      output.innerHTML = outputBox('json-result', result);
    } catch (e) {
      output.innerHTML = `<div class="output" style="color:var(--danger)">✗ ${escapeHtml(e.message)}</div>`;
    }
  };
  root.querySelectorAll('[data-action]').forEach((btn) =>
    btn.addEventListener('click', () => {
      if (btn.dataset.action === 'clear') { input.value = ''; output.innerHTML = ''; saveToolInput('json', ''); return; }
      run(btn.dataset.action);
    })
  );
  input.addEventListener('input', () => saveToolInput('json', input.value));
  run('format');
};

/* ---------- YAML (dengan warning "parser sederhana") ---------- */
TOOL_RENDERERS.yaml = (root) => {
  root.innerHTML = `
    <div class="warning-banner">⚠ Parser YAML sederhana — hanya mendukung <code>key: value</code> datar dan list of strings. Untuk YAML kompleks, pakai lib eksternal.</div>
    ${colWrap(
      `<div class="btn-group">
        <button class="btn btn-primary" data-action="y2j">YAML → JSON</button>
        <button class="btn btn-secondary" data-action="j2y">JSON → YAML</button>
        <button class="btn btn-ghost" data-action="clear">Clear</button>
      </div>
      <textarea id="yaml-in" style="min-height:240px"></textarea>`,
      `<div id="yaml-out"></div>`
    )}
  `;
  const input = $('#yaml-in');
  const output = $('#yaml-out');
  input.value = getToolInput('yaml') || 'name: test\nversion: 1.0.0\nitems:\n  - a\n  - b';

  function parseScalar(v) {
    if (v === 'true') return true;
    if (v === 'false') return false;
    if (v === 'null' || v === '~') return null;
    if (/^-?\d+$/.test(v)) return parseInt(v, 10);
    if (/^-?\d+\.\d+$/.test(v)) return parseFloat(v);
    return v.replace(/^["']|["']$/g, '');
  }

  function parseYaml(text) {
    const lines = text.split('\n');
    const result = {};
    let currentKey = null;
    for (const raw of lines) {
      const line = raw.replace(/\t/g, '  ');
      if (!line.trim() || line.trim().startsWith('#')) continue;
      const indent = line.match(/^\s*/)[0].length;
      const content = line.trim();
      if (indent === 0) {
        const m = content.match(/^([^:]+):\s*(.*)$/);
        if (!m) continue;
        currentKey = m[1].trim();
        const val = m[2].trim();
        result[currentKey] = val ? parseScalar(val) : null;
      } else if (content.startsWith('- ') && currentKey) {
        if (!Array.isArray(result[currentKey])) result[currentKey] = [];
        result[currentKey].push(parseScalar(content.slice(2).trim()));
      }
    }
    return result;
  }

  function needsQuote(s) {
    if (typeof s !== 'string') return false;
    if (s === '') return true;
    if (/^(true|false|null|yes|no|on|off|~|Null|NULL|True|False|Yes|No)$/i.test(s)) return true;
    if (/^-?\d+(\.\d+)?$/.test(s)) return true;
    if (/^[-?:,\[\]{}#&*!|>'"%@`]/.test(s)) return true;
    if (/[:#]\s/.test(s) || /\s$/.test(s) || /^\s/.test(s)) return true;
    return false;
  }

  function dumpYaml(obj, indent = 0) {
    const pad = '  '.repeat(indent);
    let out = '';
    for (const [k, v] of Object.entries(obj)) {
      if (v === null || v === undefined) out += `${pad}${k}: null\n`;
      else if (typeof v === 'object' && !Array.isArray(v)) out += `${pad}${k}:\n${dumpYaml(v, indent + 1)}`;
      else if (Array.isArray(v)) {
        out += `${pad}${k}:\n`;
        v.forEach((item) => {
          if (item && typeof item === 'object') out += `${pad}  -\n${dumpYaml(item, indent + 2)}`;
          else out += `${pad}  - ${typeof item === 'string' && needsQuote(item) ? JSON.stringify(item) : item}\n`;
        });
      } else if (typeof v === 'string' && needsQuote(v)) out += `${pad}${k}: ${JSON.stringify(v)}\n`;
      else out += `${pad}${k}: ${v}\n`;
    }
    return out;
  }

  root.querySelectorAll('[data-action]').forEach((btn) =>
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      if (action === 'clear') { input.value = ''; output.innerHTML = ''; saveToolInput('yaml', ''); return; }
      saveToolInput('yaml', input.value);
      try {
        if (action === 'y2j') output.innerHTML = outputBox('yaml-result', JSON.stringify(parseYaml(input.value), null, 2));
        else output.innerHTML = outputBox('yaml-result', dumpYaml(JSON.parse(input.value)));
      } catch (e) {
        output.innerHTML = `<div class="output" style="color:var(--danger)">✗ ${escapeHtml(e.message)}</div>`;
      }
    })
  );
  input.addEventListener('input', () => saveToolInput('yaml', input.value));
};

/* ---------- URL ---------- */
TOOL_RENDERERS.url = (root) => {
  root.innerHTML = `
    <div class="field">
      <input type="text" id="url-in" value="https://example.com/path?foo=bar&baz=qux#section">
    </div>
    <div id="url-out"></div>
  `;
  const input = $('#url-in');
  const output = $('#url-out');
  input.value = getToolInput('url') || 'https://example.com/path?foo=bar&baz=qux#section';

  const render = () => {
    saveToolInput('url', input.value);
    try {
      const raw = input.value.trim();
      if (!raw) return (output.innerHTML = '');
      const url = new URL(raw.includes('://') ? raw : 'https://' + raw);
      const rows = [
        ['Protocol', url.protocol.replace(':', '')],
        ['Hostname', url.hostname],
        ['Port', url.port || (url.protocol === 'https:' ? '443' : '80')],
        ['Pathname', url.pathname],
        ['Search', url.search || '—'],
        ['Hash', url.hash || '—'],
        ['Origin', url.origin],
      ];
      const params = [];
      url.searchParams.forEach((v, k) => params.push([k, v]));
      output.innerHTML = rows.map(([k, v]) => row(k, v)).join('') +
        (params.length ? `<div style="margin-top:16px"><div class="col-label">Query Params</div>${params.map(([k, v]) => row(k, v)).join('')}</div>` : '');
    } catch (e) {
      output.innerHTML = `<div class="output" style="color:var(--danger)">✗ ${escapeHtml(e.message)}</div>`;
    }
  };
  input.addEventListener('input', render);
  render();
};

/* ---------- MIME ---------- */
const MIME_MAP = {
  html: 'text/html', htm: 'text/html', css: 'text/css', js: 'application/javascript',
  mjs: 'application/javascript', json: 'application/json', xml: 'application/xml',
  yaml: 'application/yaml', yml: 'application/yaml', csv: 'text/csv', txt: 'text/plain',
  md: 'text/markdown', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg',
  gif: 'image/gif', svg: 'image/svg+xml', webp: 'image/webp', ico: 'image/x-icon',
  avif: 'image/avif', mp3: 'audio/mpeg', wav: 'audio/wav', ogg: 'audio/ogg',
  mp4: 'video/mp4', webm: 'video/webm', mov: 'video/quicktime', pdf: 'application/pdf',
  zip: 'application/zip', gz: 'application/gzip', tar: 'application/x-tar',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  woff: 'font/woff', woff2: 'font/woff2', ttf: 'font/ttf', otf: 'font/otf',
  wasm: 'application/wasm', exe: 'application/octet-stream',
};
TOOL_RENDERERS.mime = (root) => {
  root.innerHTML = `
    <div class="field"><input type="text" id="mime-in" placeholder=".png atau image atau json..."></div>
    <div id="mime-out"></div>
  `;
  const input = $('#mime-in');
  const output = $('#mime-out');
  input.value = getToolInput('mime') || 'image';

  const render = () => {
    saveToolInput('mime', input.value);
    const q = input.value.toLowerCase().trim();
    if (!q) return (output.innerHTML = '');
    const cleanQ = q.replace(/^\./, '');
    const exact = MIME_MAP[cleanQ];
    const results = Object.entries(MIME_MAP).filter(([ext, mime]) => ext.includes(cleanQ) || mime.includes(q));
    output.innerHTML = (exact ? row('EXACT', exact, { color: 'var(--accent)' }) : '') +
      results.map(([ext, mime]) => row('.' + ext, mime)).join('');
  };
  input.addEventListener('input', render);
  render();
};

/* ---------- CASE ---------- */
TOOL_RENDERERS.case = (root) => {
  root.innerHTML = `<div class="field"><input type="text" id="case-in" value="hello world example"></div><div id="case-out"></div>`;
  const input = $('#case-in');
  const output = $('#case-out');
  input.value = getToolInput('case') || 'hello world example';

  const words = (s) => s.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2').replace(/[_\-.]+/g, ' ').trim().split(/\s+/).filter(Boolean).map((w) => w.toLowerCase());

  const render = () => {
    saveToolInput('case', input.value);
    const w = words(input.value);
    const cap = (s) => s[0].toUpperCase() + s.slice(1);
    const formats = {
      camelCase: w.map((x, i) => (i === 0 ? x : cap(x))).join(''),
      PascalCase: w.map(cap).join(''),
      snake_case: w.join('_'),
      'kebab-case': w.join('-'),
      CONSTANT_CASE: w.join('_').toUpperCase(),
      'dot.case': w.join('.'),
      'Title Case': w.map(cap).join(' '),
      'Sentence case': w.length ? [cap(w[0]), ...w.slice(1)].join(' ') : '',
      slug: w.join('-'),
    };
    output.innerHTML = Object.entries(formats).map(([k, v]) => row(k, v)).join('');
  };
  input.addEventListener('input', render);
  render();
};

/* ---------- SLUG ---------- */
TOOL_RENDERERS.slug = (root) => {
  root.innerHTML = `<div class="field"><input type="text" id="slug-in" value="Hello World — Æther 2024!"></div><div id="slug-out"></div>`;
  const input = $('#slug-in');
  const output = $('#slug-out');
  input.value = getToolInput('slug') || 'Hello World — Æther 2024!';
  const LIG = { Æ: 'AE', æ: 'ae', Ø: 'O', ø: 'o', Ð: 'D', ð: 'd', Þ: 'TH', þ: 'th', ß: 'ss', Œ: 'OE', œ: 'oe' };

  const slugify = (s, sep = '-', lower = true) => {
    let out = s;
    for (const [k, v] of Object.entries(LIG)) out = out.split(k).join(v);
    out = out.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\w\s-]/g, '').trim();
    out = out.replace(/[\s_]+/g, sep).replace(new RegExp(sep + '+', 'g'), sep);
    return lower ? out.toLowerCase() : out;
  };

  const render = () => {
    saveToolInput('slug', input.value);
    const v = input.value;
    const variants = { dash: slugify(v, '-'), underscore: slugify(v, '_'), dot: slugify(v, '.'), 'dash-upper': slugify(v, '-', false) };
    output.innerHTML = Object.entries(variants).map(([k, val]) => row(k, val)).join('');
  };
  input.addEventListener('input', render);
  render();
};

/* ---------- REGEX (dengan capture groups + limit) ---------- */
TOOL_RENDERERS.regex = (root) => {
  root.innerHTML = `
    <div class="grid-2">
      <div class="field"><label class="field-label">Pattern</label><input type="text" id="rx-pat" value="\\d+"></div>
      <div class="field"><label class="field-label">Flags</label><input type="text" id="rx-flags" value="g"></div>
    </div>
    <div class="field"><label class="field-label">Test String</label><textarea id="rx-text">abc 123 def 456</textarea></div>
    <div id="rx-out"></div>
  `;
  const pat = $('#rx-pat');
  const flags = $('#rx-flags');
  const text = $('#rx-text');
  const output = $('#rx-out');
  const MAX = 100;

  const render = () => {
    try {
      const re = new RegExp(pat.value, flags.value.includes('g') ? flags.value : flags.value + 'g');
      const matches = [];
      let m;
      while ((m = re.exec(text.value)) !== null && matches.length < MAX) {
        matches.push({ match: m[0], index: m.index, groups: m.slice(1) });
        if (m.index === re.lastIndex) re.lastIndex++;
      }
      if (matches.length === 0) {
        output.innerHTML = `<div class="output" style="color:var(--text-dim)">Tidak ada match</div>`;
        return;
      }
      output.innerHTML =
        `<div class="col-label">${matches.length}${matches.length >= MAX ? '+' : ''} match</div>` +
        matches.map((m, i) => {
          let html = `<div class="output-row"><span class="output-row-label">#${i + 1}</span><span class="output-row-value"><strong>${escapeHtml(m.match)}</strong> <span style="color:var(--text-dimmer)">at ${m.index}</span></span></div>`;
          if (m.groups.length) {
            html += m.groups.map((g, gi) => `<div class="output-row" style="margin-left:20px;opacity:0.85"><span class="output-row-label">[${gi + 1}]</span><span class="output-row-value">${g === undefined ? '<span style="color:var(--text-dimmer)">undefined</span>' : escapeHtml(g)}</span></div>`).join('');
          }
          return html;
        }).join('');
    } catch (e) {
      output.innerHTML = `<div class="output" style="color:var(--danger)">✗ ${escapeHtml(e.message)}</div>`;
    }
  };
  [pat, flags, text].forEach((el) => el.addEventListener('input', render));
  render();
};

/* ---------- DIFF ---------- */
TOOL_RENDERERS.diff = (root) => {
  root.innerHTML = `
    <div class="grid-2">
      <div class="field"><label class="field-label">Text A</label><textarea id="diff-a">hello\nworld\nfoo</textarea></div>
      <div class="field"><label class="field-label">Text B</label><textarea id="diff-b">hello\nworld!\nfoo\nbar</textarea></div>
    </div>
    <div id="diff-out"></div>
  `;
  const a = $('#diff-a');
  const b = $('#diff-b');
  const output = $('#diff-out');

  const render = () => {
    const linesA = a.value.split('\n');
    const linesB = b.value.split('\n');
    const n = linesA.length, m = linesB.length;
    const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
    for (let i = n - 1; i >= 0; i--)
      for (let j = m - 1; j >= 0; j--)
        dp[i][j] = linesA[i] === linesB[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    const result = [];
    let i = 0, j = 0;
    while (i < n && j < m) {
      if (linesA[i] === linesB[j]) { result.push(['ctx', linesA[i]]); i++; j++; }
      else if (dp[i + 1][j] >= dp[i][j + 1]) { result.push(['del', linesA[i]]); i++; }
      else { result.push(['add', linesB[j]]); j++; }
    }
    while (i < n) { result.push(['del', linesA[i]]); i++; }
    while (j < m) { result.push(['add', linesB[j]]); j++; }
    const stats = { add: result.filter((r) => r[0] === 'add').length, del: result.filter((r) => r[0] === 'del').length };
    output.innerHTML = `<div class="col-label">+${stats.add} / -${stats.del}</div>` +
      `<div class="output diff-output">` +
      result.map(([type, val]) =>
        `<div class="diff-line diff-${type}">${type === 'add' ? '+' : type === 'del' ? '-' : ' '} ${escapeHtml(val || ' ')}</div>`
      ).join('') + `</div>`;
  };
  [a, b].forEach((el) => el.addEventListener('input', render));
  render();
};

/* ---------- LOREM (fix NaN) ---------- */
TOOL_RENDERERS.lorem = (root) => {
  root.innerHTML = `
    <div class="btn-group">
      <select id="lorem-type" style="width:auto;padding:9px 12px">
        <option value="paragraphs">Paragraf</option>
        <option value="sentences">Kalimat</option>
        <option value="words">Kata</option>
      </select>
      <input type="number" id="lorem-count" value="3" min="1" max="50" style="width:100px">
      <button class="btn btn-primary" id="lorem-gen">Generate</button>
    </div>
    <div id="lorem-out"></div>
  `;
  const WORDS = 'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure in reprehenderit voluptate velit esse cillum fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum'.split(' ');
  const pick = () => WORDS[Math.floor(Math.random() * WORDS.length)];
  const cap = (s) => s[0].toUpperCase() + s.slice(1);
  const words = (n) => Array.from({ length: n }, pick).join(' ');
  const sentences = (n) => Array.from({ length: n }, () => cap(words(8 + Math.floor(Math.random() * 8))) + '.').join(' ');
  const paragraphs = (n) => Array.from({ length: n }, () => sentences(3 + Math.floor(Math.random() * 3))).join('\n\n');
  const output = $('#lorem-out');

  const run = () => {
    const type = $('#lorem-type').value;
    let n = parseInt($('#lorem-count').value, 10);
    if (!Number.isFinite(n) || n < 1) n = 1;
    if (n > 50) n = 50;
    const result = type === 'words' ? words(n) : type === 'sentences' ? sentences(n) : paragraphs(n);
    output.innerHTML = outputBox('lorem-result', result);
  };
  $('#lorem-gen').addEventListener('click', run);
  run();
};

/* ---------- MARKDOWN (whitelist http/https, list fix) ---------- */
TOOL_RENDERERS.markdown = (root) => {
  root.innerHTML = colWrap(
    `<textarea id="md-in" style="min-height:300px"></textarea>`,
    `<div id="md-out" class="output md-output"></div>`
  );
  const input = $('#md-in');
  const output = $('#md-out');
  input.value = getToolInput('markdown') || '# Hello\n\nIni **markdown** dengan `code` dan [link](https://example.com).\n\n- item 1\n- item 2';

  const safeUrl = (u) => (/^https?:\/\//i.test(u.trim()) ? u.trim() : '#');

  const render = () => {
    saveToolInput('markdown', input.value);
    let html = escapeHtml(input.value);
    html = html.replace(/^### (.*)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.*)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.*)$/gm, '<h1>$1</h1>');
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    html = html.replace(/`(.+?)`/g, '<code>$1</code>');
    html = html.replace(/\[(.+?)\]\((.+?)\)/g, (_, text, url) => `<a href="${safeUrl(url)}" target="_blank" rel="noopener noreferrer">${text}</a>`);
    // List — group semua <li> berurutan jadi satu <ul>
    html = html.replace(/(?:^|\n)((?:- .+(?:\n|$))+)/gm, (match) => {
      const items = match.trim().split('\n').map((l) => `<li>${l.replace(/^- /, '')}</li>`).join('');
      return `\n<ul>${items}</ul>`;
    });
    html = html.split('\n\n').map((p) => (p.trim().startsWith('<') ? p : `<p>${p}</p>`)).join('\n');
    output.innerHTML = html;
  };
  input.addEventListener('input', render);
  render();
};

/* ---------- HASH (tidak di-persist) ---------- */
TOOL_RENDERERS.hash = (root) => {
  root.innerHTML = colWrap(
    `<div class="warning-banner">🔒 Input tidak disimpan ke localStorage (sensitif).</div>
     <textarea id="hash-in" placeholder="Ketik teks..." style="min-height:120px">hello</textarea>`,
    `<div id="hash-out"></div>`
  );
  const input = $('#hash-in');
  const output = $('#hash-out');
  input.value = 'hello';

  const render = async () => {
    if (!input.value) return (output.innerHTML = '');
    const algos = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'];
    const data = new TextEncoder().encode(input.value);
    const results = await Promise.all(
      algos.map(async (algo) => {
        const buf = await crypto.subtle.digest(algo, data);
        const hex = Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
        return [algo, hex];
      })
    );
    output.innerHTML = results.map(([algo, hex]) =>
      `<div class="output-row" style="flex-direction:column;align-items:stretch;gap:6px">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span class="output-row-label">${algo}</span>
          <button class="copy-btn copy-inline" data-copy="${hex}">Copy</button>
        </div>
        <span class="output-row-value" style="font-size:11px">${hex}</span>
      </div>`
    ).join('');
  };
  input.addEventListener('input', render);
  render();
};

/* ---------- JWT (tidak di-persist) ---------- */
TOOL_RENDERERS.jwt = (root) => {
  root.innerHTML = `
    <div class="warning-banner">🔒 Token JWT sensitif — tidak disimpan ke localStorage.</div>
    <div class="field"><textarea id="jwt-in" placeholder="Paste JWT token di sini..." style="min-height:100px;font-size:11px"></textarea></div>
    <div id="jwt-out"></div>
  `;
  const input = $('#jwt-in');
  const output = $('#jwt-out');

  const b64decode = (str) => {
    const pad = str.length % 4 === 0 ? '' : '='.repeat(4 - (str.length % 4));
    const b64 = (str + pad).replace(/-/g, '+').replace(/_/g, '/');
    const bin = atob(b64);
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  };

  const render = () => {
    if (!input.value.trim()) return (output.innerHTML = '');
    try {
      const parts = input.value.trim().split('.');
      if (parts.length !== 3) throw new Error('JWT harus punya 3 bagian');
      const header = JSON.parse(b64decode(parts[0]));
      const payload = JSON.parse(b64decode(parts[1]));
      let expiry = '';
      if (typeof payload.exp === 'number') {
        const diff = payload.exp * 1000 - Date.now();
        const abs = Math.abs(diff);
        const days = Math.floor(abs / 86400000);
        const hrs = Math.floor(abs / 3600000);
        const mins = Math.floor(abs / 60000);
        const dur = days > 0 ? `${days} hari` : hrs > 0 ? `${hrs} jam` : mins > 0 ? `${mins} menit` : `${Math.floor(abs / 1000)} detik`;
        expiry = diff >= 0 ? `✓ Valid — expired dalam ${dur}` : `✗ Expired — ${dur} lalu`;
      }
      output.innerHTML =
        (expiry ? `<div class="output-row" style="border-color:${expiry.startsWith('✓') ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)'}"><span class="output-row-value">${expiry}</span></div><div style="height:8px"></div>` : '') +
        `<div class="col-label">Header</div><pre class="output" style="padding-right:14px">${escapeHtml(JSON.stringify(header, null, 2))}</pre>
         <div class="col-label" style="margin-top:12px">Payload</div><pre class="output" style="padding-right:14px">${escapeHtml(JSON.stringify(payload, null, 2))}</pre>`;
    } catch (e) {
      output.innerHTML = `<div class="output" style="color:var(--danger)">✗ ${escapeHtml(e.message)}</div>`;
    }
  };
  input.addEventListener('input', render);
};

/* ---------- PASSWORD (minimal 1 dari tiap tipe) ---------- */
TOOL_RENDERERS.password = (root) => {
  root.innerHTML = `
    <div class="field"><div style="display:flex;gap:8px">
      <input type="text" id="pw-out" readonly style="font-family:var(--font-mono)">
      <button class="btn btn-primary" id="pw-regen" aria-label="Generate ulang">↻</button>
      <button class="btn btn-secondary" id="pw-copy">Copy</button>
    </div></div>
    <div id="pw-strength"></div>
    <div class="field" style="margin-top:16px">
      <label class="field-label">Panjang: <span id="pw-len-val">16</span></label>
      <input type="range" id="pw-len" min="4" max="64" value="16">
    </div>
    <div class="grid-2">
      <label class="checkbox-row"><input type="checkbox" id="pw-upper" checked> Huruf besar</label>
      <label class="checkbox-row"><input type="checkbox" id="pw-lower" checked> Huruf kecil</label>
      <label class="checkbox-row"><input type="checkbox" id="pw-num" checked> Angka</label>
      <label class="checkbox-row"><input type="checkbox" id="pw-sym" checked> Simbol</label>
      <label class="checkbox-row"><input type="checkbox" id="pw-amb"> Exclude ambigu</label>
    </div>
  `;
  const CHARS = { upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', lower: 'abcdefghijklmnopqrstuvwxyz', num: '0123456789', sym: '!@#$%^&*()_+-=[]{}|;:,.<>?' };
  const AMB = 'Il1O0o';
  const out = $('#pw-out');
  const strengthEl = $('#pw-strength');
  const types = ['upper', 'lower', 'num', 'sym'];

  function randIdx(max) {
    const a = new Uint32Array(1);
    crypto.getRandomValues(a);
    return a[0] % max;
  }

  function generate() {
    const len = Math.max(4, parseInt($('#pw-len').value, 10) || 16);
    const active = types.filter((t) => $('#pw-' + t).checked);
    if (active.length === 0) { out.value = ''; strengthEl.innerHTML = '<div class="output" style="color:var(--danger)">Pilih minimal satu tipe</div>'; return; }
    let pool = active.map((t) => CHARS[t]).join('');
    if ($('#pw-amb').checked) pool = pool.split('').filter((c) => !AMB.includes(c)).join('');
    if (pool.length === 0) { out.value = ''; return; }
    // Minimal 1 karakter per tipe yang dicentang
    const chars = active.map((t) => {
      let set = CHARS[t];
      if ($('#pw-amb').checked) set = set.split('').filter((c) => !AMB.includes(c)).join('');
      return set[randIdx(set.length)];
    });
    while (chars.length < len) chars.push(pool[randIdx(pool.length)]);
    // Shuffle
    for (let i = chars.length - 1; i > 0; i--) {
      const j = randIdx(i + 1);
      [chars[i], chars[j]] = [chars[j], chars[i]];
    }
    out.value = chars.slice(0, len).join('');
    renderStrength();
  }

  function renderStrength() {
    const pw = out.value;
    let poolSize = 0;
    if (/[a-z]/.test(pw)) poolSize += 26;
    if (/[A-Z]/.test(pw)) poolSize += 26;
    if (/[0-9]/.test(pw)) poolSize += 10;
    if (/[^a-zA-Z0-9]/.test(pw)) poolSize += 32;
    const entropy = pw.length > 0 ? pw.length * Math.log2(poolSize || 1) : 0;
    let score = 0;
    if (entropy >= 30) score++;
    if (entropy >= 50) score++;
    if (entropy >= 70) score++;
    if (entropy >= 90) score++;
    const labels = ['Sangat lemah', 'Lemah', 'Sedang', 'Kuat', 'Sangat kuat'];
    const colors = ['var(--danger)', 'var(--danger)', 'var(--warning)', 'var(--success)', 'var(--success)'];
    const label = labels[Math.min(score, 4)];
    const bar = Array.from({ length: 5 }, (_, i) => `<div style="flex:1;height:4px;border-radius:2px;background:${i < score ? colors[score] : 'var(--bg-hover)'}"></div>`).join('');
    const guess = Math.pow(2, entropy) / 1e10;
    const crack = guess < 60 ? `${Math.round(guess)} detik` : guess < 3600 ? `${Math.round(guess / 60)} menit` : guess < 86400 ? `${Math.round(guess / 3600)} jam` : guess < 31536000 ? `${Math.round(guess / 86400)} hari` : `${Math.round(guess / 31536000)} tahun`;
    strengthEl.innerHTML = `
      <div style="display:flex;gap:4px;margin-bottom:8px">${bar}</div>
      <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--text-dim)">
        <span><strong style="color:${colors[score]}">${label}</strong></span>
        <span>${Math.round(entropy)} bits · crack: ${crack}</span>
      </div>`;
  }

  $('#pw-regen').addEventListener('click', generate);
  $('#pw-copy').addEventListener('click', () => copy(out.value));
  $('#pw-len').addEventListener('input', (e) => { $('#pw-len-val').textContent = e.target.value; generate(); });
  ['pw-upper', 'pw-lower', 'pw-num', 'pw-sym', 'pw-amb'].forEach((id) => $('#' + id).addEventListener('change', generate));
  generate();
};

/* ---------- TIMESTAMP (fix leak + ms detection) ---------- */
TOOL_RENDERERS.timestamp = (root) => {
  root.innerHTML = `
    <div class="field"><input type="text" id="ts-in" placeholder="1700000000 atau 1700000000000 atau 2024-01-01"></div>
    <div id="ts-out"></div>
  `;
  const input = $('#ts-in');
  const output = $('#ts-out');

  const format = (ts) => {
    const d = new Date(ts * 1000);
    return {
      full: d.toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'long' }),
      iso: d.toISOString(),
    };
  };

  const render = () => {
    const now = Math.floor(Date.now() / 1000);
    const nf = format(now);
    let html = `<div class="col-label">Sekarang</div>` + row('Unix', String(now)) + row('Date', nf.full);

    if (input.value) {
      let ts;
      const raw = input.value.trim();
      if (/^\d{13,}$/.test(raw)) ts = Math.floor(parseInt(raw, 10) / 1000); // ms
      else if (/^\d+$/.test(raw)) ts = parseInt(raw, 10);
      else {
        const d = new Date(raw);
        if (!isNaN(d.getTime())) ts = Math.floor(d.getTime() / 1000);
      }
      if (ts !== undefined && ts !== null) {
        const f = format(ts);
        html += `<div class="col-label" style="margin-top:16px">Hasil</div>` +
          row('Unix', String(ts)) +
          row('Date', f.full) +
          row('ISO', f.iso);
      }
    }
    output.innerHTML = html;
  };

  render();
  const tick = setInterval(() => {
    // Cuma update kalau input kosong — ganti teks tanpa nge-rewrite DOM
    if (input.value) return;
    const now = Math.floor(Date.now() / 1000);
    const rows = output.querySelectorAll('.output-row-value');
    if (rows.length >= 2) {
      rows[0].textContent = String(now);
      rows[1].textContent = format(now).full;
    }
  }, 1000);
  input.addEventListener('input', render);

  return () => clearInterval(tick);
};

/* ---------- CRON (validasi + OR logic) ---------- */
TOOL_RENDERERS.cron = (root) => {
  root.innerHTML = `
    <div class="field"><input type="text" id="cron-in" value="*/5 * * * *" style="font-family:var(--font-mono);text-align:center;font-size:16px;letter-spacing:0.1em"></div>
    <div class="btn-group" id="cron-presets">
      <button class="btn btn-secondary" data-expr="* * * * *">Tiap menit</button>
      <button class="btn btn-secondary" data-expr="*/5 * * * *">5 menit</button>
      <button class="btn btn-secondary" data-expr="0 * * * *">Tiap jam</button>
      <button class="btn btn-secondary" data-expr="0 0 * * *">Harian</button>
      <button class="btn btn-secondary" data-expr="0 9 * * 1-5">Weekday 9am</button>
    </div>
    <div id="cron-out"></div>
  `;
  const input = $('#cron-in');
  const output = $('#cron-out');
  const FIELDS = [
    { name: 'Menit', min: 0, max: 59 },
    { name: 'Jam', min: 0, max: 23 },
    { name: 'Tanggal', min: 1, max: 31 },
    { name: 'Bulan', min: 1, max: 12 },
    { name: 'Hari', min: 0, max: 6 },
  ];
  const MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
  const MONTHS_FULL = ['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE','JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER'];
  const DAYS = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
  const DAYS_FULL = ['SUNDAY','MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY'];

  function parseField(raw, min, max, names) {
    if (raw === '*' || raw === '?') return Array.from({ length: max - min + 1 }, (_, i) => min + i);
    const values = new Set();
    for (const part of raw.split(',')) {
      const stepMatch = part.match(/^(\*|\d+(?:-\d+)?)\/(\d+)$/);
      if (stepMatch) {
        const step = parseInt(stepMatch[2], 10);
        if (step < 1) throw new Error(`Step tidak valid: ${part}`);
        let start = min, end = max;
        if (stepMatch[1] !== '*') {
          const range = stepMatch[1].split('-').map(Number);
          start = range[0]; end = range[1] ?? max;
        }
        for (let v = start; v <= end; v += step) values.add(v);
        continue;
      }
      const rangeMatch = part.match(/^([A-Z0-9]+)-([A-Z0-9]+)$/i);
      if (rangeMatch) {
        const a = resolveName(rangeMatch[1], names, min, max);
        const b = resolveName(rangeMatch[2], names, min, max);
        for (let v = a; v <= b; v++) values.add(v);
        continue;
      }
      const v = resolveName(part, names, min, max);
      values.add(v === 7 && max === 6 ? 0 : v);
    }
    for (const v of values) if (v < min || v > max) throw new Error(`Nilai ${v} di luar range ${min}-${max}`);
    return Array.from(values).sort((a, b) => a - b);
  }

  function resolveName(tok, names, min, max) {
    const upper = tok.toUpperCase();
    if (names && names.indexOf(upper) >= 0) return names.indexOf(upper) + min;
    if (names === MONTHS && MONTHS_FULL.indexOf(upper) >= 0) return MONTHS_FULL.indexOf(upper) + 1;
    if (names === DAYS && DAYS_FULL.indexOf(upper) >= 0) return DAYS_FULL.indexOf(upper);
    if (upper === '7' && max === 6) return 0;
    if (/^-?\d+$/.test(upper)) return parseInt(upper, 10);
    throw new Error(`Token tidak valid: ${tok}`);
  }

  function describe(raw, name) {
    if (raw === '*' || raw === '?') return `setiap ${name.toLowerCase()}`;
    const step = raw.match(/^\*\/(\d+)$/);
    if (step) return `setiap ${step[1]} ${name.toLowerCase()}`;
    return raw;
  }

  function describeCron(parts, next) {
    const [mi, hr, dom, mon, dow] = parts;
    const dayNames = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
    const monNames = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
    let when = '';
    // Jam & menit
    if (hr === '*' && mi === '*') when = 'Setiap menit';
    else if (hr === '*' && /^\*\/(\d+)$/.test(mi)) when = `Setiap ${mi.match(/^\*\/(\d+)$/)[1]} menit`;
    else if (hr === '*' && /^\d+$/.test(mi)) when = `Setiap jam pada menit ke-${mi}`;
    else if (/^\d+$/.test(hr) && /^\d+$/.test(mi)) when = `Pukul ${hr.padStart(2,'0')}:${mi.padStart(2,'0')}`;
    else if (/^\d+$/.test(hr) && mi === '*') when = `Setiap menit pada jam ${hr}`;
    else when = `${hr}:${mi}`;
    // Hari
    if (dow === '*' && dom === '*') {
      // tiap hari
    } else if (dow !== '*' && dom === '*') {
      const parts2 = dow.split(',').flatMap((p) => {
        if (/^\d-\d$/.test(p)) {
          const [a, b] = p.split('-').map(Number);
          return [`${dayNames[a]}–${dayNames[b]}`];
        }
        if (/^[A-Z]{3}/i.test(p)) {
          const idx = ['SUN','MON','TUE','WED','THU','FRI','SAT'].indexOf(p.toUpperCase());
          return idx >= 0 ? [dayNames[idx]] : [p];
        }
        if (/^\d$/.test(p)) return [dayNames[+p] || p];
        return [p];
      });
      when = `Setiap ${parts2.join(', ')} ${when.toLowerCase().startsWith('pukul') ? when.toLowerCase() : 'pada ' + when}`;
    } else if (dom !== '*' && dow === '*') {
      when = `Setiap tanggal ${dom} ${when.toLowerCase().startsWith('pukul') ? when.toLowerCase() : 'pada ' + when}`;
    }
    // Bulan
    if (mon !== '*') {
      const mparts = mon.split(',').map((p) => {
        if (/^\d+$/.test(p)) return monNames[+p - 1] || p;
        const idx = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'].indexOf(p.toUpperCase());
        return idx >= 0 ? monNames[idx] : p;
      });
      when += ` di bulan ${mparts.join(', ')}`;
    }
    return when;
  }

  function getNext(fields, count) {
    const results = [];
    const d = new Date();
    d.setSeconds(0, 0);
    d.setMinutes(d.getMinutes() + 1);
    const [minV, hrV, domV, monV, dowV] = fields;
    const limit = 366 * 24 * 60 * 4; // 4 tahun, cukup buat 29 Feb
    let iter = 0;
    const domRestricted = domV.length !== 31;
    const dowRestricted = dowV.length !== 7;
    while (results.length < count && iter < limit) {
      const mon = d.getMonth() + 1;
      // Lompat hari kalau bulan tidak match
      if (!monV.includes(mon)) {
        d.setMonth(d.getMonth() + 1, 1);
        d.setHours(0, 0, 0, 0);
        iter += 1440;
        continue;
      }
      const day = d.getDate(), dow = d.getDay();
      const domMatch = domV.includes(day);
      const dowMatch = dowV.includes(dow);
      let dayMatch;
      if (domRestricted && dowRestricted) dayMatch = domMatch || dowMatch;
      else if (domRestricted) dayMatch = domMatch;
      else if (dowRestricted) dayMatch = dowMatch;
      else dayMatch = true;
      if (!dayMatch) {
        d.setDate(d.getDate() + 1);
        d.setHours(0, 0, 0, 0);
        iter += 1440;
        continue;
      }
      const h = d.getHours();
      if (!hrV.includes(h)) {
        d.setHours(d.getHours() + 1, 0, 0, 0);
        iter += 60;
        continue;
      }
      const m = d.getMinutes();
      if (!minV.includes(m)) {
        d.setMinutes(d.getMinutes() + 1);
        iter++;
        continue;
      }
      results.push(new Date(d));
      d.setMinutes(d.getMinutes() + 1);
      iter++;
    }
    return results;
  }

  const render = () => {
    try {
      const parts = input.value.trim().split(/\s+/);
      if (parts.length !== 5) throw new Error('Cron harus punya 5 field: menit jam tanggal bulan hari');
      const fields = [
        parseField(parts[0], 0, 59),
        parseField(parts[1], 0, 23),
        parseField(parts[2], 1, 31),
        parseField(parts[3], 1, 12, MONTHS),
        parseField(parts[4], 0, 6, DAYS),
      ];
      const next = getNext(fields, 5);
      const sentence = describeCron(parts, next);
      output.innerHTML =
        `<div class="output">${escapeHtml(sentence)}</div><div style="height:12px"></div>` +
        (next.length
          ? `<div class="col-label" style="margin-top:16px">Next ${next.length} runs</div>` + next.map((d) => `<div class="output-row"><span class="output-row-value">${d.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</span></div>`).join('')
          : `<div class="output-row" style="color:var(--warning)">⚠ Tidak ada jadwal dalam 4 tahun ke depan</div>`);
    } catch (e) {
      output.innerHTML = `<div class="output" style="color:var(--danger)">✗ ${escapeHtml(e.message)}</div>`;
    }
  };

  root.querySelectorAll('#cron-presets button').forEach((b) => b.addEventListener('click', () => { input.value = b.dataset.expr; render(); }));
  input.addEventListener('input', render);
  render();
};

/* ---------- COLOR (escape + theme-aware) ---------- */
TOOL_RENDERERS.color = (root) => {
  root.innerHTML = `
    <div class="field" style="display:flex;gap:12px;align-items:center;flex-direction:row">
      <input type="color" id="col-in" value="#3b82f6" style="width:64px;height:64px">
      <input type="text" id="col-hex" value="#3b82f6" style="font-family:var(--font-mono)">
    </div>
    <div id="col-out"></div>
  `;
  const colorIn = $('#col-in');
  const hexIn = $('#col-hex');
  const output = $('#col-out');

  const hexToRgb = (hex) => {
    const c = hex.replace('#', '');
    return { r: parseInt(c.slice(0, 2), 16), g: parseInt(c.slice(2, 4), 16), b: parseInt(c.slice(4, 6), 16) };
  };
  const rgbToHsl = ({ r, g, b }) => {
    const rn = r / 255, gn = g / 255, bn = b / 255;
    const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
    const l = (max + min) / 2;
    let h = 0, s = 0;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      if (max === rn) h = (gn - bn) / d + (gn < bn ? 6 : 0);
      else if (max === gn) h = (bn - rn) / d + 2;
      else h = (rn - gn) / d + 4;
      h /= 6;
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
  };
  const hslToRgb = ({ h, s, l }) => {
    const hn = h / 360, sn = s / 100, ln = l / 100;
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1; if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    if (sn === 0) { const v = Math.round(ln * 255); return { r: v, g: v, b: v }; }
    const q = ln < 0.5 ? ln * (1 + sn) : ln + sn - ln * sn;
    const p = 2 * ln - q;
    return { r: Math.round(hue2rgb(p, q, hn + 1 / 3) * 255), g: Math.round(hue2rgb(p, q, hn) * 255), b: Math.round(hue2rgb(p, q, hn - 1 / 3) * 255) };
  };
  const rgbToHex = ({ r, g, b }) => '#' + [r, g, b].map((n) => n.toString(16).padStart(2, '0')).join('');

  const render = () => {
    try {
      const raw = hexIn.value.trim();
      const hex = /^#[0-9a-fA-F]{6}$/.test(raw) ? raw : /^[0-9a-fA-F]{6}$/.test(raw) ? '#' + raw : null;
      if (!hex) throw new Error('Format hex tidak valid (contoh: #3b82f6)');
      const rgb = hexToRgb(hex);
      const hsl = rgbToHsl(rgb);
      const palette = [95, 85, 70, 55, 45, 35, 25, 15].map((l) => rgbToHex(hslToRgb({ h: hsl.h, s: hsl.s, l })));
      output.innerHTML =
        row('HEX', hex) +
        row('RGB', `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`) +
        row('HSL', `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`) +
        `<div class="col-label" style="margin-top:16px">Palette (klik untuk copy)</div>` +
        `<div class="palette">${palette.map((c) => `<button class="palette-swatch" style="background:${c}" data-copy="${c}" title="${c}" aria-label="Copy ${c}"></button>`).join('')}</div>`;
    } catch (e) {
      output.innerHTML = `<div class="output" style="color:var(--danger)">✗ ${escapeHtml(e.message)}</div>`;
    }
  };
  colorIn.addEventListener('input', () => { hexIn.value = colorIn.value; render(); });
  hexIn.addEventListener('input', () => { if (/^#[0-9a-fA-F]{6}$/.test(hexIn.value)) colorIn.value = hexIn.value; render(); });
  render();
};

/* ---------- QR (pakai qrcode-generator lokal) ---------- */
TOOL_RENDERERS.qr = (root) => {
  root.innerHTML = `
    <div class="field"><textarea id="qr-in" placeholder="Teks atau URL..." style="min-height:80px">https://github.com/Syqmhmmd-commits/devtools-hub</textarea></div>
    <div class="grid-2" style="margin-bottom:16px">
      <div class="field"><label class="field-label">Warna QR</label><input type="color" id="qr-dark" value="#000000"></div>
      <div class="field"><label class="field-label">Background</label><input type="color" id="qr-light" value="#ffffff"></div>
    </div>
    <div class="grid-2" style="margin-bottom:16px">
      <div class="field">
        <label class="field-label">Ukuran: <span id="qr-size-val">320</span>px</label>
        <input type="range" id="qr-size" min="160" max="640" value="320" step="20">
      </div>
      <div class="field">
        <label class="field-label">Error Correction</label>
        <select id="qr-level" style="padding:9px 12px">
          <option value="L">L — Low (7%)</option>
          <option value="M" selected>M — Medium (15%)</option>
          <option value="Q">Q — Quartile (25%)</option>
          <option value="H">H — High (30%)</option>
        </select>
      </div>
    </div>
    <div id="qr-out" style="text-align:center"></div>
  `;
  const input = $('#qr-in');
  const dark = $('#qr-dark');
  const light = $('#qr-light');
  const size = $('#qr-size');
  const level = $('#qr-level');
  const output = $('#qr-out');

  const render = () => {
    const text = input.value;
    if (!text) { output.innerHTML = ''; return; }
    if (typeof qrcode === 'undefined') {
      output.innerHTML = `<div class="output" style="color:var(--danger)">✗ Library qrcode.min.js belum ke-load</div>`;
      return;
    }
    try {
      if (qrcode.stringToBytesFuncs && qrcode.stringToBytesFuncs['UTF-8']) {
        qrcode.stringToBytes = qrcode.stringToBytesFuncs['UTF-8'];
      }
      const qr = qrcode(0, level.value);
      qr.addData(text);
      qr.make();
      const size = qr.getModuleCount();
      const cell = 8;
      const margin = 4;
      const total = (size + margin * 2) * cell;
      const displaySize = parseInt(size.value, 10) || 320;
      let rects = '';
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          if (qr.isDark(r, c)) {
            rects += `<rect x="${(c + margin) * cell}" y="${(r + margin) * cell}" width="${cell}" height="${cell}" />`;
          }
        }
      }
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${total}" height="${total}" viewBox="0 0 ${total} ${total}" style="max-width:100%;height:auto;border-radius:12px;border:1px solid var(--border);display:block">
        <rect width="${total}" height="${total}" fill="${light.value}" />
        <g fill="${dark.value}">${rects}</g>
      </svg>`;
      output.innerHTML = `
        <div style="display:inline-block;padding:16px;background:var(--bg-card);border-radius:var(--radius);border:1px solid var(--border);max-width:${displaySize}px">
          ${svg}
        </div>
        <div class="btn-group" style="justify-content:center;margin-top:16px">
          <button class="btn btn-secondary" id="qr-download-svg">⬇ SVG</button>
          <button class="btn btn-primary" id="qr-download-png">⬇ PNG</button>
        </div>
      `;
      const downloadSVG = () => {
        const blob = new Blob([svg], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'qr.svg';
        a.click();
        URL.revokeObjectURL(url);
        toast('Downloaded SVG');
      };
      const downloadPNG = () => {
        const canvas = document.createElement('canvas');
        canvas.width = total;
        canvas.height = total;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = light.value;
        ctx.fillRect(0, 0, total, total);
        ctx.fillStyle = dark.value;
        for (let r = 0; r < size; r++) {
          for (let c = 0; c < size; c++) {
            if (qr.isDark(r, c)) {
              ctx.fillRect((c + margin) * cell, (r + margin) * cell, cell, cell);
            }
          }
        }
        canvas.toBlob((blob) => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'qr.png';
          a.click();
          URL.revokeObjectURL(url);
          toast('Downloaded PNG');
        });
      };
      $('#qr-download-svg').addEventListener('click', downloadSVG);
      $('#qr-download-png').addEventListener('click', downloadPNG);
    } catch (e) {
      const msg = (e && (e.message || String(e))) || 'Gagal generate QR';
      const friendly = /too long|overflow|code length/i.test(msg) ? 'Teks terlalu panjang untuk QR' : msg;
      output.innerHTML = `<div class="output" style="color:var(--danger)">✗ ${escapeHtml(friendly)}</div>`;
    }
  };
  input.addEventListener('input', render);
  dark.addEventListener('input', render);
  light.addEventListener('input', render);
  size.addEventListener('input', () => { $('#qr-size-val').textContent = size.value; render(); });
  level.addEventListener('change', render);
  render();
};

/* ---------- UUID ---------- */
TOOL_RENDERERS.uuid = (root) => {
  root.innerHTML = `
    <div class="btn-group">
      <select id="uuid-type" style="width:auto;padding:9px 12px">
        <option value="uuid">UUID v4</option>
        <option value="nanoid">NanoID</option>
        <option value="ulid">ULID</option>
      </select>
      <input type="number" id="uuid-count" value="5" min="1" max="100" style="width:100px">
      <button class="btn btn-primary" id="uuid-gen">Generate</button>
    </div>
    <div id="uuid-out"></div>
  `;
  const uuidv4 = () => crypto.randomUUID();
  const NANO = 'useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict';
  const nanoid = (size = 21) => {
    const bytes = crypto.getRandomValues(new Uint8Array(size));
    return Array.from(bytes).map((b) => NANO[b & 63]).join('');
  };
  const ULID = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
  const ulid = () => {
    let t = Date.now();
    let timeStr = '';
    for (let i = 0; i < 10; i++) { timeStr = ULID[t % 32] + timeStr; t = Math.floor(t / 32); }
    const rand = crypto.getRandomValues(new Uint8Array(16));
    return timeStr + Array.from(rand).map((b) => ULID[b % 32]).join('');
  };
  $('#uuid-gen').addEventListener('click', () => {
    const type = $('#uuid-type').value;
    let n = parseInt($('#uuid-count').value, 10) || 1;
    if (n < 1) n = 1; if (n > 100) n = 100;
    const list = type === 'uuid' ? Array.from({ length: n }, uuidv4) : type === 'nanoid' ? Array.from({ length: n }, () => nanoid()) : Array.from({ length: n }, ulid);
    $('#uuid-out').innerHTML = outputBox('uuid-result', list.join('\n'));
  });
  $('#uuid-gen').click();
};

/* ---------- SEMVER (prerelease + ^0.x) ---------- */
TOOL_RENDERERS.semver = (root) => {
  root.innerHTML = `
    <div class="grid-2">
      <div class="field"><label class="field-label">Version A</label><input type="text" id="sv-a" value="1.2.3"></div>
      <div class="field"><label class="field-label">Version B</label><input type="text" id="sv-b" value="1.2.4"></div>
    </div>
    <div class="field"><label class="field-label">Satisfies Range</label><input type="text" id="sv-range" value="^1.0.0"></div>
    <div id="sv-out"></div>
  `;
  const parse = (v) => {
    const m = v.trim().match(/^v?(\d+)\.(\d+)\.(\d+)(?:-([^\s+]+))?/);
    if (!m) throw new Error('Format tidak valid: ' + v);
    return { major: +m[1], minor: +m[2], patch: +m[3], pre: m[4] || '' };
  };
  const cmp = (a, b) => {
    const va = parse(a), vb = parse(b);
    if (va.major !== vb.major) return va.major - vb.major;
    if (va.minor !== vb.minor) return va.minor - vb.minor;
    if (va.patch !== vb.patch) return va.patch - vb.patch;
    if (!va.pre && vb.pre) return 1;
    if (va.pre && !vb.pre) return -1;
    if (va.pre === vb.pre) return 0;
    const pa = va.pre.split('.');
    const pb = vb.pre.split('.');
    for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
      const xa = pa[i], xb = pb[i];
      if (xa === undefined) return -1;
      if (xb === undefined) return 1;
      const na = /^\d+$/.test(xa) ? parseInt(xa, 10) : xa;
      const nb = /^\d+$/.test(xb) ? parseInt(xb, 10) : xb;
      if (na === nb) continue;
      if (typeof na === 'number' && typeof nb === 'number') return na - nb;
      return na < nb ? -1 : 1;
    }
    return 0;
  };
  const satisfies = (v, range) => {
    const r = range.trim();
    if (r === '*') return true;
    const cur = parse(v);
    if (r.startsWith('^')) {
      const min = parse(r.slice(1));
      if (cmp(v, r.slice(1)) < 0) return false;
      if (min.major === 0 && min.minor === 0) return cur.major === 0 && cur.minor === 0 && cur.patch === min.patch;
      if (min.major === 0) return cur.major === 0 && cur.minor === min.minor;
      return cur.major === min.major;
    }
    if (r.startsWith('~')) { const min = parse(r.slice(1)); return cmp(v, r.slice(1)) >= 0 && cur.major === min.major && cur.minor === min.minor; }
    if (r.startsWith('>=')) return cmp(v, r.slice(2).trim()) >= 0;
    if (r.startsWith('>')) return cmp(v, r.slice(1).trim()) > 0;
    if (r.startsWith('<=')) return cmp(v, r.slice(2).trim()) <= 0;
    if (r.startsWith('<')) return cmp(v, r.slice(1).trim()) < 0;
    return cmp(v, r) === 0;
  };

  const render = () => {
    try {
      const a = $('#sv-a').value, b = $('#sv-b').value, range = $('#sv-range').value;
      const c = cmp(a, b);
      const sat = satisfies(a, range);
      const pa = parse(a);
      $('#sv-out').innerHTML =
        row('Compare', `${a} ${c > 0 ? '>' : c < 0 ? '<' : '='} ${b}`) +
        row('Satisfies', sat ? '✓ match' : '✗ tidak match', { color: sat ? 'var(--success)' : 'var(--danger)' }) +
        row('Major', String(pa.major)) + row('Minor', String(pa.minor)) + row('Patch', String(pa.patch)) +
        (pa.pre ? row('Prerelease', pa.pre, { color: 'var(--warning)' }) : '');
    } catch (e) {
      $('#sv-out').innerHTML = `<div class="output" style="color:var(--danger)">✗ ${escapeHtml(e.message)}</div>`;
    }
  };
  ['sv-a', 'sv-b', 'sv-range'].forEach((id) => $('#' + id).addEventListener('input', render));
  render();
};

/* ============================================
   COMMAND PALETTE
============================================ */
const palette = $('#cmdPalette');
const cmdInput = $('#cmdInput');
const cmdResults = $('#cmdResults');
let cmdSelected = 0;
let cmdFiltered = TOOLS;
let cmdTrigger = null;

function openCmd() {
  cmdTrigger = document.activeElement;
  palette.classList.remove('hidden');
  cmdInput.value = '';
  cmdSelected = 0;
  cmdFiltered = TOOLS;
  renderCmd();
  setTimeout(() => cmdInput.focus(), 50);
}
function closeCmd() {
  palette.classList.add('hidden');
  if (cmdTrigger && typeof cmdTrigger.focus === 'function') cmdTrigger.focus();
}

function renderCmd() {
  if (cmdFiltered.length === 0) return (cmdResults.innerHTML = `<div class="cmd-empty">Tidak ada hasil</div>`);
  cmdResults.innerHTML = cmdFiltered.map((t, i) => `
    <a class="cmd-item ${i === cmdSelected ? 'active' : ''}" href="#/${t.id}" role="option" aria-selected="${i === cmdSelected}">
      <span class="cmd-item-icon">${t.icon}</span>
      <span class="cmd-item-content">
        <div class="cmd-item-name">${t.name}</div>
        <div class="cmd-item-desc">${t.desc}</div>
      </span>
      <span class="cmd-item-cat">${t.cat.split(' ')[0]}</span>
    </a>`).join('');
  cmdResults.querySelectorAll('.cmd-item').forEach((el, i) => {
    el.addEventListener('click', () => closeCmd());
    el.addEventListener('mouseenter', () => {
      cmdSelected = i;
      cmdResults.querySelectorAll('.cmd-item').forEach((x, j) => x.classList.toggle('active', j === i));
    });
  });
  // Scroll selected into view
  const active = cmdResults.querySelector('.cmd-item.active');
  if (active) active.scrollIntoView({ block: 'nearest' });
}

cmdInput.addEventListener('input', () => {
  const q = cmdInput.value.toLowerCase();
  cmdFiltered = TOOLS.filter((t) => t.name.toLowerCase().includes(q) || t.desc.toLowerCase().includes(q) || t.cat.toLowerCase().includes(q));
  cmdSelected = 0;
  renderCmd();
});
palette.addEventListener('click', closeCmd);

document.addEventListener('keydown', (e) => {
  const isMac = /Mac|iPhone|iPad/.test(navigator.platform);
  const mod = isMac ? e.metaKey : e.ctrlKey;
  if (mod && e.key.toLowerCase() === 'k') { e.preventDefault(); palette.classList.contains('hidden') ? openCmd() : closeCmd(); }
  if (e.key === 'Escape' && !palette.classList.contains('hidden')) closeCmd();
  if (!palette.classList.contains('hidden')) {
    if (e.key === 'ArrowDown') { e.preventDefault(); cmdSelected = Math.min(cmdSelected + 1, cmdFiltered.length - 1); renderCmd(); }
    if (e.key === 'ArrowUp') { e.preventDefault(); cmdSelected = Math.max(cmdSelected - 1, 0); renderCmd(); }
    if (e.key === 'Enter' && cmdFiltered[cmdSelected]) { e.preventDefault(); location.hash = `#/${cmdFiltered[cmdSelected].id}`; closeCmd(); }
    if (e.key === 'Tab') {
      // Trap focus di dalam modal (cuma input + items yang bisa di-tab)
      const focusable = [cmdInput, ...cmdResults.querySelectorAll('.cmd-item')];
      const idx = focusable.indexOf(document.activeElement);
      if (idx === -1) { e.preventDefault(); cmdInput.focus(); }
    }
  }
});

$('#searchTrigger').addEventListener('click', openCmd);
const heroSearch = document.getElementById('heroSearch');
if (heroSearch) heroSearch.addEventListener('click', openCmd);

/* ============================================
   INIT
============================================ */
function init() {
  initTheme();
  renderChips();

  const isMac = /Mac|iPhone|iPad/.test(navigator.platform);
  if (!isMac) {
    const k = $('#kbdShortcut');
    if (k) k.textContent = 'Ctrl K';
    const hk = $('#heroKbd');
    if (hk) hk.textContent = 'Ctrl K';
  }

  $('#themeToggle').addEventListener('click', toggleTheme);
  $('#favBtn').addEventListener('click', () => { if (currentTool) toggleFavorite(currentTool); });

  window.addEventListener('hashchange', handleRoute);
  handleRoute();
}
init();
