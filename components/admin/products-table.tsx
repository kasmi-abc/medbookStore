"use client";
import { useState } from "react";
import { Check, Loader2, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useLang } from "@/components/providers";
import { useToast } from "@/components/toast";
import { deleteBook, updateBook } from "@/app/actions/admin";
import { BookForm, type BookFormInitial, type CategoryLite } from "@/components/admin/book-form";
import { formatPrice } from "@/lib/book";

type Row = {
  id: string;
  slug: string;
  title: string;
  titleAr: string;
  author: string;
  cover: string;
  price: number;
  discountPercent: number | null;
  inStock: boolean;
  quantity: number;
  categorySlug: string | null;
};

export function ProductsTable({
  books,
  categories,
}: {
  books: Row[];
  categories: CategoryLite[];
}) {
  const { t, lang } = useLang();
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState(books);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState<{ key: string; initial: BookFormInitial | null } | null>(null);

  const filtered = rows.filter((b) =>
    `${b.title} ${b.titleAr} ${b.author}`.toLowerCase().includes(query.trim().toLowerCase())
  );

  const save = async (id: string, patch: Partial<Row>) => {
    const book = rows.find((r) => r.id === id);
    if (!book) return;
    const next = { ...book, ...patch };
    setRows((prev) => prev.map((r) => (r.id === id ? next : r)));
    setBusyId(id);
    const res = await updateBook(id, {
      price: next.price,
      discountPercent: next.discountPercent,
      inStock: next.inStock,
      quantity: next.quantity,
      cover: next.cover,
    });
    setBusyId(null);
    toast(res.ok ? t.admin.saved : t.common.error);
  };

  const remove = async (b: Row) => {
    if (!window.confirm(t.admin.deleteConfirm)) return;
    setDeletingId(b.id);
    const res = await deleteBook(b.id);
    setDeletingId(null);
    if (res.ok) {
      setRows((prev) => prev.filter((r) => r.id !== b.id));
      toast(t.admin.saved);
    } else {
      toast(t.common.error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative max-w-xs flex-1">
          <Search className="pointer-events-none absolute inset-y-0 start-3 my-auto h-4 w-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.admin.search}
            className="input-base ps-9"
          />
        </div>
        <button
          type="button"
          onClick={() => setForm({ key: "new", initial: null })}
          className="btn-primary !py-2.5"
        >
          <Plus className="h-4 w-4" />
          {t.admin.add}
        </button>
      </div>

      <div className="card-soft overflow-x-auto p-0">
        <table className="w-full min-w-[840px] text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3 text-start">{t.admin.bookTitle}</th>
              <th className="px-4 py-3 text-start">{t.admin.price}</th>
              <th className="px-4 py-3 text-start">%</th>
              <th className="px-4 py-3 text-start">{t.admin.stock}</th>
              <th className="px-4 py-3 text-start">{t.admin.quantity}</th>
              <th className="px-4 py-3 text-start">{t.admin.actions}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((b) => (
              <tr key={b.id} className="border-b border-border/50 last:border-0">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="h-11 w-8 shrink-0 overflow-hidden rounded bg-muted">
                      <img src={b.cover} alt="" className="h-full w-full object-cover" />
                    </span>
                    <span className="min-w-0">
                      <span className="line-clamp-2 max-w-[240px] font-medium">
                        {lang === "ar" ? b.titleAr || b.title : b.title}
                      </span>
                      <span className="block text-xs text-muted-foreground" dir="ltr">
                        {b.author}
                      </span>
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      step={50}
                      value={b.price}
                      dir="ltr"
                      onChange={(e) => setRows((prev) => prev.map((r) => (r.id === b.id ? { ...r, price: Number(e.target.value) } : r)))}
                      onBlur={() => save(b.id, {})}
                      className="input-base !w-24 py-1.5 text-xs"
                    />
                    {busyId === b.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                    ) : (
                      <Check className="h-3.5 w-3.5 text-primary opacity-60" />
                    )}
                  </div>
                  <span className="text-[11px] text-muted-foreground">{formatPrice(b.price, lang)}</span>
                </td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    min={0}
                    max={90}
                    value={b.discountPercent ?? 0}
                    dir="ltr"
                    onChange={(e) =>
                      setRows((prev) =>
                        prev.map((r) => (r.id === b.id ? { ...r, discountPercent: Number(e.target.value) || null } : r))
                      )
                    }
                    onBlur={() => save(b.id, {})}
                    className="input-base !w-16 py-1.5 text-xs"
                  />
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => save(b.id, { inStock: !b.inStock })}
                    className={
                      b.inStock
                        ? "badge bg-primary/10 text-primary"
                        : "badge bg-red-500/15 text-red-500"
                    }
                  >
                    {b.inStock ? t.admin.inStockLabel : t.product.outOfStock}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    min={0}
                    value={b.quantity}
                    dir="ltr"
                    onChange={(e) => setRows((prev) => prev.map((r) => (r.id === b.id ? { ...r, quantity: Number(e.target.value) } : r)))}
                    onBlur={() => save(b.id, {})}
                    className="input-base !w-20 py-1.5 text-xs"
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setForm({
                          key: b.id,
                          initial: {
                            id: b.id,
                            slug: b.slug,
                            title: b.title,
                            titleAr: b.titleAr,
                            author: b.author,
                            price: b.price,
                            quantity: b.quantity,
                            cover: b.cover,
                            categorySlug: b.categorySlug,
                          },
                        })
                      }
                      title={t.admin.save}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground transition hover:border-primary hover:text-primary"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(b)}
                      disabled={deletingId === b.id}
                      title={t.admin.delete}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground transition hover:border-red-500 hover:text-red-500 disabled:opacity-50"
                    >
                      {deletingId === b.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                  {t.admin.noResults}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {form && (
        <BookForm
          key={form.key}
          initial={form.initial}
          categories={categories}
          onClose={() => setForm(null)}
        />
      )}
    </div>
  );
}
