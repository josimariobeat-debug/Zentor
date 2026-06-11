import React from "react";
import TopBar from "@/components/layout/TopBar";
import AppCard from "@/components/apps/AppCard";
import { installedApps } from "@/mock";

export default function MeusApps() {
  return (
    <>
      <TopBar title="Apps" />
      <main className="px-10 py-10 fade-in">
        <h2 className="text-[18px] font-semibold text-neutral-900 mb-6">Apps instalados</h2>
        {installedApps.length === 0 ? (
          <div className="border border-dashed border-neutral-300 rounded-2xl p-12 text-center text-neutral-500">
            Você ainda não instalou nenhum app.
          </div>
        ) : (
          <div className="space-y-4 max-w-[920px]">
            {installedApps.map((app) => (
              <AppCard key={app.id} app={app} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
