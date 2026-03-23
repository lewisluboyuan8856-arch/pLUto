import type { Metadata } from "next";

import "@/app/globals.css";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { shouldAllowIndexing } from "@/lib/site";

const allowIndexing = shouldAllowIndexing();

export const metadata: Metadata = {
  metadataBase: new URL("https://researchwithai.info"),
  title: "pLUto — AI Research Assistant for Students",
  description:
    "pLUto helps students find, compare, and analyse research papers using AI. Get summaries, comparisons, and insights instantly.",
  icons: {
    icon: "/favicon.ico"
  },
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
    title: "pLUto — AI Research Assistant",
    description: "Compare research papers and analyse sources using AI.",
    url: "https://researchwithai.info",
    siteName: "pLUto",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630
      }
    ],
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "pLUto — AI Research Assistant",
    description: "Find and compare research papers using AI",
    images: ["/og-image.png"]
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
