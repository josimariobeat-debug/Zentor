import React, { useEffect, useState } from "react";
import TopBar from "@/components/layout/TopBar";
import { CreditCard, Calendar } from "lucide-react";
import { api } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

export default function Assinaturas() {
  const [subs, setSubs] = useState(null);
  useEffect(() => { api.get("/subscriptions").then(r => setSubs(r.data)).catch(() => setSubs([])); }, []);
  return (
    <>
      <TopBar title="Assinaturas" />
      <main className="px-10 py-10 fade-in">
        <p className="text-[14px] text-neutral-500 mb-8 max-w-2xl">Gerencie todas as suas assinaturas em um único lugar.</p>

        <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden max-w-4xl">
          <div className="grid grid-cols-12 px-6 py-3 bg-neutral-50 border-b border-neutral-200 text-[12px] font-semibold tracking-wider uppercase text-neutral-500">
            <div className="col-span-4">App</div>
            <div className="col-span-2">Plano</div>
            <div className="col-span-2">Valor</div>
            <div className="col-span-3">Próxima cobrança</div>
            <div className="col-span-1 text-right">Status</div>
          </div>
          {subs === null ? (
            <div className="p-6 space-y-3">{[1,2].map(i => <Skeleton key={i} className="h-10"/>)}</div>
          ) : subs.length === 0 ? (
            <div className="p-10 text-center text-[14px] text-neutral-500">Nenhuma assinatura ativa.</div>
          ) : subs.map((s) => (
            <div key={s.id} className="grid grid-cols-12 px-6 py-5 items-center border-b border-neutral-100 last:border-0 text-[14px]">
              <div className="col-span-4 font-medium text-neutral-900">{s.app}</div>
              <div className="col-span-2 text-neutral-700 flex items-center gap-2"><CreditCard className="w-3.5 h-3.5 text-neutral-400"/>{s.plan}</div>
              <div className="col-span-2 text-neutral-900 font-semibold">{s.price}</div>
              <div className="col-span-3 text-neutral-700 flex items-center gap-2"><Calendar className="w-3.5 h-3.5 text-neutral-400"/>{s.nextBilling}</div>
              <div className="col-span-1 text-right">
                <span className="text-[11px] font-semibold uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md">{s.status}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-neutral-50 border border-neutral-200 rounded-2xl p-6 max-w-4xl">
          <h3 className="text-[15px] font-semibold text-neutral-900">Método de pagamento</h3>
          <p className="text-[13.5px] text-neutral-600 mt-1">Adicione um cartão para não perder suas assinaturas.</p>
        </div>
      </main>
    </>
  );
}
