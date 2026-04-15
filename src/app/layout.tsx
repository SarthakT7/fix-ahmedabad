import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Fix AHM — Report Garbage, Tag Your Neta",
    template: "%s | Fix AHM",
  },
  description:
    "Crowdsourced garbage reporting for Ahmedabad. Report dumps, tag your MLA/MP/Corporator, and pressure authorities to clean up. 48 wards covered.",
  keywords: [
    "Fix AHM",
    "fixahm",
    "Ahmedabad garbage",
    "garbage reporting",
    "AMC complaint",
    "Ahmedabad Municipal Corporation",
    "clean Ahmedabad",
    "waste management",
    "civic complaint",
    "MLA tag",
    "MP tag",
    "corporator",
    "ward garbage",
    "crowdsourced",
    "neta tag",
  ],
  authors: [{ name: "Fix AHM" }],
  creator: "Fix AHM",
  metadataBase: new URL("https://fixahm.xyz"),
  openGraph: {
    title: "Fix AHM — Report Garbage, Tag Your Neta",
    description:
      "Crowdsourced garbage reporting for Ahmedabad. Report dumps on the map, tag your MLA/MP/Corporator on X, and pressure authorities to clean up.",
    url: "https://fixahm.xyz",
    siteName: "Fix AHM",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Fix AHM — Crowdsourced Garbage Map for Ahmedabad",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fix AHM — Report Garbage, Tag Your Neta",
    description:
      "Crowdsourced garbage reporting for Ahmedabad. 48 wards. Tag your MLA/MP. Fix Ahmedabad.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#16a34a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full`}>
      <body className="h-full antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Fix AHM",
              description:
                "Crowdsourced garbage reporting for Ahmedabad. Report dumps, tag your MLA/MP/Corporator, and pressure authorities to clean up.",
              url: "https://fixahm.xyz",
              applicationCategory: "UtilityApplication",
              operatingSystem: "Web",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "INR",
              },
              areaServed: {
                "@type": "City",
                name: "Ahmedabad",
                containedInPlace: {
                  "@type": "State",
                  name: "Gujarat",
                },
              },
            }),
          }}
        />
        {children}
      </body>
    </html>
  );
}
