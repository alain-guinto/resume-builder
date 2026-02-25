"use client";

import { useEffect, useState } from "react";
import { UploadModal } from "./UploadModal";

export function LandingClient() {
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const handler = () => setModalOpen(true);
    window.addEventListener("openUploadModal", handler);
    return () => window.removeEventListener("openUploadModal", handler);
  }, []);

  return (
    <>
      <UploadModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}

export function UploadResumeButton() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new CustomEvent("openUploadModal"))}
      className="text-sm font-semibold text-slate-300 underline decoration-slate-500 underline-offset-2 hover:text-white hover:decoration-white"
    >
      Upload existing resume
    </button>
  );
}
