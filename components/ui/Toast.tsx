// components/ui/Toast.tsx
"use client";

import { useEffect, useState } from "react";

type Props = {
  message: string;
  type?: "success" | "error";
  onClose: () => void;
};

export default function Toast({ message, type = "success", onClose }: Props) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed top-16 left-4 right-4 z-[100] flex items-center gap-3 p-4 rounded-xl shadow-lg transition-all ${
        type === "success"
          ? "bg-emerald-600 text-white"
          : "bg-red-500 text-white"
      }`}
    >
      <span className="material-symbols-outlined text-[20px]">
        {type === "success" ? "check_circle" : "error"}
      </span>
      <p className="text-sm font-semibold flex-1">{message}</p>
      <button onClick={onClose}>
        <span className="material-symbols-outlined text-[18px] opacity-70">
          close
        </span>
      </button>
    </div>
  );
}
