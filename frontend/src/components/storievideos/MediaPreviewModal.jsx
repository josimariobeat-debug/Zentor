import React, { useEffect, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export default function MediaPreviewModal({ open, onOpenChange, media }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (open && media?.type === "video" && videoRef.current) {
      // Hint browser to start downloading + decoding ASAP
      try {
        videoRef.current.load();
        const p = videoRef.current.play();
        if (p && p.catch) p.catch(() => {});
      } catch (_) {}
    }
  }, [open, media]);

  if (!media) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[420px] p-0 bg-black border-0 overflow-hidden rounded-2xl">
        <div className="relative w-full aspect-[9/16] bg-black">
          {media.type === "video" ? (
            <video
              ref={videoRef}
              src={media.url}
              poster={media.poster}
              autoPlay
              controls
              playsInline
              preload="auto"
              className="w-full h-full object-contain"
            />
          ) : (
            <img src={media.url} alt={media.name || ""} className="w-full h-full object-contain"/>
          )}
        </div>
        <div className="px-4 py-3 bg-black text-white">
          <div className="text-[13.5px] font-medium truncate">{media.name || "Pré-visualização"}</div>
          <div className="text-[11.5px] text-neutral-400 mt-0.5">{media.type === "video" ? "Vídeo" : "Imagem"}</div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
