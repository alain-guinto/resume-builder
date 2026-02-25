import Link from "next/link";

export default function TemplatesPage() {
  return (
    <>
      <nav
        className="sticky top-0 z-[100] flex items-center justify-between bg-cyan-900 px-8 py-4"
        role="navigation"
        aria-label="Main navigation"
      >
        <Link href="/" className="flex items-center gap-2 font-bold text-white">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--rf-primary)]">
            <DocumentIcon className="h-4 w-4" />
          </div>
          ResumeForge
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-slate-400 hover:text-white">
            Sign In
          </Link>
          <Link
            href="/templates"
            className="rounded-md bg-[var(--rf-primary)] px-4 py-2 text-sm font-semibold text-white"
          >
            Build My Resume
          </Link>
        </div>
      </nav>

      <div className="border-b border-slate-200 bg-white px-8 py-10 text-center">
        <h1 className="mb-2 text-3xl font-extrabold text-slate-900">
          Choose from our resume templates
        </h1>
        <p className="text-slate-600">You can always change your template later.</p>
      </div>

      <div className="flex min-h-[60vh] items-center justify-center bg-slate-50 p-8">
        <div className="text-center">
          <p className="mb-6 text-slate-600">
            Template gallery with filters — full implementation connects to resume-templates.js.
          </p>
          <Link
            href="/editor"
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--rf-primary)] px-6 py-3 font-semibold text-white hover:bg-[var(--rf-primary-hover)]"
          >
            <DocumentIcon className="h-5 w-5" />
            Go to Editor
          </Link>
        </div>
      </div>
    </>
  );
}

function DocumentIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}
