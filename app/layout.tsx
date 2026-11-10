import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

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
    default: "Riser Atelier — Luxury Haute Couture",
    template: "%s | Riser Atelier",
  },
  description:
    "Riser Haute Couture — Signature Nayra Cut with Skirt, Royal Baby Frocks, Two-Piece & Three-Piece sets, and Architectural Short Tops. Handcrafted in Bangladesh since 1998.",
  keywords: [
    "children's clothing",
    "girls dresses",
    "kids fashion",
    "frocks",
    "party wear",
    "Bangladesh kids clothes",
    "premium children's wear",
    "Riser",
  ],
  authors: [{ name: "Riser" }],
  creator: "Riser",
  publisher: "Riser",
  openGraph: {
    type: "website",
    locale: "en_BD",
    siteName: "Riser",
    title: "Riser — Premium Children's Fashion Since 1998",
    description:
      "Premium girls' clothing — dresses, frocks, party wear. Established 1998.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Riser — Premium Children's Fashion",
    description: "Premium girls' clothing since 1998.",
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        {/* Google Analytics */}
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}');
                `,
              }}
            />
          </>
        )}
        {/* Meta Pixel */}
        {process.env.NEXT_PUBLIC_META_PIXEL_ID && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
                n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
                document,'script','https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${process.env.NEXT_PUBLIC_META_PIXEL_ID}');
                fbq('track', 'PageView');
              `,
            }}
          />
        )}
      </head>
      <body className="font-sans antialiased bg-[#070709] text-white selection:bg-brand-600 selection:text-white">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
