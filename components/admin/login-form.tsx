"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LockKeyhole } from "lucide-react";
import { useLang } from "@/components/providers";
import { useToast } from "@/components/toast";
import { adminLogin } from "@/app/actions/admin";

export function LoginForm() {
  const { t, lang } = useLang();
  const { toast } = useToast();
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPending(true);
    const res = await adminLogin(new FormData(e.currentTarget));
    setPending(false);
    if (res.ok) {
      router.replace(`/${lang}/admin`);
      router.refresh();
    } else {
      toast(t.admin.invalid);
    }
  };

  return (
    <form onSubmit={submit} className="card-soft mx-auto w-full max-w-sm p-8">
      <LockKeyhole className="mx-auto h-10 w-10 text-primary" />
      <h1 className="mt-4 text-center font-display text-xl font-bold">{t.admin.signIn}</h1>

      <div className="mt-6 space-y-4">
        <div>
          <label className="label-base" htmlFor="ad-user">{t.admin.username}</label>
          <input id="ad-user" name="username" required autoComplete="username" dir="ltr" className="input-base" />
        </div>
        <div>
          <label className="label-base" htmlFor="ad-pass">{t.admin.password}</label>
          <input
            id="ad-pass"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            dir="ltr"
            className="input-base"
          />
        </div>
      </div>

      <button type="submit" disabled={pending} className="btn-primary mt-6 w-full py-3">
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <LockKeyhole className="h-4 w-4" />}
        {t.admin.loginBtn}
      </button>
    </form>
  );
}
