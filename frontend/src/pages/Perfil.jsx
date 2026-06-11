import React, { useState } from "react";
import TopBar from "@/components/layout/TopBar";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { toast } from "sonner";

export default function Perfil() {
  const { user, refresh } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [saving, setSaving] = useState(false);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put("/profile", { name, email });
      await refresh();
      toast.success("Perfil atualizado");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Falha ao salvar");
    } finally { setSaving(false); }
  };

  return (
    <>
      <TopBar title="Perfil" />
      <main className="px-10 py-10 fade-in max-w-2xl">
        <div className="flex items-center gap-5 mb-10">
          <div className="w-20 h-20 rounded-full bg-neutral-900 text-white flex items-center justify-center text-2xl font-semibold">
            {user?.initials || "·"}
          </div>
          <div>
            <h2 className="text-[20px] font-semibold text-neutral-900">{user?.name}</h2>
            <p className="text-[14px] text-neutral-500">{user?.email}</p>
          </div>
        </div>

        <form onSubmit={save} className="space-y-5 bg-white border border-neutral-200 rounded-2xl p-7">
          <div>
            <label className="text-[13px] font-medium text-neutral-700 block mb-2">Nome da loja</label>
            <Input value={name} onChange={(e)=>setName(e.target.value)} className="h-11 rounded-xl border-neutral-200"/>
          </div>
          <div>
            <label className="text-[13px] font-medium text-neutral-700 block mb-2">E-mail</label>
            <Input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} className="h-11 rounded-xl border-neutral-200"/>
          </div>
          <div className="flex justify-end pt-2">
            <button type="submit" disabled={saving} className="text-[14px] font-medium text-white bg-neutral-900 hover:bg-neutral-800 disabled:opacity-60 px-5 py-2.5 rounded-xl transition-colors">
              {saving ? "Salvando…" : "Salvar alterações"}
            </button>
          </div>
        </form>
      </main>
    </>
  );
}
