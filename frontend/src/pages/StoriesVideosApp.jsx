import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TopBar from "@/components/layout/TopBar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import {
  Search,
  Plus,
  Settings2,
  Edit2,
  Trash2,
  Eye,
  Play,
} from "lucide-react";
import { toast } from "sonner";

const TABS = [
  { value: "stories", label: "Stories" },
  { value: "midias", label: "Mídias" },
  { value: "aparencia", label: "Aparência" },
  { value: "dashboard", label: "Dashboard" },
  { value: "produtos", label: "Produtos" },
  { value: "medidas", label: "Medidas" },
  { value: "comentarios", label: "Comentários" },
  { value: "config", label: "Configurações" },
  { value: "integracao", label: "Integração" },
];

export default function StoriesVideosApp() {
  const navigate = useNavigate();
  const { appId } = useParams();
  const [stories, setStories] = useState(null);
  const [search, setSearch] = useState("");
  const [widget, setWidget] = useState(true);
  const [carrossel, setCarrossel] = useState(false);

  const load = () =>
    api.get(`/stories`, { params: { app_id: appId } })
      .then(r => setStories(r.data))
      .catch(() => setStories([]));

  useEffect(() => { load(); }, [appId]);

  const filtered = (stories || []).filter((s) => s.title.toLowerCase().includes(search.toLowerCase()));

  const remove = async (id) => {
    try {
      await api.delete(`/stories/${id}`);
      toast.success("Story removido");
      setStories((s) => s.filter((x) => x.id !== id));
    } catch { toast.error("Falha ao remover"); }
  };
  const toggle = async (id) => {
    try {
      const r = await api.patch(`/stories/${id}/toggle`);
      setStories((s) => s.map((x) => (x.id === id ? { ...x, active: r.data.active } : x)));
    } catch { toast.error("Falha ao alterar"); }
  };

  return (
    <>
      <TopBar
        title="Stories Vídeos"
        breadcrumb="Meus apps"
        backTo="/"
      />
      <main className="px-10 py-8 fade-in">
        <Tabs defaultValue="stories">
          <TabsList className="flex w-full justify-start gap-7 bg-transparent p-0 mb-9 border-b border-neutral-200 rounded-none h-auto overflow-x-auto">
            {TABS.map((t) => (
              <TabsTrigger
                key={t.value}
                value={t.value}
                className="px-0 pb-3 pt-1 text-[14px] font-medium text-neutral-400 hover:text-neutral-700 data-[state=active]:text-neutral-900 data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-neutral-900 rounded-none transition-colors -mb-px"
              >
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Stories tab */}
          <TabsContent value="stories" className="mt-0">
            <div className="flex items-center gap-8 mb-7">
              <div className="flex items-center gap-2.5">
                <Switch checked={widget} onCheckedChange={(v) => { setWidget(v); if (v) setCarrossel(false); }} />
                <label className="text-[14px] font-medium text-neutral-700">Widget Flutuante</label>
              </div>
              <div className="flex items-center gap-2.5">
                <Switch checked={carrossel} onCheckedChange={(v) => { setCarrossel(v); if (v) setWidget(false); }} />
                <label className="text-[14px] font-medium text-neutral-700">Carrossel</label>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="relative w-[300px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar stories…"
                  className="pl-9 h-10 rounded-xl border-neutral-200"
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toast.message("Configurar Aparência", { description: "Em breve você editará cores e formato do widget." })}
                  className="inline-flex items-center gap-2 text-[13.5px] font-medium text-neutral-700 border border-neutral-200 hover:bg-neutral-50 px-4 py-2.5 rounded-xl transition-colors"
                >
                  <Settings2 className="w-4 h-4" /> Configurar Aparência
                </button>
                <button
                  onClick={() => navigate(`/app/${appId}/story/novo`)}
                  className="inline-flex items-center gap-2 text-[13.5px] font-medium text-white bg-neutral-900 hover:bg-neutral-800 px-4 py-2.5 rounded-xl transition-colors"
                >
                  <Plus className="w-4 h-4" /> Adicionar
                </button>
              </div>
            </div>

            {stories === null ? (
              <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-[92px] rounded-2xl"/>)}</div>
            ) : filtered.length === 0 ? (
              <div className="border border-dashed border-neutral-300 rounded-2xl p-16 text-center text-neutral-500">
                Nenhum story criado ainda. Clique em <b className="text-neutral-700">Adicionar</b> para criar o primeiro.
              </div>
            ) : (
              <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden">
                {filtered.map((s, idx) => (
                  <div
                    key={s.id}
                    className={`flex items-center gap-4 px-5 py-4 ${idx !== filtered.length - 1 ? "border-b border-neutral-100" : ""}`}
                  >
                    <div className="w-14 h-20 rounded-lg overflow-hidden bg-neutral-100 relative shrink-0">
                      {s.thumbnail ? (
                        <>
                          <img src={s.thumbnail} alt="" className="w-full h-full object-cover"/>
                          {(s.media?.[0]?.type === "video" || s.media?.find(m=>m.cover)?.type === "video") && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/15">
                              <div className="w-7 h-7 rounded-full bg-white/95 flex items-center justify-center">
                                <Play className="w-3.5 h-3.5 fill-neutral-900 ml-0.5" strokeWidth={0}/>
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Play className="w-5 h-5 fill-neutral-400 text-neutral-400" strokeWidth={0}/>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[14.5px] font-semibold text-neutral-900">{s.title}</h4>
                      <div className="flex items-center gap-3 mt-1 text-[12.5px] text-neutral-500">
                        <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5"/> {(s.views||0).toLocaleString("pt-BR")} visualizações</span>
                        {s.format && <span className="uppercase tracking-wider font-semibold text-[10px] bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded">{s.format}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch checked={s.active} onCheckedChange={() => toggle(s.id)} />
                      <button onClick={() => navigate(`/app/${appId}/story/${s.id}`)} className="w-9 h-9 rounded-lg hover:bg-neutral-100 flex items-center justify-center text-neutral-700 transition-colors"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => remove(s.id)} className="w-9 h-9 rounded-lg hover:bg-red-50 hover:text-red-600 flex items-center justify-center text-neutral-700 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {TABS.filter(t => t.value !== "stories").map((t) => (
            <TabsContent key={t.value} value={t.value} className="mt-0">
              <PlaceholderTab label={t.label} />
            </TabsContent>
          ))}
        </Tabs>
      </main>
    </>
  );
}

function PlaceholderTab({ label }) {
  return (
    <div className="bg-white border border-neutral-200 rounded-2xl p-16 text-center">
      <h3 className="text-[16px] font-semibold text-neutral-900">{label}</h3>
      <p className="text-[14px] text-neutral-500 mt-1">Esta seção será personalizada para o seu fluxo.</p>
    </div>
  );
}
