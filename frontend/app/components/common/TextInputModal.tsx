"use client";

import { useEffect, useRef } from "react";

interface TextInputModalProps {
  open: boolean;
  title: string;
  label: string;
  value: string;
  placeholder?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isSubmitting?: boolean;
  onChange: (value: string) => void;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
}

export default function TextInputModal({
  open,
  title,
  label,
  value,
  placeholder,
  confirmLabel = "Create",
  cancelLabel = "Cancel",
  isSubmitting = false,
  onChange,
  onCancel,
  onConfirm,
}: TextInputModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;

    const timer = setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 0);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCancel();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onCancel]);

  if (!open) {
    return null;
  }

  const disableConfirm = isSubmitting || !value.trim();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1f1738]/35 px-4 backdrop-blur-[2px]"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-[#e7e2f4] bg-[#f9f8fd] p-5 shadow-[0_18px_48px_rgba(39,24,83,0.22)]"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-[#27223f]">{title}</h2>

        <label className="mt-4 block text-sm font-medium text-[#61597d]">
          {label}
        </label>
        <input
          ref={inputRef}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !disableConfirm) {
              void onConfirm();
            }
          }}
          placeholder={placeholder}
          className="mt-2 w-full rounded-xl border border-[#d7d0eb] bg-white px-3 py-2.5 text-sm text-[#2b2542] outline-none transition focus:border-[#8b6df0] focus:ring-2 focus:ring-[#8b6df0]/20"
        />

        <div className="mt-5 flex justify-end gap-2.5">
          <button
            onClick={onCancel}
            disabled={isSubmitting}
            className="rounded-xl border border-[#ddd5ef] bg-white px-4 py-2 text-sm font-medium text-[#5c5575] transition hover:bg-[#f3effa] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          <button
            onClick={() => void onConfirm()}
            disabled={disableConfirm}
            className="rounded-xl bg-[#6f4de0] px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(87,57,195,0.32)] transition hover:bg-[#6643dd] disabled:cursor-not-allowed disabled:bg-[#bbaee7] disabled:shadow-none"
          >
            {isSubmitting ? "Saving..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
