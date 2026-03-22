import type { Metadata } from "next";

import "@/app/globals.css";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";
import { getBaseUrl } from "@/lib/utils";

export const metadata: Metadata = {
  metadataBase: new URL(getBaseUrl()),
  title: {
    default: `${APP_NAME} | AI Research Assistant for Students`,
    template: `%s | ${APP_NAME}`
  },
  description:
    "pLUto helps students sharpen narrow research questions, review mock-ranked academic papers, and build a cleaner shortlist before live API integrations arrive in later phases.",
  keywords: [
    "AI research assistant",
    "student research tool",
    "academic paper search",
    "Google Scholar alternative",
    "essay research assistant"
  ],
  openGraph: {
    title: `${APP_NAME} | ${APP_TAGLINE}`,
    description:
      "A polished MVP frontend for students who need better research questions, clearer paper relevance, and a focused shortlist workflow.",
    url: getBaseUrl(),
    siteName: APP_NAME,
    locale: "en_US",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: `${APP_NAME} | ${APP_TAGLINE}`,
    description:
      "A student-first research assistant prototype with mock search, ranking, and shortlist flows."
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
