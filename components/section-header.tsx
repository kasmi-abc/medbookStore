import Link from "next/link";
import { cn } from "@/lib/utils";

export function SectionHeader({
  title,
  sub,
  href,
  linkLabel,
}: {
  title: string;
  sub?: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2 className="section-title">{title}</h2>
        {sub ? <p className="section-sub">{sub}</p> : null}
      </div>
      {href && linkLabel ? (
        <Link
          href={href}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition hover:border-primary hover:text-primary"
          )}
        >
          {linkLabel}
          <span aria-hidden>→</span>
        </Link>
      ) : null}
    </div>
  );
}
