"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { parseResume } from "@/lib/api";

interface UploadModalProps {
  open?: boolean;
  onClose?: () => void;
}

export function UploadModal({ open: controlledOpen = false, onClose }: UploadModalProps = {}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen || internalOpen;
  const closeModal = useCallback(() => {
    onClose?.();
    setInternalOpen(false);
    setUploading(false);
    setProgress(0);
    setStatus("");
  }, [onClose]);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    if (open) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [open, closeModal]);

  const handleSkip = useCallback(() => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("startBlank", "1");
      sessionStorage.removeItem("parsedResume");
    }
    router.push("/editor");
  }, [router]);

  const handleFile = useCallback(
    async (file: File) => {
      const allowed = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/msword",
      ];
      if (!allowed.includes(file.type) && !/\.(pdf|docx|doc)$/i.test(file.name)) {
        setStatus("Please upload a PDF or DOCX file.");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setStatus("File is too large. Max size is 10 MB.");
        return;
      }

      setUploading(true);
      setProgress(10);
      setStatus(`Uploading ${file.name}…`);

      try {
        setProgress(40);
        setStatus("Reading your resume…");
        const parsed = await parseResume(file);

        setProgress(80);
        setStatus("Extracting information…");

        const name = parsed.contacts?.name || parsed.contacts?.firstName || "";
        const expCount = (parsed.experience || []).length;
        const eduCount = (parsed.education || []).length;
        const skillCount = (parsed.skills || []).length;

        const summary = [
          name && `Name: ${name}`,
          expCount && `${expCount} job(s)`,
          eduCount && `${eduCount} education entry(ies)`,
          skillCount && `${skillCount} skill(s)`,
        ]
          .filter(Boolean)
          .join(" · ");

        setProgress(100);
        setStatus(summary ? `Found: ${summary}. Opening editor…` : "Parsing complete. Opening editor…");

        if (typeof window !== "undefined") {
          sessionStorage.setItem("parsedResume", JSON.stringify(parsed));
          sessionStorage.removeItem("startBlank");
        }

        await new Promise((r) => setTimeout(r, 800));
        router.push("/editor");
      } catch (err) {
        console.error("[upload] parse error:", err);
        setStatus(
          `Could not read the file (${err instanceof Error ? err.message : "unknown error"}). Starting with a blank resume instead.`
        );
        await new Promise((r) => setTimeout(r, 2500));
        if (typeof window !== "undefined") {
          sessionStorage.removeItem("parsedResume");
          sessionStorage.setItem("startBlank", "1");
        }
        router.push("/editor");
      }
    },
    [router]
  );

  if (!open) return null;

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && closeModal()}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-modal-title"
      aria-hidden="false"
    >
      <div className="w-full max-w-[480px] animate-in rounded-2xl bg-white p-10 shadow-2xl">
        <button
          type="button"
          onClick={closeModal}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200"
          aria-label="Close upload modal"
        >
          ✕
        </button>
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--rf-primary-light)] text-2xl">
            📄
          </div>
          <h2 id="upload-modal-title" className="text-xl font-extrabold text-[var(--rf-dark)]">
            Start Your Resume
          </h2>
          <p className="mt-1 text-sm text-[var(--rf-muted)] leading-relaxed">
            Upload your existing resume and we&apos;ll auto-fill your details, or start fresh from
            scratch.
          </p>
        </div>

        <div
          className={`mt-7 cursor-pointer rounded-2xl border-2 border-dashed p-9 text-center transition-colors ${
            dragOver ? "border-[var(--rf-primary)] bg-[var(--rf-primary-light)]" : "border-[var(--rf-border)] bg-[var(--rf-bg)] hover:border-[var(--rf-primary)] hover:bg-[var(--rf-primary-light)]"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const f = e.dataTransfer.files[0];
            if (f) handleFile(f);
          }}
          onClick={() => document.getElementById("upload-file-input")?.click()}
        >
          <input
            id="upload-file-input"
            type="file"
            accept=".pdf,.docx,.doc"
            className="hidden"
            aria-label="Upload resume file (PDF or DOCX, max 10 MB)"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
              e.target.value = "";
            }}
          />
          {!uploading ? (
            <>
              <div className="mb-2 text-3xl">☁️</div>
              <div className="mb-1 text-sm font-semibold text-[var(--rf-dark)]">
                Drag & drop your resume here
              </div>
              <p className="text-xs text-[var(--rf-muted)]">
                or <span className="font-semibold text-[var(--rf-primary)]">click to browse</span> · PDF or DOCX · Max 10 MB
              </p>
            </>
          ) : (
            <div className="mt-2">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--rf-border)]">
                <div
                  className="h-full rounded-full bg-[var(--rf-primary)] transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="mt-1.5 text-xs text-[var(--rf-muted)]">{status}</div>
            </div>
          )}
        </div>

        <div className="my-5 flex items-center gap-3 text-sm text-[var(--rf-muted)]">
          <div className="h-px flex-1 bg-[var(--rf-border)]" />
          or
          <div className="h-px flex-1 bg-[var(--rf-border)]" />
        </div>

        <button
          type="button"
          onClick={handleSkip}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--rf-border)] bg-white py-3 text-sm font-semibold text-[var(--rf-muted)] transition-colors hover:border-[var(--rf-primary)] hover:text-[var(--rf-primary)]"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
          Start with a blank resume
        </button>
      </div>
    </div>
  );
}
