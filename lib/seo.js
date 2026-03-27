export const SITE_URL = "https://visitnepal77.com";
export const SITE_NAME = "visitNepal77";
export const SITE_HANDLE = "@visitnepal77";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/opengraph-image`;

export function toAbsoluteUrl(path = "/") {
  if (!path) return SITE_URL;

  if (/^https?:\/\//i.test(path)) {
    return path.replace(/^http:\/\//i, "https://");
  }

  return new URL(path.startsWith("/") ? path : `/${path}`, SITE_URL).toString();
}

export function buildMetadata({
  title,
  description,
  path = "/",
  image = DEFAULT_OG_IMAGE,
  imageAlt,
  keywords,
  type = "website",
  noIndex = false,
} = {}) {
  const url = toAbsoluteUrl(path);
  const absoluteImage = toAbsoluteUrl(image);

  return {
    title,
    description,
    ...(keywords?.length ? { keywords } : {}),
    alternates: {
      canonical: url,
    },
    ...(noIndex
      ? {
          robots: {
            index: false,
            follow: false,
            googleBot: {
              index: false,
              follow: false,
            },
          },
        }
      : {}),
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      images: [
        {
          url: absoluteImage,
          width: 1200,
          height: 630,
          alt: imageAlt || title || SITE_NAME,
        },
      ],
      locale: "en_US",
      type,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [absoluteImage],
      site: SITE_HANDLE,
    },
  };
}
