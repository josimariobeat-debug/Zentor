import React, { useState } from "react";
import { Play, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function AppCard({ app, onUninstall }) {
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <div className="group relative bg-white border border-neutral-200 rounded-2xl p-5 flex items-center gap-5 hover:border-neutral-300 hover:shadow-[0_4px_24px_-12px_rgba(0,0,0,0.12)] transition-all duration-200">
      <button
        onClick={() => navigate(`/app/${app.id}`)}
        className="flex-1 flex items-center gap-5 text-left min-w-0"
      >
        <div className="w-[88px] h-[88px] rounded-2xl bg-neutral-900 text-white flex items-center justify-center shrink-0 group-hover:scale-[1.02] transition-transform">
          <Play className="w-9 h-9 fill-white" strokeWidth={0} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 mb-1.5">
            <h3 className="text-[18px] font-semibold text-neutral-900">{app.name}</h3>
            <span className="text-[10px] font-semibold tracking-wider uppercase bg-neutral-100 text-neutral-700 px-2.5 py-1 rounded-md">
              {app.type}
            </span>
          </div>
          <p className="text-[14px] text-neutral-600 mb-3">{app.description}</p>
          <div className="flex items-center gap-2 text-[12.5px]">
            <span className="text-neutral-500">Assinatura {app.status}</span>
            <span className="text-[10.5px] font-semibold tracking-wider uppercase bg-red-50 text-red-600 px-2.5 py-1 rounded-md border border-red-100">
              Expira em {app.expiresInDays} dias
            </span>
          </div>
        </div>
      </button>

      <button
        onClick={(e) => { e.stopPropagation(); setConfirmOpen(true); }}
        className="w-10 h-10 rounded-xl flex items-center justify-center text-neutral-500 hover:bg-red-50 hover:text-red-600 transition-colors"
        title="Excluir app"
        aria-label="Excluir app"
      >
        <Trash2 className="w-[18px] h-[18px]" strokeWidth={1.75} />
      </button>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir {app.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação remove o app da sua loja e cancela a assinatura. Você poderá reinstalar pela Loja de apps a qualquer momento.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onUninstall?.(app.id)}
              className="bg-red-600 text-white hover:bg-red-700 focus:ring-red-600"
            >
              Excluir app
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
