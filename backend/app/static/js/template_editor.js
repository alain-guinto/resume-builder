    const API = '/api';
    const resumeId = new URLSearchParams(window.location.search).get('resume_id');
    const resumeApiUrl = resumeId ? `${API}/resume?resume_id=${resumeId}` : `${API}/resume`;
    let data = {};
    let currentTemplate = 'classic';
    let accentColor = '#1e3a5f';
    let currentFont = 'sans-serif';
    let lineSpacing = '1.5';
    let spellErrors = [];
    let activeCard = null;

    // ── Section metadata ──────────────────────────────────────────────────────
    const GRIP = `<span class="drag-grip"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="5" r="1.2" fill="currentColor"/><circle cx="15" cy="5" r="1.2" fill="currentColor"/><circle cx="9" cy="12" r="1.2" fill="currentColor"/><circle cx="15" cy="12" r="1.2" fill="currentColor"/><circle cx="9" cy="19" r="1.2" fill="currentColor"/><circle cx="15" cy="19" r="1.2" fill="currentColor"/></svg></span>`;
    const sectionMeta = {
      summary:        { label: 'Summary',        icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>' },
      experience:     { label: 'Experience',     icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>' },
      education:      { label: 'Education',      icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>' },
      skills:         { label: 'Skills',         icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>' },
      languages:      { label: 'Languages',      icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 8l6 6"/><path d="M4 14l6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="M22 22l-5-10-5 10"/><path d="M14 18h6"/></svg>' },
      contact:        { label: 'Contact',        icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>' },
      details:        { label: 'Details',        icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>' },
      certifications: { label: 'Certifications', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>' },
      awards:         { label: 'Awards',         icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>' },
    };

    // ── Section order state (per template) ───────────────────────────────────
    const _single = (cols) => ({ type: 'single', columns: [cols || ['summary','experience','education','skills','languages','certifications','awards']] });
    const _double = (l, r) => ({ type: 'double', columns: [l, r], columnLabels: ['Sidebar', 'Main Content'] });
    const sectionOrder = {
      classic:         _single(['summary','experience','details','skills','education','languages','certifications','awards']),
      modern_simple:   _single(),
      modern_with_photo: _single(['summary','experience','education','skills','languages']),
      chronological:   _single(['summary','experience','details','skills','education','languages','certifications','awards']),
      functional:      _single(),
      hybrid:          _double(['contact','education','skills','languages','certifications'], ['summary','experience','awards']),
      creative:        _single(['summary','experience','education','skills','languages','certifications','awards']),
      simple_ats:      _single(),
      two_col_ats:     _double(['contact','education','skills','languages'], ['summary','experience','certifications','awards']),
      polished:        _single(),
      minimalist:      _single(),
      elegant:         _single(),
      teenager:        _single(['summary','experience','education','skills','languages']),
      internship:      _single(['summary','experience','education','skills','languages']),
      entry_level:     _single(),
      career_change:   _single(),
    };

    // Section renderers removed — now handled by resume-templates.js

    // ── Spell highlight helper ────────────────────────────────────────────────
    function applySpellHighlights(html) {
      if (!spellErrors.length) return html;
      const words = [...new Set(spellErrors.map(e => e.word).filter(w => w && w.length > 1))];
      let result = html;
      words.forEach(word => {
        const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        result = result.replace(
          new RegExp(`(?<=>)([^<]*)\\b(${escaped})\\b([^<]*)(?=<)`, 'g'),
          '$1<mark style="background:#fee2e2;color:#dc2626;border-radius:2px;padding:0 1px;font-style:normal;">$2</mark>$3'
        );
      });
      return result;
    }

    // ── Spell check runner ────────────────────────────────────────────────────
    async function runSpellCheck() {
      const resultsEl = document.getElementById('spellcheck-results');
      resultsEl.innerHTML = '<p style="font-size:0.875rem;color:var(--text-muted);display:flex;align-items:center;gap:0.5rem;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation:spin 1s linear infinite"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> Checking your resume…</p>';

      const parts = [];
      if (data.contacts?.name) parts.push(data.contacts.name);
      if (data.contacts?.jobTitle) parts.push(data.contacts.jobTitle);
      if (data.summary) parts.push(data.summary);
      (data.experience||[]).forEach(e => { if (e.role) parts.push(e.role); if (e.description) parts.push(e.description); });
      (data.education||[]).forEach(e => { if (e.degree) parts.push(e.degree); if (e.school) parts.push(e.school); });
      (data.skills||[]).forEach(s => parts.push(s));
      const text = parts.filter(Boolean).join('\n');

      if (!text.trim()) {
        resultsEl.innerHTML = '<p style="font-size:0.875rem;color:var(--text-muted);">No text found. Fill in your resume first.</p>';
        return;
      }

      try {
        const res = await fetch('https://api.languagetool.org/v2/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({ text, language: 'en-US' })
        });
        const result = await res.json();
        const matches = result.matches || [];

        if (!matches.length) {
          spellErrors = [];
          resultsEl.innerHTML = `<div class="spell-item ok"><div style="display:flex;align-items:center;gap:0.5rem;color:#16a34a;font-weight:600;font-size:0.9rem;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>No issues found</div><div class="spell-context">Your resume looks great!</div></div>`;
          updatePreview();
          return;
        }

        spellErrors = matches.map(m => ({
          word: text.substring(m.offset, m.offset + m.length),
          suggestions: (m.replacements||[]).slice(0, 3).map(r => r.value),
          message: m.message
        })).filter(e => e.word.trim().length > 0);

        resultsEl.innerHTML = `<p style="font-size:0.8rem;color:var(--text-muted);margin-bottom:0.5rem;">${spellErrors.length} issue${spellErrors.length!==1?'s':''} found — highlighted in preview</p>` +
          spellErrors.map(e => `<div class="spell-item error">
            <div style="display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap;">
              <span class="spell-word">${e.word}</span>
              <span style="font-size:0.78rem;color:var(--text-muted);">${e.message}</span>
            </div>
            ${e.suggestions.length ? `<div class="spell-suggestions">${e.suggestions.map(s=>`<span class="spell-suggestion" data-replace="${e.word}" data-with="${s}">${s}</span>`).join('')}</div>` : ''}
          </div>`).join('') +
          `<button id="btn-clear-spellcheck" style="margin-top:0.75rem;padding:0.4rem 0.9rem;border:1px solid var(--border);border-radius:6px;background:#fff;cursor:pointer;font-size:0.82rem;color:var(--text-muted);">Clear highlights</button>`;

        updatePreview();
      } catch (err) {
        resultsEl.innerHTML = '<p style="font-size:0.875rem;color:#dc2626;">Spell check failed. Check your internet connection and try again.</p>';
      }
    }

    // ── Preview HTML — delegates to resume-templates.js engine ───────────────
    function getPreviewHTML(template) {
      const t = template || currentTemplate;
      return renderResume(data, t, {
        accent:       accentColor,
        font:         currentFont,
        spacing:      lineSpacing,
        applySpell:   applySpellHighlights,
        sectionOrder: sectionOrder[t],
      });
    }

    // ── Thumbnails & preview helpers (A4: 595×842, same as landing) ───────────
    const THUMB_RENDER_W = 595;
    const THUMB_RENDER_H = 842;
    function renderThumbnail(containerId, template) {
      const el = document.getElementById(containerId);
      if (!el) return;
      const thumb = el.closest('.template-card-thumb');
      const tw = thumb ? thumb.offsetWidth : el.offsetWidth || 120;
      const th = thumb ? thumb.offsetHeight : el.offsetHeight || 170;
      const scale = Math.min(tw / THUMB_RENDER_W, th / THUMB_RENDER_H) * 0.98;
      el.style.cssText = 'position:absolute;top:0;left:0;overflow:hidden;width:100%;height:100%;';
      el.innerHTML = `<div style="position:absolute;top:0;left:0;width:${THUMB_RENDER_W}px;height:${THUMB_RENDER_H}px;transform:scale(${scale});transform-origin:top left;pointer-events:none;">${getPreviewHTML(template)}</div>`;
    }

    function updatePreview() {
      const paper = document.getElementById('preview-paper');
      if (paper) paper.innerHTML = getPreviewHTML();
    }

    function updateThumbnails() {
      Object.keys(TEMPLATE_REGISTRY).forEach(id => renderThumbnail('thumb-' + id, id));
    }
    window.addEventListener('resize', () => updateThumbnails());

    // ── Section panel builder ─────────────────────────────────────────────────
    function buildSectionPanel() {
      const container = document.getElementById('section-layout-container');
      if (!container) return;
      const layout = sectionOrder[currentTemplate];
      if (!layout) { container.innerHTML = ''; return; }
      const isDouble = layout.type === 'double';

      let html = `<div class="section-columns${isDouble ? ' section-columns-stacked' : ''}">`;
      layout.columns.forEach((col, colIdx) => {
        const label = layout.columnLabels ? layout.columnLabels[colIdx] : null;
        html += `<div class="section-column">`;
        if (label) html += `<div class="column-header-label">${label}</div>`;
        html += `<div class="column-drop-zone" data-col="${colIdx}">`;
        col.forEach(key => {
          const meta = sectionMeta[key];
          if (!meta) return;
          html += `<div class="section-drag-item" draggable="true" data-section="${key}" data-col="${colIdx}">${GRIP}<span class="section-drag-icon">${meta.icon}</span><span>${meta.label}</span></div>`;
        });
        html += `</div></div>`;
      });
      html += '</div>';
      container.innerHTML = html;
      initSectionDragDrop();
    }

    // ── Drag-and-drop for section panel ───────────────────────────────────────
    function initSectionDragDrop() {
      let dragSection = null;

      document.querySelectorAll('.section-drag-item').forEach(item => {
        item.addEventListener('dragstart', e => {
          dragSection = item.dataset.section;
          item.classList.add('dragging');
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData('text/plain', dragSection);
        });
        item.addEventListener('dragend', () => {
          item.classList.remove('dragging');
          document.querySelectorAll('.column-drop-zone').forEach(z => z.classList.remove('drag-over'));
          dragSection = null;
        });
      });

      document.querySelectorAll('.column-drop-zone').forEach((zone, colIdx) => {
        zone.addEventListener('dragover', e => {
          e.preventDefault();
          zone.classList.add('drag-over');
          e.dataTransfer.dropEffect = 'move';
        });
        zone.addEventListener('dragleave', e => {
          if (!zone.contains(e.relatedTarget)) zone.classList.remove('drag-over');
        });
        zone.addEventListener('drop', e => {
          e.preventDefault();
          zone.classList.remove('drag-over');
          if (!dragSection) return;

          // Determine insert position from mouse Y
          const items = [...zone.querySelectorAll('.section-drag-item:not(.dragging)')];
          let insertIdx = items.length;
          for (let i = 0; i < items.length; i++) {
            const rect = items[i].getBoundingClientRect();
            if (e.clientY < rect.top + rect.height / 2) { insertIdx = i; break; }
          }

          // Remove from current column
          const layout = sectionOrder[currentTemplate];
          layout.columns.forEach(col => {
            const idx = col.indexOf(dragSection);
            if (idx !== -1) col.splice(idx, 1);
          });
          // Insert at new position
          layout.columns[colIdx].splice(insertIdx, 0, dragSection);

          buildSectionPanel();
          updatePreview();
        });
      });
    }

    // ── Template card events ──────────────────────────────────────────────────
    document.querySelectorAll('.template-card').forEach(card => {
      card.addEventListener('mouseenter', () => {
        document.querySelectorAll('.template-card').forEach(c => c.classList.remove('hovered'));
        card.classList.add('hovered');
        const paper = document.getElementById('preview-paper');
        if (paper) paper.innerHTML = getPreviewHTML(card.dataset.template);
      });
      card.addEventListener('mouseleave', () => {
        card.classList.remove('hovered');
        updatePreview();
      });
      card.addEventListener('click', () => {
        if (!card.dataset.template) return;
        setActiveTemplate(card);
        updatePreview();
        saveTemplate();
        if (document.getElementById('panel-section')?.classList.contains('active')) buildSectionPanel();
      });
    });

    // ── Color swatches (event delegation) ────────────────────────────────────
    document.querySelector('.color-swatches').addEventListener('click', e => {
      const swatch = e.target.closest('.color-swatch');
      if (!swatch) return;
      accentColor = swatch.dataset.color;
      document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
      swatch.classList.add('active');
      updatePreview();
      updateThumbnails();
    });

    // ── Sidebar navigation (event delegation) ────────────────────────────────
    document.getElementById('sidebar').addEventListener('click', e => {
      const item = e.target.closest('.sidebar-item');
      if (!item) return;
      const panel = item.dataset.panel;
      if (!panel) return;
      document.querySelectorAll('.sidebar-item').forEach(s => s.classList.remove('active'));
      item.classList.add('active');
      document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
      const target = document.getElementById(`panel-${panel}`);
      if (target) target.classList.add('active');
      if (panel === 'section') buildSectionPanel();
    });

    document.getElementById('sidebar-toggle').addEventListener('click', () => {
      document.getElementById('sidebar').classList.toggle('collapsed');
    });

    // ── Design panel (event delegation) ──────────────────────────────────────
    document.getElementById('panel-design').addEventListener('click', e => {
      const fontOpt = e.target.closest('.font-option');
      if (fontOpt) {
        currentFont = fontOpt.dataset.font;
        document.querySelectorAll('.font-option').forEach(o => o.classList.remove('active'));
        fontOpt.classList.add('active');
        updatePreview(); updateThumbnails();
        return;
      }
      const accentBtn = e.target.closest('.accent-color-btn');
      if (accentBtn) {
        accentColor = accentBtn.dataset.accent;
        document.querySelectorAll('.accent-color-btn').forEach(b => b.classList.remove('active'));
        accentBtn.classList.add('active');
        updatePreview(); updateThumbnails();
        return;
      }
      const spacingOpt = e.target.closest('.spacing-option');
      if (spacingOpt) {
        lineSpacing = spacingOpt.dataset.spacing;
        document.querySelectorAll('.spacing-option').forEach(o => o.classList.remove('active'));
        spacingOpt.classList.add('active');
        updatePreview();
      }
    });

    // ── Spell check ───────────────────────────────────────────────────────────
    document.getElementById('panel-spellcheck').addEventListener('click', e => {
      if (e.target.closest('#btn-run-spellcheck')) { runSpellCheck(); return; }
      if (e.target.closest('#btn-clear-spellcheck')) {
        spellErrors = [];
        document.getElementById('spellcheck-results').innerHTML = '<p style="font-size:0.875rem;color:var(--text-muted);">Click "Run Spell Check" to scan your resume text for errors.</p>';
        updatePreview();
        return;
      }
    });

    // ── setActiveTemplate ─────────────────────────────────────────────────────
    function setActiveTemplate(cardOrTemplate) {
      if (typeof cardOrTemplate === 'string') {
        activeCard = document.querySelector(`.template-card[data-template="${cardOrTemplate}"]`);
        currentTemplate = cardOrTemplate;
      } else {
        activeCard = cardOrTemplate;
        currentTemplate = cardOrTemplate.dataset.template;
      }
      document.querySelectorAll('.template-card').forEach(c => c.classList.remove('active'));
      if (activeCard) activeCard.classList.add('active');
    }

    async function saveTemplate() {
      data.template = currentTemplate;
      try { await fetch(resumeApiUrl, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data) }); }
      catch(e) { console.warn('Save failed:', e); }
    }

    async function loadData() {
      try {
        const res = await fetch(resumeApiUrl);
        data = await res.json();
        if (data.template) currentTemplate = data.template;
      } catch(e) {
        data = { contacts:{}, summary:'', experience:[], education:[], skills:[], languages:[] };
      }
    }

    // ── Download (PDF client-side, DOCX via API) ───────────────────────────────
    const btnDownload = document.getElementById('btn-download');
    const downloadDropdown = document.getElementById('download-dropdown');

    function getExportData() {
      const payload = { ...data };
      payload.template = currentTemplate;
      if (payload.contacts && !payload.contacts.location && (payload.contacts.city || payload.contacts.country)) {
        payload.contacts = { ...payload.contacts };
        payload.contacts.location = [payload.contacts.city, payload.contacts.country].filter(Boolean).join(', ');
      }
      return payload;
    }

    async function downloadPdf() {
      const paper = document.getElementById('preview-paper');
      if (!paper) { alert('No preview content to export.'); return; }

      const orig = btnDownload.innerHTML;
      btnDownload.innerHTML =
        '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation:spin 1s linear infinite"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> Generating…';
      btnDownload.disabled = true;
      if (downloadDropdown) downloadDropdown.classList.remove('open');

      try {
        const clone = paper.cloneNode(true);
        clone.style.cssText =
          'position:relative;top:0;left:0;transform:none;' +
          'width:210mm;min-height:297mm;background:#fff;overflow:visible;';

        const filename = (data.contacts?.name || 'Resume').replace(/\s+/g, '-') + '.pdf';

        await html2pdf()
          .set({
            margin: 0,
            filename,
            image:      { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, letterRendering: true, logging: false },
            jsPDF:       { unit: 'mm', format: 'a4', orientation: 'portrait' },
            pagebreak:   { mode: ['avoid-all', 'css', 'legacy'] }
          })
          .from(clone)
          .save();
        showDownloadSuccess(filename);
      } catch (e) {
        alert('PDF export failed: ' + e.message);
      } finally {
        btnDownload.innerHTML = orig;
        btnDownload.disabled = false;
      }
    }

    async function downloadDocx() {
      if (downloadDropdown) downloadDropdown.classList.remove('open');

      const orig = btnDownload.innerHTML;
      btnDownload.innerHTML =
        '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation:spin 1s linear infinite"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> Generating…';
      btnDownload.disabled = true;

      try {
        const payload = getExportData();
        const res = await fetch(`${API}/export/docx`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || 'DOCX export failed');
        }
        const blob = await res.blob();
        const filename = (data.contacts?.name || 'Resume').replace(/\s+/g, '-') + '.docx';
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
        showDownloadSuccess(filename);
      } catch (e) {
        alert('DOCX export failed: ' + (e.message || 'Unknown error'));
      } finally {
        btnDownload.innerHTML = orig;
        btnDownload.disabled = false;
      }
    }

    function showDownloadSuccess(filename) {
      const toast = document.createElement('div');
      toast.className = 'download-success-toast';
      toast.innerHTML = `<span class="toast-icon">✓</span> <span>${filename} downloaded</span>`;
      toast.style.cssText = 'position:fixed;bottom:1.5rem;left:50%;transform:translateX(-50%);background:#16a34a;color:#fff;padding:0.65rem 1.25rem;border-radius:10px;font-size:0.9rem;font-weight:600;display:flex;align-items:center;gap:0.5rem;box-shadow:0 4px 20px rgba(0,0,0,0.2);z-index:9999;';
      document.body.appendChild(toast);
      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s';
        setTimeout(() => toast.remove(), 300);
      }, 3500);
    }

    if (btnDownload) {
      btnDownload.addEventListener('click', (e) => {
        e.stopPropagation();
        if (downloadDropdown) downloadDropdown.classList.toggle('open');
        btnDownload.setAttribute('aria-expanded', downloadDropdown?.classList.contains('open') ? 'true' : 'false');
      });
    }

    if (downloadDropdown) {
      downloadDropdown.addEventListener('click', (e) => e.stopPropagation());
      document.querySelectorAll('.download-option').forEach(opt => {
        opt.addEventListener('click', (e) => {
          e.stopPropagation();
          const format = opt.dataset.format;
          if (format === 'pdf') downloadPdf();
          else if (format === 'docx') downloadDocx();
        });
      });
    }

    document.addEventListener('click', () => {
      if (downloadDropdown) downloadDropdown.classList.remove('open');
      if (btnDownload) btnDownload.setAttribute('aria-expanded', 'false');
    });

    (async () => {
      await loadData();
      setActiveTemplate(currentTemplate);
      updatePreview();
      updateThumbnails();

      if (new URLSearchParams(window.location.search).get('download') === '1') {
        const wrap = document.querySelector('.download-dropdown-wrap');
        if (wrap) wrap.classList.add('visible');
        wrap?.querySelector('.btn-download-pdf')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    })();
