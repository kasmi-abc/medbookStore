"use client";
import { useState } from "react";
import { Loader2, MailCheck } from "lucide-react";
import { subscribeNewsletter } from "@/app/actions/newsletter";
import { useLang } from "@/components/providers";
import { useToast } from "@/components/toast";
import { cn } from "@/lib/utils";

export function NewsletterForm({ className }: { className?: string }) {
  const { t, lang } = useLang();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await subscribeNewsletter(email);
    setLoading(false);
    if (res.ok) {
      setDone(true);
      setEmail("");
      toast(t.home.newsletterDone);
    } else {
      toast(res.message === "invalid" ? t.home.newsletterErr : t.common.error);
    }
  };

  if (done) {
    return (
      <div className={cn("flex items-center gap-2 rounded-full bg-primary/10 px-4 py-3 text-sm font-medium text-primary", className)}>
        <MailCheck className="h-4 w-4" />
        {t.home.newsletterDone}
      </div>
    );
  }

  return (
    <form onSubmit={submit} className={cn("flex w-full max-w-md flex-col gap-2 sm:flex-row", className)}>
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={t.footer.emailPlaceholder}
        aria-label={t.footer.emailPlaceholder}
        dir={lang === "ar" ? "rtl" : "ltr"}
        className="input-base flex-1"
      />
      <button type="submit" disabled={loading} className="btn-primary shrink-0">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {t.footer.subscribe}
      </button>
    </form>
  );
}
