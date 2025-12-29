import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import "./globals.css";

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-ibm-plex-arabic",
  display: "swap",
});

export const metadata: Metadata = {
  title: "فيصل بن سعيدان | Faisal Bin Saedan Properties",
  description:
    "اكتشف أرقى المشاريع العقارية مع مجموعة فيصل بن سعيدان. مجتمعات سكنية فاخرة في أفضل مواقع المملكة العربية السعودية.",
  keywords: [
    "فيصل بن سعيدان",
    "عقارات",
    "السعودية",
    "الرياض",
    "فلل",
    "شقق",
    "مجتمعات سكنية",
  ],
  authors: [{ name: "Faisal Bin Saedan Group" }],
  creator: "Faisal Bin Saedan Group",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Bin Saedan",
  },
  formatDetection: {
    telephone: true,
  },
  openGraph: {
    type: "website",
    locale: "ar_SA",
    url: "https://binsaedan.com",
    siteName: "فيصل بن سعيدان",
    title: "فيصل بن سعيدان | Faisal Bin Saedan Properties",
    description:
      "اكتشف أرقى المشاريع العقارية مع مجموعة فيصل بن سعيدان",
  },
  twitter: {
    card: "summary_large_image",
    title: "فيصل بن سعيدان | Faisal Bin Saedan Properties",
    description:
      "اكتشف أرقى المشاريع العقارية مع مجموعة فيصل بن سعيدان",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#1a365d",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={ibmPlexArabic.variable}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="font-sans antialiased bg-[var(--color-bg)]">
        {children}
      </body>
    </html>
  );
}
