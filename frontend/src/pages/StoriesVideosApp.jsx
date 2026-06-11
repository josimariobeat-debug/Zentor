import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TopBar from "@/components/layout/TopBar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { sampleStories } from "@/mock";
import {
  Search,
  Plus,
  Settings2,
  Edit2,
  Trash2,
  Eye,
  Play,
  Image as ImageIcon,
  LayoutDashboard,
  ShoppingBag,
  Ruler,
  MessageSquare,
  Settings,
  Link as LinkIcon,
  Palette,
  Film,
} from "lucide-react";
import { toast } from "sonner";

const TABS = [
  { value: "stories", label: "Stories", icon: Film },
  { value: "midias", label: "Mídias", icon: ImageIcon },
  { value: "aparencia", label: "Aparência", icon: Palette },
  { value: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { value: "produtos", label: "Produtos", icon: ShoppingBag },
  { value: "medidas", label: "Medidas", icon: Ruler },
  { value: "comentarios", label: "Comentários", icon: MessageSquare },
  { value: "config", label: "Configurações", icon: Settings },
  { value: "integracao", label: "Integração", icon: LinkIcon },
];

export default function StoriesVideosApp() {
  const navigate = useNavigate();
  const { appId } = useParams();
  const [stories, setStories] = useState(sampleStories);
  const [search, setSearch] = useState("");
  const [widget, setWidget] = useState(true);
  const [carrossel, setCarrossel] = useState(false);

  const filtered = stories.filter((s) => s.title.toLowerCase().includes(search.toLowerCase()));

  const remove = (id) => {
    setStories((s) => s.filter((x) => x.id !== id));
    toast.success("Story removido");
  };
  const toggle = (id) => setStories((s) => s.map((x) => (x.id === id ? { ...x, active: !x.active } : x)));

  return (
    <>
      <TopBar
        title="Stories Vídeos"
        breadcrumb="Meus apps"
        backTo="/"
      />
      <main className="px-10 py-8 fade-in">
        <Tabs defaultValue="stories">
          <TabsList className="flex w-full justify-start gap-1 bg-transparent p-0 mb-8 border-b border-neutral-200 rounded-none h-auto overflow-x-auto">
            {TABS.map((t) => {
              const Icon = t.icon;
              return (
                <TabsTrigger
                  key={t.value}
                  value={t.value}
                  className="flex items-center gap-2 px-4 py-3 text-[13.5px] font-medium text-neutral-500 data-[state=active]:text-neutral-900 data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-neutral-900 rounded-none transition-colors"
                >
                  <Icon className="w-4 h-4" strokeWidth={1.75} />
                  {t.label}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Stories tab */}
          <TabsContent value="stories" className="mt-0">
            <div className="flex items-center gap-8 mb-7">
              <div className="flex items-center gap-2.5">
                <Switch checked={widget} onCheckedChange={setWidget} />
                <label className="text-[14px] font-medium text-neutral-700">Widget Flutuante</label>
              </div>
              <div className="flex items-center gap-2.5">
                <Switch checked={carrossel} onCheckedChange={setCarrossel} />
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

            {filtered.length === 0 ? (
              <div className="border border-dashed border-neutral-300 rounded-2xl p-16 text-center text-neutral-500">
                Nenhum story encontrado.
              </div>
            ) : (
              <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden">
                {filtered.map((s, idx) => (
                  <div
                    key={s.id}
                    className={`flex items-center gap-4 px-5 py-4 ${idx !== filtered.length - 1 ? "border-b border-neutral-100" : ""}`}
                  >
                    <div className="w-14 h-20 rounded-lg overflow-hidden bg-neutral-100 relative shrink-0">
                      <img src={s.thumbnail} alt="" className="w-full h-full object-cover" />
                      {s.format === "video" && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                          <Play className="w-5 h-5 fill-white text-white" strokeWidth={0}/>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[14.5px] font-semibold text-neutral-900">{s.title}</h4>
                      <div className="flex items-center gap-3 mt-1 text-[12.5px] text-neutral-500">
                        <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5"/> {s.views.toLocaleString("pt-BR")} visualizações</span>
                        <span className="uppercase tracking-wider font-semibold text-[10px] bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded">{s.format}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch checked={s.active} onCheckedChange={() => toggle(s.id)} />
                      <button
                        onClick={() => navigate(`/app/${appId}/story/${s.id}`)}
                        className="w-9 h-9 rounded-lg hover:bg-neutral-100 flex items-center justify-center text-neutral-700 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => remove(s.id)}
                        className="w-9 h-9 rounded-lg hover:bg-red-50 hover:text-red-600 flex items-center justify-center text-neutral-700 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {TABS.filter(t => t.value !== "stories").map((t) => (
            <TabsContent key={t.value} value={t.value} className="mt-0">
              <PlaceholderTab label={t.label} Icon={t.icon} />
            </TabsContent>
          ))}
        </Tabs>
      </main>
    </>
  );
}

function PlaceholderTab({ label, Icon }) {
  return (
    <div className="bg-white border border-neutral-200 rounded-2xl p-16 text-center">
      <div className="w-14 h-14 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto mb-5">
        <Icon className="w-6 h-6 text-neutral-500" strokeWidth={1.75}/>
      </div>
      <h3 className="text-[16px] font-semibold text-neutral-900">{label}</h3>
      <p className="text-[14px] text-neutral-500 mt-1">Esta seção será personalizada para o seu fluxo.</p>
    </div>
  );
}
