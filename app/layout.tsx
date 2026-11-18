import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { getPublicMarketingConfig, type PublicMarketingConfig } from "@/lib/marketing/settings";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ),
  title: {
    default: "Riser — Girls' Dresses, Baby Frocks & Party Wear in Bangladesh",
    template: "%s | Riser",
  },
  description:
    "Shop Riser for girls' clothing in Bangladesh — Royal Baby Frocks, Party Frocks, Nayra Cut Dresses with Skirt, Kids Two-Piece & Three-Piece sets, and Women's Ethnic Wear since 1998.",
  keywords: [
    "girls dresses Bangladesh",
    "baby frocks",
    "kids party frocks",
    "nayra cut dress",
    "girls three piece",
    "children's clothing Bangladesh",
    "kids fashion Dhaka",
    "Riser",
  ],
  authors: [{ name: "Riser" }],
  creator: "Riser",
  publisher: "Riser",
  openGraph: {
    type: "website",
    locale: "en_BD",
    siteName: "Riser",
    title: "Riser — Girls' Dresses, Baby Frocks & Kids Fashion Since 1998",
    description:
      "Shop baby frocks, girls' party wear, Nayra cut sets, and kids ethnic dresses in Bangladesh.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Riser — Girls' Dresses, Baby Frocks & Party Wear",
    description: "Premium girls' dresses, frocks & party wear in Bangladesh since 1998.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const marketing = await getPublicMarketingConfig().catch(() => ({} as PublicMarketingConfig));
  const googleSiteVerification = marketing.googleSiteVerification;
  const facebookDomainVerification = marketing.facebookDomainVerification;

  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        {/* Domain & Search Console verification meta tags (browser tracking pixels run only in store layout) */}
        {googleSiteVerification && (
          <meta name="google-site-verification" content={googleSiteVerification} />
        )}
        {facebookDomainVerification && (
          <meta name="facebook-domain-verification" content={facebookDomainVerification} />
        )}
      </head>
      <body className="font-sans antialiased bg-[#070709] text-white selection:bg-brand-600 selection:text-white">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
