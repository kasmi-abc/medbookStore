import type { Metadata } from "next";
import { Facebook, Instagram, Mail, MapPin, MessageCircle, Phone, Timer } from "lucide-react";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { ContactForm } from "@/components/contact-form";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const t = getDictionary(isLocale(lang) ? lang : "en");
  return { title: `${t.contact.title} · Medical Books DZ`, description: t.contact.subtitle };
}

export default async function ContactPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale = (isLocale(lang) ? lang : "en") as Locale;
  const t = getDictionary(locale);

  const details = [
    { icon: Phone, label: t.contact.phoneLabel, value: t.footer.phone, href: `tel:${t.footer.phone.replace(/\s/g, "")}` },
    { icon: Mail, label: t.contact.emailLabel, value: t.footer.email, href: `mailto:${t.footer.email}` },
    { icon: MapPin, label: t.contact.addressLabel, value: t.footer.address },
    { icon: Timer, label: t.contact.hoursLabel, value: t.footer.hours },
  ];

  return (
    <div className="container-store py-14">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="section-title">{t.contact.title}</h1>
        <p className="section-sub">{t.contact.subtitle}</p>
      </div>

      <div className="mx-auto mt-10 grid max-w-4xl gap-8 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-4">
          {details.map((d) => (
            <div key={d.label} className="card-soft flex items-start gap-3 p-4">
              <d.icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">{d.label}</p>
                {d.href ? (
                  <a href={d.href} dir="ltr" className="block truncate font-medium hover:text-primary">{d.value}</a>
                ) : (
                  <p className="font-medium">{d.value}</p>
                )}
              </div>
            </div>
          ))}

          <div className="flex flex-wrap gap-2">
            <a
              href="https://wa.me/213555123456"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
            >
              <MessageCircle className="h-4 w-4 text-primary" />
              {t.contact.whatsapp}
            </a>
            <a
              href="https://www.instagram.com/medical.books.dz/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
            >
              <Instagram className="h-4 w-4 text-primary" />
              {t.contact.instagram}
            </a>
            <a
              href="https://www.facebook.com/107350227737347?ref=PRODASH_UPSELL_xav_ig_profile_page_web"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
            >
              <Facebook className="h-4 w-4 text-primary" />
              {t.contact.facebook}
            </a>
          </div>
        </div>

        <ContactForm email={t.footer.email} />
      </div>
    </div>
  );
}
