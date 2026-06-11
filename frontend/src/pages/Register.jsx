import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { Input } from "@/components/ui/input";

export default function Register() {
  const navigate = useNavigate();
  const submit = (e) => { e.preventDefault(); navigate("/"); };
  return (
    <div className="min-h-screen bg-white grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between p-12 bg-neutral-900 text-white">
        <div className="flex items-baseline gap-2">
          <span className="text-[26px] font-bold tracking-tight">Zentor</span>
          <span className="text-[10px] font-medium tracking-[0.15em] uppercase text-neutral-400">Sites &amp; Ferramentas</span>
        </div>
        <div className="max-w-md">
          <h2 className="text-[34px] leading-[1.1] font-semibold tracking-tight">Crie sua conta e comece em minutos.</h2>
          <p className="text-[15px] text-neutral-400 mt-4 leading-relaxed">Tudo pronto pra você adicionar apps, gerenciar assinaturas e elevar a sua loja.</p>
        </div>
        <div className="text-[12.5px] text-neutral-500">© {new Date().getFullYear()} Zentor</div>
      </div>
      <div className="flex items-center justify-center p-8">
        <form onSubmit={submit} className="w-full max-w-sm">
          <h1 className="text-[28px] font-semibold tracking-tight text-neutral-900">Criar conta</h1>
          <p className="text-[14px] text-neutral-500 mt-1.5 mb-8">Comece grátis. Sem cartão de crédito.</p>

          <Field label="Nome da loja"><Input required className="h-11 rounded-xl border-neutral-200"/></Field>
          <Field label="E-mail"><Input type="email" required className="h-11 rounded-xl border-neutral-200"/></Field>
          <Field label="Senha"><Input type="password" required className="h-11 rounded-xl border-neutral-200"/></Field>

          <button type="submit" className="w-full h-11 rounded-xl bg-neutral-900 text-white text-[14.5px] font-medium hover:bg-neutral-800 transition-colors mt-2">
            Criar conta
          </button>
          <p className="text-center text-[13.5px] text-neutral-500 mt-6">
            Já tem conta? <Link to="/login" className="text-neutral-900 font-medium hover:underline">Entrar</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
function Field({label, children}){return (<div className="mb-4"><label className="text-[13px] font-medium text-neutral-700 block mb-1.5">{label}</label>{children}</div>);}
