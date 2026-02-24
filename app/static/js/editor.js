    const API = '/api';
    const resumeId = new URLSearchParams(window.location.search).get('resume_id');
    const resumeApiUrl = resumeId ? `${API}/resume?resume_id=${resumeId}` : `${API}/resume`;
    let data = {
      contacts: { firstName: '', lastName: '', jobTitle: '', email: '', phone: '', phoneCode: '+1', country: '', city: '', address: '', postCode: '', linkedin: '', website: '', additional: '', photoUrl: '' },
      summary: '',
      experience: [],
      education: [],
      skills: [],
      languages: [],
      certifications: '',
      awards: '',
      additional: ''
    };
    const STEP_LABELS = ['Contacts', 'Experience', 'Education', 'Skills', 'Summary', 'Additional'];
    let currentStep = 0;
    let currentTemplate = 'classic';

    const steps = ['contacts', 'experience', 'education', 'skills', 'summary', 'additional'];


    function showStep(step) {
      currentStep = step;
      document.querySelectorAll('.editor-section').forEach(s => s.classList.remove('active'));
      document.querySelector(`.editor-section[data-step="${step}"]`)?.classList.add('active');
      document.querySelectorAll('.nav-step').forEach((s, i) => {
        s.classList.toggle('active', i === step);
        s.classList.toggle('done', i < step);
      });
      document.getElementById('btn-prev').style.visibility = step === 0 ? 'hidden' : 'visible';
      document.getElementById('btn-prev').textContent = step === 0 ? 'Back' : '← Back';
      document.getElementById('btn-next').textContent = step === 5 ? 'Next: Download' : `Next: ${STEP_LABELS[step + 1]}`;
    }

    function collectContacts() {
      const c = data.contacts;
      c.firstName = document.getElementById('contact-firstName')?.value || '';
      c.lastName = document.getElementById('contact-lastName')?.value || '';
      c.jobTitle = document.getElementById('contact-jobTitle')?.value || '';
      c.email = document.getElementById('contact-email')?.value || '';
      c.phoneCode = document.getElementById('contact-phoneCode')?.value || '+1';
      c.phone = document.getElementById('contact-phone')?.value || '';
      c.country = document.getElementById('contact-country')?.value || '';
      c.city = document.getElementById('contact-city')?.value || '';
      c.address = document.getElementById('contact-address')?.value || '';
      c.postCode = document.getElementById('contact-postCode')?.value || '';
      c.linkedin = document.getElementById('contact-linkedin')?.value || '';
      c.website = document.getElementById('contact-website')?.value || '';
      c.additional = document.getElementById('contact-additional')?.value || '';
      c.name = [c.firstName, c.lastName].filter(Boolean).join(' ') || c.firstName || c.lastName;
      c.location = [c.city, c.country].filter(Boolean).join(', ') || c.city || c.country;
    }

    function applyContacts() {
      const c = data.contacts;
      let first = c.firstName, last = c.lastName;
      if (!first && !last && c.name) {
        const parts = (c.name || '').trim().split(/\s+/);
        first = parts[0] || '';
        last = parts.slice(1).join(' ') || '';
      }
      let city = c.city, country = c.country;
      if (!city && !country && c.location) {
        const locParts = (c.location || '').split(',').map(s => s.trim());
        city = locParts[0] || '';
        country = locParts[1] || '';
      }
      document.getElementById('contact-firstName').value = first || '';
      document.getElementById('contact-lastName').value = last || '';
      document.getElementById('contact-jobTitle').value = c.jobTitle || '';
      document.getElementById('contact-email').value = c.email || '';
      document.getElementById('contact-phoneCode').value = c.phoneCode || '+1';
      document.getElementById('contact-phone').value = c.phone || '';
      document.getElementById('contact-country').value = c.country || country || '';
      document.getElementById('contact-city').value = c.city || city || '';
      document.getElementById('contact-address').value = c.address || '';
      document.getElementById('contact-postCode').value = c.postCode || '';
      document.getElementById('contact-linkedin').value = c.linkedin || '';
      document.getElementById('contact-website').value = c.website || '';
      document.getElementById('contact-additional').value = c.additional || '';
      updatePhotoPreview(c.photoUrl);
    }

    function updatePhotoPreview(photoUrl) {
      const img = document.getElementById('profile-photo-preview');
      const placeholder = document.getElementById('profile-photo-placeholder');
      const btnRemove = document.getElementById('btn-remove-photo');
      if (photoUrl) {
        img.src = photoUrl;
        img.style.display = 'block';
        placeholder.style.display = 'none';
        btnRemove.style.display = 'inline';
      } else {
        img.src = '';
        img.style.display = 'none';
        placeholder.style.display = 'flex';
        btnRemove.style.display = 'none';
      }
    }

    function renderExperience() {
      const list = document.getElementById('experience-list');
      list.innerHTML = data.experience.map((exp, i) => `
        <div class="array-item" data-idx="${i}">
          <div class="array-item-header">
            <span>${exp.role || exp.jobTitle || 'New position'}, ${exp.company || exp.employer || 'Company'}</span>
            <button type="button" class="btn-remove" data-remove-exp="${i}">Remove</button>
          </div>
          <div class="form-group">
            <label for="exp-role-${i}">Job title</label>
            <input type="text" id="exp-role-${i}" value="${(exp.role || exp.jobTitle || '').replace(/"/g, '&quot;')}" placeholder="e.g. Software Engineer">
          </div>
          <div class="form-group">
            <label for="exp-company-${i}">Employer</label>
            <input type="text" id="exp-company-${i}" value="${(exp.company || exp.employer || '').replace(/"/g, '&quot;')}" placeholder="Company name">
          </div>
          <div class="form-group">
            <label for="exp-location-${i}">Location</label>
            <input type="text" id="exp-location-${i}" value="${(exp.location || '').replace(/"/g, '&quot;')}" placeholder="City, Country">
          </div>
          <div style="display: flex; gap: 1rem;">
            <div class="form-group" style="flex: 1;">
              <label for="exp-startDate-${i}">Start date</label>
              <input type="text" id="exp-startDate-${i}" value="${(exp.startDate || (exp.dates && exp.dates.split(/\s*[–—\-]\s*/)[0]) || '').replace(/"/g, '&quot;')}" placeholder="MM/YYYY">
            </div>
            <div class="form-group" style="flex: 1;">
              <label for="exp-endDate-${i}">End date</label>
              <input type="text" id="exp-endDate-${i}" value="${(exp.endDate || (exp.dates && exp.dates.split(/\s*[–—\-]\s*/)[1]) || '').replace(/"/g, '&quot;')}" placeholder="MM/YYYY or Present">
            </div>
          </div>
          <div class="form-group">
            <label for="exp-desc-${i}">Description</label>
            <textarea id="exp-desc-${i}" rows="4" placeholder="Key responsibilities and achievements (use bullet points)">${(exp.description || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</textarea>
          </div>
        </div>
      `).join('');
      list.querySelectorAll('[data-remove-exp]').forEach(btn => {
        btn.addEventListener('click', () => {
          data.experience.splice(parseInt(btn.dataset.removeExp), 1);
          renderExperience();
          updatePreview();
        });
      });
      list.querySelectorAll('input, textarea').forEach(el => {
        el.addEventListener('input', () => collectExperience());
      });
    }

    function collectExperience() {
      data.experience = data.experience.map((_, i) => {
        const start = document.getElementById(`exp-startDate-${i}`)?.value || '';
        const end = document.getElementById(`exp-endDate-${i}`)?.value || '';
        const dates = start && end ? `${start} – ${end}` : (start || end);
        return {
          role: document.getElementById(`exp-role-${i}`)?.value || '',
          company: document.getElementById(`exp-company-${i}`)?.value || '',
          employer: document.getElementById(`exp-company-${i}`)?.value || '',
          location: document.getElementById(`exp-location-${i}`)?.value || '',
          startDate: start,
          endDate: end,
          dates: dates,
          description: document.getElementById(`exp-desc-${i}`)?.value || ''
        };
      });
      updatePreview();
    }

    function renderEducation() {
      const list = document.getElementById('education-list');
      list.innerHTML = data.education.map((edu, i) => `
        <div class="array-item" data-idx="${i}">
          <div class="array-item-header">
            <span>${edu.school || 'New education'}, ${edu.degree || ''}</span>
            <button type="button" class="btn-remove" data-remove-edu="${i}">Remove</button>
          </div>
          <div class="form-group">
            <label for="edu-school-${i}">School name</label>
            <input type="text" id="edu-school-${i}" value="${(edu.school || '').replace(/"/g, '&quot;')}" placeholder="University name">
          </div>
          <div class="form-group">
            <label for="edu-location-${i}">Location</label>
            <input type="text" id="edu-location-${i}" value="${(edu.location || '').replace(/"/g, '&quot;')}" placeholder="City, Country">
          </div>
          <div class="form-group">
            <label for="edu-degree-${i}">Degree</label>
            <input type="text" id="edu-degree-${i}" value="${(edu.degree || '').replace(/"/g, '&quot;')}" placeholder="e.g. Bachelor of Science (B.S.)">
          </div>
          <div style="display: flex; gap: 1rem;">
            <div class="form-group" style="flex: 1;">
              <label for="edu-startDate-${i}">Start date</label>
              <input type="text" id="edu-startDate-${i}" value="${(edu.startDate || (edu.dates && edu.dates.split(/\s*[–—\-]\s*/)[0]) || '').replace(/"/g, '&quot;')}" placeholder="MM/YYYY">
            </div>
            <div class="form-group" style="flex: 1;">
              <label for="edu-endDate-${i}">End date</label>
              <input type="text" id="edu-endDate-${i}" value="${(edu.endDate || (edu.dates && edu.dates.split(/\s*[–—\-]\s*/)[1]) || edu.dates || '').replace(/"/g, '&quot;')}" placeholder="MM/YYYY">
            </div>
          </div>
          <div class="form-group">
            <label for="edu-desc-${i}">Description</label>
            <textarea id="edu-desc-${i}" rows="2" placeholder="Honors, activities, relevant coursework">${(edu.description || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</textarea>
          </div>
        </div>
      `).join('');
      list.querySelectorAll('[data-remove-edu]').forEach(btn => {
        btn.addEventListener('click', () => {
          data.education.splice(parseInt(btn.dataset.removeEdu), 1);
          renderEducation();
          updatePreview();
        });
      });
      list.querySelectorAll('input, textarea').forEach(el => {
        el.addEventListener('input', () => collectEducation());
      });
    }

    function collectEducation() {
      data.education = data.education.map((_, i) => {
        const start = document.getElementById(`edu-startDate-${i}`)?.value || '';
        const end = document.getElementById(`edu-endDate-${i}`)?.value || '';
        const dates = start && end ? `${start} – ${end}` : (start || end);
        return {
          school: document.getElementById(`edu-school-${i}`)?.value || '',
          location: document.getElementById(`edu-location-${i}`)?.value || '',
          degree: document.getElementById(`edu-degree-${i}`)?.value || '',
          startDate: start,
          endDate: end,
          dates: dates,
          description: document.getElementById(`edu-desc-${i}`)?.value || ''
        };
      });
      updatePreview();
    }

    function renderSkills() {
      const wrap = document.getElementById('skills-wrap');
      const existing = wrap.querySelector('input');
      wrap.innerHTML = '';
      data.skills.forEach((s, i) => {
        const tag = document.createElement('span');
        tag.className = 'tag';
        tag.innerHTML = `${s} <span class="tag-remove" data-skill-remove="${i}">×</span>`;
        wrap.appendChild(tag);
      });
      const input = document.createElement('input');
      input.type = 'text';
      input.id = 'skills-input';
      input.placeholder = 'Type a skill';
      wrap.appendChild(input);
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ',') {
          e.preventDefault();
          const v = input.value.trim().replace(/,/g, '');
          if (v && !data.skills.includes(v)) {
            data.skills.push(v);
            renderSkills();
            updatePreview();
          }
          input.value = '';
        }
      });
      wrap.querySelectorAll('.tag-remove').forEach(el => {
        el.addEventListener('click', () => {
          data.skills.splice(parseInt(el.dataset.skillRemove), 1);
          renderSkills();
          updatePreview();
        });
      });
      const suggested = ['Python', 'JavaScript', 'SQL', 'AWS', 'Docker', 'Kubernetes', 'React', 'Node.js', 'Project Management', 'Data Analysis', 'Machine Learning', 'Agile', 'Communication', 'Leadership'];
      const sugEl = document.getElementById('suggested-skills');
      if (sugEl) {
        sugEl.innerHTML = suggested.map(s => `<a href="#" class="suggested-skill" data-skill="${s}" style="color:var(--accent);margin-right:0.5rem;text-decoration:none;">${s}</a>`).join('');
        sugEl.querySelectorAll('.suggested-skill').forEach(a => {
          a.onclick = (e) => { e.preventDefault(); if (!data.skills.includes(a.dataset.skill)) { data.skills.push(a.dataset.skill); renderSkills(); updatePreview(); } };
        });
      }
    }

    function renderLanguages() {
      const list = document.getElementById('languages-list');
      list.innerHTML = data.languages.map((lang, i) => `
        <div class="array-item" style="margin-bottom: 0.5rem;">
          <div class="form-group" style="margin-bottom: 0;">
            <div style="display: flex; gap: 0.5rem;">
              <input type="text" id="lang-name-${i}" value="${(lang.name || '').replace(/"/g, '&quot;')}" placeholder="Language" style="flex: 1;">
              <input type="number" id="lang-level-${i}" value="${lang.level || 5}" min="1" max="5" placeholder="1-5" style="width: 60px;">
              <button type="button" class="btn-remove" data-remove-lang="${i}">Remove</button>
            </div>
          </div>
        </div>
      `).join('');
      list.querySelectorAll('[data-remove-lang]').forEach(btn => {
        btn.addEventListener('click', () => {
          data.languages.splice(parseInt(btn.dataset.removeLang), 1);
          renderLanguages();
          updatePreview();
        });
      });
      list.querySelectorAll('input').forEach(el => {
        el.addEventListener('input', () => collectLanguages());
      });
    }

    function collectLanguages() {
      data.languages = data.languages.map((_, i) => ({
        name: document.getElementById(`lang-name-${i}`)?.value || '',
        level: parseInt(document.getElementById(`lang-level-${i}`)?.value || 5)
      }));
      updatePreview();
    }

    const PAGE_W_MM  = 210;
    const PAGE_H_MM  = 297;
    const PX_PER_MM  = 96 / 25.4; // CSS reference pixel density

    function updateResumeScore() {
      let score = 0;
      const c = data.contacts;
      if (c.firstName || c.lastName || c.name) score += 15;
      if (c.email) score += 10;
      if (c.jobTitle) score += 5;
      if (data.experience.length) score += 25;
      if (data.education.length) score += 15;
      if (data.skills.length) score += 15;
      if (data.summary) score += 10;
      if (data.certifications || data.languages?.length) score += 5;
      const el = document.getElementById('resume-score');
      if (el) el.textContent = Math.min(100, score) + '%';
    }

    function updatePreview() {
      collectContacts();
      const sumEl = document.getElementById('summary');
      const certEl = document.getElementById('certifications');
      const awardsEl = document.getElementById('awards');
      data.summary = sumEl?.value || '';
      data.certifications = certEl?.value || '';
      data.awards = awardsEl?.value || '';
      const paper = document.getElementById('preview-paper');
      if (!paper) return;
      paper.className = 'preview-paper ' + currentTemplate;
      paper.innerHTML = getPreviewHTML();
      updateResumeScore();
      requestAnimationFrame(() => window.resetPaginationAndUpdate && window.resetPaginationAndUpdate());
    }

    let paginationPage = 0;

    (function initPagination() {
      const prevBtn = document.getElementById('prev-page');
      const nextBtn = document.getElementById('next-page');
      const pageInfo = document.getElementById('page-info');

      // Calculate the uniform scale that fits one A4 page into the viewport
      function getScale() {
        const viewport = document.getElementById('preview-viewport');
        if (!viewport) return 1;
        const PAD = 24;
        const availW = viewport.clientWidth  - PAD;
        const availH = viewport.clientHeight - PAD;
        const paperW = Math.round(PAGE_W_MM * PX_PER_MM);
        const paperH = Math.round(PAGE_H_MM * PX_PER_MM);
        return Math.min(1, availW / paperW, availH / paperH);
      }

      // Apply scale + page-translate to the paper; optionally animate the slide
      function applyTransform(animate) {
        const frame   = document.getElementById('preview-page-frame');
        const wrapper = document.getElementById('preview-page-wrapper');
        const paper   = document.getElementById('preview-paper');
        if (!frame || !paper) return;

        const scale  = getScale();
        const paperW = Math.round(PAGE_W_MM * PX_PER_MM);
        const paperH = Math.round(PAGE_H_MM * PX_PER_MM);
        const fw = Math.round(paperW * scale) + 'px';
        const fh = Math.round(paperH * scale) + 'px';

        // Frame is exactly one scaled page; wrapper matches so the overlay anchors to it
        frame.style.width  = fw;
        frame.style.height = fh;
        if (wrapper) { wrapper.style.width = fw; wrapper.style.height = fh; }

        // Paper renders at full resolution; scale + slide bring the right page into view
        paper.style.width          = paperW + 'px';
        paper.style.transformOrigin = 'top left';

        if (animate) {
          paper.classList.add('page-animating');
          setTimeout(() => paper.classList.remove('page-animating'), 360);
        }
        paper.style.transform = `scale(${scale}) translateY(-${paginationPage * paperH}px)`;
      }

      function refreshControls(totalPages) {
        pageInfo.textContent = `${paginationPage + 1} / ${totalPages}`;
        prevBtn.disabled = paginationPage === 0;
        nextBtn.disabled = paginationPage >= totalPages - 1;
      }

      function getTotalPages() {
        const paper = document.getElementById('preview-paper');
        if (!paper) return 1;
        const paperH = Math.round(PAGE_H_MM * PX_PER_MM);
        return Math.max(1, Math.ceil(paper.scrollHeight / paperH));
      }

      prevBtn.addEventListener('click', () => {
        if (paginationPage > 0) {
          paginationPage--;
          applyTransform(true);
          refreshControls(getTotalPages());
        }
      });

      nextBtn.addEventListener('click', () => {
        const total = getTotalPages();
        if (paginationPage < total - 1) {
          paginationPage++;
          applyTransform(true);
          refreshControls(total);
        }
      });

      window.addEventListener('resize', () => applyTransform(false));

      // Called after content updates — keeps current page position
      window.updatePagination = () => {
        const total = getTotalPages();
        paginationPage = Math.min(paginationPage, total - 1);
        applyTransform(false);
        refreshControls(total);
      };

      // Called when entirely new content is rendered — jump back to page 1
      window.resetPaginationAndUpdate = () => {
        paginationPage = 0;
        const total = getTotalPages();
        applyTransform(false);
        refreshControls(total);
      };
    })();

    function getPreviewHTML() {
      const c = data.contacts;
      const details = [];
      if (c.email) details.push(c.email);
      if (c.phone) details.push((c.phoneCode || '') + (c.phoneCode && c.phone ? ' ' : '') + (c.phone || ''));
      if (c.location) details.push(c.location);
      if (c.address) details.push(c.address);
      const expHtml = data.experience.map(e => `
        <div style="margin-bottom:1rem;">
          <div style="font-size:8.5pt;color:#333;margin-bottom:0.2rem;">${e.dates}</div>
          <div style="font-weight:700;font-size:9pt;color:#1a1a1a;margin-bottom:0.15rem;">${e.role}</div>
          <div style="font-size:9pt;color:#333;margin-bottom:0.25rem;">${e.company}</div>
          <p style="font-size:9pt;color:#1a1a1a;line-height:1.45;margin:0;">${e.description}</p>
        </div>
      `).join('');
      const eduHtml = data.education.map(e => {
        const meta = [e.degree, e.location, e.dates].filter(Boolean).join(' · ');
        return `<p style="font-size:9pt;color:#1a1a1a;line-height:1.45;margin-bottom:0.5rem;"><strong>${e.school}</strong>${meta ? ' · ' + meta : ''}</p>`;
      }).join('');
      const skillsHtml = data.skills.map(s => `<li style="font-size:9.5pt;color:#1a1a1a;margin-bottom:0.35rem;padding-left:1rem;">${s}</li>`).join('');

      if (currentTemplate === 'classic') {
        const contactLines = [];
        if (c.phone) contactLines.push(`<div style="font-size:9pt;color:#555;margin-bottom:0.35rem;">Phone</div><div style="font-size:9pt;color:#1a1a1a;margin-bottom:0.75rem;">${(c.phoneCode || '') + (c.phoneCode && c.phone ? ' ' : '') + c.phone}</div>`);
        if (c.email) contactLines.push(`<div style="font-size:9pt;color:#555;margin-bottom:0.35rem;">Email</div><div style="font-size:9pt;color:#1a1a1a;margin-bottom:0.75rem;">${c.email}</div>`);
        if (c.address || c.location) contactLines.push(`<div style="font-size:9pt;color:#555;margin-bottom:0.35rem;">Address</div><div style="font-size:9pt;color:#1a1a1a;margin-bottom:0.75rem;">${c.address || c.location}</div>`);
        const eduClassicHtml = data.education.map(e => `
          <div style="margin-bottom:1.25rem;">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:0.25rem;">
              <strong style="font-size:9.5pt;color:#1a1a1a;">${e.degree}</strong>
              <span style="font-size:9pt;color:#666;">${e.dates}</span>
            </div>
            <div style="font-size:9pt;color:#555;margin-bottom:0.35rem;">${e.school}</div>
            ${e.description ? `<p style="font-size:8.5pt;color:#666;line-height:1.4;margin:0;">${e.description}</p>` : ''}
          </div>
        `).join('');
        const expClassicHtml = data.experience.map(e => `
          <div style="margin-bottom:1.25rem;">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:0.25rem;">
              <strong style="font-size:9.5pt;color:#1a1a1a;">${e.role}</strong>
              <span style="font-size:9pt;color:#666;">${e.dates}</span>
            </div>
            <div style="font-size:9pt;color:#555;margin-bottom:0.35rem;">${e.company}${e.location ? ' / ' + e.location : ''}</div>
            <p style="font-size:8.5pt;color:#666;line-height:1.4;margin:0;">${e.description}</p>
          </div>
        `).join('');
        return `
          <div style="min-height:297mm;font-family:sans-serif;color:#1a1a1a;font-size:10pt;background:#fff;padding:2rem;">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:0;gap:1.5rem;">
              <div style="flex:1;">
                <h1 style="font-size:20pt;font-weight:700;margin-bottom:0.25rem;color:#1a1a1a;text-transform:uppercase;letter-spacing:0.02em;">${c.name}</h1>
                <p style="font-size:10pt;color:#64748b;margin-bottom:0;">${c.jobTitle}</p>
              </div>
              <div style="flex-shrink:0;">
                ${c.photoUrl ? `<img src="${c.photoUrl}" alt="" style="width:100px;height:100px;object-fit:cover;">` : `<div style="width:100px;height:100px;background:#e5e7eb;"></div>`}
              </div>
            </div>
            <div style="height:4px;background:#1e3a5f;margin:1rem 0 1.5rem;"></div>
            ${data.summary ? `<section style="margin-bottom:1.25rem;">
              <h2 style="font-size:9pt;font-weight:700;margin-bottom:0.5rem;color:#1a1a1a;text-transform:uppercase;letter-spacing:0.05em;">Summary</h2>
              <p style="font-size:9pt;color:#475569;line-height:1.5;">${data.summary}</p>
            </section>` : ''}
            <section style="margin-bottom:1.25rem;">
              <h2 style="font-size:9pt;font-weight:700;margin-bottom:0.5rem;color:#1a1a1a;text-transform:uppercase;letter-spacing:0.05em;">Experience</h2>
              ${expClassicHtml || '<p style="font-size:9pt;color:#666;">No experience added.</p>'}
            </section>
            <section style="margin-bottom:1.25rem;">
              <h2 style="font-size:9pt;font-weight:700;margin-bottom:0.5rem;color:#1a1a1a;text-transform:uppercase;letter-spacing:0.05em;">Details</h2>
              ${c.email ? `<div style="font-size:9pt;color:#475569;margin-bottom:0.35rem;">${c.email}</div>` : ''}
              ${(c.city || c.country) ? `<div style="font-size:9pt;color:#475569;margin-bottom:0.35rem;">${[c.city, c.country].filter(Boolean).join(', ')}</div>` : ''}
              ${c.phone ? `<div style="font-size:9pt;color:#475569;">${(c.phoneCode || '') + (c.phoneCode && c.phone ? ' ' : '') + c.phone}</div>` : ''}
            </section>
            ${data.skills.length ? `<section style="margin-bottom:1.25rem;">
              <h2 style="font-size:9pt;font-weight:700;margin-bottom:0.5rem;color:#1a1a1a;text-transform:uppercase;letter-spacing:0.05em;">Skills</h2>
              <ul style="list-style:none;padding:0;margin:0;">${skillsHtml}</ul>
            </section>` : ''}
            ${data.education.length ? `<section style="margin-bottom:1.25rem;">
              <h2 style="font-size:9pt;font-weight:700;margin-bottom:0.5rem;color:#1a1a1a;text-transform:uppercase;letter-spacing:0.05em;">Education</h2>
              ${eduClassicHtml}
            </section>` : ''}
            ${data.languages.length ? `<section style="margin-bottom:1.25rem;">
              <h2 style="font-size:9pt;font-weight:700;margin-bottom:0.5rem;color:#1a1a1a;text-transform:uppercase;letter-spacing:0.05em;">Languages</h2>
              <div style="font-size:9pt;color:#475569;">${data.languages.map(l => l.name).join(', ')}</div>
            </section>` : ''}
            ${data.certifications ? `<section style="margin-bottom:1.25rem;">
              <h2 style="font-size:9pt;font-weight:700;margin-bottom:0.5rem;color:#1a1a1a;text-transform:uppercase;letter-spacing:0.05em;">Certifications</h2>
              <p style="font-size:9pt;color:#475569;">${data.certifications}</p>
            </section>` : ''}
          </div>
        `;
      }
      if (currentTemplate === 'minimal') {
        return `
          <div style="max-width:210mm;margin:0 auto;padding:2rem;font-family:Georgia,serif;color:#1a1a1a;font-size:10pt;">
            <div style="text-align:center;margin-bottom:2rem;padding-bottom:1.5rem;border-bottom:2px solid #1a1a1a;">
              <h1 style="font-size:18pt;font-weight:700;margin-bottom:0.25rem;color:#1a1a1a;">${c.name}</h1>
              <p style="font-size:10pt;color:#1a1a1a;">${c.jobTitle}</p>
              <p style="font-size:9pt;color:#1a1a1a;margin-top:0.5rem;">${details.join(' · ')}</p>
            </div>
            ${data.summary ? `<section style="margin-bottom:1.5rem;">
              <h2 style="font-size:10pt;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;margin-bottom:0.75rem;color:#1a1a1a;">Summary</h2>
              <p style="font-size:10pt;text-align:justify;color:#1a1a1a;">${data.summary}</p>
            </section>` : ''}
            <section style="margin-bottom:1.5rem;">
              <h2 style="font-size:10pt;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;margin-bottom:0.75rem;color:#1a1a1a;">Experience</h2>
              ${expHtml || '<p style="font-size:10pt;color:#1a1a1a;">No experience added.</p>'}
            </section>
            ${data.education.length ? `<section style="margin-bottom:1.5rem;">
              <h2 style="font-size:10pt;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;margin-bottom:0.75rem;color:#1a1a1a;">Education</h2>
              ${eduHtml}
            </section>` : ''}
            ${data.skills.length ? `<section style="margin-bottom:1.5rem;">
              <h2 style="font-size:10pt;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;margin-bottom:0.75rem;color:#1a1a1a;">Skills</h2>
              <p style="font-size:10pt;color:#1a1a1a;">${data.skills.join(', ')}</p>
            </section>` : ''}
          </div>
        `;
      }
      if (currentTemplate === 'modern') {
        const contactModern = [];
        if (c.phone) contactModern.push(`<div style="margin-bottom:0.6rem;"><span style="font-size:8pt;color:#94a3b8;">Phone</span><div style="font-size:9pt;color:#fff;">${(c.phoneCode || '') + (c.phoneCode && c.phone ? ' ' : '') + c.phone}</div></div>`);
        if (c.email) contactModern.push(`<div style="margin-bottom:0.6rem;"><span style="font-size:8pt;color:#94a3b8;">Email</span><div style="font-size:9pt;color:#fff;">${c.email}</div></div>`);
        if (c.address || c.location) contactModern.push(`<div style="margin-bottom:0.6rem;"><span style="font-size:8pt;color:#94a3b8;">Address</span><div style="font-size:9pt;color:#fff;">${c.address || c.location}</div></div>`);
        const eduModernHtml = data.education.map(e => `
          <div style="margin-bottom:1rem;">
            <div style="font-size:8.5pt;color:#94a3b8;margin-bottom:0.2rem;">${e.dates}</div>
            <div style="font-weight:700;font-size:9pt;color:#fff;">${e.degree}</div>
            <div style="font-size:9pt;color:#cbd5e1;">${e.school}</div>
          </div>
        `).join('');
        const expModernHtml = data.experience.map(e => `
          <div style="display:flex;gap:0.75rem;margin-bottom:1.25rem;">
            <div style="flex-shrink:0;width:8px;height:8px;border-radius:50%;background:#475569;margin-top:0.4rem;"></div>
            <div style="flex:1;">
              <div style="font-size:8.5pt;color:#64748b;margin-bottom:0.2rem;">${e.dates}</div>
              <div style="font-size:9pt;color:#1a1a1a;margin-bottom:0.15rem;">${e.company}${e.location ? ' | ' + e.location : ''}</div>
              <div style="font-weight:700;font-size:9pt;color:#1a1a1a;margin-bottom:0.35rem;">${e.role}</div>
              <p style="font-size:8.5pt;color:#64748b;line-height:1.5;margin:0;">${e.description}</p>
            </div>
          </div>
        `).join('');
        return `
          <div style="display:flex;min-height:297mm;font-family:sans-serif;color:#1a1a1a;font-size:10pt;">
            <div style="width:32%;background:#334155;color:#fff;padding:2rem 1.5rem;">
              ${c.photoUrl ? `<img src="${c.photoUrl}" alt="" style="width:160px;height:160px;object-fit:cover;margin:0 auto 1.5rem;display:block;border:2px solid #64748b;">` : `<div style="width:160px;height:160px;background:#475569;margin:0 auto 1.5rem;overflow:hidden;border:2px solid #64748b;"></div>`}
              <h2 style="font-size:10pt;font-weight:700;margin-bottom:0.5rem;padding-bottom:0.35rem;border-bottom:1px solid #475569;color:#fff;">Contact</h2>
              ${contactModern.join('')}
              ${data.education.length ? `<h2 style="font-size:10pt;font-weight:700;margin:1.25rem 0 0.5rem;padding-bottom:0.35rem;border-bottom:1px solid #475569;color:#fff;">Education</h2>${eduModernHtml}` : ''}
              ${data.skills.length ? `<h2 style="font-size:10pt;font-weight:700;margin:1.25rem 0 0.5rem;padding-bottom:0.35rem;border-bottom:1px solid #475569;color:#fff;">Expertise</h2>
                <ul style="list-style:none;padding:0;margin:0;">${data.skills.map(s => `<li style="font-size:9pt;color:#e2e8f0;margin-bottom:0.35rem;padding-left:0;">• ${s}</li>`).join('')}</ul>` : ''}
              ${data.languages.length ? `<h2 style="font-size:10pt;font-weight:700;margin:1.25rem 0 0.5rem;padding-bottom:0.35rem;border-bottom:1px solid #475569;color:#fff;">Language</h2>
                <div style="font-size:9pt;color:#e2e8f0;">${data.languages.map(l => l.name).join(', ')}</div>` : ''}
            </div>
            <div style="width:68%;background:#f8fafc;padding:2rem 2.5rem;border-left:1px solid #e2e8f0;">
              <h1 style="font-size:22pt;font-weight:700;margin-bottom:0.25rem;color:#1e293b;">${c.name}</h1>
              <p style="font-size:11pt;color:#64748b;margin-bottom:1.25rem;">${c.jobTitle}</p>
              ${data.summary ? `<p style="font-size:9pt;color:#64748b;line-height:1.6;margin-bottom:1.5rem;">${data.summary}</p>` : ''}
              <h2 style="font-size:10pt;font-weight:700;margin-bottom:0.75rem;padding-bottom:0.35rem;border-bottom:1px solid #cbd5e1;color:#1e293b;">Experience</h2>
              ${expModernHtml || '<p style="font-size:9pt;color:#64748b;">No experience added.</p>'}
              <h2 style="font-size:10pt;font-weight:700;margin:1.5rem 0 0.75rem;padding-bottom:0.35rem;border-bottom:1px solid #cbd5e1;color:#1e293b;">Reference</h2>
              <p style="font-size:9pt;color:#64748b;">${data.additional || 'Available upon request'}</p>
            </div>
          </div>
        `;
      }
      return '';
    }

    document.querySelectorAll('.nav-step').forEach(step => {
      step.addEventListener('click', () => showStep(parseInt(step.dataset.step)));
    });

    document.getElementById('btn-prev').addEventListener('click', () => {
      if (currentStep > 0) showStep(currentStep - 1);
    });

    document.getElementById('btn-next').addEventListener('click', () => {
      if (currentStep < 5) { showStep(currentStep + 1); return; }
      window.location.href = '/template-editor?download=1';
    });


    document.getElementById('add-experience').addEventListener('click', () => {
      data.experience.push({ role: '', company: '', dates: '', description: '' });
      renderExperience();
      updatePreview();
    });

    document.getElementById('add-education').addEventListener('click', () => {
      data.education.push({ school: '', degree: '', dates: '' });
      renderEducation();
      updatePreview();
    });

    document.getElementById('add-language').addEventListener('click', () => {
      data.languages.push({ name: '', level: 5 });
      renderLanguages();
      updatePreview();
    });

    document.getElementById('summary')?.addEventListener('input', updatePreview);
    document.getElementById('certifications')?.addEventListener('input', updatePreview);
    document.getElementById('awards')?.addEventListener('input', updatePreview);

    ['contact-firstName','contact-lastName','contact-jobTitle','contact-email','contact-phoneCode','contact-phone','contact-country','contact-city','contact-address','contact-postCode','contact-linkedin','contact-website','contact-additional'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('input', updatePreview);
    });

    document.getElementById('btn-upload-photo').addEventListener('click', (e) => { e.preventDefault(); document.getElementById('profile-photo-input').click(); });
    document.getElementById('profile-photo-input').addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (!file || !file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = () => {
        data.contacts.photoUrl = reader.result;
        updatePhotoPreview(reader.result);
        updatePreview();
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    });
    document.getElementById('btn-remove-photo').addEventListener('click', (e) => {
      e.preventDefault();
      data.contacts.photoUrl = '';
      updatePhotoPreview('');
      updatePreview();
    });

    document.getElementById('btn-save').addEventListener('click', async () => {
      collectContacts();
      collectExperience();
      collectEducation();
      collectLanguages();
      data.summary = document.getElementById('summary')?.value || '';
      data.certifications = document.getElementById('certifications')?.value || '';
      data.awards = document.getElementById('awards')?.value || '';
      data.template = currentTemplate;
      try {
        const res = await fetch(resumeApiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        if (res.ok) alert('Resume saved!');
        else alert('Failed to save.');
      } catch (e) {
        alert('Failed to save: ' + e.message);
      }
    });

    function migrateData(loaded) {
      const c = loaded.contacts || {};
      if (!c.firstName && !c.lastName && c.name) {
        const parts = (c.name || '').trim().split(/\s+/);
        c.firstName = parts[0] || '';
        c.lastName = parts.slice(1).join(' ') || '';
      }
      if (!c.city && !c.country && c.location) {
        const loc = (c.location || '').split(',').map(s => s.trim());
        c.city = loc[0] || '';
        c.country = loc[1] || '';
      }
      if (!c.phoneCode) c.phoneCode = '+1';
      loaded.experience = (loaded.experience || []).map(exp => {
        if (!exp.dates && (exp.startDate || exp.endDate)) exp.dates = [exp.startDate, exp.endDate].filter(Boolean).join(' – ');
        if (!exp.startDate && exp.dates) exp.startDate = exp.dates.split(/\s*[–—\-]\s*/)[0] || '';
        if (!exp.endDate && exp.dates) exp.endDate = exp.dates.split(/\s*[–—\-]\s*/)[1] || '';
        return exp;
      });
      loaded.education = (loaded.education || []).map(edu => {
        if (!edu.dates && (edu.startDate || edu.endDate)) edu.dates = [edu.startDate, edu.endDate].filter(Boolean).join(' – ');
        if (!edu.startDate && edu.dates) edu.startDate = edu.dates.split(/\s*[–—\-]\s*/)[0] || '';
        if (!edu.endDate && edu.dates) edu.endDate = edu.dates.split(/\s*[–—\-]\s*/)[1] || edu.dates || '';
        return edu;
      });
      return loaded;
    }

    function blankData() {
      return {
        contacts: {
          firstName: '', lastName: '', name: '', jobTitle: '', email: '',
          phone: '', phoneCode: '+1', country: '', city: '',
          address: '', postCode: '', linkedin: '', website: '',
          additional: '', photoUrl: ''
        },
        summary: '', experience: [], education: [], skills: [],
        languages: [], certifications: '', awards: '', additional: '',
        template: 'classic'
      };
    }

    function applyLoadedData(loaded) {
      console.log('[editor] applyLoadedData called with:', loaded);
      data = migrateData(loaded);
      console.log('[editor] after migrateData:', { contacts: data.contacts, expCount: data.experience?.length });
      if (data.template) currentTemplate = data.template;
      applyContacts();
      renderExperience();
      renderEducation();
      renderSkills();
      renderLanguages();
      const sumEl = document.getElementById('summary');
      const certEl = document.getElementById('certifications');
      const awardsEl = document.getElementById('awards');
      if (sumEl) sumEl.value = data.summary || '';
      if (certEl) certEl.value = data.certifications || '';
      if (awardsEl) awardsEl.value = data.awards || '';

      // Defer preview so DOM has settled; re-apply contacts after paint (fixes inputs not filling)
      const runPreview = () => {
        applyContacts();  // Re-apply in case DOM wasn't ready on first pass
        updatePreview();
        setTimeout(() => {
          applyContacts();
          updatePreview();
        }, 50);
      };
      requestAnimationFrame(() => requestAnimationFrame(runPreview));
    }

    // ── Toast notification ───────────────────────────────────────────────────
    function showToast(msg, type) {
      const existing = document.getElementById('editor-toast');
      if (existing) existing.remove();
      const toast = document.createElement('div');
      toast.id = 'editor-toast';
      const bg = type === 'success' ? '#16a34a' : type === 'warn' ? '#d97706' : '#dc2626';
      toast.style.cssText = [
        'position:fixed', 'top:72px', 'left:50%', 'transform:translateX(-50%)',
        'z-index:9999', `background:${bg}`, 'color:#fff',
        'padding:0.65rem 1.4rem', 'border-radius:999px',
        'font-size:0.82rem', 'font-weight:600', 'box-shadow:0 4px 20px rgba(0,0,0,0.25)',
        'max-width:90vw', 'text-align:center', 'pointer-events:none',
        'transition:opacity 0.4s',
      ].join(';');
      toast.textContent = msg;
      document.body.appendChild(toast);
      setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 400); }, 4000);
    }

    async function loadResume() {
      // Read server-injected data from JSON script block (CSP-safe, no inline eval)
      let serverData = null;
      const dataEl = document.getElementById('initial-resume-data');
      if (dataEl && dataEl.textContent) {
        try { serverData = JSON.parse(dataEl.textContent); } catch (e) { /* ignore */ }
      }
      console.log('[editor] loadResume: serverData=', serverData);
      // ── Path 1a: Server-injected data (from POST /editor/with-data)
      const hasData = serverData && typeof serverData === 'object' && (serverData.contacts || serverData.experience || serverData.skills);
      if (hasData) {
        if (dataEl) dataEl.remove();  // clear so refresh fetches from API
        try {
          applyLoadedData(serverData);
          try {
            await fetch(`${API}/resume`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
          } catch (_) { /* non-fatal */ }
          const c = serverData.contacts || {};
          const name = c.name || [c.firstName, c.lastName].filter(Boolean).join(' ');
          const parts = [
            name && `Name: ${name}`,
            (serverData.experience || []).length && `${serverData.experience.length} job(s)`,
            (serverData.education || []).length && `${serverData.education.length} education`,
            (serverData.skills || []).length && `${serverData.skills.length} skills`,
          ].filter(Boolean).join(' · ');
          showToast(parts ? `✓ Resume loaded — ${parts}` : '✓ Resume loaded', 'success');
        } catch (e) {
          console.error('[editor] applyLoadedData threw:', e);
          applyLoadedData(blankData());
          showToast('Resume uploaded but some fields could not be applied.', 'warn');
        }
        return;
      }

      // ── Path 1b: sessionStorage fallback (legacy) ────────────────────────
      const rawParsed = sessionStorage.getItem('parsedResume');
      if (rawParsed) {
        sessionStorage.removeItem('parsedResume');
        let parsedData = null;
        try { parsedData = JSON.parse(rawParsed); }
        catch (e) { console.error('[editor] Bad parsedResume JSON:', e); }

        if (parsedData) {
          try {
            applyLoadedData(parsedData);

            // Persist to backend so refresh and future visits load this data
            try {
              await fetch(resumeApiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
              });
            } catch (_) { /* non-fatal */ }

            const c    = parsedData.contacts || {};
            const name = c.name || [c.firstName, c.lastName].filter(Boolean).join(' ');
            const parts = [
              name                                     && `Name: ${name}`,
              (parsedData.experience || []).length     && `${parsedData.experience.length} job(s)`,
              (parsedData.education  || []).length     && `${parsedData.education.length} education`,
              (parsedData.skills     || []).length     && `${parsedData.skills.length} skills`,
            ].filter(Boolean).join(' · ');

            showToast(parts
              ? `✓ Resume loaded — ${parts}`
              : '✓ Resume loaded (fill in any missing fields below)', 'success');

          } catch (e) {
            console.error('[editor] applyLoadedData threw:', e);
            applyLoadedData(blankData());
            showToast('Resume uploaded but some fields could not be applied. Please fill in manually.', 'warn');
          }
        } else {
          applyLoadedData(blankData());
        }
        return;
      }

      // ── Path 2: Blank resume (user skipped upload) ────────────────────
      const flagsEl = document.getElementById('editor-flags');
      const flags = flagsEl && flagsEl.textContent ? (() => { try { return JSON.parse(flagsEl.textContent); } catch (e) { return {}; } })() : {};
      if (sessionStorage.getItem('startBlank') === '1' || flags.start_blank) {
        sessionStorage.removeItem('startBlank');
        applyLoadedData(blankData());
        return;
      }

      // ── Path 3: Load previously saved resume from backend ─────────────
      try {
        const res = await fetch(resumeApiUrl);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        applyLoadedData(await res.json());
      } catch (e) {
        console.warn('[editor] Could not load saved resume:', e);
        applyLoadedData(blankData());
      }
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', loadResume);
    } else {
      loadResume();
    }
