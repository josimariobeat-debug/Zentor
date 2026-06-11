import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { currentUser } from "@/mock";

export default function TopBar({ title, backTo, breadcrumb, rightSlot }) {
  const navigate = useNavigate();
  return (
    <header className="h-[76px] border-b border-neutral-200 bg-white flex items-center justify-between px-10">
      <div className="flex items-center gap-3 min-w-0">
        {backTo !== undefined && (
          <button
            onClick={() => (backTo ? navigate(backTo) : navigate(-1))}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-neutral-100 transition-colors text-neutral-700"
            aria-label="Voltar"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        <div className="min-w-0">
          {breadcrumb && (
            <div className="text-[12px] text-neutral-500 font-medium leading-none mb-1">
              {breadcrumb}
            </div>
          )}
          <h1 className="text-[26px] font-semibold tracking-tight text-neutral-900 leading-tight truncate">
            {title}
          </h1>
        </div>
      </div>
      <div className="flex items-center gap-4">
        {rightSlot}
        <div className="flex items-center gap-3">
          <span className="text-[14px] font-medium text-neutral-800">{currentUser.name}</span>
          <div className="w-10 h-10 rounded-full bg-neutral-900 text-white flex items-center justify-center text-[12px] font-semibold tracking-wide">
            {currentUser.initials}
          </div>
        </div>
      </div>
    </header>
  );
}
