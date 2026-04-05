import { Suspense } from "react";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { FavoritesProvider } from "@/context/favorites-context";
import ScrollToTop from "@/components/layout/scroll-to-top";
import { DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL } from "@/lib/seo";

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: `${SITE_URL}/`,
  description:
    "Discover the best places to visit in Nepal. Explore all 77 districts with travel guides, top-rated tourist spots, local food, and hidden gems.",
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  logo: {
    "@type": "ImageObject",
    url: `${SITE_URL}/logo.png`,
    width: 512,
    height: 512,
  },
  description:
    "visitNepal77 is Nepal's travel discovery platform covering all 77 districts with travel guides, top-rated places, local food, hidden gems, and real reviews.",
  sameAs: ["https://twitter.com/visitnepal77"],
};

const playfair = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const jakartaSans = Plus_Jakarta_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  title: {
    default: `${SITE_NAME} - Explore Nepal`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Explore all 77 districts of Nepal with travel guides, places, reviews, and local discoveries on visitNepal77.",
  openGraph: {
    siteName: SITE_NAME,
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} social preview`,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@visitnepal77",
    images: [DEFAULT_OG_IMAGE],
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${jakartaSans.variable}`}
      data-scroll-behavior="smooth"
    >
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify([websiteSchema, organizationSchema]) }}
        />
        <Suspense fallback={null}>
          <ScrollToTop />
        </Suspense>
        <FavoritesProvider>
          {children}
        </FavoritesProvider>
        <Analytics />
        {process.env.NEXT_PUBLIC_GA_ID ? (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
        ) : null}
      </body>
    </html>
  );
}
