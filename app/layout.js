import { Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";
import { FavoritesProvider } from "@/context/favorites-context";

const playfair = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const dmSans = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

export const metadata = {
  title: "Ghum Nepal",
  description: "Explore all 77 districts of Nepal — hidden gems, local foods, sacred places and mountain stories.",
};

export default async function RootLayout({ children }) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable}`}>
      <body>
        <FavoritesProvider initialFavorites={[]} initialAuthenticated={false}>
          {children}
        </FavoritesProvider>
      </body>
    </html>
  );
}
