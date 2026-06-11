import React, { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TopBar from "@/components/layout/TopBar";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Upload,
  Smartphone,
  Instagram,
  Image as ImageIcon,
  HelpCircle,
  Star,
  Link as LinkIcon,
  Trash2,
  Plus,
  X,
  Play,
} from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function AdicionarStory() {
  const { appId } = useParams();
  const navigate = useNavigate();
  const titleRef = useRef(null);
  const mediaRef = useRef(null);
  const urlRef = useRef(null);

  const [title, setTitle] = useState("");
  const [format, setFormat] = useState("vertical");
  const [scroll, setScroll] = useState("auto");
  const [active, setActive] = useState(true);
  const [cta, setCta] = useState("");
  const [media, setMedia] = useState([]);
  const [urls, setUrls] = useState([{ value: "", type: "contem", ignoreParams: false }]);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const addUrl = () => setUrls([...urls, { value: "", type: "contem", ignoreParams: false }]);
  const removeUrl = (i) => setUrls(urls.filter((_, x) => x !== i));
  const updateUrl = (i, k, v) => setUrls(urls.map((u, x) => (x === i ? { ...u, [k]: v } : u)));

  const onUploadClick = () => {
    const sample = {
      id: Date.now(),
      url: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=300&h=400&fit=crop",
      type: "image",
      name: "capa-colecao.jpg",
      cover: media.length === 0,
    };
    setMedia([...media, sample]);
    toast.success("Mídia adicionada");
  };

  const setCover = (id) => setMedia(media.map((m) => ({ ...m, cover: m.id === id })));
  const copyLink = (m) => { navigator.clipboard.writeText(m.url); toast.success("Link copiado"); };
  const removeMedia = (id) => setMedia(media.filter((m) => m.id !== id));

  const handleSave = () => {
    const e = {};
    if (!title.trim()) e.title = true;
    if (media.length === 0) e.media = true;
    if (!urls[0].value.trim()) e.url = true;
    setErrors(e);
    if (e.title) { titleRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }); return; }
    if (e.media) { mediaRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }); return; }
    if (e.url) { urlRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }); return; }
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success("Story salvo com sucesso");
      navigate(`/app/${appId}`);
    }, 700);
  };

  return (
    <>
      <TopBar
        title="Adicionar story vídeo"
        breadcrumb="Stories Vídeos"
        backTo={`/app/${appId}`}
        rightSlot={
          <button
            onClick={handleSave}
            disabled={saving}
            className="text-[14px] font-medium text-white bg-neutral-900 hover:bg-neutral-800 disabled:opacity-60 px-5 py-2.5 rounded-xl transition-colors"
          >
            {saving ? "Salvando…" : "Salvar"}
          </button>
        }
      />
      <main className="px-10 py-8 fade-in max-w-3xl space-y-6">
        {/* Title */}
        <section ref={titleRef} className="bg-white border border-neutral-200 rounded-2xl p-6">
          <Label>Título {errors.title && <span className="text-red-600 ml-1">(obrigatório)</span>}</Label>
          <Input value={title} onChange={(e)=>{setTitle(e.target.value); setErrors({...errors,title:false});}} placeholder="Ex: Coleção Verão 2025" className={`h-11 rounded-xl ${errors.title?"border-red-400":"border-neutral-200"}`}/>
        </section>

        {/* Format & Scroll */}
        <section className="bg-white border border-neutral-200 rounded-2xl p-6 grid grid-cols-2 gap-6">
          <div>
            <Label>Formato</Label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger className="h-11 rounded-xl border-neutral-200"><SelectValue/></SelectTrigger>
              <SelectContent>
                <SelectItem value="vertical">Vertical (9:16)</SelectItem>
                <SelectItem value="quadrado">Quadrado (1:1)</SelectItem>
                <SelectItem value="horizontal">Horizontal (16:9)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Rolagem</Label>
            <Select value={scroll} onValueChange={setScroll}>
              <SelectTrigger className="h-11 rounded-xl border-neutral-200"><SelectValue/></SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Automática</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </section>

        {/* Active */}
        <section className="bg-white border border-neutral-200 rounded-2xl p-6 flex items-center justify-between">
          <div>
            <Label className="mb-1">Story ativo</Label>
            <p className="text-[13px] text-neutral-500">Quando desativado, o story não aparece na vitrine.</p>
          </div>
          <Switch checked={active} onCheckedChange={setActive}/>
        </section>

        {/* CTA */}
        <section className="bg-white border border-neutral-200 rounded-2xl p-6">
          <Label>Chamada para ação</Label>
          <Input value={cta} onChange={(e)=>setCta(e.target.value)} placeholder="Ex: Comprar agora" className="h-11 rounded-xl border-neutral-200"/>
        </section>

        {/* Media sources */}
        <section ref={mediaRef} className="bg-white border border-neutral-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Label className="mb-0">Fontes de mídia</Label>
              <button onClick={()=>setHelpOpen(true)} className="w-6 h-6 rounded-full bg-neutral-100 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200 transition-colors flex items-center justify-center">
                <HelpCircle className="w-3.5 h-3.5"/>
              </button>
            </div>
            {errors.media && <span className="text-[12.5px] text-red-600 font-medium">(obrigatório)</span>}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
            <SourceBtn icon={Upload} label="Upload" onClick={onUploadClick}/>
            <SourceBtn icon={Smartphone} label="Pelo celular" onClick={()=>setMobileOpen(true)}/>
            <SourceBtn icon={Instagram} label="Instagram" onClick={()=>toast.message("Conecte sua conta", { description: "Integração com Instagram em breve." })}/>
            <SourceBtn icon={ImageIcon} label="Galeria" onClick={()=>toast.message("Galeria", { description: "Selecione mídias enviadas anteriormente." })}/>
          </div>

          {media.length > 0 && (
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
              {media.map((m) => (
                <div key={m.id} className="group relative aspect-[3/4] rounded-xl overflow-hidden border border-neutral-200 bg-neutral-100">
                  <img src={m.url} alt="" className="w-full h-full object-cover"/>
                  {m.cover && <span className="absolute top-2 left-2 text-[10px] font-semibold tracking-wider uppercase bg-white/95 text-neutral-900 px-2 py-0.5 rounded">Capa</span>}
                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={()=>setCover(m.id)} title="Definir capa" className="w-7 h-7 rounded-full bg-white/95 text-neutral-900 hover:bg-white flex items-center justify-center"><Star className="w-3.5 h-3.5"/></button>
                    <button onClick={()=>copyLink(m)} title="Copiar link" className="w-7 h-7 rounded-full bg-white/95 text-neutral-900 hover:bg-white flex items-center justify-center"><LinkIcon className="w-3.5 h-3.5"/></button>
                    <button onClick={()=>removeMedia(m.id)} title="Remover" className="w-7 h-7 rounded-full bg-white/95 text-red-600 hover:bg-white flex items-center justify-center"><Trash2 className="w-3.5 h-3.5"/></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* URL section */}
        <section ref={urlRef} className="bg-white border border-neutral-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <Label className="mb-0">Onde o story irá aparecer {errors.url && <span className="text-red-600 ml-1">(obrigatório)</span>}</Label>
            <button onClick={addUrl} className="inline-flex items-center gap-1.5 text-[13px] font-medium text-neutral-700 border border-neutral-200 hover:bg-neutral-50 px-3 py-1.5 rounded-lg transition-colors">
              <Plus className="w-3.5 h-3.5"/> Adicionar página
            </button>
          </div>
          <div className="space-y-3">
            {urls.map((u, i) => (
              <div key={i} className="flex items-center gap-2">
                <Select value={u.type} onValueChange={(v)=>updateUrl(i,"type",v)}>
                  <SelectTrigger className="w-[140px] h-11 rounded-xl border-neutral-200"><SelectValue/></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="contem">Contém</SelectItem>
                    <SelectItem value="exato">Exato</SelectItem>
                    <SelectItem value="todas">Todas as páginas</SelectItem>
                  </SelectContent>
                </Select>
                <Input value={u.value} onChange={(e)=>{updateUrl(i,"value",e.target.value); setErrors({...errors,url:false});}} placeholder="/colecao-verao" className={`flex-1 h-11 rounded-xl ${i===0 && errors.url?"border-red-400":"border-neutral-200"}`}/>
                {urls.length > 1 && (
                  <button onClick={()=>removeUrl(i)} className="w-11 h-11 rounded-xl hover:bg-red-50 hover:text-red-600 flex items-center justify-center text-neutral-600 transition-colors">
                    <X className="w-4 h-4"/>
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Help modal */}
      <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Como funcionam as fontes de mídia</DialogTitle></DialogHeader>
          <div className="text-[14px] text-neutral-600 space-y-3">
            <p><b>Upload</b>: envie arquivos diretamente do seu computador.</p>
            <p><b>Pelo celular</b>: gere um QR Code e envie mídias do seu celular.</p>
            <p><b>Instagram</b>: importe vídeos diretamente do seu Instagram.</p>
            <p><b>Galeria</b>: selecione mídias enviadas anteriormente.</p>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={mobileOpen} onOpenChange={setMobileOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Enviar pelo celular</DialogTitle></DialogHeader>
          <div className="flex flex-col items-center gap-4 py-2">
            <div className="w-48 h-48 bg-neutral-100 rounded-2xl grid place-items-center">
              <div className="text-[11px] text-neutral-500 text-center px-3">QR Code da sessão<br/>(simulado)</div>
            </div>
            <p className="text-[13px] text-neutral-500 text-center">Escaneie com o celular para enviar fotos e vídeos diretamente.</p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Label({ children, className="" }) {
  return <label className={`text-[14px] font-medium text-neutral-800 block mb-2 ${className}`}>{children}</label>;
}

function SourceBtn({ icon: Icon, label, onClick }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-2 p-4 border border-neutral-200 rounded-xl hover:border-neutral-400 hover:bg-neutral-50 transition-all">
      <Icon className="w-5 h-5 text-neutral-700" strokeWidth={1.75}/>
      <span className="text-[13px] font-medium text-neutral-700">{label}</span>
    </button>
  );
}
