"use client";
import { useState } from "react";
import { Loader2, Send } from "lucide-react";
import { useLang } from "@/components/providers";
import { useToast } from "@/components/toast";

export function ContactForm({ email }: { email: string }) {
  const { t } = useLang();
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const subject = encodeURIComponent(`${t.contact.title} — ${form.name}`);
    const body = encodeURIComponent(`${form.message}\n\n— ${form.name} <${form.email}>`);
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    setTimeout(() => {
      setBusy(false);
      toast(t.contact.sent);
      setForm({ name: "", email: "", message: "" });
    }, 600);
  };

  return (
    <form onSubmit={submit} className="card-soft p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label-base" htmlFor="ct-name">{t.contact.name}</label>
          <input
            id="ct-name"
            required
            minLength={2}
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="input-base"
          />
        </div>
        <div>
          <label className="label-base" htmlFor="ct-email">{t.contact.emailLabel}</label>
          <input
            id="ct-email"
            required
            type="email"
            dir="ltr"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className="input-base"
          />
        </div>
      </div>
      <div className="mt-4">
        <label className="label-base" htmlFor="ct-msg">{t.contact.message}</label>
        <textarea
          id="ct-msg"
          required
          rows={5}
          value={form.message}
          onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
          className="input-base resize-none"
        />
      </div>
      <button type="submit" disabled={busy} className="btn-primary mt-5 w-full py-3">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        {t.contact.send}
      </button>
    </form>
  );
}
