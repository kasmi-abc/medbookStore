"use client";
import { Share2 } from "lucide-react";
import { useLang } from "@/components/providers";
import { useToast } from "@/components/toast";

export function ShareButton({ url }: { url: string }) {
  const { t } = useLang();
  const { toast } = useToast();

  const share = async () => {
    const full = `${window.location.origin}${url}`;
    try {
      if (navigator.share) {
        await navigator.share({ url: full });
        return;
      }
      await navigator.clipboard.writeText(full);
      toast(t.common.copied);
    } catch {}
  };

  return (
    <button type="button" onClick={share} className="btn-secondary w-full py-3">
      <Share2 className="h-4 w-4" />
      {t.product.share}
    </button>
  );
}
