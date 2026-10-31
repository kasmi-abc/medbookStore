"use client";
import { useState } from "react";
import { Loader2, X } from "lucide-react";
import { useLang } from "@/components/providers";
import { useToast } from "@/components/toast";
import { createBook, updateBook } from "@/app/actions/admin";

export type CategoryLite = {
  slug: string;
  name: string;
  nameAr: string;
  nameFr: string;
  parentSlug: string | null;
};

export type BookFormInitial = {
  id: string;
  slug: string;
  title: string;
  titleAr: string;
  author: string;
  price: number;
  quantity: number;
  cover: string;
  categorySlug: string | null;
};

export function BookForm({
  initial,
  categories,
  onClose,
}: {
  initial: BookFormInitial | null;
  categories: CategoryLite[];
  onClose: () => void;
}) {
  const { t, lang } = useLang();
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    title: initial?.title ?? "",
    titleAr: initial?.titleAr ?? "",
    author: initial?.author ?? "",
    price: initial?.price ?? 0,
    quantity: initial?.quantity ?? 0,
    cover: initial?.cover ?? "",
    categorySlug: initial?.categorySlug ?? "",
  });

  const set = (k: keyof typeof form, v: string | number) => setForm((f) => ({ ...f, [k]: v }));

  const catLabel = (c: CategoryLite) => (lang === "ar" ? c.nameAr : lang === "fr" ? c.nameFr : c.name);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const res = initial
      ? await updateBook(initial.id, {
          title: form.title,
          titleAr: form.titleAr,
          author: form.author,
          price: form.price,
          quantity: form.quantity,
          cover: form.cover,
          categorySlug: form.categorySlug || null,
        })
      : await createBook({
          title: form.title,
          titleAr: form.titleAr,
          author: form.author,
          price: form.price,
          quantity: form.quantity,
          cover: form.cover,
          categorySlug: form.categorySlug,
        });
    setBusy(false);
    if (res.ok) {
      toast(t.admin.saved);
      onClose();
    } else {
      toast(t.common.error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="card-soft max-h-[90vh] w-full max-w-lg overflow-y-auto p-6"
      >
        <div className="mb-5 flex items-center justify-between gap-3">
          <h3 className="font-display text-lg font-bold">
            {initial ? initial.title : t.admin.newProduct}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.admin.cancel}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="label-base" htmlFor="bf-title">
                {t.admin.bookTitle} *
              </label>
              <input
                id="bf-title"
                required
                minLength={2}
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                className="input-base"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="label-base" htmlFor="bf-title-ar">
                {t.admin.titleAr} *
              </label>
              <input
                id="bf-title-ar"
                required
                minLength={2}
                value={form.titleAr}
                onChange={(e) => set("titleAr", e.target.value)}
                className="input-base"
              />
            </div>
            <div>
              <label className="label-base" htmlFor="bf-author">
                {t.shop.author} *
              </label>
              <input
                id="bf-author"
                required
                minLength={2}
                value={form.author}
                onChange={(e) => set("author", e.target.value)}
                className="input-base"
              />
            </div>
            <div>
              <label className="label-base" htmlFor="bf-cat">
                {t.shop.category}
              </label>
              <select
                id="bf-cat"
                value={form.categorySlug}
                onChange={(e) => set("categorySlug", e.target.value)}
                className="input-base"
              >
                <option value="">—</option>
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.parentSlug ? `— ${catLabel(c)}` : catLabel(c)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-base" htmlFor="bf-price">
                {t.admin.price} (DA) *
              </label>
              <input
                id="bf-price"
                type="number"
                min={0}
                step={50}
                required
                dir="ltr"
                value={form.price}
                onChange={(e) => set("price", Number(e.target.value))}
                className="input-base"
              />
            </div>
            <div>
              <label className="label-base" htmlFor="bf-qty">
                {t.admin.quantity} *
              </label>
              <input
                id="bf-qty"
                type="number"
                min={0}
                required
                dir="ltr"
                value={form.quantity}
                onChange={(e) => set("quantity", Number(e.target.value))}
                className="input-base"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="label-base" htmlFor="bf-cover">
                {t.admin.coverUrl} *
              </label>
              <input
                id="bf-cover"
                type="url"
                required
                dir="ltr"
                placeholder="https://..."
                value={form.cover}
                onChange={(e) => set("cover", e.target.value)}
                className="input-base"
              />
            </div>
            {initial && (
              <div className="sm:col-span-2">
                <label className="label-base" htmlFor="bf-slug">
                  {t.admin.slug}
                </label>
                <input
                  id="bf-slug"
                  value={initial.slug}
                  readOnly
                  dir="ltr"
                  className="input-base opacity-60"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">
              {t.admin.cancel}
            </button>
            <button type="submit" disabled={busy} className="btn-primary">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {t.admin.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
