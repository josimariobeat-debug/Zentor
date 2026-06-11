import React, { useState } from "react";
import TopBar from "@/components/layout/TopBar";
import { Star, Send } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function Feedback() {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [text, setText] = useState("");

  const submit = () => {
    if (!rating) return toast.error("Dê uma nota antes de enviar");
    toast.success("Obrigado pelo seu feedback!");
    setRating(0);
    setText("");
  };

  return (
    <>
      <TopBar title="Feedback" />
      <main className="px-10 py-10 fade-in max-w-2xl">
        <p className="text-[14px] text-neutral-500 mb-8">
          Sua opinião nos ajuda a construir uma Zentor melhor. Conta pra gente.
        </p>

        <div className="bg-white border border-neutral-200 rounded-2xl p-7">
          <label className="text-[14px] font-medium text-neutral-800 block mb-3">Como você avalia sua experiência?</label>
          <div className="flex gap-1 mb-7">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onMouseEnter={() => setHover(n)}
                onMouseLeave={() => setHover(0)}
                onClick={() => setRating(n)}
                className="p-1"
              >
                <Star
                  className={`w-7 h-7 transition-colors ${
                    (hover || rating) >= n ? "fill-neutral-900 text-neutral-900" : "text-neutral-300"
                  }`}
                  strokeWidth={1.5}
                />
              </button>
            ))}
          </div>

          <label className="text-[14px] font-medium text-neutral-800 block mb-2">Conte mais</label>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="O que está funcionando bem? O que podemos melhorar?"
            className="min-h-[140px] rounded-xl border-neutral-200"
          />

          <div className="flex justify-end mt-6">
            <button
              onClick={submit}
              className="inline-flex items-center gap-2 text-[14px] font-medium text-white bg-neutral-900 hover:bg-neutral-800 px-5 py-2.5 rounded-xl transition-colors"
            >
              <Send className="w-4 h-4" /> Enviar feedback
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
