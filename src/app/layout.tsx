import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "SDG FOCUSED PROJECT EXPO | IEEE WIE & CS KARE",
  description: "Organized by IEEE Women in Engineering KARE & IEEE Computer Society KARE at Kalasalingam Academy of Research and Education. September 3-4, 2026.",
  keywords: ["SDG Project Expo", "IEEE WIE KARE", "IEEE CS KARE", "KLU", "Project Expo 2026"],
  authors: [{ name: "IEEE CS & WIE KARE" }],
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={outfit.variable}>
      <body className="bg-neu-bg text-neu-text antialiased selection:bg-neu-gold selection:text-white">
        {children}
      </body>
    </html>
  );
}
