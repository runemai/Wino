import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vinterest — Min personlige vinjournal",
  description:
    "Fang vinetiketter, få AI-analyseret metadata og opbyg min private vin-samling.",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    viewportFit: "cover",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="da">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-[#fafafa] font-sans text-[#1f2937] antialiased`}
        style={{ letterSpacing: '-0.01em' }}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
