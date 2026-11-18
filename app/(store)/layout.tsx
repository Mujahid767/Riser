import { Suspense } from "react";
import Script from "next/script";
import Header from "@/components/store/header";
import Footer from "@/components/store/footer";
import WhatsAppButton from "@/components/store/whatsapp-button";
import StoreTracking from "@/components/store/store-tracking";
import { getSiteContent } from "@/lib/cms/store";
import {
  getPublicMarketingConfig,
  type PublicMarketingConfig,
} from "@/lib/marketing/settings";

const PIXEL_ID_RE = /^\d{5,30}$/;
const GTM_ID_RE = /^GTM-[A-Z0-9]{4,20}$/i;
const GA4_ID_RE = /^G-[A-Z0-9]{4,20}$/i;

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [content, marketing] = await Promise.all([
    getSiteContent(),
    getPublicMarketingConfig().catch(() => ({} as PublicMarketingConfig)),
  ]);

  const safePixelId =
    marketing.metaPixelId && PIXEL_ID_RE.test(marketing.metaPixelId)
      ? marketing.metaPixelId
      : undefined;
  const safeGtmId =
    marketing.gtmId && GTM_ID_RE.test(marketing.gtmId)
      ? marketing.gtmId
      : undefined;
  const safeGa4Id =
    marketing.ga4Id && GA4_ID_RE.test(marketing.ga4Id)
      ? marketing.ga4Id
      : undefined;

  return (
    <div className="bg-[#070709] text-white min-h-screen flex flex-col justify-between relative">
      {/* Storefront-only browser analytics (never loaded on /admin/*) */}
      {safeGtmId && (
        <>
          <Script id="riser-gtm" strategy="afterInteractive">
            {`
              if (!window.location.pathname.startsWith('/admin') && !window.__riserGtmInit) {
                window.__riserGtmInit = true;
                (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer','${safeGtmId}');
              }
            `}
          </Script>
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${safeGtmId}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        </>
      )}

      {safeGa4Id && (
        <>
          <Script
            id="riser-ga4-lib"
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${safeGa4Id}`}
          />
          <Script id="riser-ga4-init" strategy="afterInteractive">
            {`
              if (!window.location.pathname.startsWith('/admin') && !window.__riserGa4Init) {
                window.__riserGa4Init = true;
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                window.gtag = gtag;
                gtag('js', new Date());
                gtag('config', '${safeGa4Id}');
              }
            `}
          </Script>
        </>
      )}

      {safePixelId && (
        <>
          <Script id="riser-meta-pixel" strategy="afterInteractive">
            {`
              if (!window.location.pathname.startsWith('/admin') && !window.__riserMetaPixelInit) {
                window.__riserMetaPixelInit = true;
                !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
                n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
                document,'script','https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${safePixelId}');
                fbq('track', 'PageView');
              }
            `}
          </Script>
          <noscript>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              src={`https://www.facebook.com/tr?id=${safePixelId}&ev=PageView&noscript=1`}
              alt=""
            />
          </noscript>
        </>
      )}

      <Suspense fallback={null}>
        <StoreTracking />
      </Suspense>

      <Header announcement={content.announcement} />
      <main className="flex-1">{children}</main>
      <Footer content={content} />
      <WhatsAppButton
        phoneNumber={content.contact?.whatsapp || "01577049566"}
        message={content.contact?.whatsappMessage}
      />
    </div>
  );
}
