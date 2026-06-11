import React from "react";
import TopBar from "@/components/layout/TopBar";
import { Input } from "@/components/ui/input";
import { currentUser } from "@/mock";
import { toast } from "sonner";

export default function Perfil() {
  const save = (e) => {
    e.preventDefault();
    toast.success("Perfil atualizado");
  };
  return (
    <>
      <TopBar title="Perfil" />
      <main className="px-10 py-10 fade-in max-w-2xl">
        <div className="flex items-center gap-5 mb-10">
          <div className="w-20 h-20 rounded-full bg-neutral-900 text-white flex items-center justify-center text-2xl font-semibold">
            {currentUser.initials}
          </div>
          <div>
            <h2 className="text-[20px] font-semibold text-neutral-900">{currentUser.name}</h2>
            <p className="text-[14px] text-neutral-500">{currentUser.email}</p>
          </div>
        </div>

        <form onSubmit={save} className="space-y-5 bg-white border border-neutral-200 rounded-2xl p-7">
          <div>
            <label className="text-[13px] font-medium text-neutral-700 block mb-2">Nome da loja</label>
            <Input defaultValue={currentUser.name} className="h-11 rounded-xl border-neutral-200"/>
          </div>
          <div>
            <label className="text-[13px] font-medium text-neutral-700 block mb-2">E-mail</label>
            <Input defaultValue={currentUser.email} className="h-11 rounded-xl border-neutral-200"/>
          </div>
          <div>
            <label className="text-[13px] font-medium text-neutral-700 block mb-2">Senha</label>
            <Input type="password" defaultValue="********" className="h-11 rounded-xl border-neutral-200"/>
          </div>
          <div className="flex justify-end pt-2">
            <button type="submit" className="text-[14px] font-medium text-white bg-neutral-900 hover:bg-neutral-800 px-5 py-2.5 rounded-xl transition-colors">
              Salvar alterações
            </button>
          </div>
        </form>
      </main>
    </>
  );
}
