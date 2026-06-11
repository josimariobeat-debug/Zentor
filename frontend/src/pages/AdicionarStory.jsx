import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TopBar from "@/components/layout/TopBar";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Music2,
  Pencil,
  Play,
} from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { api } from "@/lib/api";
import { generateVideoPoster } from "@/lib/videoPoster";
import MediaPreviewModal from "@/components/storievideos/MediaPreviewModal";

export default function AdicionarStory() {
  const { appId, storyId } = useParams();
  const navigate = useNavigate();
  const isEdit = storyId && storyId !== "novo";

  const titleRef = useRef(null);
  const mediaRef = useRef(null);
  const urlRef = useRef(null);
  const fileInputRef = useRef(null);

  const [title, setTitle] = useState("");
  const [format, setFormat] = useState("widget");
  const [scroll, setScroll] = useState("vertical");
  const [aparencia, setAparencia] = useState("padrao-1");
  const [aparenciaOptions, setAparenciaOptions] = useState([
    { value: "padrao-1", label: "Padrão 1" },
  ]);
  const [active, setActive] = useState(true);
  const [cta, setCta] = useState("");
  const [media, setMedia] = useState([]);
  const [urls, setUrls] = useState([{ value: "", type: "contem", ignore_params: false }]);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState(null);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (!isEdit) return;
    api.get(`/stories/${storyId}`)
      .then(r => {
        const s = r.data;
        setTitle(s.title || "");
        setFormat(s.format || "widget");
        setScroll(s.scroll || "vertical");
        setActive(s.active !== false);
        setCta(s.cta || "");
        setMedia(s.media || []);
        setUrls(s.urls?.length ? s.urls : [{ value: "", type: "contem", ignore_params: false }]);
      })
      .catch(() => toast.error("Story não encontrado"))
      .finally(() => setLoading(false));
  }, [isEdit, storyId]);

  const addUrl = () => setUrls([...urls, { value: "", type: "contem", ignore_params: false }]);
  const removeUrl = (i) => setUrls(urls.filter((_, x) => x !== i));
  const updateUrl = (i, k, v) => setUrls(urls.map((u, x) => (x === i ? { ...u, [k]: v } : u)));

  const onFilesPicked = async (files) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      const newItems = [];
      for (const file of files) {
        const fd = new FormData();
        fd.append("file", file);
        const r = await api.post("/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
        const isVideo = (r.data.mime || "").startsWith("video/");
        const item = {
          url: r.data.url,
          type: isVideo ? "video" : "image",
          name: r.data.name,
          cover: media.length === 0 && newItems.length === 0,
          poster: isVideo ? null : r.data.url,
        };
        // For videos, generate a poster frame on the client and upload it
        if (isVideo) {
          try {
            const blob = await generateVideoPoster(r.data.url);
            const pfd = new FormData();
            const posterName = (r.data.name || "video").replace(/\.[^.]+$/, "") + "-poster.jpg";
            pfd.append("file", new File([blob], posterName, { type: "image/jpeg" }));
            const pr = await api.post("/upload", pfd, { headers: { "Content-Type": "multipart/form-data" } });
            item.poster = pr.data.url;
          } catch (_) {
            // poster generation failed; thumbnail will fallback to play icon
          }
        }
        newItems.push(item);
        // auto-fill title from first filename if empty
        if (!title.trim() && newItems.length === 1) {
          const baseName = (r.data.name || "").replace(/\.[^.]+$/, "");
          if (baseName) setTitle(baseName);
        }
      }
      setMedia([...media, ...newItems]);
      toast.success(`${newItems.length} mídia(s) enviada(s)`);
    } catch (e) {
      toast.error("Falha no upload");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const setCover = (idx) => setMedia(media.map((m, i) => ({ ...m, cover: i === idx })));
  const copyLink = (m) => { navigator.clipboard.writeText(m.url); toast.success("Link copiado"); };
  const removeMedia = (idx) => {
    const next = media.filter((_, i) => i !== idx);
    if (next.length && !next.some(m => m.cover)) next[0].cover = true;
    setMedia(next);
  };

  const handleSave = async () => {
    const e = {};
    if (!title.trim()) e.title = true;
    if (media.length === 0) e.media = true;
    if (!urls[0]?.value?.trim()) e.url = true;
    setErrors(e);
    if (e.title) { titleRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }); return; }
    if (e.media) { mediaRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }); return; }
    if (e.url) { urlRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }); return; }
    setSaving(true);
    try {
      const payload = { app_id: appId, title, format, scroll, active, cta, media, urls };
      if (isEdit) await api.put(`/stories/${storyId}`, payload);
      else await api.post(`/stories`, payload);
      toast.success(isEdit ? "Story atualizado" : "Story criado");
      navigate(`/app/${appId}`);
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Falha ao salvar");
    } finally { setSaving(false); }
  };

  if (loading) return (
    <>
      <TopBar title={isEdit ? "Editar story vídeo" : "Adicionar story vídeo"} breadcrumb="Stories Vídeos" backTo={`/app/${appId}`} />
      <main className="px-10 py-8 max-w-3xl"><div className="text-neutral-500 text-sm">Carregando…</div></main>
    </>
  );

  return (
    <>
      <TopBar
        title={isEdit ? "Editar story vídeo" : "Adicionar story vídeo"}
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
                <SelectItem value="widget">Widget Flutuante</SelectItem>
                <SelectItem value="carrossel">Carrossel</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Rolagem</Label>
            <Select value={scroll} onValueChange={setScroll}>
              <SelectTrigger className="h-11 rounded-xl border-neutral-200"><SelectValue/></SelectTrigger>
              <SelectContent>
                <SelectItem value="vertical">Vertical</SelectItem>
                <SelectItem value="horizontal">Horizontal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </section>

        {/* Aparência */}
        <section className="bg-white border border-neutral-200 rounded-2xl p-6">
          <Label>Aparência</Label>
          <div className="flex items-center gap-3">
            <Select value={aparencia} onValueChange={setAparencia}>
              <SelectTrigger className="flex-1 h-11 rounded-xl border-neutral-200"><SelectValue/></SelectTrigger>
              <SelectContent>
                {aparenciaOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <button
              type="button"
              onClick={() => {
                const next = aparenciaOptions.length + 1;
                const newOpt = { value: `padrao-${next}`, label: `Padrão ${next}` };
                setAparenciaOptions([...aparenciaOptions, newOpt]);
                setAparencia(newOpt.value);
                toast.success(`Aparência "${newOpt.label}" criada`);
              }}
              title="Adicionar aparência"
              className="w-11 h-11 rounded-full bg-neutral-900 text-white flex items-center justify-center hover:bg-neutral-800 transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" strokeWidth={2.25} />
            </button>
            <button
              type="button"
              onClick={() => toast.message("Editar aparência", { description: "Em breve você editará cores, formato e bordas." })}
              title="Editar aparência"
              className="w-11 h-11 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center hover:bg-amber-200 transition-colors shrink-0 ring-1 ring-amber-200"
            >
              <Pencil className="w-4 h-4" strokeWidth={2} />
            </button>
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

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            className="hidden"
            onChange={(e)=>onFilesPicked(Array.from(e.target.files || []))}
          />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
            <SourceBtn icon={Upload} label={uploading ? "Enviando…" : "Upload"} onClick={() => fileInputRef.current?.click()} disabled={uploading}/>
            <SourceBtn icon={Smartphone} label="Pelo celular" onClick={()=>setMobileOpen(true)}/>
            <SourceBtn icon={Instagram} label="Instagram" onClick={()=>toast.message("Conecte sua conta", { description: "Integração com Instagram em breve." })}/>
            <SourceBtn icon={ImageIcon} label="Galeria" onClick={()=>toast.message("Galeria", { description: "Selecione mídias enviadas anteriormente." })}/>
          </div>

          {media.length > 0 && (
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
              {media.map((m, idx) => (
                <div key={idx} className="group relative aspect-[3/4] rounded-xl overflow-hidden border border-neutral-200 bg-neutral-100">
                  <button
                    type="button"
                    onClick={() => setPreviewItem(m)}
                    className="absolute inset-0 w-full h-full"
                    title="Pré-visualizar"
                  >
                    {m.type === "video" ? (
                      m.poster ? (
                        <img src={m.poster} alt="" className="w-full h-full object-cover"/>
                      ) : (
                        <video src={m.url} className="w-full h-full object-cover" muted preload="metadata"/>
                      )
                    ) : (
                      <img src={m.url} alt="" className="w-full h-full object-cover"/>
                    )}
                    {m.type === "video" && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/15 group-hover:bg-black/30 transition-colors">
                        <div className="w-12 h-12 rounded-full bg-white/95 text-neutral-900 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <Play className="w-5 h-5 fill-neutral-900 ml-0.5" strokeWidth={0}/>
                        </div>
                      </div>
                    )}
                  </button>
                  {m.cover && <span className="absolute top-2 left-2 text-[10px] font-semibold tracking-wider uppercase bg-amber-300 text-neutral-900 px-2 py-0.5 rounded pointer-events-none z-10">Capa</span>}
                  {m.type === "video" && <Music2 className="absolute top-2 right-2 w-4 h-4 text-white drop-shadow pointer-events-none z-10"/>}
                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 p-2 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-20">
                    <button onClick={()=>setCover(idx)} title="Definir capa" className="w-7 h-7 rounded-full bg-white/95 text-neutral-900 hover:bg-white flex items-center justify-center"><Star className="w-3.5 h-3.5"/></button>
                    <button onClick={()=>copyLink(m)} title="Copiar link" className="w-7 h-7 rounded-full bg-white/95 text-neutral-900 hover:bg-white flex items-center justify-center"><LinkIcon className="w-3.5 h-3.5"/></button>
                    <button onClick={()=>removeMedia(idx)} title="Remover" className="w-7 h-7 rounded-full bg-white/95 text-red-600 hover:bg-white flex items-center justify-center"><Trash2 className="w-3.5 h-3.5"/></button>
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

      <MediaPreviewModal open={!!previewItem} onOpenChange={(o)=>!o && setPreviewItem(null)} media={previewItem} />
    </>
  );
}

function Label({ children, className="" }) {
  return <label className={`text-[14px] font-medium text-neutral-800 block mb-2 ${className}`}>{children}</label>;
}

function SourceBtn({ icon: Icon, label, onClick, disabled }) {
  return (
    <button disabled={disabled} onClick={onClick} className="flex flex-col items-center gap-2 p-4 border border-neutral-200 rounded-xl hover:border-neutral-400 hover:bg-neutral-50 disabled:opacity-50 transition-all">
      <Icon className="w-5 h-5 text-neutral-700" strokeWidth={1.75}/>
      <span className="text-[13px] font-medium text-neutral-700">{label}</span>
    </button>
  );
}
