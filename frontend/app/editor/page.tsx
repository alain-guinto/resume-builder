"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Script from "next/script";

declare global {
  interface Window {
    renderResume?: (data: unknown, templateId: string, opts?: { accent?: string; font?: string; spacing?: string }) => string;
    getTemplateSample?: (id: string) => unknown;
    TEMPLATE_REGISTRY?: Record<string, { name: string; cat: string; hasPhoto: boolean }>;
  }
}

const DEFAULT_DATA = {
  template: "classic",
  contacts: {},
  summary: "",
  experience: [],
  education: [],
  skills: [],
  certifications: "",
  awards: "",
  languages: [],
  additional: "",
};

export default function EditorPage() {
  const [data, setData] = useState<Record<string, unknown>>(DEFAULT_DATA);
  const [template, setTemplate] = useState("classic");
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? sessionStorage.getItem("parsedResume") : null;
    const startBlank = typeof window !== "undefined" ? sessionStorage.getItem("startBlank") : null;
    if (stored && !startBlank) {
      try {
        setData({ ...DEFAULT_DATA, ...JSON.parse(stored) });
      } catch {
        // ignore
      }
    }
  }, []);

  useEffect(() => {
    if (scriptLoaded && typeof window !== "undefined" && window.renderResume) {
      const el = document.getElementById("preview-paper");
      if (el) {
        el.innerHTML = window.renderResume(data, template, {
          accent: "#1e3a5f",
          font: "sans-serif",
          spacing: "1.4",
        });
      }
    }
  }, [data, template, scriptLoaded]);

  return (
    <>
      <Script
        src="/js/resume-templates.js"
        strategy="afterInteractive"
        onLoad={() => setScriptLoaded(true)}
      />
      <div className="flex h-screen flex-col">
        <header className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 py-2">
          <Link href="/templates" className="text-sm font-medium text-slate-600 hover:text-[var(--rf-primary)]">
            ← Back
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold text-green-600">Resume Score: 0%</span>
            <Link
              href="/template-editor"
              className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:border-[var(--rf-primary)] hover:text-[var(--rf-primary)]"
            >
              Change Template
            </Link>
          </div>
        </header>

        <div className="flex flex-1 min-h-0">
          <div className="flex w-1/2 flex-col border-r border-slate-200 bg-white">
            <div className="flex-1 overflow-y-auto p-8">
              <h2 className="mb-4 text-xl font-bold text-slate-800">Resume Editor</h2>
              <p className="mb-6 text-sm text-slate-600">
                Editor form will be implemented with full field support. For now, the preview uses
                your parsed data or sample data.
              </p>
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Template</label>
                  <select
                    value={template}
                    onChange={(e) => setTemplate(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm"
                  >
                    <option value="classic">Classic</option>
                    <option value="modern_simple">Modern Simple</option>
                    <option value="modern_with_photo">Modern with Photo</option>
                    <option value="chronological">Chronological</option>
                    <option value="functional">Functional</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="creative">Creative</option>
                    <option value="simple_ats">Simple ATS</option>
                    <option value="two_col_ats">Two Column ATS</option>
                    <option value="polished">Polished</option>
                    <option value="minimalist">Minimalist</option>
                    <option value="elegant">Elegant</option>
                    <option value="teenager">Teenager</option>
                    <option value="internship">Internship</option>
                    <option value="entry_level">Entry-Level</option>
                    <option value="career_change">Career Change</option>
                  </select>
                </div>
                <Link
                  href="/template-editor"
                  className="inline-block rounded-lg bg-[var(--rf-primary)] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[var(--rf-primary-hover)]"
                >
                  Full Editor →
                </Link>
              </div>
            </div>
          </div>

          <div className="flex w-1/2 flex-col bg-slate-200 p-6">
            <div className="flex flex-1 items-center justify-center overflow-auto">
              <div
                id="preview-paper"
                className="min-h-[842px] w-[595px] bg-white shadow-xl"
                style={{ transform: "scale(0.9)", transformOrigin: "top center" }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
