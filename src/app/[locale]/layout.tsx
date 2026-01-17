import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "../globals.css";
import { getSite } from "@/lib/content";
import { assertLocale } from "@/lib/i18n";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

type LayoutProps = Readonly<{
  children: React.ReactNode;
  params: { locale: string } | Promise<{ locale: string }>;
}>;

type SiteContent = {
  siteName: string;
  baseUrl: string;
  defaultLocale: string;
  seo: Record<string, { title: string; description: string }>;
  openGraph?: {
    image?: string;
    twitterCard?: "summary" | "summary_large_image" | "player" | "app";
  };
};

async function resolveLocale(params: LayoutProps["params"]) {
  const resolvedParams = await Promise.resolve(params);
  const locale = resolvedParams.locale;

  assertLocale(locale);

  return locale;
}

export async function generateMetadata({
  params,
}: LayoutProps): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const site = (await getSite()) as SiteContent;
  const metadataBase = new URL(site.baseUrl);
  const seo = site.seo?.[locale] ?? site.seo?.[site.defaultLocale];
  const title = seo?.title ?? site.siteName;
  const description = seo?.description ?? "";
  const canonical = new URL(`/${locale}`, metadataBase).toString();
  const ogImage = site.openGraph?.image
    ? new URL(site.openGraph.image, metadataBase).toString()
    : undefined;

  return {
    metadataBase,
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: site.siteName,
      type: "website",
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: site.openGraph?.twitterCard ?? "summary_large_image",
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export default async function RootLayout({ children, params }: LayoutProps) {
  const locale = await resolveLocale(params);

  return (
    <html lang={locale} className="theme-slate" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider>
          <div className="min-h-screen flex flex-col bg-background text-foreground">
            <Navbar locale={locale} />
            <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8 flex-1">
              <div className="desktop-content">{children}</div>
            </main>
            <Footer locale={locale} />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}