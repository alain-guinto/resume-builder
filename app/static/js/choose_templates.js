'use strict';

// ── Template metadata ──────────────────────────────────────────────────────
const RECOMMENDED_IDS = ['classic', 'minimal', 'modern', 'two_col_blue', 'executive', 'photo_modern'];

const ACCENT_PALETTES = {
  default:  ['#1e3a5f','#3b82f6','#0f172a','#0d9488','#7c3aed','#dc2626','#f59e0b'],
};

const TAG_MAP = {
  'Single Column':  { cols: '1', photo: false, style: ['professional','minimal'] },
  'Single + Photo': { cols: '1', photo: true,  style: ['professional'] },
  'Two Column':     { cols: '2', photo: false, style: ['professional','creative'] },
  'Two Col + Photo':{ cols: '2', photo: true,  style: ['professional','creative'] },
  'Special':        { cols: '1', photo: false, style: ['creative','minimal'] },
};

// ── State ──────────────────────────────────────────────────────────────────
let selectedTemplate = null;
let selectedAccent   = null;
const cards = [];

// ── DOM ────────────────────────────────────────────────────────────────────
const grid       = document.getElementById('ctGrid');
const modal      = document.getElementById('ctModal');
const modalClose = document.getElementById('ctModalClose');
const skipBtn    = document.getElementById('ctSkip');
const fileInput  = document.getElementById('ctFileInput');
const uploadZone = document.getElementById('ctUploadZone');
const resultCount = document.getElementById('resultCount');

// ── Build grid ─────────────────────────────────────────────────────────────
Object.keys(TEMPLATE_REGISTRY).forEach(id => {
  const info     = TEMPLATE_REGISTRY[id];
  const tags     = TAG_MAP[info.cat] || { cols:'1', photo:false, style:['professional'] };
  const isRecom  = RECOMMENDED_IDS.includes(id);
  const palette  = ACCENT_PALETTES.default;

  const card = document.createElement('div');
  card.className = 'ct-card';
  card.dataset.id    = id;
  card.dataset.cols  = tags.cols;
  card.dataset.photo = tags.photo ? 'true' : 'false';
  card.dataset.style = tags.style.join(',');

  // Thumb
  const thumb = document.createElement('div');
  thumb.className = 'ct-card-thumb';

  const inner = document.createElement('div');
  inner.className = 'ct-card-thumb-inner';
  thumb.appendChild(inner);

  // Recommended badge
  if (isRecom) {
    const badge = document.createElement('div');
    badge.className = 'ct-badge';
    badge.textContent = 'RECOMMENDED';
    thumb.appendChild(badge);
  }

  // Hover overlay
  const overlay = document.createElement('div');
  overlay.className = 'ct-card-thumb-overlay';
  overlay.innerHTML = `
    <button class="ct-overlay-btn" data-action="use">Use This Template</button>
    <button class="ct-overlay-btn secondary" data-action="preview">Preview</button>`;
  overlay.addEventListener('click', e => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const accent = card.querySelector('.ct-swatch.active')?.dataset.color || palette[0];
    if (btn.dataset.action === 'use') {
      sessionStorage.setItem('selectedTemplate', id);
      sessionStorage.setItem('selectedAccent', accent);
      window.location.href = '/upload';
    }
    if (btn.dataset.action === 'preview') openModal(id, accent);
  });
  thumb.appendChild(overlay);

  // Footer
  const footer = document.createElement('div');
  footer.className = 'ct-card-footer';

  const name = document.createElement('div');
  name.className = 'ct-card-name';
  name.textContent = info.name;
  footer.appendChild(name);

  // Swatches
  const swatches = document.createElement('div');
  swatches.className = 'ct-swatches';
  palette.forEach((color, i) => {
    const sw = document.createElement('button');
    sw.className = 'ct-swatch' + (i === 0 ? ' active' : '');
    sw.style.cssText = `background:${color};color:${color};`;
    sw.title = color;
    sw.dataset.color = color;
    sw.addEventListener('click', e => {
      e.stopPropagation();
      swatches.querySelectorAll('.ct-swatch').forEach(s => s.classList.remove('active'));
      sw.classList.add('active');
      // Re-render thumbnail with new color
      const sample = getTemplateSample(id);
      inner.innerHTML = renderResume(sample, id, { accent: color, font:'sans-serif', spacing:'1.4' });
    });
    swatches.appendChild(sw);
  });
  footer.appendChild(swatches);

  card.appendChild(thumb);
  card.appendChild(footer);
  grid.appendChild(card);

  // Click on card body → redirect to upload (same as "Use This Template")
  card.addEventListener('click', e => {
    if (e.target.closest('.ct-swatches') || e.target.closest('.ct-card-thumb-overlay')) return;
    const activeColor = card.querySelector('.ct-swatch.active')?.dataset.color || palette[0];
    sessionStorage.setItem('selectedTemplate', id);
    sessionStorage.setItem('selectedAccent', activeColor);
    window.location.href = '/upload';
  });

  cards.push({ id, info, tags, card, inner, thumb, rendered: false });
});

