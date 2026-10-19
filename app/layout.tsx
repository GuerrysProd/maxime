import type { Metadata, Viewport } from "next";
import { DM_Mono, Funnel_Display } from "next/font/google";
import localFont from "next/font/local";
import { ViewTransition } from "react";
import { MotionObserver } from "@/components/layout/MotionObserver";
import { SiteFooter, TOP_ID } from "@/components/layout/SiteFooter";
import { SkipLink } from "@/components/layout/SkipLink";
import { StickyCTA } from "@/components/layout/StickyCTA";
import { getHome, getSite, getUi } from "@/lib/content";
import "./globals.css";

/* Gambarino (Fontshare, licence ITF Free Font) : une seule graisse, 400. */
const gambarino = localFont({
  src: "../public/fonts/gambarino-regular.woff2",
  variable: "--font-gambarino",
  weight: "400",
  display: "swap",
  fallback: ["Georgia", "Times New Roman", "serif"],
});

const funnel = Funnel_Display({
  subsets: ["latin"],
  variable: "--font-funnel",
  display: "swap",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-mono",
  display: "swap",
});

const site = getSite();
const home = getHome();

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: { default: home.meta.title, template: `%s — ${site.identity.name}` },
  description: home.meta.description,
  applicationName: site.identity.name,
  openGraph: { type: "website", locale: "fr_FR", siteName: site.identity.name },
};

export const viewport: Viewport = {
  themeColor: "#F5F0E8",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${gambarino.variable} ${funnel.variable} ${dmMono.variable}`}>
      <head>
        {/* Avant le premier rendu : active les apparitions au défilement (sans JS, tout reste visible). */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.setAttribute('data-js','')" }} />
      </head>
      <body>
        <div id={TOP_ID} />
        <SkipLink />
        <ViewTransition>{children}</ViewTransition>
        <SiteFooter />
        <StickyCTA cta={site.primaryCta} phone={site.contact.phone} callLabel={getUi().call} label={getUi().quickActions} />
        <MotionObserver />
      </body>
    </html>
  );
}
