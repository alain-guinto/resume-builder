// Use relative URLs so Next.js rewrites proxy to Flask
const API_BASE = "";

export interface ResumeData {
  template?: string;
  contacts?: Record<string, string>;
  summary?: string;
  experience?: Array<Record<string, string>>;
  education?: Array<Record<string, string>>;
  skills?: string[];
  certifications?: string;
  awards?: string;
  languages?: Array<{ name: string; level?: number }>;
  additional?: string;
  [key: string]: unknown;
}

export async function parseResume(file: File): Promise<ResumeData> {
  const form = new FormData();
  form.append("resume", file);
  const res = await fetch(`${API_BASE}/api/parse-resume`, {
    method: "POST",
    body: form,
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.text().catch(() => `Server error (${res.status})`);
    throw new Error(err);
  }
  return res.json();
}

export async function saveResume(data: ResumeData, resumeId?: number): Promise<{ success: boolean }> {
  const url = resumeId ? `${API_BASE}/api/resume?resume_id=${resumeId}` : `${API_BASE}/api/resume`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to save resume");
  return res.json();
}

export async function getResume(resumeId?: number): Promise<ResumeData> {
  const url = resumeId ? `${API_BASE}/api/resume?resume_id=${resumeId}` : `${API_BASE}/api/resume`;
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to load resume");
  return res.json();
}

export async function exportPdf(data: ResumeData): Promise<Blob> {
  const res = await fetch(`${API_BASE}/api/export/pdf`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to export PDF");
  return res.blob();
}

export async function exportDocx(data: ResumeData): Promise<Blob> {
  const res = await fetch(`${API_BASE}/api/export/docx`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to export DOCX");
  return res.blob();
}
