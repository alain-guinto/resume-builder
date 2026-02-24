/* ── Resume Templates Engine ──────────────────────────────────────────────────
   24 templates: 8 single-col, 4 single-col+photo, 6 two-col, 4 two-col+photo, 2 special
   Usage: renderResume(data, templateId, { accent, font, spacing, applySpell })
────────────────────────────────────────────────────────────────────────────── */
(function (global) {
  'use strict';

  // ── Sample personas ────────────────────────────────────────────────────────
  const _P = [
    {
      contacts: { name:'Jordan Rivera', jobTitle:'Senior Product Designer', email:'jordan@resumeforge.io', phone:'415 234 5678', phoneCode:'+1', city:'San Francisco', country:'United States', location:'San Francisco, CA', linkedin:'linkedin.com/in/jordanrivera', photoUrl:'https://i.pravatar.cc/150?img=47' },
      summary: 'Creative product designer with 8+ years crafting user-centered digital experiences. Skilled in design systems, prototyping, and cross-functional collaboration.',
      experience: [
        { dates:'2021 – Present', role:'Senior Product Designer', company:'TechCorp Inc.', description:'Led redesign of core product, improving user retention by 40%.' },
        { dates:'2018 – 2021', role:'UX Designer', company:'Digital Studio', description:'Designed mobile apps for Fortune 500 clients across fintech and healthcare.' },
        { dates:'2016 – 2018', role:'UI Designer', company:'StartupXYZ', description:'Built design system and component library from scratch.' },
      ],
      education: [{ school:'California College of Arts', degree:'B.A. Graphic Design', dates:'2012–2016' }],
      skills: ['Figma', 'Sketch', 'Prototyping', 'User Research', 'CSS/HTML', 'Design Systems'],
      languages: [{ name:'English', level:5 }, { name:'Spanish', level:3 }],
      certifications: 'Google UX Design Certificate · Adobe Certified Expert',
      awards: 'Design Excellence Award 2023',
    },
    {
      contacts: { name:'Alex Chen', jobTitle:'Full-Stack Software Engineer', email:'alex.chen@devmail.com', phone:'212 876 5432', phoneCode:'+1', city:'New York', country:'United States', location:'New York, NY', linkedin:'linkedin.com/in/alexchen', photoUrl:'https://i.pravatar.cc/150?img=12' },
      summary: 'Passionate engineer with 6 years building scalable web applications. Expert in React, Node.js, and cloud infrastructure with a focus on performance.',
      experience: [
        { dates:'2022 – Present', role:'Senior Software Engineer', company:'FinTech Solutions', description:'Architected microservices handling 10M+ daily transactions.' },
        { dates:'2019 – 2022', role:'Software Engineer', company:'DataCloud Inc.', description:'Built real-time analytics dashboard used by 500+ enterprise clients.' },
        { dates:'2017 – 2019', role:'Junior Developer', company:'WebAgency', description:'Developed client websites and internal tools using React and Django.' },
      ],
      education: [{ school:'MIT', degree:'B.S. Computer Science', dates:'2013–2017' }],
      skills: ['React', 'Node.js', 'TypeScript', 'AWS', 'Docker', 'PostgreSQL'],
      languages: [{ name:'English', level:5 }, { name:'Mandarin', level:4 }],
      certifications: 'AWS Certified Solutions Architect · Google Cloud Professional',
      awards: 'Hackathon Winner 2022 · Top Engineer Q3 2023',
    },
    {
      contacts: { name:'Maria Santos', jobTitle:'Marketing Director', email:'maria.santos@mktpro.com', phone:'44 7700 900123', phoneCode:'+44', city:'London', country:'United Kingdom', location:'London, UK', linkedin:'linkedin.com/in/mariasantos', photoUrl:'https://i.pravatar.cc/150?img=33' },
      summary: 'Results-driven marketing leader with 10+ years building global brand strategies. Passionate about data-driven growth and storytelling that converts.',
      experience: [
        { dates:'2020 – Present', role:'Marketing Director', company:'GlobalBrand Co.', description:'Grew digital revenue by 65% YoY through integrated campaigns.' },
        { dates:'2016 – 2020', role:'Senior Marketing Manager', company:'MediaHouse Ltd.', description:'Managed £2M annual budget and team of 12 marketing specialists.' },
        { dates:'2014 – 2016', role:'Marketing Analyst', company:'AdTech UK', description:'Delivered SEO and PPC strategies increasing organic traffic by 180%.' },
      ],
      education: [{ school:'London School of Economics', degree:'M.Sc. Marketing', dates:'2012–2014' }],
      skills: ['Brand Strategy', 'SEO/SEM', 'Data Analytics', 'Content Marketing', 'Social Media', 'CRM'],
      languages: [{ name:'English', level:5 }, { name:'Portuguese', level:5 }, { name:'Spanish', level:4 }],
      certifications: 'Google Analytics · HubSpot Content Marketing · Meta Blueprint',
      awards: 'Marketing Campaign of the Year 2022 · Rising Leader Award',
    },
    {
      contacts: { name:'James Wilson', jobTitle:'Senior Financial Analyst', email:'james.wilson@financeplus.com', phone:'312 555 7890', phoneCode:'+1', city:'Chicago', country:'United States', location:'Chicago, IL', linkedin:'linkedin.com/in/jameswilson', photoUrl:'https://i.pravatar.cc/150?img=5' },
      summary: 'Detail-oriented financial analyst with 7 years in investment banking and corporate finance. Skilled in financial modeling, valuation, and strategic planning.',
      experience: [
        { dates:'2021 – Present', role:'Senior Financial Analyst', company:'Midwest Capital', description:'Built DCF models supporting $500M+ M&A transactions.' },
        { dates:'2018 – 2021', role:'Financial Analyst', company:'JP Finance Group', description:'Conducted equity research covering 15 mid-cap technology companies.' },
        { dates:'2016 – 2018', role:'Junior Analyst', company:'First National Bank', description:'Prepared financial reports and variance analysis for executive team.' },
      ],
      education: [{ school:'University of Chicago Booth', degree:'M.B.A. Finance', dates:'2014–2016' }],
      skills: ['Financial Modeling', 'Excel/VBA', 'Bloomberg', 'Valuation', 'SQL', 'PowerPoint'],
      languages: [{ name:'English', level:5 }, { name:'French', level:2 }],
      certifications: 'CFA Level III · Series 7 & 63',
      awards: 'Analyst of the Year 2022',
    },
    {
      contacts: { name:'Sarah Thompson', jobTitle:'Human Resources Manager', email:'sarah.t@hrpros.com', phone:'416 222 3344', phoneCode:'+1', city:'Toronto', country:'Canada', location:'Toronto, ON', linkedin:'linkedin.com/in/sarahthompson', photoUrl:'https://i.pravatar.cc/150?img=28' },
      summary: 'People-focused HR professional with 8 years optimizing talent acquisition, employee engagement, and organizational development at scale.',
      experience: [
        { dates:'2020 – Present', role:'HR Manager', company:'TechStartup Canada', description:'Scaled team from 40 to 180 employees while maintaining 92% retention.' },
        { dates:'2017 – 2020', role:'HR Business Partner', company:'Retail Giant Corp.', description:'Implemented performance management system for 2,000+ employees.' },
        { dates:'2015 – 2017', role:'Recruiter', company:'TalentFirst Agency', description:'Placed 200+ candidates across tech, finance, and healthcare sectors.' },
      ],
      education: [{ school:'University of Toronto', degree:'B.A. Psychology & HR Management', dates:'2011–2015' }],
      skills: ['Talent Acquisition', 'HRIS/Workday', 'Performance Management', 'L&D', 'Labor Law', 'DEI'],
      languages: [{ name:'English', level:5 }, { name:'French', level:3 }],
      certifications: 'SHRM-CP · CHRP Designation · LinkedIn Recruiter Certified',
      awards: 'HR Excellence Award 2023',
    },
    {
      contacts: { name:'David Park', jobTitle:'Project Manager, PMP', email:'david.park@pm-pros.com', phone:'206 333 5678', phoneCode:'+1', city:'Seattle', country:'United States', location:'Seattle, WA', linkedin:'linkedin.com/in/davidpark', photoUrl:'https://i.pravatar.cc/150?img=15' },
      summary: 'Certified PMP with 9 years delivering complex technology projects on time and within budget. Expert in Agile/Scrum methodologies and stakeholder management.',
      experience: [
        { dates:'2019 – Present', role:'Senior Project Manager', company:'Amazon Web Services', description:'Managed 6-12 month cloud migration programs with $5M+ budgets.' },
        { dates:'2016 – 2019', role:'Project Manager', company:'Boeing Digital', description:'Led cross-functional teams of 30+ members across 3 continents.' },
        { dates:'2013 – 2016', role:'Business Analyst', company:'Accenture', description:'Delivered ERP implementation for Fortune 500 manufacturing clients.' },
      ],
      education: [{ school:'University of Washington', degree:'B.S. Business Administration', dates:'2009–2013' }],
      skills: ['Agile/Scrum', 'MS Project', 'JIRA', 'Risk Management', 'Stakeholder Mgmt', 'Budget Planning'],
      languages: [{ name:'English', level:5 }, { name:'Korean', level:4 }],
      certifications: 'PMP · Certified ScrumMaster · PRINCE2 Practitioner',
      awards: 'Project Excellence Award 2021 · Delivery Star Q4 2022',
    },
  ];

  // ── Assign persona per template ────────────────────────────────────────────
  const _PERSONA_MAP = {
    classic: 0, minimal: 1, executive: 3, clean: 1, bold: 1, corporate: 3,
    elegant: 2, simple: 4, photo_classic: 0, photo_modern: 2, photo_minimal: 4,
    photo_executive: 3, modern: 5, two_col_blue: 1, two_col_green: 2,
    two_col_red: 3, two_col_warm: 4, two_col_light: 5, two_col_photo_blue: 0,
    two_col_photo_dark: 5, two_col_photo_green: 2, two_col_photo_teal: 1,
    timeline: 5, infographic: 0,
  };

  function _getSample(id) {
    const idx = _PERSONA_MAP[id] !== undefined ? _PERSONA_MAP[id] : 0;
    return Object.assign({ template: id, additional: '' }, _P[idx]);
  }

  // Default sample (first persona)
  const SAMPLE = Object.assign({ template: 'classic', additional: '' }, _P[0]);

  // ── Registry ───────────────────────────────────────────────────────────────
  const REGISTRY = {
    // Single Column – No Photo
    classic:        { name: 'Classic',        cat: 'Single Column',  hasPhoto: false },
    minimal:        { name: 'Minimal',        cat: 'Single Column',  hasPhoto: false },
    executive:      { name: 'Executive',      cat: 'Single Column',  hasPhoto: false },
    clean:          { name: 'Clean',          cat: 'Single Column',  hasPhoto: false },
    bold:           { name: 'Bold',           cat: 'Single Column',  hasPhoto: false },
    corporate:      { name: 'Corporate',      cat: 'Single Column',  hasPhoto: false },
    elegant:        { name: 'Elegant',        cat: 'Single Column',  hasPhoto: false },
    simple:         { name: 'Simple',         cat: 'Single Column',  hasPhoto: false },
    // Single Column – With Photo
    photo_classic:  { name: 'Photo Classic',  cat: 'Single + Photo', hasPhoto: true  },
    photo_modern:   { name: 'Photo Modern',   cat: 'Single + Photo', hasPhoto: true  },
    photo_minimal:  { name: 'Photo Minimal',  cat: 'Single + Photo', hasPhoto: true  },
    photo_executive:{ name: 'Photo Exec',     cat: 'Single + Photo', hasPhoto: true  },
    // Two Column – No Photo
    modern:         { name: 'Modern',         cat: 'Two Column',     hasPhoto: false },
    two_col_blue:   { name: 'Navy Blue',      cat: 'Two Column',     hasPhoto: false },
    two_col_green:  { name: 'Forest Green',   cat: 'Two Column',     hasPhoto: false },
    two_col_red:    { name: 'Burgundy',       cat: 'Two Column',     hasPhoto: false },
    two_col_warm:   { name: 'Terracotta',     cat: 'Two Column',     hasPhoto: false },
    two_col_light:  { name: 'Light Sidebar',  cat: 'Two Column',     hasPhoto: false },
    // Two Column – With Photo
    two_col_photo_blue:  { name: 'Blue + Photo',   cat: 'Two Col + Photo', hasPhoto: true },
    two_col_photo_dark:  { name: 'Dark + Photo',   cat: 'Two Col + Photo', hasPhoto: true },
    two_col_photo_green: { name: 'Green + Photo',  cat: 'Two Col + Photo', hasPhoto: true },
    two_col_photo_teal:  { name: 'Teal + Photo',   cat: 'Two Col + Photo', hasPhoto: true },
    // Special
    timeline:    { name: 'Timeline',    cat: 'Special', hasPhoto: false },
    infographic: { name: 'Infographic', cat: 'Special', hasPhoto: false },
  };

  // ── Shared Helpers ─────────────────────────────────────────────────────────
  function _d(x) { return x || ''; }

  function _photo(url, size, radius, extra) {
    const s = `width:${size}px;height:${size}px;object-fit:cover;${radius ? 'border-radius:' + radius + ';' : ''}${extra || ''}`;
    if (url) return `<img src="${url}" alt="" style="${s}">`;
    return `<div style="${s}background:#cbd5e1;display:flex;align-items:center;justify-content:center;flex-shrink:0;"><svg width="${size * 0.5}" height="${size * 0.5}" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>`;
  }

  function _exp(list, accent, dotColor, dateStyle) {
    return (list || []).map(e => {
      const dot = dotColor ? `<div style="flex-shrink:0;width:9px;height:9px;border-radius:50%;background:${dotColor};margin-top:4px;"></div>` : '';
      return `<div style="display:flex;gap:0.6rem;margin-bottom:1rem;">
        ${dot}
        <div style="flex:1;">
          <div style="font-size:8pt;color:${dateStyle || '#64748b'};margin-bottom:1px;">${_d(e.dates)}</div>
          <div style="font-weight:700;font-size:9pt;color:#1a1a1a;">${_d(e.role)}</div>
          <div style="font-size:8.5pt;color:#64748b;margin-bottom:2px;">${_d(e.company)}</div>
          <p style="font-size:8pt;color:#555;line-height:1.45;margin:0;">${_d(e.description)}</p>
        </div>
      </div>`;
    }).join('');
  }

  function _expPlain(list) {
    return (list || []).map(e => `<div style="margin-bottom:1rem;">
      <div style="display:flex;justify-content:space-between;align-items:baseline;">
        <div style="font-weight:700;font-size:9pt;color:#1a1a1a;">${_d(e.role)}</div>
        <div style="font-size:8pt;color:#888;white-space:nowrap;">${_d(e.dates)}</div>
      </div>
      <div style="font-size:8.5pt;color:#64748b;margin-bottom:2px;">${_d(e.company)}</div>
      <p style="font-size:8pt;color:#555;line-height:1.45;margin:0;">${_d(e.description)}</p>
    </div>`).join('');
  }

  function _edu(list) {
    return (list || []).map(e => `<div style="margin-bottom:0.6rem;">
      <div style="font-weight:700;font-size:9pt;color:#1a1a1a;">${_d(e.degree)}</div>
      <div style="font-size:8.5pt;color:#64748b;">${_d(e.school)}</div>
      <div style="font-size:8pt;color:#888;">${_d(e.dates)}</div>
    </div>`).join('');
  }

  function _skills(list, bg, color, gap) {
    if (!list || !list.length) return '';
    const g = gap || '4px';
    return `<div style="display:flex;flex-wrap:wrap;gap:${g};">${list.map(s =>
      `<span style="font-size:8pt;background:${bg || '#f1f5f9'};color:${color || '#334155'};padding:2px 8px;border-radius:999px;">${s}</span>`
    ).join('')}</div>`;
  }

  function _skillsBar(list, accent) {
    return (list || []).map((s, i) => {
      const pct = [85, 90, 75, 80, 70, 65, 88, 72, 78, 82][i % 10];
      return `<div style="margin-bottom:6px;">
        <div style="display:flex;justify-content:space-between;font-size:8pt;color:#475569;margin-bottom:2px;">
          <span>${s}</span><span style="color:${accent};">${pct}%</span>
        </div>
        <div style="height:4px;background:#e2e8f0;border-radius:4px;">
          <div style="height:4px;width:${pct}%;background:${accent};border-radius:4px;"></div>
        </div>
      </div>`;
    }).join('');
  }

  function _langs(list, color) {
    return (list || []).map(l => {
      const dots = [1,2,3,4,5].map(n =>
        `<span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:${n <= (l.level || 3) ? (color || '#4f46e5') : '#e2e8f0'};margin-right:2px;"></span>`
      ).join('');
      return `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px;font-size:8.5pt;color:inherit;">
        <span>${_d(l.name)}</span><div>${dots}</div>
      </div>`;
    }).join('');
  }

  function _secTitle(text, accent, style) {
    if (style === 'bar')
      return `<h2 style="font-size:9pt;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:${accent};border-bottom:2px solid ${accent};padding-bottom:3px;margin:0 0 8px;">${text}</h2>`;
    if (style === 'track')
      return `<h2 style="font-size:8.5pt;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:#374151;margin:0 0 8px;">${text}</h2>`;
    if (style === 'bold')
      return `<h2 style="font-size:10pt;font-weight:800;color:#111;border-left:3px solid ${accent};padding-left:6px;margin:0 0 8px;">${text}</h2>`;
    if (style === 'dot')
      return `<h2 style="font-size:9pt;font-weight:700;color:#1a1a1a;display:flex;align-items:center;gap:6px;margin:0 0 8px;"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${accent};"></span>${text}</h2>`;
    if (style === 'light')
      return `<h2 style="font-size:9pt;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#6b7280;margin:0 0 8px;">${text}</h2>`;
    if (style === 'elegant')
      return `<h2 style="font-size:9pt;font-weight:600;color:${accent};border-bottom:1px solid ${accent};padding-bottom:3px;margin:0 0 8px;letter-spacing:0.04em;">${text}</h2>`;
    // default underline
    return `<h2 style="font-size:9pt;font-weight:700;text-transform:uppercase;color:#1a1a1a;border-bottom:1px solid #e2e8f0;padding-bottom:3px;margin:0 0 8px;letter-spacing:0.04em;">${text}</h2>`;
  }

  function _sec(title, content, accent, style, margin) {
    if (!content) return '';
    const m = margin || '0 0 1.1rem';
    return `<section style="margin:${m};">${_secTitle(title, accent, style)}${content}</section>`;
  }

  function _contactRow(c, sep, color) {
    const parts = [c.email, (c.phoneCode || '') + ' ' + (c.phone || ''), c.location || [c.city, c.country].filter(Boolean).join(', '), c.linkedin].filter(x => x && x.trim());
    return parts.map(p => `<span style="font-size:8.5pt;color:${color || '#64748b'};">${p}</span>`).join(`<span style="color:${color || '#94a3b8'};margin:0 4px;">${sep || ' · '}</span>`);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // SINGLE COLUMN — NO PHOTO
  // ─────────────────────────────────────────────────────────────────────────

  function tClassic(d, ac, fo, sp) {
    const c = d.contacts || {};
    return `<div style="min-height:297mm;font-family:${fo};line-height:${sp};color:#1a1a1a;font-size:10pt;background:#fff;padding:2rem;">
      <h1 style="font-size:20pt;font-weight:800;text-transform:uppercase;letter-spacing:0.03em;margin:0;">${c.name || 'Your Name'}</h1>
      <p style="font-size:10pt;color:#64748b;margin:4px 0 6px;">${c.jobTitle || 'Job Title'}</p>
      <div style="margin-bottom:6px;">${_contactRow(c, ' · ')}</div>
      <div style="height:4px;background:${ac};margin:8px 0 1.25rem;border-radius:2px;"></div>
      ${_sec('Summary', d.summary ? `<p style="font-size:9pt;color:#475569;">${d.summary}</p>` : '', ac, 'bar')}
      ${_sec('Experience', _expPlain(d.experience), ac, 'bar')}
      ${_sec('Education', _edu(d.education), ac, 'bar')}
      ${_sec('Skills', _skills(d.skills), ac, 'bar')}
      ${_sec('Languages', _langs(d.languages, ac), ac, 'bar')}
      ${d.certifications ? _sec('Certifications', `<p style="font-size:9pt;color:#555;">${d.certifications}</p>`, ac, 'bar') : ''}
    </div>`;
  }

  function tMinimal(d, ac, fo, sp) {
    const c = d.contacts || {};
    const contact = _contactRow(c, '  ·  ', '#888');
    return `<div style="min-height:297mm;font-family:${fo};line-height:${sp};color:#1a1a1a;font-size:10pt;background:#fff;padding:2.5rem 2rem;">
      <div style="text-align:center;padding-bottom:1.25rem;border-bottom:1px solid ${ac};margin-bottom:1.5rem;">
        <h1 style="font-size:22pt;font-weight:300;letter-spacing:0.08em;margin:0;">${c.name || 'Your Name'}</h1>
        <p style="font-size:10pt;color:#888;margin:5px 0;">${c.jobTitle || ''}</p>
        <div>${contact}</div>
      </div>
      ${_sec('Summary', d.summary ? `<p style="font-size:9pt;color:#555;">${d.summary}</p>` : '', ac, 'track')}
      ${_sec('Experience', _expPlain(d.experience), ac, 'track')}
      ${_sec('Education', _edu(d.education), ac, 'track')}
      ${_sec('Skills', `<p style="font-size:9pt;color:#555;">${(d.skills || []).join(', ')}</p>`, ac, 'track')}
      ${_sec('Languages', _langs(d.languages, ac), ac, 'track')}
      ${d.certifications ? _sec('Certifications', `<p style="font-size:9pt;color:#555;">${d.certifications}</p>`, ac, 'track') : ''}
    </div>`;
  }

  function tExecutive(d, ac, fo, sp) {
    const c = d.contacts || {};
    const accent2 = ac || '#1a2744';
    return `<div style="min-height:297mm;font-family:${fo};line-height:${sp};color:#1a1a1a;font-size:10pt;background:#fff;padding:2.5rem 2rem;">
      <div style="border-bottom:3px solid ${accent2};padding-bottom:1rem;margin-bottom:1.5rem;">
        <h1 style="font-size:24pt;font-weight:700;color:${accent2};letter-spacing:-0.01em;margin:0;">${c.name || 'Your Name'}</h1>
        <p style="font-size:11pt;color:#64748b;margin:4px 0 8px;">${c.jobTitle || ''}</p>
        <div>${_contactRow(c, '  |  ', '#888')}</div>
      </div>
      ${_sec('Professional Summary', d.summary ? `<p style="font-size:9pt;color:#555;line-height:1.6;">${d.summary}</p>` : '', accent2, 'track')}
      ${_sec('Professional Experience', _expPlain(d.experience), accent2, 'track')}
      ${_sec('Education', _edu(d.education), accent2, 'track')}
      ${_sec('Core Competencies', _skills(d.skills, '#eef2ff', accent2), accent2, 'track')}
      ${_sec('Languages', _langs(d.languages, accent2), accent2, 'track')}
      ${d.certifications ? _sec('Certifications & Licences', `<p style="font-size:9pt;color:#555;">${d.certifications}</p>`, accent2, 'track') : ''}
    </div>`;
  }

  function tClean(d, ac, fo, sp) {
    const c = d.contacts || {};
    const accent2 = ac || '#475569';
    return `<div style="min-height:297mm;font-family:${fo};line-height:${sp};color:#1a1a1a;font-size:10pt;background:#fff;padding:2.5rem 2.5rem;">
      <h1 style="font-size:21pt;font-weight:600;margin:0;color:#111;">${c.name || 'Your Name'}</h1>
      <p style="font-size:10pt;color:#888;margin:3px 0 10px;">${c.jobTitle || ''}</p>
      <p style="font-size:8.5pt;color:#aaa;margin-bottom:1.5rem;">${_contactRow(c, ' · ', '#aaa')}</p>
      ${_sec('About', d.summary ? `<p style="font-size:9pt;color:#555;">${d.summary}</p>` : '', accent2, 'light')}
      ${_sec('Experience', _expPlain(d.experience), accent2, 'light')}
      ${_sec('Education', _edu(d.education), accent2, 'light')}
      ${_sec('Skills', _skills(d.skills, '#f8fafc', '#475569', '3px'), accent2, 'light')}
      ${_sec('Languages', _langs(d.languages, accent2), accent2, 'light')}
      ${d.certifications ? _sec('Certifications', `<p style="font-size:9pt;color:#555;">${d.certifications}</p>`, accent2, 'light') : ''}
    </div>`;
  }

  function tBold(d, ac, fo, sp) {
    const c = d.contacts || {};
    const accent2 = ac || '#111827';
    return `<div style="min-height:297mm;font-family:${fo};line-height:${sp};color:#1a1a1a;font-size:10pt;background:#fff;padding:2rem;">
      <div style="background:${accent2};padding:1.5rem 2rem;margin:-2rem -2rem 1.5rem;">
        <h1 style="font-size:26pt;font-weight:900;color:#fff;letter-spacing:-0.02em;margin:0;">${c.name || 'Your Name'}</h1>
        <p style="font-size:11pt;color:rgba(255,255,255,0.75);margin:4px 0;">${c.jobTitle || ''}</p>
        <p style="font-size:8pt;color:rgba(255,255,255,0.55);margin-top:5px;">${_contactRow(c, ' · ', 'rgba(255,255,255,0.6)')}</p>
      </div>
      ${_sec('Summary', d.summary ? `<p style="font-size:9pt;color:#555;">${d.summary}</p>` : '', accent2, 'bold')}
      ${_sec('Experience', _expPlain(d.experience), accent2, 'bold')}
      ${_sec('Education', _edu(d.education), accent2, 'bold')}
      ${_sec('Skills', _skills(d.skills, '#f3f4f6', '#111', '4px'), accent2, 'bold')}
      ${_sec('Languages', _langs(d.languages, accent2), accent2, 'bold')}
      ${d.certifications ? _sec('Certifications', `<p style="font-size:9pt;color:#555;">${d.certifications}</p>`, accent2, 'bold') : ''}
    </div>`;
  }

  function tCorporate(d, ac, fo, sp) {
    const c = d.contacts || {};
    const accent2 = ac || '#374151';
    return `<div style="min-height:297mm;font-family:${fo};line-height:${sp};color:#1a1a1a;font-size:10pt;background:#f9fafb;padding:0;">
      <div style="background:#fff;padding:1.5rem 2rem;border-bottom:2px solid ${accent2};">
        <h1 style="font-size:20pt;font-weight:700;color:${accent2};margin:0;">${c.name || 'Your Name'}</h1>
        <p style="font-size:10pt;color:#6b7280;margin:3px 0 8px;">${c.jobTitle || ''}</p>
        <div>${_contactRow(c, '  |  ', '#6b7280')}</div>
      </div>
      <div style="padding:1.5rem 2rem;">
      ${_sec('Summary', d.summary ? `<p style="font-size:9pt;color:#555;">${d.summary}</p>` : '', accent2, 'bar')}
      ${_sec('Experience', _expPlain(d.experience), accent2, 'bar')}
      ${_sec('Education', _edu(d.education), accent2, 'bar')}
      ${_sec('Skills', _skills(d.skills, '#f3f4f6', '#374151', '4px'), accent2, 'bar')}
      ${_sec('Languages', _langs(d.languages, accent2), accent2, 'bar')}
      ${d.certifications ? _sec('Certifications', `<p style="font-size:9pt;color:#555;">${d.certifications}</p>`, accent2, 'bar') : ''}
      </div>
    </div>`;
  }

  function tElegant(d, ac, fo, sp) {
    const c = d.contacts || {};
    const accent2 = ac || '#92400e';
    return `<div style="min-height:297mm;font-family:${fo};line-height:${sp};color:#1a1a1a;font-size:10pt;background:#fffdf8;padding:2.5rem 2rem;">
      <div style="text-align:center;margin-bottom:1.5rem;">
        <h1 style="font-size:22pt;font-weight:300;letter-spacing:0.06em;color:${accent2};margin:0;">${c.name || 'Your Name'}</h1>
        <div style="height:1px;background:${accent2};width:60px;margin:8px auto;opacity:0.4;"></div>
        <p style="font-size:10pt;color:#888;margin:4px 0;">${c.jobTitle || ''}</p>
        <p style="font-size:8.5pt;color:#aaa;">${_contactRow(c, '  ·  ', '#bbb')}</p>
      </div>
      ${_sec('Profile', d.summary ? `<p style="font-size:9pt;color:#666;font-style:italic;">${d.summary}</p>` : '', accent2, 'elegant')}
      ${_sec('Experience', _expPlain(d.experience), accent2, 'elegant')}
      ${_sec('Education', _edu(d.education), accent2, 'elegant')}
      ${_sec('Skills', _skills(d.skills, '#fef3c7', accent2, '3px'), accent2, 'elegant')}
      ${_sec('Languages', _langs(d.languages, accent2), accent2, 'elegant')}
      ${d.certifications ? _sec('Certifications', `<p style="font-size:9pt;color:#666;">${d.certifications}</p>`, accent2, 'elegant') : ''}
    </div>`;
  }

  function tSimple(d, ac, fo, sp) {
    const c = d.contacts || {};
    return `<div style="min-height:297mm;font-family:${fo};line-height:${sp};color:#222;font-size:10pt;background:#fff;padding:2rem 2.5rem;">
      <h1 style="font-size:18pt;font-weight:700;margin:0;">${c.name || 'Your Name'}</h1>
      <p style="font-size:9.5pt;color:#555;margin:3px 0 5px;">${c.jobTitle || ''}</p>
      <p style="font-size:8pt;color:#888;margin-bottom:1.25rem;">${_contactRow(c, ' · ', '#999')}</p>
      ${d.summary ? `<p style="font-size:9pt;color:#444;margin-bottom:1.25rem;">${d.summary}</p>` : ''}
      <hr style="border:none;border-top:1px solid #e5e7eb;margin-bottom:1.25rem;">
      ${_sec('Experience', _expPlain(d.experience), '#222', 'default')}
      <hr style="border:none;border-top:1px solid #f3f4f6;margin-bottom:1.25rem;">
      ${_sec('Education', _edu(d.education), '#222', 'default')}
      ${_sec('Skills', `<p style="font-size:9pt;color:#555;">${(d.skills || []).join(' · ')}</p>`, '#222', 'default')}
      ${_sec('Languages', _langs(d.languages, '#555'), '#222', 'default')}
    </div>`;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // SINGLE COLUMN — WITH PHOTO
  // ─────────────────────────────────────────────────────────────────────────

  function tPhotoClassic(d, ac, fo, sp) {
    const c = d.contacts || {};
    return `<div style="min-height:297mm;font-family:${fo};line-height:${sp};background:#fff;padding:2rem;color:#1a1a1a;font-size:10pt;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:1rem;margin-bottom:0.5rem;">
        <div style="flex:1;">
          <h1 style="font-size:20pt;font-weight:800;text-transform:uppercase;margin:0;">${c.name || 'Your Name'}</h1>
          <p style="font-size:10pt;color:#64748b;margin:4px 0 6px;">${c.jobTitle || ''}</p>
          <div style="font-size:8.5pt;color:#94a3b8;">${_contactRow(c)}</div>
        </div>
        ${_photo(c.photoUrl, 90, '50%', 'flex-shrink:0;border:3px solid ' + ac + ';')}
      </div>
      <div style="height:4px;background:${ac};margin:10px 0 1.25rem;border-radius:2px;"></div>
      ${_sec('Summary', d.summary ? `<p style="font-size:9pt;color:#475569;">${d.summary}</p>` : '', ac, 'bar')}
      ${_sec('Experience', _expPlain(d.experience), ac, 'bar')}
      ${_sec('Education', _edu(d.education), ac, 'bar')}
      ${_sec('Skills', _skills(d.skills, '#eff6ff', ac), ac, 'bar')}
      ${_sec('Languages', _langs(d.languages, ac), ac, 'bar')}
    </div>`;
  }

  function tPhotoModern(d, ac, fo, sp) {
    const c = d.contacts || {};
    const accent2 = ac || '#0ea5e9';
    return `<div style="min-height:297mm;font-family:${fo};line-height:${sp};background:#fff;color:#1a1a1a;font-size:10pt;">
      <div style="background:linear-gradient(135deg,${accent2},${accent2}dd);padding:1.75rem 2rem;display:flex;align-items:center;gap:1.25rem;">
        ${_photo(c.photoUrl, 80, '50%', 'border:3px solid rgba(255,255,255,0.8);flex-shrink:0;')}
        <div style="flex:1;">
          <h1 style="font-size:20pt;font-weight:700;color:#fff;margin:0;">${c.name || 'Your Name'}</h1>
          <p style="font-size:10pt;color:rgba(255,255,255,0.85);margin:3px 0;">${c.jobTitle || ''}</p>
          <p style="font-size:8pt;color:rgba(255,255,255,0.65);margin-top:4px;">${_contactRow(c, ' · ', 'rgba(255,255,255,0.7)')}</p>
        </div>
      </div>
      <div style="padding:1.75rem 2rem;">
      ${_sec('Summary', d.summary ? `<p style="font-size:9pt;color:#555;">${d.summary}</p>` : '', accent2, 'bar')}
      ${_sec('Experience', _exp(d.experience, accent2, accent2, '#64748b'), accent2, 'bar')}
      ${_sec('Education', _edu(d.education), accent2, 'bar')}
      ${_sec('Skills', _skills(d.skills, '#e0f2fe', accent2), accent2, 'bar')}
      ${_sec('Languages', _langs(d.languages, accent2), accent2, 'bar')}
      </div>
    </div>`;
  }

  function tPhotoMinimal(d, ac, fo, sp) {
    const c = d.contacts || {};
    const accent2 = ac || '#334155';
    return `<div style="min-height:297mm;font-family:${fo};line-height:${sp};background:#fff;padding:2rem;color:#1a1a1a;font-size:10pt;">
      <div style="text-align:center;margin-bottom:1.5rem;">
        ${_photo(c.photoUrl, 80, '50%', 'margin:0 auto 10px;display:block;border:2px solid #e2e8f0;')}
        <h1 style="font-size:19pt;font-weight:300;letter-spacing:0.05em;margin:0;">${c.name || 'Your Name'}</h1>
        <p style="font-size:10pt;color:#888;margin:3px 0 6px;">${c.jobTitle || ''}</p>
        <div style="width:40px;height:2px;background:${accent2};margin:8px auto;"></div>
        <div>${_contactRow(c, ' · ', '#aaa')}</div>
      </div>
      ${_sec('Summary', d.summary ? `<p style="font-size:9pt;color:#555;">${d.summary}</p>` : '', accent2, 'track')}
      ${_sec('Experience', _expPlain(d.experience), accent2, 'track')}
      ${_sec('Education', _edu(d.education), accent2, 'track')}
      ${_sec('Skills', `<p style="font-size:9pt;color:#555;">${(d.skills || []).join(', ')}</p>`, accent2, 'track')}
      ${_sec('Languages', _langs(d.languages, accent2), accent2, 'track')}
    </div>`;
  }

  function tPhotoExecutive(d, ac, fo, sp) {
    const c = d.contacts || {};
    const accent2 = ac || '#1e3a8a';
    return `<div style="min-height:297mm;font-family:${fo};line-height:${sp};background:#fff;padding:2rem;color:#1a1a1a;font-size:10pt;">
      <div style="display:flex;gap:1.25rem;align-items:flex-start;border-bottom:2px solid ${accent2};padding-bottom:1rem;margin-bottom:1.25rem;">
        ${_photo(c.photoUrl, 90, '4px', 'flex-shrink:0;border:1px solid #e2e8f0;')}
        <div style="flex:1;padding-top:4px;">
          <h1 style="font-size:20pt;font-weight:700;color:${accent2};margin:0;">${c.name || 'Your Name'}</h1>
          <p style="font-size:10.5pt;color:#6b7280;margin:4px 0 8px;">${c.jobTitle || ''}</p>
          <div>${_contactRow(c, ' · ', '#888')}</div>
        </div>
      </div>
      ${_sec('Professional Summary', d.summary ? `<p style="font-size:9pt;color:#555;">${d.summary}</p>` : '', accent2, 'track')}
      ${_sec('Professional Experience', _expPlain(d.experience), accent2, 'track')}
      ${_sec('Education', _edu(d.education), accent2, 'track')}
      ${_sec('Skills', _skills(d.skills, '#eff6ff', accent2), accent2, 'track')}
      ${_sec('Languages', _langs(d.languages, accent2), accent2, 'track')}
      ${d.certifications ? _sec('Certifications', `<p style="font-size:9pt;color:#555;">${d.certifications}</p>`, accent2, 'track') : ''}
    </div>`;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // TWO COLUMN — configurable sidebar
  // ─────────────────────────────────────────────────────────────────────────

  function _doubleCol(d, ac, fo, sp, sideColor, sideTxt, withPhoto) {
    const c = d.contacts || {};
    const eduSide = (d.education || []).map(e => `<div style="margin-bottom:0.6rem;">
      <div style="font-size:8.5pt;font-weight:700;color:${sideTxt};">${_d(e.degree)}</div>
      <div style="font-size:8pt;color:${sideTxt};opacity:0.75;">${_d(e.school)}</div>
      <div style="font-size:7.5pt;color:${sideTxt};opacity:0.55;">${_d(e.dates)}</div>
    </div>`).join('');
    const skillSide = (d.skills || []).map(s => `<div style="font-size:8.5pt;color:${sideTxt};margin-bottom:3px;">• ${s}</div>`).join('');
    const langSide = _langs(d.languages || [], sideTxt === '#fff' ? '#fff' : ac);
    const sideTitleStyle = `font-size:9pt;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:${sideTxt};border-bottom:1px solid ${sideTxt === '#fff' ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.15)'};padding-bottom:3px;margin:0 0 8px;`;
    const rightExpHtml = (d.experience || []).map(e => `<div style="display:flex;gap:0.5rem;margin-bottom:1rem;">
      <div style="flex-shrink:0;width:8px;height:8px;border-radius:50%;background:${ac};margin-top:4px;"></div>
      <div><div style="font-size:7.5pt;color:#94a3b8;">${_d(e.dates)}</div>
      <div style="font-weight:700;font-size:9pt;color:#1a1a1a;">${_d(e.role)}</div>
      <div style="font-size:8.5pt;color:#64748b;">${_d(e.company)}</div>
      <p style="font-size:8pt;color:#555;margin:2px 0 0;line-height:1.4;">${_d(e.description)}</p></div>
    </div>`).join('');

    return `<div style="display:flex;min-height:297mm;font-family:${fo};line-height:${sp};font-size:10pt;">
      <div style="width:32%;background:${sideColor};padding:2rem 1.25rem;flex-shrink:0;">
        ${withPhoto ? _photo(c.photoUrl, 100, '50%', 'display:block;margin:0 auto 1rem;border:3px solid ' + (sideTxt === '#fff' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.1)') + ';') : ''}
        <h1 style="font-size:14pt;font-weight:700;color:${sideTxt};margin:0 0 3px;">${c.name || 'Your Name'}</h1>
        <p style="font-size:9pt;color:${sideTxt};opacity:0.75;margin-bottom:1rem;">${c.jobTitle || ''}</p>
        <div style="height:2px;background:${sideTxt === '#fff' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'};margin-bottom:1rem;"></div>
        <h2 style="${sideTitleStyle}">Contact</h2>
        ${c.email ? `<div style="font-size:8pt;color:${sideTxt};opacity:0.85;margin-bottom:5px;">${c.email}</div>` : ''}
        ${c.phone ? `<div style="font-size:8pt;color:${sideTxt};opacity:0.85;margin-bottom:5px;">${c.phoneCode || ''} ${c.phone}</div>` : ''}
        ${(c.city || c.country) ? `<div style="font-size:8pt;color:${sideTxt};opacity:0.85;margin-bottom:1rem;">${[c.city, c.country].filter(Boolean).join(', ')}</div>` : ''}
        ${(d.education || []).length ? `<h2 style="${sideTitleStyle}margin-top:0.75rem;">Education</h2>${eduSide}` : ''}
        ${(d.skills || []).length ? `<h2 style="${sideTitleStyle}margin-top:0.75rem;">Skills</h2>${skillSide}` : ''}
        ${(d.languages || []).length ? `<h2 style="${sideTitleStyle}margin-top:0.75rem;">Languages</h2>${langSide}` : ''}
        ${d.certifications ? `<h2 style="${sideTitleStyle}margin-top:0.75rem;">Certifications</h2><p style="font-size:8pt;color:${sideTxt};opacity:0.8;">${d.certifications}</p>` : ''}
      </div>
      <div style="flex:1;background:#f8fafc;padding:2rem 1.75rem;border-left:1px solid #e2e8f0;">
        <div style="border-top:4px solid ${ac};padding-top:1rem;margin-bottom:1rem;">
          ${d.summary ? `<p style="font-size:9pt;color:#64748b;margin-bottom:1rem;">${d.summary}</p>` : ''}
        </div>
        <h2 style="font-size:9.5pt;font-weight:700;padding-bottom:3px;border-bottom:1px solid #e2e8f0;margin-bottom:0.75rem;color:#1e293b;">Experience</h2>
        ${rightExpHtml || '<p style="font-size:9pt;color:#888;">No experience added.</p>'}
        ${d.awards ? `<h2 style="font-size:9.5pt;font-weight:700;padding-bottom:3px;border-bottom:1px solid #e2e8f0;margin:1rem 0 0.75rem;color:#1e293b;">Awards</h2><p style="font-size:9pt;color:#555;">${d.awards}</p>` : ''}
      </div>
    </div>`;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // SPECIAL TEMPLATES
  // ─────────────────────────────────────────────────────────────────────────

  function tTimeline(d, ac, fo, sp) {
    const c = d.contacts || {};
    const accent2 = ac || '#7c3aed';
    const timelineExp = (d.experience || []).map(e => `<div style="display:flex;gap:1rem;margin-bottom:1.25rem;position:relative;">
      <div style="display:flex;flex-direction:column;align-items:center;width:16px;flex-shrink:0;">
        <div style="width:12px;height:12px;border-radius:50%;background:${accent2};border:2px solid ${accent2};flex-shrink:0;"></div>
        <div style="flex:1;width:2px;background:#e2e8f0;min-height:40px;margin-top:2px;"></div>
      </div>
      <div style="flex:1;padding-top:0;">
        <div style="display:flex;justify-content:space-between;align-items:baseline;">
          <div style="font-weight:700;font-size:9pt;color:#1a1a1a;">${_d(e.role)}</div>
          <div style="font-size:7.5pt;color:${accent2};font-weight:600;white-space:nowrap;background:${accent2}15;padding:1px 6px;border-radius:999px;">${_d(e.dates)}</div>
        </div>
        <div style="font-size:8.5pt;color:#64748b;margin-bottom:2px;">${_d(e.company)}</div>
        <p style="font-size:8pt;color:#555;line-height:1.4;margin:0;">${_d(e.description)}</p>
      </div>
    </div>`).join('');
    return `<div style="min-height:297mm;font-family:${fo};line-height:${sp};background:#fff;padding:2rem;color:#1a1a1a;font-size:10pt;">
      <div style="background:${accent2}0d;border-left:4px solid ${accent2};padding:1rem 1.25rem;margin-bottom:1.5rem;border-radius:0 8px 8px 0;">
        <h1 style="font-size:20pt;font-weight:800;color:${accent2};margin:0;">${c.name || 'Your Name'}</h1>
        <p style="font-size:10pt;color:#64748b;margin:3px 0 6px;">${c.jobTitle || ''}</p>
        <div>${_contactRow(c, ' · ', '#94a3b8')}</div>
      </div>
      ${d.summary ? `<p style="font-size:9pt;color:#555;margin-bottom:1.5rem;padding-left:1px;">${d.summary}</p>` : ''}
      <h2 style="font-size:9pt;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:${accent2};margin-bottom:0.75rem;">Experience</h2>
      ${timelineExp || '<p style="font-size:9pt;color:#888;">No experience added.</p>'}
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-top:0.5rem;">
        <div>
          ${_sec('Education', _edu(d.education), accent2, 'dot')}
          ${d.certifications ? _sec('Certifications', `<p style="font-size:9pt;color:#555;">${d.certifications}</p>`, accent2, 'dot') : ''}
        </div>
        <div>
          ${_sec('Skills', _skills(d.skills, accent2 + '15', accent2), accent2, 'dot')}
          ${_sec('Languages', _langs(d.languages, accent2), accent2, 'dot')}
        </div>
      </div>
    </div>`;
  }

  function tInfographic(d, ac, fo, sp) {
    const c = d.contacts || {};
    const accent2 = ac || '#0ea5e9';
    return `<div style="min-height:297mm;font-family:${fo};line-height:${sp};background:#fff;padding:0;color:#1a1a1a;font-size:10pt;">
      <div style="background:${accent2};padding:1.5rem 2rem;">
        <h1 style="font-size:22pt;font-weight:800;color:#fff;margin:0;">${c.name || 'Your Name'}</h1>
        <p style="font-size:10.5pt;color:rgba(255,255,255,0.85);margin:3px 0;">${c.jobTitle || ''}</p>
        <div style="display:flex;gap:1rem;margin-top:8px;flex-wrap:wrap;">
          ${c.email ? `<span style="font-size:7.5pt;color:rgba(255,255,255,0.7);">✉ ${c.email}</span>` : ''}
          ${c.phone ? `<span style="font-size:7.5pt;color:rgba(255,255,255,0.7);">📞 ${c.phoneCode || ''} ${c.phone}</span>` : ''}
          ${(c.city || c.country) ? `<span style="font-size:7.5pt;color:rgba(255,255,255,0.7);">📍 ${[c.city, c.country].filter(Boolean).join(', ')}</span>` : ''}
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1.3fr 1fr;gap:0;min-height:calc(297mm - 100px);">
        <div style="padding:1.5rem;border-right:1px solid #e2e8f0;">
          ${d.summary ? `<p style="font-size:9pt;color:#555;margin-bottom:1.25rem;">${d.summary}</p>` : ''}
          ${_sec('Experience', _exp(d.experience, accent2, accent2, '#64748b'), accent2, 'bar')}
          ${d.certifications ? _sec('Certifications', `<p style="font-size:9pt;color:#555;">${d.certifications}</p>`, accent2, 'bar') : ''}
        </div>
        <div style="padding:1.5rem;background:#f8fafc;">
          ${_sec('Skills', _skillsBar(d.skills, accent2), accent2, 'bar')}
          ${_sec('Education', _edu(d.education), accent2, 'bar')}
          ${_sec('Languages', _langs(d.languages, accent2), accent2, 'bar')}
          ${d.awards ? _sec('Awards', `<p style="font-size:9pt;color:#555;">${d.awards}</p>`, accent2, 'bar') : ''}
        </div>
      </div>
    </div>`;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Public renderer
  // ─────────────────────────────────────────────────────────────────────────

  function renderResume(data, id, opts) {
    const ac = (opts && opts.accent)  || '#4f46e5';
    const fo = (opts && opts.font)    || 'sans-serif';
    const sp = (opts && opts.spacing) || '1.5';
    const fn = opts && opts.applySpell;
    const apply = (html) => (fn ? fn(html) : html);

    switch (id) {
      case 'classic':           return apply(tClassic(data, ac, fo, sp));
      case 'minimal':           return apply(tMinimal(data, ac, fo, sp));
      case 'executive':         return apply(tExecutive(data, ac, fo, sp));
      case 'clean':             return apply(tClean(data, ac, fo, sp));
      case 'bold':              return apply(tBold(data, ac, fo, sp));
      case 'corporate':         return apply(tCorporate(data, ac, fo, sp));
      case 'elegant':           return apply(tElegant(data, ac, fo, sp));
      case 'simple':            return apply(tSimple(data, ac, fo, sp));
      case 'photo_classic':     return apply(tPhotoClassic(data, ac, fo, sp));
      case 'photo_modern':      return apply(tPhotoModern(data, ac, fo, sp));
      case 'photo_minimal':     return apply(tPhotoMinimal(data, ac, fo, sp));
      case 'photo_executive':   return apply(tPhotoExecutive(data, ac, fo, sp));
      case 'modern':            return apply(_doubleCol(data, ac || '#1e3a5f', fo, sp, '#334155', '#fff', false));
      case 'two_col_blue':      return apply(_doubleCol(data, '#3b82f6', fo, sp, '#1e40af', '#fff', false));
      case 'two_col_green':     return apply(_doubleCol(data, '#10b981', fo, sp, '#065f46', '#fff', false));
      case 'two_col_red':       return apply(_doubleCol(data, '#dc2626', fo, sp, '#7f1d1d', '#fff', false));
      case 'two_col_warm':      return apply(_doubleCol(data, '#f59e0b', fo, sp, '#78350f', '#fff', false));
      case 'two_col_light':     return apply(_doubleCol(data, '#475569', fo, sp, '#f1f5f9', '#1e293b', false));
      case 'two_col_photo_blue':  return apply(_doubleCol(data, '#3b82f6', fo, sp, '#1e3a8a', '#fff', true));
      case 'two_col_photo_dark':  return apply(_doubleCol(data, '#64748b', fo, sp, '#0f172a', '#fff', true));
      case 'two_col_photo_green': return apply(_doubleCol(data, '#16a34a', fo, sp, '#14532d', '#fff', true));
      case 'two_col_photo_teal':  return apply(_doubleCol(data, '#0891b2', fo, sp, '#164e63', '#fff', true));
      case 'timeline':          return apply(tTimeline(data, ac, fo, sp));
      case 'infographic':       return apply(tInfographic(data, ac, fo, sp));
      default:                  return apply(tClassic(data, ac, fo, sp));
    }
  }

  global.TEMPLATE_REGISTRY    = REGISTRY;
  global.TEMPLATE_SAMPLE      = SAMPLE;
  global.getTemplateSample    = _getSample;
  global.renderResume         = renderResume;

}(window));
