import React from "react";
import TopBar from "@/components/layout/TopBar";
import { tutorials } from "@/mock";
import { Play, Clock } from "lucide-react";

export default function Tutoriais() {
  return (
    <>
      <TopBar title="Tutoriais" />
      <main className="px-10 py-10 fade-in">
        <p className="text-[14px] text-neutral-500 mb-8 max-w-2xl">
          Vídeos curtos e diretos pra você dominar a Zentor em minutos.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {tutorials.map((t) => (
            <div
              key={t.id}
              className="bg-white border border-neutral-200 rounded-2xl overflow-hidden hover:border-neutral-300 hover:shadow-[0_4px_24px_-12px_rgba(0,0,0,0.1)] transition-all cursor-pointer group"
            >
              <div className="aspect-video bg-neutral-100 relative flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-neutral-900 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Play className="w-5 h-5 fill-white ml-0.5" strokeWidth={0} />
                </div>
                <div className="absolute bottom-3 right-3 bg-black/70 text-white text-[11px] font-medium px-2 py-0.5 rounded-md flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {t.duration}
                </div>
              </div>
              <div className="p-5">
                <span className="text-[10px] font-semibold tracking-wider uppercase text-neutral-500">{t.category}</span>
                <h3 className="text-[15px] font-semibold text-neutral-900 mt-1.5">{t.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
