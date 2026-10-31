"use client";
import { useState } from "react";
import { CheckCircle2, Loader2, ThumbsUp } from "lucide-react";
import { useLang } from "@/components/providers";
import { useToast } from "@/components/toast";
import { Stars } from "@/components/stars";
import { markReviewHelpful, submitReview } from "@/app/actions/reviews";
import { cn, formatDate } from "@/lib/utils";

export type ReviewDTO = {
  id: string;
  name: string;
  city: string | null;
  stars: number;
  comment: string;
  helpful: number;
  verified: boolean;
  createdAt: string | Date;
};

export function ReviewsSection({
  bookId,
  reviews,
  lang,
}: {
  bookId: string;
  reviews: ReviewDTO[];
  lang: string;
}) {
  const { t } = useLang();
  const { toast } = useToast();
  const [list, setList] = useState(reviews);
  const [formOpen, setFormOpen] = useState(false);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    const res = await submitReview({ bookId, name, city, stars, comment });
    setSending(false);
    if (res.ok) {
      setDone(true);
      setFormOpen(false);
      setList((l) => [
        {
          id: `local-${Date.now()}`,
          name,
          city: city || null,
          stars,
          comment,
          helpful: 0,
          verified: false,
          createdAt: new Date(),
        },
        ...l,
      ]);
      toast(t.product.reviewSuccess);
    } else {
      toast(t.product.reviewError);
    }
  };

  const helpful = async (id: string) => {
    if (id.startsWith("local-")) return;
    setList((l) => l.map((r) => (r.id === id ? { ...r, helpful: r.helpful + 1 } : r)));
    await markReviewHelpful(id);
  };

  return (
    <section id="reviews" className="mt-16 scroll-mt-28">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-2xl font-bold">
          {t.product.reviews}{" "}
          <span className="text-base font-medium text-muted-foreground">
            ({t.product.reviewsCount.replace("{n}", String(reviews.length))})
          </span>
        </h2>
        <button type="button" onClick={() => setFormOpen((o) => !o)} className="btn-secondary">
          {t.product.writeReview}
        </button>
      </div>

      {formOpen && (
        <form onSubmit={submit} className="card-soft mb-8 space-y-4 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label-base" htmlFor="rv-name">{t.product.reviewName} *</label>
              <input id="rv-name" required value={name} onChange={(e) => setName(e.target.value)} className="input-base" />
            </div>
            <div>
              <label className="label-base" htmlFor="rv-city">{t.product.reviewCity}</label>
              <input id="rv-city" value={city} onChange={(e) => setCity(e.target.value)} className="input-base" />
            </div>
          </div>
          <div>
            <span className="label-base">{t.product.reviewStars}</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStars(s)}
                  aria-label={`${s}`}
                  className={cn(
                    "rounded-full px-2 py-1 text-xl transition",
                    s <= stars ? "text-amber-400" : "text-muted-foreground/30"
                  )}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label-base" htmlFor="rv-comment">{t.product.reviewComment} *</label>
            <textarea
              id="rv-comment"
              required
              minLength={10}
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="input-base resize-none"
            />
          </div>
          <button type="submit" disabled={sending} className="btn-primary">
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {t.product.reviewSubmit}
          </button>
        </form>
      )}

      {done && (
        <p className="mb-6 flex items-center gap-2 rounded-2xl bg-primary/10 px-4 py-3 text-sm font-medium text-primary">
          <CheckCircle2 className="h-4 w-4" />
          {t.product.reviewSuccess}
        </p>
      )}

      {list.length === 0 ? (
        <p className="card-soft p-10 text-center text-sm text-muted-foreground">{t.common.noResults}</p>
      ) : (
        <ul className="space-y-4">
          {list.map((r) => (
            <li key={r.id} className="card-soft p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {r.name.charAt(0).toUpperCase()}
                  </span>
                  <div>
                    <p className="text-sm font-semibold">
                      {r.name}
                      {r.city ? <span className="font-normal text-muted-foreground"> — {r.city}</span> : null}
                    </p>
                    <p className="text-xs text-muted-foreground">{formatDate(r.createdAt, lang)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Stars value={r.stars} />
                  {r.verified ? (
                    <span className="badge bg-primary/10 text-primary">{t.product.verified}</span>
                  ) : null}
                </div>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-foreground/85">{r.comment}</p>
              <button
                type="button"
                onClick={() => helpful(r.id)}
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition hover:text-primary"
              >
                <ThumbsUp className="h-3.5 w-3.5" />
                {t.product.helpful} · {r.helpful}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