// ── Lazy render via IntersectionObserver ──────────────────────────────────
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const item = cards.find(c => c.card === e.target);
    if (item && !item.rendered) renderCard(item);
  });
}, { rootMargin: '300px' });
cards.forEach(c => obs.observe(c.card));

const CT_RENDER_W = 595, CT_RENDER_H = 842;  // screen-pixel A4 — always scales down

function renderCard(item) {
  item.rendered = true;
  const tw = item.thumb.offsetWidth  || 220;
  const th = item.thumb.offsetHeight || 311;  // 220 * 842/595 ≈ 311
  const scale   = Math.min(tw / CT_RENDER_W, th / CT_RENDER_H);
  const palette = ACCENT_PALETTES.default;
  const accent  = item.card.querySelector('.ct-swatch.active')?.dataset.color || palette[0];
  const sample  = getTemplateSample(item.id);
  item.inner.style.cssText = [
    `width:${CT_RENDER_W}px`, `height:${CT_RENDER_H}px`,
    `transform:scale(${scale})`, `transform-origin:top left`,
    `position:absolute`, `top:0`, `left:0`, `pointer-events:none`,
  ].join(';');
  item.inner.innerHTML = renderResume(sample, item.id, { accent, font:'sans-serif', spacing:'1.4' });
}

window.addEventListener('resize', () => {
  cards.forEach(item => {
    if (!item.rendered) return;
    const tw = item.thumb.offsetWidth  || 220;
    const th = item.thumb.offsetHeight || 311;
    const scale = Math.min(tw / CT_RENDER_W, th / CT_RENDER_H);
    item.inner.style.transform = `scale(${scale})`;
  });
});

// ── Filters ────────────────────────────────────────────────────────────────
function applyFilters() {
  const photoFilters = [...document.querySelectorAll('input[name="photo"]:checked')].map(i => i.value);
  const colsFilters  = [...document.querySelectorAll('input[name="cols"]:checked')].map(i => i.value);
  const styleFilters = [...document.querySelectorAll('input[name="style"]:checked')].map(i => i.value);

  let visible = 0;
  cards.forEach(c => {
    let show = true;
    if (photoFilters.length) {
      const need = photoFilters.includes('with') ? true : false;
      if (!photoFilters.includes('with') || !photoFilters.includes('without')) {
        show = show && (c.tags.photo === (photoFilters[0] === 'with'));
      }
    }
    if (colsFilters.length) show = show && colsFilters.includes(c.tags.cols);
    if (styleFilters.length) show = show && styleFilters.some(s => c.tags.style.includes(s));

    c.card.classList.toggle('hidden', !show);
    if (show) {
      visible++;
      if (!c.rendered) setTimeout(() => renderCard(c), 50);
    }
  });
  resultCount.textContent = `${visible} template${visible !== 1 ? 's' : ''}`;
}

