import { Suspense } from "react";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { FavoritesProvider } from "@/context/favorites-context";
import ScrollToTop from "@/components/layout/scroll-to-top";
import { DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL } from "@/lib/seo";

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  alternateName: "Visit Nepal 77",
  url: SITE_URL,
  description:
    "Discover the best places to visit in Nepal. Explore all 77 districts with travel guides, top-rated tourist spots, local food, and hidden gems.",
  // SiteLinksSearchBox — shows a search box directly in Google SERP for branded queries
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/allplaces?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  alternateName: "Visit Nepal 77",
  url: SITE_URL,
  logo: {
    "@type": "ImageObject",
    url: `${SITE_URL}/logo.png`,
    width: 512,
    height: 512,
  },
  description:
    "visitNepal77 is Nepal's travel discovery platform covering all 77 districts with travel guides, top-rated places, local food, hidden gems, and real reviews.",
  foundingDate: "2024",
  areaServed: {
    "@type": "Country",
    name: "Nepal",
    identifier: "NP",
  },
  knowsAbout: ["Nepal travel", "Nepal tourism", "Nepal districts", "Nepal places"],
  sameAs: [
    "https://twitter.com/visitnepal77",
    "https://www.facebook.com/visitnepal77",
    "https://www.instagram.com/visitnepal77",
  ],
};

const playfair = Playfair_Display({
  display: "swap",
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  preload: true,
});

const jakartaSans = Plus_Jakarta_Sans({
  display: "swap",
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  preload: true,
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
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: SITE_NAME,
    statusBarStyle: "default",
  },
  icons: {
    icon: "/favicon.png",
    apple: "/logo.png",
    shortcut: "/favicon.png",
  },
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
      <head>
        {/* Preconnect to image CDNs so DNS+TLS are resolved before LCP image fetch */}
        <link rel="preconnect" href="https://ik.imagekit.io" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        {/* Analytics DNS resolved early but connection not held open */}
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
      </head>
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
        {/* lazyOnload: deferred until page is fully idle — never blocks FCP/LCP/TBT */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-M8K3RQ680H"
          strategy="lazyOnload"
        />
        <Script id="google-analytics" strategy="lazyOnload">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = gtag;
            gtag('js', new Date());
            gtag('config', 'G-M8K3RQ680H', { send_page_view: true });
          `}
        </Script>
      </body>
    </html>
  );
}
