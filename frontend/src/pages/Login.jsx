import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Falha ao entrar");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-white grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between p-12 bg-neutral-900 text-white">
        <div className="flex items-baseline gap-2">
          <span className="text-[26px] font-bold tracking-tight">Zentor</span>
          <span className="text-[10px] font-medium tracking-[0.15em] uppercase text-neutral-400">Sites &amp; Ferramentas</span>
        </div>
        <div className="max-w-md">
          <h2 className="text-[34px] leading-[1.1] font-semibold tracking-tight">Workspace elegante para sua loja.</h2>
          <p className="text-[15px] text-neutral-400 mt-4 leading-relaxed">Ferramentas e apps que se conectam à sua loja em minutos. Stories, avaliações, pop-ups e mais.</p>
        </div>
        <div className="text-[12.5px] text-neutral-500">© {new Date().getFullYear()} Zentor</div>
      </div>
      <div className="flex items-center justify-center p-8">
        <form onSubmit={submit} className="w-full max-w-sm">
          <h1 className="text-[28px] font-semibold tracking-tight text-neutral-900">Bem-vindo de volta</h1>
          <p className="text-[14px] text-neutral-500 mt-1.5 mb-8">Acesse sua conta para continuar.</p>
          <label className="text-[13px] font-medium text-neutral-700 block mb-1.5">E-mail</label>
          <Input type="email" required value={email} onChange={(e)=>setEmail(e.target.value)} className="h-11 rounded-xl border-neutral-200 mb-4"/>
          <label className="text-[13px] font-medium text-neutral-700 block mb-1.5">Senha</label>
          <div className="relative mb-2">
            <Input type={show?"text":"password"} required value={password} onChange={(e)=>setPassword(e.target.value)} className="h-11 rounded-xl border-neutral-200 pr-10"/>
            <button type="button" onClick={()=>setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700">
              {show ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
            </button>
          </div>
          <div className="flex justify-end mb-7">
            <span className="text-[13px] text-neutral-600">Mínimo 6 caracteres</span>
          </div>
          <button type="submit" disabled={loading} className="w-full h-11 rounded-xl bg-neutral-900 text-white text-[14.5px] font-medium hover:bg-neutral-800 disabled:opacity-60 transition-colors">
            {loading ? "Entrando…" : "Entrar"}
          </button>
          <p className="text-center text-[13.5px] text-neutral-500 mt-6">
            Não tem conta? <Link to="/register" className="text-neutral-900 font-medium hover:underline">Criar conta</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