document.querySelectorAll('.ct-checkbox input').forEach(cb => {
  cb.addEventListener('change', applyFilters);
});

document.getElementById('clearFilters').addEventListener('click', () => {
  document.querySelectorAll('.ct-checkbox input').forEach(cb => cb.checked = false);
  applyFilters();
});

// ── Modal ──────────────────────────────────────────────────────────────────
function openModal(id, accent) {
  selectedTemplate = id;
  selectedAccent   = accent || '#4f46e5';
  modal.classList.add('open');
}
function closeModal() { modal.classList.remove('open'); }

modalClose.addEventListener('click', closeModal);
modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

skipBtn.addEventListener('click', () => {
  sessionStorage.setItem('startBlank', '1');
  if (selectedTemplate) sessionStorage.setItem('selectedTemplate', selectedTemplate);
  if (selectedAccent)   sessionStorage.setItem('selectedAccent',   selectedAccent);
  sessionStorage.removeItem('parsedResume');
  window.location.href = '/editor';
});

// ── File upload ────────────────────────────────────────────────────────────
uploadZone.addEventListener('click', () => fileInput.click());
uploadZone.addEventListener('dragover', e => { e.preventDefault(); uploadZone.style.borderColor = '#4f46e5'; });
uploadZone.addEventListener('dragleave', () => { uploadZone.style.borderColor = ''; });
uploadZone.addEventListener('drop', e => {
  e.preventDefault();
  uploadZone.style.borderColor = '';
  if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
});
fileInput.addEventListener('change', () => {
  if (fileInput.files[0]) handleFile(fileInput.files[0]);
});

async function handleFile(file) {
  const allowed = ['application/pdf','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/msword'];
  if (!allowed.includes(file.type) && !/\.(pdf|docx|doc)$/i.test(file.name)) {
    alert('Please upload a PDF or DOCX file.'); return;
  }
  if (file.size > 10 * 1024 * 1024) { alert('File exceeds 10 MB limit.'); return; }

  const contentEl = document.getElementById('ctUploadContent');
  contentEl.innerHTML = `<div style="color:#4f46e5;font-weight:600;">⏳ Parsing your resume…</div>`;

  const form = new FormData();
  form.append('resume', file);   // must match API field name: request.files["resume"]

  try {
    const res  = await fetch('/api/parse-resume', { method: 'POST', body: form });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Parse failed');

    // Summarise what was extracted
    const c    = json.contacts || {};
    const name = c.name || [c.firstName, c.lastName].filter(Boolean).join(' ');
    const summary = [
      name                              && `Name: ${name}`,
      (json.experience || []).length    && `${json.experience.length} job(s)`,
      (json.skills     || []).length    && `${json.skills.length} skills`,
    ].filter(Boolean).join(' · ');

    contentEl.innerHTML = `<div style="color:#16a34a;font-weight:600;">✓ ${summary || 'Resume parsed!'} — Loading editor…</div>`;

    sessionStorage.removeItem('startBlank');
    sessionStorage.setItem('parsedResume', JSON.stringify(json));
    if (selectedTemplate) sessionStorage.setItem('selectedTemplate', selectedTemplate);
    if (selectedAccent)   sessionStorage.setItem('selectedAccent',   selectedAccent);
    window.location.replace('/editor');

  } catch (err) {
    contentEl.innerHTML = `
      <div style="color:#dc2626;margin-bottom:0.5rem;">${err.message}</div>
      <div style="font-size:0.8rem;color:#6b7280;">Starting with a blank resume instead…</div>`;
    sessionStorage.removeItem('parsedResume');
    sessionStorage.setItem('startBlank', '1');
    if (selectedTemplate) sessionStorage.setItem('selectedTemplate', selectedTemplate);
    if (selectedAccent)   sessionStorage.setItem('selectedAccent',   selectedAccent);
    setTimeout(() => { window.location.href = '/editor'; }, 2200);
  }
}
