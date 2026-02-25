import Link from "next/link";

export default function TemplateEditorPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
        <Link
          href="/editor"
          className="text-sm font-medium text-slate-600 hover:text-[var(--rf-primary)]"
        >
          ← Back to editor
        </Link>
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="rounded-lg bg-[var(--rf-primary)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--rf-primary-hover)]"
          >
            Download PDF
          </button>
          <span className="text-sm text-green-600">✔ Saved</span>
        </div>
      </header>

      <div className="flex flex-1 items-center justify-center bg-slate-100 p-12">
        <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
          <h2 className="mb-4 text-xl font-bold text-slate-800">Template Editor</h2>
          <p className="mb-6 text-slate-600">
            Full template editor with design options, spell check, and PDF export. Connects to
            resume-templates.js and Flask export API.
          </p>
          <Link
            href="/editor"
            className="inline-block rounded-lg bg-[var(--rf-primary)] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[var(--rf-primary-hover)]"
          >
            Back to Editor
          </Link>
        </div>
      </div>
    </div>
  );
}
