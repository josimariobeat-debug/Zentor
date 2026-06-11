import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutGrid,
  Store,
  GraduationCap,
  MessageSquare,
  CreditCard,
  User,
  Megaphone,
  MessageCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const iconMap = {
  LayoutGrid,
  Store,
  GraduationCap,
  MessageSquare,
  CreditCard,
  User,
};

const items = [
  { key: "meus-apps", label: "Meus apps", icon: "LayoutGrid", path: "/" },
  { key: "loja", label: "Loja de apps", icon: "Store", path: "/loja" },
  { key: "tutoriais", label: "Tutoriais", icon: "GraduationCap", path: "/tutoriais" },
  { key: "assinaturas", label: "Assinaturas", icon: "CreditCard", path: "/assinaturas" },
  { key: "perfil", label: "Perfil", icon: "User", path: "/perfil" },
];

export default function Sidebar() {
  const location = useLocation();
  const isMeusApps = location.pathname === "/" || location.pathname.startsWith("/app/");

  return (
    <aside className="w-[260px] shrink-0 border-r border-neutral-200 bg-white flex flex-col h-screen sticky top-0">
      {/* Brand */}
      <div className="px-6 pt-7 pb-8">
        <div className="flex items-baseline gap-2">
          <span className="text-[26px] font-bold tracking-tight text-neutral-900">Zentor</span>
          <span className="text-[10px] font-medium tracking-[0.15em] text-neutral-500 uppercase">
            Sites &amp; Ferramentas
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="px-3 flex-1 space-y-1">
        {items.map((item) => {
          const Icon = iconMap[item.icon];
          const active = item.path === "/" ? isMeusApps : location.pathname.startsWith(item.path);
          return (
            <NavLink
              key={item.key}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14px] font-medium transition-colors duration-150",
                active
                  ? "bg-neutral-900 text-white shadow-sm"
                  : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
              )}
            >
              <Icon className="w-[18px] h-[18px]" strokeWidth={1.75} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer actions */}
      <div className="p-4 space-y-2.5">
        <button className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14px] font-medium text-neutral-700 border border-neutral-200 bg-white hover:bg-neutral-50 transition-colors">
          <Megaphone className="w-[18px] h-[18px]" strokeWidth={1.75} />
          Novidades
        </button>
        <button className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14px] font-medium text-white bg-neutral-900 hover:bg-neutral-800 transition-colors">
          <MessageCircle className="w-[18px] h-[18px]" strokeWidth={1.75} />
          Entre em contato
        </button>
      </div>
    </aside>
  );
}
