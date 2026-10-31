"use client";
import { Check, PackageCheck, PackageOpen, Truck, Wallet } from "lucide-react";
import { useLang } from "@/components/providers";
import { cn } from "@/lib/utils";

const STATUS_ORDER = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"] as const;

export function OrderTimeline({ status }: { status: string }) {
  const { t } = useLang();
  const idx = STATUS_ORDER.indexOf(status as (typeof STATUS_ORDER)[number]);

  const steps = [
    { key: "step1", icon: Wallet },
    { key: "step2", icon: PackageOpen },
    { key: "step3", icon: Truck },
    { key: "step4", icon: PackageCheck },
  ] as const;

  if (status === "CANCELLED" || status === "RETURNED") {
    return (
      <div className="rounded-2xl border border-red-300/40 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-600 dark:text-red-400">
        {t.statuses[status as keyof typeof t.statuses]}
      </div>
    );
  }

  return (
    <ol className="grid grid-cols-4 gap-2">
      {steps.map((s, i) => {
        const Icon = s.icon;
        const active = i <= idx;
        const current = i === idx;
        return (
          <li key={s.key} className="flex flex-col items-center text-center">
            <span
              className={cn(
                "relative flex h-11 w-11 items-center justify-center rounded-full border-2 transition",
                active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground"
              )}
            >
              {active && !current ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
            </span>
            <span className={cn("mt-2 text-[11px] font-medium leading-tight sm:text-xs", active ? "text-foreground" : "text-muted-foreground")}>
              {t.statusSteps[s.key]}
            </span>
            {current ? <span className="mt-1 h-1 w-1 rounded-full bg-primary" /> : null}
          </li>
        );
      })}
    </ol>
  );
}
