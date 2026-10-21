// Hardening Checklist · interfaz
(function () {
  'use strict';
  const { DATA, CRITS, CRIT_LABEL, allItems, matches, progress } = window.Hardening;

  const T = {
    es: {
      searchPh: 'Buscar medida o comando...', all: 'Todos', noResults: 'No se encontraron medidas.',
      themeLight: '☀ Claro', themeDark: '🌙 Oscuro', reset: '↺ Reset',
      resetConfirm: '¿Desmarcar todas las medidas?', resetDone: '✓ Checklist reiniciada',
      measures: (n) => `${n} ${n === 1 ? 'medida' : 'medidas'}`, cmdLabel: '⌨ Comando / configuración', copy: 'Copiar', copied: '✓ Comando copiado', copyFail: '⚠ No se pudo copiar: selecciónalo a mano',
      expand: 'Desplegar', collapse: 'Plegar',
      notice: '<b>Antes de aplicar:</b> prueba cada cambio en un equipo de pruebas y ten un acceso alternativo. Medidas como el firewall, SSH o las cuentas pueden dejarte sin acceso remoto.',
      understood: 'ENTENDIDO', source: 'código fuente',
      report: 'Informe de bastionado', generated: 'Generado el', progressTxt: 'Progreso', done: 'Aplicada', pending: 'Pendiente',
      txtDone: '✓ TXT exportado', htmlDone: '✓ HTML exportado', pdfWorking: '⏳ Generando PDF...', pdfDone: '✓ PDF exportado', pdfFail: '⚠ No se pudo cargar el generador de PDF (¿sin conexión?)',
      critTitle: 'Criticidad',
    },
    en: {
      searchPh: 'Search measure or command...', all: 'All', noResults: 'No measures found.',
      themeLight: '☀ Light', themeDark: '🌙 Dark', reset: '↺ Reset',
      resetConfirm: 'Uncheck every measure?', resetDone: '✓ Checklist reset',
      measures: (n) => `${n} ${n === 1 ? 'measure' : 'measures'}`, cmdLabel: '⌨ Command / configuration', copy: 'Copy', copied: '✓ Command copied', copyFail: '⚠ Could not copy: select it by hand',
      expand: 'Expand', collapse: 'Collapse',
      notice: '<b>Before applying:</b> test every change on a test machine and keep an alternative way in. Measures such as the firewall, SSH or accounts can lock you out of remote access.',
      understood: 'GOT IT', source: 'source code',
      report: 'Hardening report', generated: 'Generated on', progressTxt: 'Progress', done: 'Applied', pending: 'Pending',
      txtDone: '✓ TXT exported', htmlDone: '✓ HTML exported', pdfWorking: '⏳ Generating PDF...', pdfDone: '✓ PDF exported', pdfFail: '⚠ Could not load the PDF generator (offline?)',
      critTitle: 'Criticality',
    },
  };

  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* sin almacenamiento */ } },
  };

  const state = {
    lang: store.get('hc_lang', (navigator.language || 'es').toLowerCase().startsWith('es') ? 'es' : 'en'),
    checked: store.get('hc_checked', {}),
    open: store.get('hc_open', {}),
    os: 'all',
    crits: new Set(),
    search: '',
  };
  if (!T[state.lang]) state.lang = 'es';
  if (!state.checked || typeof state.checked !== 'object') state.checked = {};

  const $ = (id) => document.getElementById(id);
  const t = (k) => T[state.lang][k];
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  const PANELS = { windows: ['winContent', 'winCount', 'winNoResults', 'winPanel'], linux: ['linuxContent', 'linuxCount', 'linuxNoResults', 'linuxPanel'] };
  const catKey = (os, cat) => `${os}_${cat.es}`;
  const today = () => new Date().toISOString().split('T')[0];

  // ── Render ──
  function renderPanel(os) {
    const [contentId, countId, noResId] = PANELS[os];
    let visible = 0;
    const html = DATA[os].map((cat) => {
      const items = cat.items.filter((it) => matches(it, cat.cat, state.lang, state.search, state.crits));
      if (!items.length) return '';
      visible += items.length;
      const key = catKey(os, cat.cat);
      const isOpen = state.search.trim() ? true : state.open[key] !== false; // al buscar se ven todas las coincidencias
      return `<div class="category fade-in">
        <button type="button" class="cat-header" data-cat="${esc(key)}" aria-expanded="${isOpen}">
          <span class="cat-icon">${cat.icon}</span>
          <span class="cat-name">${esc(cat.cat[state.lang])}</span>
          <span class="cat-badge">${items.length}</span>
          <span class="cat-toggle ${isOpen ? 'open' : ''}">▶</span>
        </button>
        <div class="cat-items ${isOpen ? '' : 'hidden'}">${items.map(itemHtml).join('')}</div>
      </div>`;
    }).join('');
    $(contentId).innerHTML = html;
    $(countId).textContent = t('measures')(visible);
    $(noResId).style.display = visible ? 'none' : 'block';
  }

  function itemHtml(it) {
    const txt = it[state.lang];
    const on = !!state.checked[it.id];
    return `<div class="item ${on ? 'checked' : ''} crit-${it.crit}" data-id="${it.id}">
      <div class="item-top">
        <button type="button" class="item-checkbox" role="checkbox" aria-checked="${on}" aria-label="${esc(txt.title)}" data-toggle="${it.id}"></button>
        <div class="item-content">
          <div class="item-title-row" data-toggle="${it.id}">
            <span class="item-title">${esc(txt.title)}</span>
            <span class="badge-crit ${it.crit}" title="${t('critTitle')}">${CRIT_LABEL[state.lang][it.crit]}</span>
          </div>
          <div class="item-desc" data-toggle="${it.id}">${esc(txt.desc)}</div>
          <div class="cmd-label"><span>${t('cmdLabel')}</span><button type="button" class="cmd-copy" data-copy="${it.id}">${t('copy')}</button></div>
          <pre class="item-cmd">${esc(it.cmd)}</pre>
        </div>
      </div>
    </div>`;
  }

  function updateProgress() {
    [['windows', 'winFill', 'winPct'], ['linux', 'linuxFill', 'linuxPct']].forEach(([os, fill, pct]) => {
      const p = progress(os, state.checked);
      $(fill).style.width = p.pct + '%';
      $(pct).textContent = p.pct + '%';
      $(pct).title = `${p.done}/${p.total}`;
    });
  }

  function syncPanels() {
    const grid = $('mainGrid');
    grid.classList.toggle('single', state.os !== 'all');
    $('winPanel').hidden = state.os === 'linux';
    $('linuxPanel').hidden = state.os === 'windows';
  }

  function renderAll() {
    renderPanel('windows');
    renderPanel('linux');
    updateProgress();
    syncPanels();
  }

  function applyI18n() {
    document.documentElement.lang = state.lang;
    document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
    document.querySelectorAll('[data-i18n-html]').forEach((el) => { el.innerHTML = t(el.dataset.i18nHtml); });
    document.querySelectorAll('[data-i18n-ph]').forEach((el) => { el.placeholder = t(el.dataset.i18nPh); });
    document.querySelectorAll('.pill-crit').forEach((b) => { b.textContent = '● ' + CRIT_LABEL[state.lang][b.dataset.crit]; });
    $('langBtn').textContent = state.lang === 'es' ? 'EN' : 'ES';
    $('resetBtn').textContent = t('reset');
    applyTheme(document.documentElement.getAttribute('data-theme'));
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme === 'light' ? 'light' : 'dark');
    $('themeBtn').textContent = theme === 'light' ? t('themeDark') : t('themeLight');
  }

  // ── Interacción ──
  function toggleItem(id) {
    state.checked[id] = !state.checked[id];
    if (!state.checked[id]) delete state.checked[id];
    store.set('hc_checked', state.checked);
    const el = document.querySelector(`.item[data-id="${id}"]`);
    if (el) {
      el.classList.toggle('checked', !!state.checked[id]);
      el.querySelector('.item-checkbox').setAttribute('aria-checked', String(!!state.checked[id]));
    }
    updateProgress();
  }

  async function copyCmd(id) {
    const item = [...allItems('windows'), ...allItems('linux')].find((it) => it.id === id);
    if (!item) return;
    try {
      await navigator.clipboard.writeText(item.cmd);
      showToast(t('copied'));
    } catch (e) {
      // Sin API de portapapeles (http, permisos): método clásico con un textarea temporal
      const ta = document.createElement('textarea');
      ta.value = item.cmd;
      ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0';
      document.body.appendChild(ta);
      ta.select();
      let ok = false;
      try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
      ta.remove();
      showToast(t(ok ? 'copied' : 'copyFail'));
    }
  }

  function showToast(msg) {
    const el = $('toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => el.classList.remove('show'), 2500);
  }

  // ── Exportaciones: informe con el estado actual, sin depender del navegador que lo abra ──
  const exportOses = () => (state.os === 'all' ? ['windows', 'linux'] : [state.os]);

  function download(name, content, type) {
    const blob = new Blob([content], { type });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  function exportTxt() {
    const L = state.lang;
    let out = `HARDENING CHECKLIST — unfantasmaenelsistema.com\n${t('generated')} ${new Date().toLocaleString(L === 'es' ? 'es-ES' : 'en-GB')}\n${'='.repeat(64)}\n`;
    let done = 0;
    let total = 0;
    exportOses().forEach((os) => {
      const p = progress(os, state.checked);
      done += p.done; total += p.total;
      out += `\n${'═'.repeat(64)}\n  ${os.toUpperCase()}  ·  ${t('progressTxt')}: ${p.done}/${p.total} (${p.pct}%)\n${'═'.repeat(64)}\n`;
      DATA[os].forEach((cat) => {
        out += `\n  ${cat.icon} ${cat.cat[L]}\n  ${'─'.repeat(48)}\n`;
        cat.items.forEach((it) => {
          out += `  ${state.checked[it.id] ? '[✓]' : '[ ]'} [${CRIT_LABEL[L][it.crit]}] ${it[L].title}\n      ${it[L].desc}\n`;
          out += it.cmd.split('\n').map((l) => `        ${l}`).join('\n') + '\n\n';
        });
      });
    });
    out += `${'='.repeat(64)}\n${t('progressTxt')}: ${done}/${total} (${total ? Math.round((done / total) * 100) : 0}%)\n`;
    download(`hardening-checklist-${today()}.txt`, out, 'text/plain;charset=utf-8');
    showToast(t('txtDone'));
  }

  const REPORT_CSS = `
    body{font-family:Segoe UI,Arial,sans-serif;color:#1a2540;background:#fff;margin:0;padding:24px;font-size:12px}
    h1{font-size:20px;margin:0 0 4px} .meta{color:#5a6478;margin-bottom:16px}
    h2{font-size:16px;margin:22px 0 6px;padding-bottom:4px;border-bottom:2px solid #d0d8e8}
    h3{font-size:13px;margin:14px 0 6px;color:#3a4560}
    .r-item{border:1px solid #d0d8e8;border-radius:6px;padding:8px 10px;margin-bottom:6px;page-break-inside:avoid;break-inside:avoid}
    .r-head{display:flex;gap:8px;align-items:baseline;flex-wrap:wrap} .r-state{font-weight:700} .r-ok{color:#0a7d2c} .r-no{color:#b45309}
    .r-title{font-weight:700} .r-crit{font-size:10px;padding:1px 5px;border-radius:4px;border:1px solid #b8c4d8}
    .r-desc{color:#3a4560;margin:4px 0} pre{background:#f0f2f7;border-radius:4px;padding:6px 8px;white-space:pre-wrap;word-break:break-all;font-size:10.5px;margin:0}
    a{color:#5b4ce0}`;

  function reportBody() {
    const L = state.lang;
    let html = `<h1>${esc(t('report'))}</h1><div class="meta">${esc(t('generated'))} ${esc(new Date().toLocaleString(L === 'es' ? 'es-ES' : 'en-GB'))} · <a href="https://www.unfantasmaenelsistema.com">unfantasmaenelsistema.com</a></div>`;
    exportOses().forEach((os) => {
      const p = progress(os, state.checked);
      html += `<h2>${os === 'windows' ? '⊞ Windows' : '🐧 Linux'} · ${esc(t('progressTxt'))}: ${p.done}/${p.total} (${p.pct}%)</h2>`;
      DATA[os].forEach((cat) => {
        html += `<h3>${cat.icon} ${esc(cat.cat[L])}</h3>`;
        cat.items.forEach((it) => {
          const on = !!state.checked[it.id];
          html += `<div class="r-item"><div class="r-head"><span class="r-state ${on ? 'r-ok' : 'r-no'}">${on ? '☑ ' + esc(t('done')) : '☐ ' + esc(t('pending'))}</span>` +
            `<span class="r-title">${esc(it[L].title)}</span><span class="r-crit">${esc(CRIT_LABEL[L][it.crit])}</span></div>` +
            `<div class="r-desc">${esc(it[L].desc)}</div><pre>${esc(it.cmd)}</pre></div>`;
        });
      });
    });
    return html;
  }

  function exportHtml() {
    const doc = `<!DOCTYPE html>\n<html lang="${state.lang}">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n<title>${esc(t('report'))} — ${today()}</title>\n<style>${REPORT_CSS}</style>\n</head>\n<body>\n${reportBody()}\n</body>\n</html>\n`;
    download(`hardening-checklist-${today()}.html`, doc, 'text/html;charset=utf-8');
    showToast(t('htmlDone'));
  }

  // html2pdf solo se descarga cuando hace falta
  function loadPdfLib() {
    if (window.html2pdf) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  async function exportPdf() {
    showToast(t('pdfWorking'));
    try {
      await loadPdfLib();
    } catch (e) {
      showToast(t('pdfFail'));
      return;
    }
    const holder = document.createElement('div');
    holder.style.cssText = 'position:fixed;left:-10000px;top:0;width:780px;background:#fff';
    holder.innerHTML = `<style>${REPORT_CSS.replace(/body\{/, '.report{')}</style><div class="report">${reportBody()}</div>`;
    document.body.appendChild(holder);
    try {
      await window.html2pdf().set({
        margin: [10, 10, 10, 10],
        filename: `hardening-checklist-${today()}.pdf`,
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: { scale: 1.5, backgroundColor: '#ffffff' },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['css', 'legacy'], avoid: '.r-item' },
      }).from(holder.querySelector('.report')).save();
      showToast(t('pdfDone'));
    } finally {
      holder.remove();
    }
  }

  // ── Eventos ──
  function bind() {
    $('searchInput').addEventListener('input', (e) => { state.search = e.target.value; renderAll(); });

    $('osFilter').addEventListener('click', (e) => {
      const b = e.target.closest('[data-os]');
      if (!b) return;
      state.os = b.dataset.os;
      document.querySelectorAll('.pill-os').forEach((x) => {
        x.className = 'pill pill-os' + (x === b ? ` active-${x.dataset.os === 'all' ? 'all' : x.dataset.os === 'windows' ? 'win' : 'linux'}` : '');
      });
      renderAll();
    });

    $('critFilter').addEventListener('click', (e) => {
      const b = e.target.closest('[data-crit]');
      if (!b) return;
      const c = b.dataset.crit;
      if (state.crits.has(c)) state.crits.delete(c); else state.crits.add(c);
      b.classList.toggle('active', state.crits.has(c));
      b.setAttribute('aria-pressed', String(state.crits.has(c)));
      renderAll();
    });

    $('mainGrid').addEventListener('click', (e) => {
      const copy = e.target.closest('[data-copy]');
      if (copy) { copyCmd(copy.dataset.copy); return; }
      const cat = e.target.closest('[data-cat]');
      if (cat) {
        const key = cat.dataset.cat;
        state.open[key] = state.open[key] === false;
        store.set('hc_open', state.open);
        renderAll();
        return;
      }
      const tog = e.target.closest('[data-toggle]');
      if (tog) toggleItem(tog.dataset.toggle);
    });

    $('exportTxt').addEventListener('click', exportTxt);
    $('exportHtml').addEventListener('click', exportHtml);
    $('exportPdf').addEventListener('click', exportPdf);
    $('themeBtn').addEventListener('click', () => {
      const next = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      store.set('hc_theme', next);
      applyTheme(next);
    });
    $('langBtn').addEventListener('click', () => {
      state.lang = state.lang === 'es' ? 'en' : 'es';
      store.set('hc_lang', state.lang);
      applyI18n();
      renderAll();
    });
    $('resetBtn').addEventListener('click', () => {
      if (!confirm(t('resetConfirm'))) return;
      state.checked = {};
      store.set('hc_checked', state.checked);
      renderAll();
      showToast(t('resetDone'));
    });

    if (store.get('hc_notice_ok', false)) $('notice').hidden = true;
    $('noticeClose').addEventListener('click', () => { $('notice').hidden = true; store.set('hc_notice_ok', true); });
  }

  // Las marcas guardadas de medidas que ya no existen (p. ej. w3 y l4, que estaban repetidas) se descartan
  const validIds = new Set([...allItems('windows'), ...allItems('linux')].map((it) => it.id));
  Object.keys(state.checked).forEach((id) => { if (!validIds.has(id)) delete state.checked[id]; });

  bind();
  applyI18n();
  renderAll();
})();
