import type { Metadata } from "next";
import { Inter, Poppins, Tajawal } from "next/font/google";
import "../globals.css";
import { Providers } from "@/components/providers";
import { ToastProvider } from "@/components/toast";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { dirOf, isLocale, locales, type Locale } from "@/lib/i18n/config";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const poppins = Poppins({ subsets: ["latin"], weight: ["500", "600", "700", "800"], variable: "--font-poppins" });
const tajawal = Tajawal({ subsets: ["arabic"], weight: ["400", "500", "700", "800"], variable: "--font-tajawal" });

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : "en";
  const t = getDictionary(locale);
  return {
    metadataBase: new URL(process.env.SITE_URL || "http://localhost:3000"),
    title: {
      default: `${t.brand.name} — ${t.brand.tagline}`,
      template: `%s | ${t.brand.name}`,
    },
    description: t.home.heroSubtitle,
    icons: { icon: "/favicon.ico", apple: "/apple-icon.png" },
    openGraph: {
      title: t.brand.name,
      description: t.brand.tagline,
      type: "website",
      images: ["/logo.jpg"],
    },
  };
}

const themeScript = `(function(){try{var t=localStorage.getItem("mdz-theme");if(t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme: dark)").matches)){document.documentElement.classList.add("dark")}}catch(e){}})();`;

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : "en";
  const dict = getDictionary(locale);

  return (
    <html
      lang={locale}
      dir={dirOf(locale)}
      suppressHydrationWarning
      className={`${inter.variable} ${poppins.variable} ${tajawal.variable}`}
    >
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <Providers lang={locale} dict={dict}>
          <ToastProvider>
            <Navbar />
            <main className="min-h-[60vh]">{children}</main>
            <Footer t={dict} lang={locale} />
          </ToastProvider>
        </Providers>
      </body>
    </html>
  );
}
