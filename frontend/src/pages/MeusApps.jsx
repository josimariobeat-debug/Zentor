import React, { useEffect, useState } from "react";
import TopBar from "@/components/layout/TopBar";
import AppCard from "@/components/apps/AppCard";
import { api } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function MeusApps() {
  const [apps, setApps] = useState(null);

  const load = () =>
    api.get("/apps/installed").then((r) => setApps(r.data)).catch(() => setApps([]));

  useEffect(() => { load(); }, []);

  const uninstall = async (id) => {
    try {
      await api.delete(`/apps/uninstall/${id}`);
      toast.success("App removido");
      setApps((a) => (a || []).filter((x) => x.id !== id));
    } catch (e) {
      toast.error("Falha ao remover");
    }
  };

  return (
    <>
      <TopBar title="Apps" />
      <main className="px-10 py-10 fade-in">
        <h2 className="text-[18px] font-semibold text-neutral-900 mb-6">Apps instalados</h2>
        {apps === null ? (
          <div className="space-y-4 max-w-[920px]">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-[124px] rounded-2xl" />
            ))}
          </div>
        ) : apps.length === 0 ? (
          <div className="border border-dashed border-neutral-300 rounded-2xl p-12 text-center text-neutral-500">
            Você ainda não instalou nenhum app.
          </div>
        ) : (
          <div className="space-y-4 max-w-[920px]">
            {apps.map((app) => (
              <AppCard key={app.id} app={app} onUninstall={uninstall} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
