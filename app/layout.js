import { Geist } from "next/font/google";
import "./globals.css";
import { FavoritesProvider } from "@/context/favorites-context";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

export const metadata = {
  title: "Ghum Nepal",
  description: "A mobile-first Nepal tourism exploration UI built for discovering districts, places, and local experiences.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full">
        <FavoritesProvider>{children}</FavoritesProvider>
      </body>
    </html>
  );
}
