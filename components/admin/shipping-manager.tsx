"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { useLang } from "@/components/providers";
import { useToast } from "@/components/toast";
import { deleteShippingCompany, saveShippingCompany } from "@/app/actions/admin";
import { cn } from "@/lib/utils";

type CompanyRow = {
  id: string;
  name: string;
  nameAr: string;
  nameFr: string;
  code: string;
  trackingUrl: string | null;
  phone: string | null;
  active: boolean;
};

const BLANK = { name: "", nameAr: "", nameFr: "", code: "", trackingUrl: "", phone: "", active: true };

export function ShippingManager({ companies }: { companies: CompanyRow[] }) {
  const { t } = useLang();
  const { toast } = useToast();
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(BLANK);
  const [busy, setBusy] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const set = (k: keyof typeof BLANK, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const openNew = () => {
    setForm(BLANK);
    setEditId(null);
    setFormOpen(true);
  };

  const openEdit = (row: CompanyRow) => {
    setForm({
      name: row.name,
      nameAr: row.nameAr,
      nameFr: row.nameFr,
      code: row.code,
      trackingUrl: row.trackingUrl ?? "",
      phone: row.phone ?? "",
      active: row.active,
    });
    setEditId(row.id);
    setFormOpen(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const res = await saveShippingCompany({ ...form, id: editId ?? undefined });
    setBusy(false);
    if (res.ok) {
      toast(t.admin.saved);
      setFormOpen(false);
      router.refresh();
    } else {
      toast(t.common.error);
    }
  };

  const toggle = async (row: CompanyRow) => {
    setBusyId(row.id);
    const res = await saveShippingCompany({
      id: row.id,
      name: row.name,
      nameAr: row.nameAr,
      nameFr: row.nameFr,
      code: row.code,
      trackingUrl: row.trackingUrl ?? "",
      phone: row.phone ?? "",
      active: !row.active,
    });
    setBusyId(null);
    if (res.ok) router.refresh();
    else toast(t.common.error);
  };

  const remove = async (row: CompanyRow) => {
    if (!window.confirm(t.admin.deleteConfirm)) return;
    setBusyId(row.id);
    const res = await deleteShippingCompany(row.id);
    setBusyId(null);
    if (res.ok) {
      toast(t.admin.saved);
      router.refresh();
    } else {
      toast(t.common.error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button type="button" onClick={openNew} className="btn-primary !py-2.5">
          <Plus className="h-4 w-4" />
          {t.admin.addShippingCompany}
        </button>
      </div>

      {formOpen && (
        <form onSubmit={submit} className="card-soft space-y-4 p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-base font-bold">
              {editId ? t.admin.shippingCompanies : t.admin.addShippingCompany}
            </h3>
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              aria-label={t.admin.cancel}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label-base" htmlFor="sc-name">
                {t.admin.name} *
              </label>
              <input
                id="sc-name"
                required
                minLength={2}
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                className="input-base"
              />
            </div>
            <div>
              <label className="label-base" htmlFor="sc-code">
                {t.admin.code} *
              </label>
              <input
                id="sc-code"
                required
                dir="ltr"
                pattern="[a-z0-9-]{2,}"
                placeholder="yalidine"
                value={form.code}
                onChange={(e) => set("code", e.target.value.toLowerCase())}
                className="input-base"
              />
            </div>
            <div>
              <label className="label-base" htmlFor="sc-name-ar">
                {t.admin.nameAr}
              </label>
              <input
                id="sc-name-ar"
                value={form.nameAr}
                onChange={(e) => set("nameAr", e.target.value)}
                className="input-base"
              />
            </div>
            <div>
              <label className="label-base" htmlFor="sc-name-fr">
                {t.admin.nameFr}
              </label>
              <input
                id="sc-name-fr"
                value={form.nameFr}
                onChange={(e) => set("nameFr", e.target.value)}
                className="input-base"
              />
            </div>
            <div>
              <label className="label-base" htmlFor="sc-track">
                {t.admin.trackingUrl}
              </label>
              <input
                id="sc-track"
                type="url"
                dir="ltr"
                placeholder="https://..."
                value={form.trackingUrl}
                onChange={(e) => set("trackingUrl", e.target.value)}
                className="input-base"
              />
            </div>
            <div>
              <label className="label-base" htmlFor="sc-phone">
                {t.admin.phone}
              </label>
              <input
                id="sc-phone"
                dir="ltr"
                placeholder="0555123456"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                className="input-base"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => set("active", e.target.checked)}
              className="h-4 w-4 accent-[var(--color-primary)]"
            />
            {t.admin.active}
          </label>

          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setFormOpen(false)} className="btn-secondary">
              {t.admin.cancel}
            </button>
            <button type="submit" disabled={busy} className="btn-primary">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {t.admin.save}
            </button>
          </div>
        </form>
      )}

      <div className="card-soft overflow-x-auto p-0">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3 text-start">{t.admin.name}</th>
              <th className="px-4 py-3 text-start">{t.admin.code}</th>
              <th className="px-4 py-3 text-start">{t.admin.trackingUrl}</th>
              <th className="px-4 py-3 text-start">{t.admin.phone}</th>
              <th className="px-4 py-3 text-start">{t.admin.active}</th>
              <th className="px-4 py-3 text-start">{t.admin.actions}</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((row) => (
              <tr key={row.id} className="border-b border-border/50 last:border-0">
                <td className="px-4 py-3">
                  <span className="block font-medium">{row.name}</span>
                  <span className="block text-xs text-muted-foreground">{row.nameAr} · {row.nameFr}</span>
                </td>
                <td className="px-4 py-3 font-mono text-xs" dir="ltr">{row.code}</td>
                <td className="max-w-[200px] truncate px-4 py-3 text-xs text-muted-foreground" dir="ltr">
                  {row.trackingUrl ?? "—"}
                </td>
                <td className="px-4 py-3 text-xs" dir="ltr">{row.phone ?? "—"}</td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => toggle(row)}
                    disabled={busyId === row.id}
                    className={cn(
                      "badge",
                      row.active ? "bg-primary/10 text-primary" : "bg-red-500/15 text-red-500"
                    )}
                  >
                    {busyId === row.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : row.active ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <X className="h-3 w-3" />
                    )}
                    {row.active ? t.admin.active : t.admin.inactive}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openEdit(row)}
                      title={t.admin.save}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground transition hover:border-primary hover:text-primary"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(row)}
                      disabled={busyId === row.id}
                      title={t.admin.delete}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground transition hover:border-red-500 hover:text-red-500 disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {companies.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
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
