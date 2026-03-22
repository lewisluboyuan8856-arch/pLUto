import type { Metadata } from "next";

import "@/app/globals.css";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";
import { buildAbsoluteUrl, getSiteUrl, shouldAllowIndexing } from "@/lib/site";

const siteUrl = getSiteUrl();
const allowIndexing = shouldAllowIndexing();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: APP_NAME,
  title: {
    default: `${APP_NAME} | AI Research Assistant for Students`,
    template: `%s | ${APP_NAME}`
  },
  description:
    "pLUto helps students refine narrow research questions, search live academic sources, understand paper relevance in plain English, and build a focused shortlist.",
  keywords: [
    "AI research assistant",
    "student research tool",
    "academic paper search",
    "Google Scholar alternative",
    "essay research assistant"
  ],
  robots: allowIndexing
    ? {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true
        }
      }
    : {
        index: false,
        follow: false,
        googleBot: {
          index: false,
          follow: false
        }
      },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || undefined
  },
  openGraph: {
    title: `${APP_NAME} | ${APP_TAGLINE}`,
    description:
      "An academic research assistant for students who need sharper search queries, stronger paper relevance, and a cleaner shortlist workflow.",
    url: buildAbsoluteUrl("/"),
    siteName: APP_NAME,
    locale: "en_US",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: `${APP_NAME} | ${APP_TAGLINE}`,
    description:
      "Search live academic sources, understand why papers matter, and build a better student research shortlist."
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <div className="min-h-screen">
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
