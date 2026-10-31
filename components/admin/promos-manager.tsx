"use client";
import { useState } from "react";
import { Percent, Power, Trash2 } from "lucide-react";
import { useLang } from "@/components/providers";
import { useToast } from "@/components/toast";
import { createPromo, deletePromo, togglePromo } from "@/app/actions/admin";

type Row = { code: string; percent: number; active: boolean; expiresAt: string | null };

export function PromosManager({ promos }: { promos: Row[] }) {
  const { t, lang } = useLang();
  const { toast } = useToast();
  const [code, setCode] = useState("");
  const [percent, setPercent] = useState(10);
  const [rows, setRows] = useState(promos);

  const refresh = (next: Row[]) => setRows(next);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = code.trim().toUpperCase();
    if (!clean) return;
    const res = await createPromo(clean, percent);
    if (res.ok) {
      const exists = rows.find((r) => r.code === clean);
      refresh(
        exists
          ? rows.map((r) => (r.code === clean ? { ...r, percent, active: true } : r))
          : [...rows, { code: clean, percent, active: true, expiresAt: null }]
      );
      setCode("");
      setPercent(10);
      toast(t.admin.saved);
    } else {
      toast(t.common.error);
    }
  };

  const toggle = async (c: string) => {
    const res = await togglePromo(c);
    if (res.ok) refresh(rows.map((r) => (r.code === c ? { ...r, active: !r.active } : r)));
    toast(res.ok ? t.admin.saved : t.common.error);
  };

  const remove = async (c: string) => {
    const res = await deletePromo(c);
    if (res.ok) refresh(rows.filter((r) => r.code !== c));
    toast(res.ok ? t.admin.saved : t.common.error);
  };

  return (
    <div className="space-y-5">
      <form onSubmit={add} className="card-soft flex flex-wrap items-end gap-3 p-5">
        <div>
          <label className="label-base" htmlFor="pr-code">{t.admin.code}</label>
          <input
            id="pr-code"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="MEDZ10"
            dir="ltr"
            className="input-base uppercase"
          />
        </div>
        <div>
          <label className="label-base" htmlFor="pr-pct">{t.admin.percent}</label>
          <input
            id="pr-pct"
            type="number"
            min={1}
            max={90}
            value={percent}
            onChange={(e) => setPercent(Number(e.target.value))}
            dir="ltr"
            className="input-base !w-24"
          />
        </div>
        <button type="submit" className="btn-primary">
          <Percent className="h-4 w-4" />
          {t.admin.addPromo}
        </button>
      </form>

      <div className="card-soft overflow-x-auto p-0">
        <table className="w-full min-w-[480px] text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3 text-start">{t.admin.code}</th>
              <th className="px-4 py-3 text-start">{t.admin.percent}</th>
              <th className="px-4 py-3 text-start">{t.admin.expires}</th>
              <th className="px-4 py-3 text-start">{t.admin.actions}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.code} className="border-b border-border/50 last:border-0">
                <td className="px-4 py-3 font-semibold tracking-wider" dir="ltr">{p.code}</td>
                <td className="px-4 py-3 font-bold text-primary">{p.percent}%</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {p.expiresAt ? new Date(p.expiresAt).toLocaleDateString(lang) : t.admin.never}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggle(p.code)}
                      className={p.active ? "badge bg-primary/10 text-primary" : "badge bg-muted text-muted-foreground"}
                    >
                      <Power className="h-3 w-3" />
                      {p.active ? t.admin.active : t.admin.expired}
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(p.code)}
                      aria-label={t.cart.remove}
                      className="rounded-full p-2 text-muted-foreground hover:bg-red-500/10 hover:text-red-500"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-muted-foreground">
                  {t.admin.empty}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
