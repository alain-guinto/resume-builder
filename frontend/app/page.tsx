import Link from "next/link";
import { LandingClient, UploadResumeButton } from "@/components/LandingClient";

export default function Home() {
  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <nav
        className="fixed top-0 left-0 right-0 z-[100] flex h-[60px] items-center justify-between gap-4 border-b border-slate-200/80 bg-white/92 px-8 backdrop-blur-xl"
        role="navigation"
        aria-label="Main navigation"
      >
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-[var(--rf-primary)]">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--rf-primary)] text-white">
            <DocumentIcon className="h-[18px] w-[18px]" />
          </div>
          ResumeForge
        </Link>
        <div className="flex items-center gap-7 text-sm font-medium text-[var(--rf-muted)]">
          <a href="#how-it-works" className="hover:text-[var(--rf-primary)]">
            How it works
          </a>
          <a href="#features" className="hover:text-[var(--rf-primary)]">
            Features
          </a>
          <a href="#templates" className="hover:text-[var(--rf-primary)]">
            Templates
          </a>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-lg border border-[var(--rf-border)] bg-white px-4 py-2 text-sm font-medium text-[var(--rf-muted)] transition-colors hover:border-[var(--rf-primary)] hover:text-[var(--rf-primary)]"
          >
            Sign In
          </Link>
          <Link
            href="/templates"
            className="rounded-lg bg-[var(--rf-primary)] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--rf-primary-hover)]"
          >
            Build My Resume
          </Link>
        </div>
      </nav>

      <main id="main-content">
        <section
          className="relative flex min-h-screen items-center overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#0c4a6e] to-[#0369a1] px-8 pt-20 pb-12"
          id="hero"
          aria-labelledby="hero-title"
        >
          <div className="relative mx-auto grid w-full max-w-[1200px] grid-cols-1 gap-16 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-sky-400/40 bg-sky-500/25 px-3 py-1.5 text-xs font-semibold tracking-wide text-sky-200">
                <StarIcon className="h-3 w-3" />
                Trusted by 2M+ professionals
              </div>
              <h1
                className="mb-5 text-[clamp(2rem,4vw,3.2rem)] font-extrabold leading-tight tracking-tight text-white"
                id="hero-title"
              >
                A resume that
                <br />
                <span className="bg-gradient-to-r from-sky-400 to-teal-400 bg-clip-text text-transparent">
                  gets you hired faster
                </span>
              </h1>
              <p className="mb-8 max-w-[480px] text-base leading-relaxed text-slate-400">
                Build an ATS-optimized, recruiter-ready resume in minutes. Choose from professional
                templates, fill in your details, and download instantly.
              </p>
              <div className="flex max-w-[400px] flex-col gap-4">
                <Link
                  href="/templates"
                  className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-teal-600 to-teal-700 px-8 py-3.5 text-base font-bold text-white shadow-lg shadow-teal-500/35 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-teal-500/45"
                >
                  <DocumentIcon className="h-5 w-5" />
                  Build My Resume — It&apos;s Free
                </Link>
                <div className="flex flex-col items-center gap-2">
                  <UploadResumeButton />
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-500">
                  <div className="h-px flex-1 bg-white/10" />
                  or continue with
                  <div className="h-px flex-1 bg-white/10" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    href="/login"
                    className="flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-200 transition-colors hover:border-white/25 hover:bg-white/10"
                  >
                    <GoogleIcon />
                    Sign in with Google
                  </Link>
                  <Link
                    href="/login"
                    className="flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-200 transition-colors hover:border-white/25 hover:bg-white/10"
                  >
                    <FacebookIcon />
                    Sign in with Facebook
                  </Link>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <div className="flex -space-x-1.5">
                    {["A", "J", "M", "S"].map((l) => (
                      <div
                        key={l}
                        className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-cyan-900 bg-gradient-to-br from-sky-400 to-teal-400 text-[9px] font-bold text-white"
                      >
                        {l}
                      </div>
                    ))}
                  </div>
                  <span>
                    Join <strong className="text-slate-300">2M+</strong> job seekers building their
                    resume today
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute -left-8 -top-4 rotate-[4deg] rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-slate-900 shadow-xl">
                  <span className="mr-1.5 inline-block h-2.5 w-2.5 rounded-full bg-green-600" />
                  ATS Score: 98%
                </div>
                <div className="animate-float w-80 rounded-2xl bg-white p-6 shadow-2xl shadow-black/50">
                  <div className="rounded-xl overflow-hidden">
                    <div className="flex items-center gap-3 bg-gradient-to-br from-sky-600 to-sky-500 px-5 py-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white/50 bg-white/30 text-base">
                        👤
                      </div>
                      <div className="flex-1">
                        <div className="mb-1 h-2 w-4/5 rounded bg-white/90" />
                        <div className="h-1.5 w-[55%] rounded bg-white/50" />
                      </div>
                      <div className="rounded-full bg-teal-600 px-2 py-0.5 text-[10px] font-bold text-white">
                        100%
                      </div>
                    </div>
                    <div className="space-y-1.5 px-5 py-3">
                      <div className="h-1 w-2/5 rounded bg-[var(--rf-primary)]" />
                      <div className="h-1 w-full rounded bg-slate-200" />
                      <div className="h-1 w-[90%] rounded bg-slate-200" />
                      <div className="h-1 w-3/4 rounded bg-slate-200" />
                      <div className="h-2.5" />
                      <div className="h-1 w-2/5 rounded bg-[var(--rf-primary)]" />
                      <div className="flex gap-2">
                        <div className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-[var(--rf-primary)]" />
                        <div className="flex-1 space-y-1">
                          <div className="h-1 w-4/5 rounded bg-slate-200" />
                          <div className="h-1 w-3/5 rounded bg-slate-200" />
                          <div className="h-1 w-[90%] rounded bg-slate-200" />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <div className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-[var(--rf-primary)]" />
                        <div className="flex-1 space-y-1">
                          <div className="h-1 w-3/4 rounded bg-slate-200" />
                          <div className="h-1 w-3/5 rounded bg-slate-200" />
                          <div className="h-1 w-4/5 rounded bg-slate-200" />
                        </div>
                      </div>
                      <div className="flex gap-1 flex-wrap">
                        {[70, 55, 80, 60].map((w) => (
                          <div
                            key={w}
                            className="h-[18px] rounded-full bg-indigo-100"
                            style={{ width: w }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-2 -right-8 -rotate-[3deg] rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-slate-900 shadow-xl">
                  <CheckIcon className="mr-1.5 inline h-3.5 w-3.5 text-green-600" />
                  Interview Ready!
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="bg-[var(--rf-primary)] px-8 py-6">
          <div className="mx-auto grid max-w-[1200px] grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { num: "2M+", label: "Resumes Created" },
              { num: "3×", label: "More Interviews" },
              { num: "4.9★", label: "Average Rating" },
              { num: "50+", label: "Templates" },
            ].map(({ num, label }) => (
              <div key={label} className="text-center text-white">
                <span className="block text-2xl font-extrabold tracking-tight">{num}</span>
                <span className="mt-0.5 block text-sm text-white/70">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <section className="px-8 py-20" id="how-it-works">
          <div className="mx-auto max-w-[1200px]">
            <div className="mb-12 text-center">
              <span className="mb-3 inline-block rounded-full bg-[var(--rf-primary-light)] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[var(--rf-primary)]">
                Simple Process
              </span>
              <h2 className="mb-3 text-[clamp(1.6rem,3vw,2.25rem)] font-extrabold tracking-tight text-[var(--rf-dark)]">
                From blank page to hired — in 3 steps
              </h2>
              <p className="mx-auto max-w-[540px] text-base text-[var(--rf-muted)] leading-relaxed">
                Our guided builder walks you through every section so you never get stuck staring at
                an empty page.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              {[
                {
                  n: 1,
                  title: "Upload or Start Fresh",
                  desc: "Already have a resume? Upload your PDF or DOCX and we'll auto-fill all your details. Or start from scratch in seconds.",
                },
                {
                  n: 2,
                  title: "Fill & Choose a Template",
                  desc: "Add your experience, skills and education with our guided editor. Pick from professional templates — classic, modern or minimal.",
                },
                {
                  n: 3,
                  title: "Download & Apply",
                  desc: "Export your polished resume as a PDF or DOCX instantly. ATS-optimized so it passes automated screening systems.",
                },
              ].map(({ n, title, desc }) => (
                <div
                  key={n}
                  className="rounded-2xl border border-[var(--rf-border)] bg-white p-8 text-center shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-sky-500/10"
                >
                  <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--rf-primary)] text-white font-extrabold shadow-lg shadow-sky-500/35">
                    {n}
                  </div>
                  <h3 className="mb-2 text-base font-bold text-[var(--rf-dark)]">{title}</h3>
                  <p className="text-sm text-[var(--rf-muted)] leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[var(--rf-bg)] px-8 py-20" id="features">
          <div className="mx-auto max-w-[1200px]">
            <span className="mb-3 inline-block rounded-full bg-[var(--rf-primary-light)] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[var(--rf-primary)]">
              Why ResumeForge
            </span>
            <h2 className="mb-3 text-[clamp(1.6rem,3vw,2.25rem)] font-extrabold tracking-tight text-[var(--rf-dark)]">
              Everything you need to land the interview
            </h2>
            <p className="mb-12 text-base text-[var(--rf-muted)]">
              Built for job seekers who want results, not headaches.
            </p>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: "🎯", title: "ATS-Optimized", desc: "All templates are built to pass Applicant Tracking Systems so your resume actually reaches human eyes." },
                { icon: "✨", title: "Professional Templates", desc: "Classic, modern, and minimal designs crafted by professional resume writers and UX designers." },
                { icon: "⚡", title: "Instant Download", desc: "Export as PDF or DOCX in a single click. Pixel-perfect formatting that looks identical on any device." },
                { icon: "💡", title: "Built-in Spell Check", desc: "Integrated spell check and writing tips highlight errors and suggest improvements as you type." },
              ].map(({ icon, title, desc }) => (
                <div
                  key={title}
                  className="rounded-2xl border border-[var(--rf-border)] bg-white p-7 transition-all hover:border-[var(--rf-primary)] hover:shadow-lg hover:shadow-sky-500/10"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--rf-primary-light)] text-2xl">
                    {icon}
                  </div>
                  <h3 className="mb-1.5 text-base font-bold text-[var(--rf-dark)]">{title}</h3>
                  <p className="text-sm text-[var(--rf-muted)] leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-8 py-20" id="templates">
          <div className="mx-auto max-w-[1200px]">
            <div className="mb-10 text-center">
              <span className="mb-3 inline-block rounded-full bg-[var(--rf-primary-light)] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[var(--rf-primary)]">
                Templates
              </span>
              <h2 className="mb-3 text-[clamp(1.6rem,3vw,2.25rem)] font-extrabold tracking-tight text-[var(--rf-dark)]">
                Choose your resume style
              </h2>
              <p className="mx-auto max-w-[540px] text-base text-[var(--rf-muted)] leading-relaxed">
                16 professionally designed templates — single column, two-column, with or without
                photo.
              </p>
            </div>
            <div className="mt-10 text-center">
              <Link
                href="/templates"
                className="inline-flex items-center gap-2 rounded-full border-2 border-[var(--rf-primary)] bg-white px-8 py-3 text-sm font-bold text-[var(--rf-primary)] transition-all hover:bg-[var(--rf-primary)] hover:text-white hover:shadow-lg hover:shadow-sky-500/30"
              >
                <MenuIcon className="h-4 w-4" />
                View All 16 Templates
              </Link>
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-br from-[#0f172a] to-[#1e1b4b] px-8 py-24 text-center">
          <div className="relative mx-auto max-w-[600px]">
            <h2 className="mb-4 text-[clamp(1.8rem,4vw,2.75rem)] font-extrabold tracking-tight text-white">
              Ready to land your dream job?
            </h2>
            <p className="mb-10 text-base leading-relaxed text-slate-400">
              Join over 2 million professionals who built their interview-winning resume with
              ResumeForge. It&apos;s completely free to get started.
            </p>
            <Link
              href="/templates"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-teal-600 to-teal-700 px-10 py-4 text-lg font-bold text-white shadow-lg shadow-teal-500/35 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-teal-500/45"
            >
              <DocumentIcon className="h-5 w-5" />
              Create My Free Resume
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-[#0f172a] px-8 py-8">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-bold text-white">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[var(--rf-primary)] text-xs text-white">
              <DocumentIcon className="h-3 w-3" />
            </div>
            ResumeForge
          </div>
          <div className="flex gap-6 text-sm text-slate-500">
            <a href="#how-it-works" className="hover:text-slate-400">
              How it works
            </a>
            <a href="#features" className="hover:text-slate-400">
              Features
            </a>
            <a href="#templates" className="hover:text-slate-400">
              Templates
            </a>
          </div>
          <div className="text-sm text-slate-600">© 2026 ResumeForge. All rights reserved.</div>
        </div>
      </footer>

      <LandingClient />
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
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="#a5b4fc" stroke="none">
      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="#1877F2">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}
