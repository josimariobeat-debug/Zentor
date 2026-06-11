import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel
} from "@/components/ui/dropdown-menu";

export default function TopBar({ title, backTo, breadcrumb, rightSlot }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
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
            <div className="text-[12px] text-neutral-500 font-medium leading-none mb-1">{breadcrumb}</div>
          )}
          <h1 className="text-[26px] font-semibold tracking-tight text-neutral-900 leading-tight truncate">{title}</h1>
        </div>
      </div>
      <div className="flex items-center gap-4">
        {rightSlot}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 outline-none">
              <span className="text-[14px] font-medium text-neutral-800">{user?.name || "—"}</span>
              <div className="w-10 h-10 rounded-full bg-neutral-900 text-white flex items-center justify-center text-[12px] font-semibold tracking-wide">
                {user?.initials || "·"}
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="text-[13px] font-semibold text-neutral-900">{user?.name}</div>
              <div className="text-[12px] text-neutral-500 mt-0.5">{user?.email}</div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/perfil")}>Perfil</DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/assinaturas")}>Assinaturas</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-red-600 focus:text-red-600">
              <LogOut className="w-4 h-4 mr-2" /> Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
