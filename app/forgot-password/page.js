import ForgotPasswordClient from "./ForgotPasswordClient";

export const metadata = {
  title: "Forgot Password - Ghum Nepal",
  description: "Reset your Ghum Nepal account password. Enter your email to receive a password reset link.",
  openGraph: {
    title: "Forgot Password - Ghum Nepal",
    description: "Reset your Ghum Nepal account password. Enter your email to receive a password reset link.",
    url: "https://ghumnepal.com/forgot-password",
    siteName: "Ghum Nepal",
    images: [
      {
        url: "https://ghumnepal.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Forgot Password - Ghum Nepal",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Forgot Password - Ghum Nepal",
    description: "Reset your Ghum Nepal account password. Enter your email to receive a password reset link.",
    images: ["https://ghumnepal.com/og-image.jpg"],
    site: "@ghumnepal",
  },
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordClient />;
}
