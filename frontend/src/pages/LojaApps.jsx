import React, { useEffect, useState } from "react";
import TopBar from "@/components/layout/TopBar";
import { Play, Check, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

export default function LojaApps() {
  const [apps, setApps] = useState(null);
  const [q, setQ] = useState("");
  const [installing, setInstalling] = useState(null);

  const load = () => api.get("/apps/catalog").then(r => setApps(r.data)).catch(() => setApps([]));
  useEffect(() => { load(); }, []);

  const install = async (id) => {
    setInstalling(id);
    try {
      await api.post(`/apps/install/${id}`);
      toast.success("App instalado com sucesso");
      load();
    } catch (e) {
      toast.error("Não foi possível instalar");
    } finally { setInstalling(null); }
  };

  const filtered = (apps || []).filter((a) =>
    a.name.toLowerCase().includes(q.toLowerCase()) ||
    a.description.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <>
      <TopBar title="Loja de apps" />
      <main className="px-10 py-10 fade-in">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-[18px] font-semibold text-neutral-900">Descubra novos apps</h2>
            <p className="text-[14px] text-neutral-500 mt-1">Amplie as funcionalidades da sua loja com nossos apps oficiais.</p>
          </div>
          <div className="relative w-[280px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar apps…" className="pl-9 h-10 rounded-xl border-neutral-200"/>
          </div>
        </div>

        {apps === null ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-[210px] rounded-2xl"/>)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map((app) => (
              <div key={app.id} className="bg-white border border-neutral-200 rounded-2xl p-5 hover:border-neutral-300 hover:shadow-[0_4px_24px_-12px_rgba(0,0,0,0.1)] transition-all">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 rounded-xl bg-neutral-900 text-white flex items-center justify-center shrink-0">
                    <Play className="w-6 h-6 fill-white" strokeWidth={0} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-[16px] font-semibold text-neutral-900">{app.name}</h3>
                    <span className="inline-block mt-1 text-[10px] font-semibold tracking-wider uppercase bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded">{app.type}</span>
                  </div>
                </div>
                <p className="text-[13.5px] text-neutral-600 mb-5 leading-relaxed min-h-[44px]">{app.description}</p>
                <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
                  <span className="text-[14px] font-semibold text-neutral-900">{app.price}</span>
                  {app.installed ? (
                    <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg"><Check className="w-3.5 h-3.5" /> Instalado</span>
                  ) : (
                    <button onClick={() => install(app.id)} disabled={installing===app.id} className="text-[13px] font-medium text-white bg-neutral-900 hover:bg-neutral-800 disabled:opacity-60 px-4 py-2 rounded-lg transition-colors">
                      {installing===app.id ? "Instalando…" : "Instalar"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
