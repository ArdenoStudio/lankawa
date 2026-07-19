import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import localFont from "next/font/local";
import { Inter, Noto_Sans_Sinhala, Noto_Sans_Tamil } from "next/font/google";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { DataSaverProvider } from "@/components/DataSaverProvider";
import { PwaRegister } from "@/components/PwaRegister";
import { InstallPrompt } from "@/components/InstallPrompt";
import { routing } from "@/i18n/routing";
import { metadata as brandMetadata } from "@/lib/brand";
import "../globals.css";

const calSans = localFont({
  src: [
    {
      path: "../../../public/fonts/cal-sans-latin-400-normal.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../../public/fonts/cal-sans-latin-ext-400-normal.woff2",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-cal-sans",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const notoSinhala = Noto_Sans_Sinhala({
  subsets: ["sinhala"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-sinhala",
  display: "swap",
});

const notoTamil = Noto_Sans_Tamil({
  subsets: ["tamil"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-tamil",
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });

  return {
    title: t("title"),
    description: t("description"),
    manifest: "/manifest.json",
    themeColor: brandMetadata.themeColor,
    icons: {
      icon: brandMetadata.favicon,
      shortcut: brandMetadata.favicon,
      apple: brandMetadata.icons["192"],
    },
    openGraph: {
      title: t("title"),
      description: t("description"),
      images: [brandMetadata.ogImage],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
      images: [brandMetadata.ogImage],
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();
  const tA11y = await getTranslations({ locale, namespace: "a11y" });

  return (
    <html lang={locale} className="h-full">
      <body
        className={`${calSans.variable} ${inter.variable} ${notoSinhala.variable} ${notoTamil.variable} min-h-full bg-slate-950 font-sans text-slate-100 antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
          <DataSaverProvider>
            <a href="#main-content" className="lk-skip-link">
              {tA11y("skipToContent")}
            </a>
            <PwaRegister />
            <InstallPrompt />
            <SiteHeader />
            <main
              id="main-content"
              tabIndex={-1}
              className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-6xl flex-1 flex-col px-4 py-8 md:py-10"
            >
              {children}
            </main>
            <SiteFooter />
          </DataSaverProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
