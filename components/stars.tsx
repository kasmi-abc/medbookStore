"use client";
import { Star, StarHalf } from "lucide-react";
import { cn } from "@/lib/utils";

export function Stars({ value, size = "sm" }: { value: number; size?: "sm" | "md" }) {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  const cls = size === "sm" ? "h-3.5 w-3.5" : "h-[18px] w-[18px]";
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${value}/5`}>
      {Array.from({ length: 5 }).map((_, i) => {
        if (i < full) return <Star key={i} className={cn(cls, "fill-amber-400 text-amber-400")} />;
        if (i === full && half) return <StarHalf key={i} className={cn(cls, "fill-amber-400 text-amber-400")} />;
        return <Star key={i} className={cn(cls, "text-muted-foreground/30")} />;
      })}
    </span>
  );
}
