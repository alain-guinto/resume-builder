'use strict';

const modal      = document.getElementById('upload-modal');
const uploadZone = document.getElementById('upload-zone');
const fileInput  = document.getElementById('resume-file-input');
const progressWrap  = document.getElementById('upload-progress');
const progressFill  = document.getElementById('progress-fill');
const uploadStatus  = document.getElementById('upload-status');
const uploadContent = document.getElementById('upload-content');

// ── Open / close modal ────────────────────────────────────────────────────────
function openModal() {
  if (modal) {
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
  }
}
function closeModal() {
  if (modal) {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  }
}

document.getElementById('btn-build-hero')?.addEventListener('click', openModal);
document.getElementById('btn-build-nav')?.addEventListener('click', openModal);
document.getElementById('btn-cta-bottom')?.addEventListener('click', openModal);
document.getElementById('modal-close')?.addEventListener('click', closeModal);
if (modal) modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

// ── Skip — go to editor blank ─────────────────────────────────────────────────
document.getElementById('btn-skip')?.addEventListener('click', () => {
  sessionStorage.setItem('startBlank', '1');
  sessionStorage.removeItem('parsedResume');
  window.location.href = '/editor';
});

// ── Drag-and-drop ─────────────────────────────────────────────────────────────
uploadZone.addEventListener('dragover', e => { e.preventDefault(); uploadZone.classList.add('drag-over'); });
uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('drag-over'));
uploadZone.addEventListener('drop', e => {
  e.preventDefault();
  uploadZone.classList.remove('drag-over');
  const file = e.dataTransfer.files[0];
  if (file) handleFile(file);
});

fileInput.addEventListener('change', () => {
  if (fileInput.files[0]) handleFile(fileInput.files[0]);
});

// ── Handle file upload & parse ────────────────────────────────────────────────
async function handleFile(file) {
  const allowed = ['application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword'];
  if (!allowed.includes(file.type) && !/\.(pdf|docx|doc)$/i.test(file.name)) {
    showStatus('Please upload a PDF or DOCX file.', 'error');
    return;
  }
  if (file.size > 10 * 1024 * 1024) {
    showStatus('File is too large. Max size is 10 MB.', 'error');
    return;
  }

  uploadContent.style.opacity = '0.4';
  progressWrap.style.display = 'block';
  setProgress(10, `Uploading ${file.name}…`);

  try {
    const form = new FormData();
    form.append('resume', file);

    setProgress(40, 'Reading your resume…');
    const res = await fetch('/api/parse-resume', { method: 'POST', body: form });

    setProgress(80, 'Extracting information…');

    if (!res.ok) {
      const errBody = await res.text().catch(() => '');
      throw new Error(errBody || `Server error (${res.status})`);
    }

    const parsed = await res.json();

    // Check how much was actually extracted
    const name    = parsed.contacts?.name || parsed.contacts?.firstName || '';
    const expCount = (parsed.experience || []).length;
    const eduCount = (parsed.education  || []).length;

    const summary = [
      name             && `Name: ${name}`,
      expCount         && `${expCount} job(s)`,
      eduCount         && `${eduCount} education entry(ies)`,
      (parsed.skills?.length) && `${parsed.skills.length} skill(s)`,
    ].filter(Boolean).join(' · ');

    setProgress(100, summary
      ? `Found: ${summary}. Opening editor…`
      : 'Parsing complete. Opening editor…'
    );

    await delay(800);

    // POST and replace page with editor HTML (no redirect — avoids cookie/session issues)
    const res = await fetch('/editor/with-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parsed),
    });
    const html = await res.text();
    document.open();
    document.write(html);
    document.close();

  } catch (err) {
    console.error('[upload] parse error:', err);
    uploadContent.style.opacity = '1';
    progressWrap.style.display  = 'none';
    showStatus(
      `Could not read the file (${err.message || 'unknown error'}). Starting with a blank resume instead.`,
      'warn'
    );
    await delay(2500);
    sessionStorage.removeItem('parsedResume');
    sessionStorage.setItem('startBlank', '1');
    window.location.href = '/editor';
  }
}

function setProgress(pct, msg) {
  progressFill.style.width = pct + '%';
  uploadStatus.textContent = msg;
}

function showStatus(msg, type) {
  uploadStatus.style.display = 'block';
  uploadStatus.textContent = msg;
  uploadStatus.style.color = type === 'error' ? '#dc2626' : '#d97706';
  progressWrap.style.display = 'block';
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

// ── Smooth scroll for anchor nav links ───────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
  });
});

// ── Nav scroll shadow ─────────────────────────────────────────────────────────
const nav = document.querySelector('.nav');
window.addEventListener('scroll', () => {
  nav.style.boxShadow = window.scrollY > 10
    ? '0 2px 16px rgba(0,0,0,0.08)'
    : 'none';
}, { passive: true });
