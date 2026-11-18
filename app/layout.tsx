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
  const gtmId = marketing.gtmId;
  const ga4Id = marketing.ga4Id;
  const metaPixelId = marketing.metaPixelId;
  const googleSiteVerification = marketing.googleSiteVerification;
  const facebookDomainVerification = marketing.facebookDomainVerification;

  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        {/* Verification meta tags */}
        {googleSiteVerification && (
          <meta name="google-site-verification" content={googleSiteVerification} />
        )}
        {facebookDomainVerification && (
          <meta name="facebook-domain-verification" content={facebookDomainVerification} />
        )}

        {/* Google Tag Manager (GTM) */}
        {gtmId && (
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${gtmId}');`,
            }}
          />
        )}

        {/* Google Analytics 4 (GA4) */}
        {ga4Id && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${ga4Id}');
                `,
              }}
            />
          </>
        )}

        {/* Meta Pixel */}
        {metaPixelId && (
          <>
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                  n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
                  n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
                  t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
                  document,'script','https://connect.facebook.net/en_US/fbevents.js');
                  fbq('init', '${metaPixelId}');
                  fbq('track', 'PageView');
                `,
              }}
            />
            <noscript>
              <img
                height="1"
                width="1"
                style={{ display: "none" }}
                src={`https://www.facebook.com/tr?id=${metaPixelId}&ev=PageView&noscript=1`}
                alt=""
              />
            </noscript>
          </>
        )}
      </head>
      <body className="font-sans antialiased bg-[#070709] text-white selection:bg-brand-600 selection:text-white">
        {gtmId && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        )}
        {children}
        <Toaster />
      </body>
    </html>
  );
}
