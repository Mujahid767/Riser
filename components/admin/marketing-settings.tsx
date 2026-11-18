"use client";

import { useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Send,
  Zap,
  Globe,
  Radio,
  Share2,
  Sparkles,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import type { MarketingSettingsView } from "@/lib/marketing/settings";
import type { OrderTrackingEvent } from "@/lib/orders/types";
import type { CapiFailureSummary } from "@/lib/analytics/order-tracking";

type LedgerData = {
  events: OrderTrackingEvent[];
  counts: { sent: number; failed: number; pending: number; expired?: number };
  summary?: CapiFailureSummary;
};

const inputClass =
  "w-full bg-black/40 border border-white/10 px-3 py-2.5 text-sm text-white outline-none focus:border-white/50 placeholder:text-neutral-600";
const labelClass = "text-[10px] uppercase tracking-widest text-neutral-400 font-mono";

export default function MarketingSettingsClient({
  initial,
  initialLedger,
}: {
  initial: MarketingSettingsView;
  initialLedger?: LedgerData;
}) {
  const [settings, setSettings] = useState(initial);
  const [ledger, setLedger] = useState<LedgerData>(
    initialLedger ?? { events: [], counts: { sent: 0, failed: 0, pending: 0 } }
  );
  const [retryingAll, setRetryingAll] = useState(false);
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [gtmId, setGtmId] = useState(initial.gtmId);
  const [ga4Id, setGa4Id] = useState(initial.ga4Id);
  const [metaPixelId, setMetaPixelId] = useState(initial.metaPixelId);
  const [metaCapiToken, setMetaCapiToken] = useState("");
  const [metaTestEventCode, setMetaTestEventCode] = useState(initial.metaTestEventCode);
  const [googleSiteVerification, setGoogleSiteVerification] = useState(initial.googleSiteVerification);
  const [facebookDomainVerification, setFacebookDomainVerification] = useState(initial.facebookDomainVerification);
  const [enableAdvancedMatching, setEnableAdvancedMatching] = useState(initial.enableAdvancedMatching);

  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [copiedFeed, setCopiedFeed] = useState(false);
  const [copiedSitemap, setCopiedSitemap] = useState(false);

  const copyToClipboard = (text: string, type: "feed" | "sitemap") => {
    navigator.clipboard.writeText(text);
    if (type === "feed") {
      setCopiedFeed(true);
      setTimeout(() => setCopiedFeed(false), 2000);
    } else {
      setCopiedSitemap(true);
      setTimeout(() => setCopiedSitemap(false), 2000);
    }
  };

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const res = await fetch("/api/admin/marketing", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        gtmId,
        ga4Id,
        metaPixelId,
        metaCapiToken: metaCapiToken || undefined,
        metaTestEventCode,
        googleSiteVerification,
        facebookDomainVerification,
        purchaseEventTrigger: "ORDER_DELIVERED",
        enableAdvancedMatching,
      }),
    });

    const data = await res.json().catch(() => ({}));
    setSaving(false);

    if (!res.ok || !data.settings) {
      setMessage({ kind: "error", text: data.error || "Failed to save settings." });
      return;
    }

    setSettings(data.settings);
    setMetaCapiToken("");
    setMessage({ kind: "ok", text: "SEO & Marketing settings saved successfully!" });
  }

  async function handleTestCapi() {
    setTesting(true);
    setMessage(null);

    const res = await fetch("/api/admin/marketing", { method: "POST" });
    const data = await res.json().catch(() => ({}));
    setTesting(false);

    if (!res.ok) {
      setMessage({ kind: "error", text: data.error || "Failed to send test event to Meta." });
      return;
    }

    setMessage({
      kind: "ok",
      text: `${data.message} (Test Order: ${data.testOrderId})`,
    });
  }

  async function refreshLedger() {
    const res = await fetch("/api/admin/marketing");
    const data = (await res.json().catch(() => ({}))) as { ledger?: LedgerData };
    if (data.ledger) setLedger(data.ledger);
  }

  async function handleRetryAll() {
    setRetryingAll(true);
    setMessage(null);
    const res = await fetch("/api/admin/orders/tracking-retry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ retryAll: true }),
    });
    const data = (await res.json().catch(() => ({}))) as { retried?: number; sent?: number; failed?: number; error?: string };
    setRetryingAll(false);
    await refreshLedger();
    if (!res.ok) {
      setMessage({ kind: "error", text: data.error || "Could not retry failed events." });
    } else {
      setMessage({
        kind: "ok",
        text: `Retried ${data.retried ?? 0} event(s): ${data.sent ?? 0} sent, ${data.failed ?? 0} failed.`,
      });
    }
  }

  async function handleRetrySingle(id: string) {
    setRetryingId(id);
    setMessage(null);
    const res = await fetch("/api/admin/orders/tracking-retry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    setRetryingId(null);
    await refreshLedger();
    if (!res.ok) {
      setMessage({ kind: "error", text: data.error || "Retry failed." });
    } else {
      setMessage({ kind: "ok", text: "CAPI event sent successfully." });
    }
  }

  return (
    <div className="max-w-5xl space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="p-1.5 bg-brand-500/10 border border-brand-500/20 text-brand-400">
            <TrendingUp className="w-5 h-5" />
          </span>
          <h1 className="text-2xl font-bold text-white tracking-wide">SEO & Marketing Integrations</h1>
        </div>
        <p className="text-neutral-400 text-sm">
          Supercharge your Facebook Ads algorithm, track genuine buyers, and rank on Google with real-time catalog feeds and server-side tracking.
        </p>
      </div>

      {message && (
        <div
          className={`p-4 border text-sm flex items-center gap-2 ${
            message.kind === "ok"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
              : "border-red-500/30 bg-red-500/10 text-red-300"
          }`}
        >
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>{message.text}</span>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Meta Pixel & Conversions API (CAPI) */}
        <div className="bg-admin-card border border-admin-border p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-blue-400" />
              <h2 className="text-white font-semibold text-sm uppercase tracking-wider">
                Meta Pixel & Conversions API (CAPI)
              </h2>
            </div>
            <span className="text-[10px] font-mono uppercase bg-blue-500/10 border border-blue-500/30 text-blue-400 px-2.5 py-0.5">
              Graph API v26.0 • Verified COD Funnel
            </span>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <label className="block space-y-1.5">
              <span className={labelClass}>Meta Pixel ID *</span>
              <input
                type="text"
                value={metaPixelId}
                onChange={(e) => setMetaPixelId(e.target.value)}
                placeholder="e.g. 123456789012345"
                className={inputClass}
              />
              <p className="text-[11px] text-neutral-500">From Meta Events Manager &gt; Data Sources &gt; Settings</p>
            </label>

            <label className="block space-y-1.5">
              <span className={labelClass}>Meta Test Event Code (Optional)</span>
              <input
                type="text"
                value={metaTestEventCode}
                onChange={(e) => setMetaTestEventCode(e.target.value)}
                placeholder="e.g. TEST12345"
                className={inputClass}
              />
              <p className="text-[11px] text-neutral-500">Found in Events Manager &gt; Test Events tab to inspect live events</p>
            </label>
          </div>

          <label className="block space-y-1.5">
            <span className={labelClass}>Conversions API (CAPI) Access Token</span>
            <input
              type="password"
              value={metaCapiToken}
              onChange={(e) => setMetaCapiToken(e.target.value)}
              placeholder={
                settings.hasMetaCapiToken
                  ? `Saved: ${settings.metaCapiTokenMasked} (leave blank to keep)`
                  : "EAAG... generated in Events Manager > Settings > Generate access token"
              }
              className={inputClass}
            />
            <p className="text-[11px] text-neutral-500">
              Enables server-to-server CAPI tracking with automatic deduplication using identical <code className="text-neutral-300">eventID</code>.
            </p>
          </label>

          <div className="pt-2 border-t border-white/10 space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={enableAdvancedMatching}
                onChange={(e) => setEnableAdvancedMatching(e.target.checked)}
                className="w-4 h-4 rounded accent-brand-500"
              />
              <span className="text-sm text-neutral-200">
                Enable Meta Advanced Matching (automatically hashes customer phone, email, name &amp; city for 8.0+ Event Quality Score)
              </span>
            </label>

            <div className="grid sm:grid-cols-2 gap-4 pt-2 items-start">
              <div className="bg-black/40 border border-white/10 p-3.5 space-y-1.5 text-xs">
                <p className="text-[10px] uppercase tracking-widest text-emerald-400 font-mono font-bold">
                  3-Stage Verified COD Event Policy (Active)
                </p>
                <ul className="space-y-1 text-neutral-300 text-[11px]">
                  <li><b>1. CODOrderPlaced:</b> Sent once when customer submits checkout (browser + CAPI deduplicated).</li>
                  <li><b>2. QualifiedOrder:</b> Sent when staff confirms order (<code className="text-white">CONFIRMED</code>, <code className="text-white">phone_call</code>).</li>
                  <li><b>3. Purchase:</b> Sent <b>only</b> when <code className="text-white">DELIVERED</code> + <code className="text-white">PAID</code> (<code className="text-white">system_generated</code>).</li>
                  <li><b>Storefront-only Pixel:</b> Meta Pixel, GTM, and GA4 load only on public storefront routes, never on <code className="text-white">/admin/*</code>. Review Meta Events Manager &gt; Automatic Events and your GTM container before launching ads so no partner rule fires on admin actions.</li>
                </ul>
              </div>

              <div className="flex flex-col justify-end">
                <button
                  type="button"
                  onClick={handleTestCapi}
                  disabled={testing || (!metaPixelId && !settings.metaPixelId)}
                  className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 text-xs font-mono uppercase tracking-wider disabled:opacity-50 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  {testing ? "Testing..." : "Send Test Event to Meta"}
                </button>
                <p className="text-[10px] text-neutral-500 mt-1">
                  Dispatches a test event via Graph API v26.0 using your Test Event Code so you can inspect it live in Meta Events Manager &gt; Test Events.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Google Tag Manager & Google Analytics 4 */}
        <div className="bg-admin-card border border-admin-border p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <h2 className="text-white font-semibold text-sm uppercase tracking-wider">
                Google Analytics &amp; Google Tag Manager
              </h2>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <label className="block space-y-1.5">
              <span className={labelClass}>Google Tag Manager (GTM ID)</span>
              <input
                type="text"
                value={gtmId}
                onChange={(e) => setGtmId(e.target.value)}
                placeholder="GTM-XXXXXXX"
                className={inputClass}
              />
              <p className="text-[11px] text-neutral-500">Injects GTM script in &lt;head&gt; and noscript in &lt;body&gt;</p>
            </label>

            <label className="block space-y-1.5">
              <span className={labelClass}>Google Analytics 4 (GA4 Measurement ID)</span>
              <input
                type="text"
                value={ga4Id}
                onChange={(e) => setGa4Id(e.target.value)}
                placeholder="G-XXXXXXXXXX"
                className={inputClass}
              />
              <p className="text-[11px] text-neutral-500">Tracks real-time e-commerce events (view_item, begin_checkout, purchase)</p>
            </label>
          </div>
        </div>

        {/* Section 3: Verification Tags (Google Search Console & Meta Domain) */}
        <div className="bg-admin-card border border-admin-border p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-400" />
              <h2 className="text-white font-semibold text-sm uppercase tracking-wider">
                Domain &amp; Search Console Verification
              </h2>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <label className="block space-y-1.5">
              <span className={labelClass}>Google Search Console Verification Code</span>
              <input
                type="text"
                value={googleSiteVerification}
                onChange={(e) => setGoogleSiteVerification(e.target.value)}
                placeholder="e.g. AbC123dEf_456Ghi..."
                className={inputClass}
              />
              <p className="text-[11px] text-neutral-500">
                Puts &lt;meta name=&quot;google-site-verification&quot;&gt; in the site head to instantly verify ownership.
              </p>
            </label>

            <label className="block space-y-1.5">
              <span className={labelClass}>Meta Domain Verification Code</span>
              <input
                type="text"
                value={facebookDomainVerification}
                onChange={(e) => setFacebookDomainVerification(e.target.value)}
                placeholder="e.g. 1a2b3c4d5e6f..."
                className={inputClass}
              />
              <p className="text-[11px] text-neutral-500">
                From Meta Business Settings &gt; Brand Safety &gt; Domains (for Aggregated Event Measurement).
              </p>
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="bg-white text-black px-8 py-3.5 text-xs font-bold font-mono tracking-[0.2em] uppercase hover:bg-neutral-200 transition-colors disabled:opacity-50"
        >
          {saving ? "SAVING CONFIGURATION..." : "SAVE INTEGRATION SETTINGS"}
        </button>
      </form>

      {/* Section 4: Live Data Feeds & Sitemaps */}
      <div className="grid md:grid-cols-2 gap-6 pt-4">
        {/* Facebook Catalog Feed */}
        <div className="bg-admin-card border border-admin-border p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-blue-400" />
            <h3 className="font-bold text-white text-sm uppercase tracking-wider">
              Facebook Product Catalog Feed (XML)
            </h3>
          </div>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Live auto-updating product feed for Meta Commerce Manager. Use this for <b>Facebook &amp; Instagram Shops</b> and <b>Dynamic Product Ads (DPA)</b> to show buyers the exact dress they checked.
          </p>

          <div className="flex items-center gap-2 bg-black/60 border border-white/10 p-2.5">
            <input
              type="text"
              readOnly
              value={settings.feedUrl}
              className="bg-transparent text-xs text-neutral-200 font-mono flex-1 outline-none truncate"
            />
            <button
              type="button"
              onClick={() => copyToClipboard(settings.feedUrl, "feed")}
              className="text-xs font-mono uppercase text-brand-400 hover:text-white px-2 py-1 flex items-center gap-1"
            >
              {copiedFeed ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedFeed ? "Copied" : "Copy"}
            </button>
          </div>

          <div className="bg-white/5 border border-white/10 p-3 text-[11px] text-neutral-300 space-y-1">
            <p className="font-bold text-white">How to connect in Meta Commerce Manager:</p>
            <ol className="list-decimal pl-4 space-y-0.5 text-neutral-400">
              <li>Go to Meta Commerce Manager &gt; <b>Catalog</b> &gt; <b>Data Sources</b>.</li>
              <li>Click <b>Add Items</b> &gt; select <b>Data Feed</b>.</li>
              <li>Choose <b>Scheduled Feed</b> and paste the feed URL above.</li>
              <li>Set schedule to <b>Daily or Hourly</b> so prices and stock sync automatically!</li>
            </ol>
          </div>
        </div>

        {/* Google Search Console & Sitemap */}
        <div className="bg-admin-card border border-admin-border p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-white text-sm uppercase tracking-wider">
              Google Search Console &amp; Sitemap
            </h3>
          </div>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Submit your XML sitemap to Google Search Console to index all collection pages, product URLs, and size guides for top Google search rankings.
          </p>

          <div className="flex items-center gap-2 bg-black/60 border border-white/10 p-2.5">
            <input
              type="text"
              readOnly
              value={settings.sitemapUrl}
              className="bg-transparent text-xs text-neutral-200 font-mono flex-1 outline-none truncate"
            />
            <button
              type="button"
              onClick={() => copyToClipboard(settings.sitemapUrl, "sitemap")}
              className="text-xs font-mono uppercase text-emerald-400 hover:text-white px-2 py-1 flex items-center gap-1"
            >
              {copiedSitemap ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedSitemap ? "Copied" : "Copy"}
            </button>
          </div>

          <div className="bg-white/5 border border-white/10 p-3 text-[11px] text-neutral-300 space-y-1">
            <p className="font-bold text-white">How to submit to Google Search Console:</p>
            <ol className="list-decimal pl-4 space-y-0.5 text-neutral-400">
              <li>Open <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer" className="text-emerald-400 underline inline-flex items-center gap-0.5">Google Search Console <ExternalLink className="w-2.5 h-2.5" /></a>.</li>
              <li>Select your site property &gt; click <b>Sitemaps</b> in the left sidebar.</li>
              <li>Under &quot;Add a new sitemap&quot;, type <code className="text-white bg-black/40 px-1">sitemap.xml</code> and click <b>Submit</b>.</li>
              <li>Google will crawl your products and notify you when pages rank in search results!</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Live CAPI Event Ledger */}
      <div className="bg-admin-card border border-admin-border p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div>
            <h3 className="font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-400" />
              Server CAPI Delivery Log (Persisted in Neon)
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Every order event is locked once per order to prevent duplicates. Failed deliveries can be retried safely with the same event ID.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
            <span className="text-emerald-400">Sent: {ledger.counts.sent}</span>
            <span className="text-red-400">Failed: {ledger.counts.failed}</span>
            <span className="text-amber-400">Pending: {ledger.counts.pending}</span>
            {(ledger.counts.expired ?? 0) > 0 && (
              <span className="text-neutral-400">Expired: {ledger.counts.expired}</span>
            )}
            {ledger.counts.failed + ledger.counts.pending > 0 && (
              <button
                type="button"
                onClick={handleRetryAll}
                disabled={retryingAll}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-black text-[10px] font-bold uppercase tracking-wider disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${retryingAll ? "animate-spin" : ""}`} />
                {retryingAll ? "Retrying…" : "Retry Failed"}
              </button>
            )}
          </div>
        </div>

        {ledger.summary && ledger.summary.exhaustedCount > 0 && (
          <div className="bg-red-500/10 border border-red-500/30 p-3.5 text-xs space-y-2">
            <div className="flex items-center gap-2 text-red-300 font-semibold">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>
                {ledger.summary.exhaustedCount} CAPI event{ledger.summary.exhaustedCount > 1 ? "s" : ""} exhausted automatic retries
              </span>
            </div>
            <p className="text-neutral-300 text-[11px]">
              Verify your Meta Pixel ID and Conversions API Token above, then click &ldquo;Retry Failed&rdquo; (events older than 7 days expire per Meta&apos;s limit).
            </p>
            {ledger.summary.recentExhausted.length > 0 && (
              <ul className="space-y-1 text-[11px] font-mono text-red-200/90">
                {ledger.summary.recentExhausted.map((item) => (
                  <li key={item.id}>
                    <Link href={`/admin/orders/${item.orderId}`} className="underline hover:text-white">
                      {item.orderNumber}
                    </Link>{" "}
                    · {item.eventName} ({item.attempts}x) — {item.lastError ?? "Delivery failed"}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {ledger.events.length === 0 ? (
          <p className="text-xs text-neutral-500 py-4">
            No order CAPI events recorded yet. Place a test order and update its status through Confirmed → Delivered + Paid to verify the full funnel.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-white/10 text-[10px] font-mono uppercase text-neutral-500">
                  <th className="py-2 pr-3">Order</th>
                  <th className="py-2 pr-3">Event</th>
                  <th className="py-2 pr-3">Event ID</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 pr-3">Attempts</th>
                  <th className="py-2 pr-3">Details</th>
                  <th className="py-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {ledger.events.map((ev) => (
                  <tr key={ev.id}>
                    <td className="py-2.5 pr-3 font-mono text-white">
                      <Link href={`/admin/orders/${ev.orderId}`} className="hover:underline">
                        {ev.orderNumber}
                      </Link>
                    </td>
                    <td className="py-2.5 pr-3 font-mono text-neutral-200">{ev.eventName}</td>
                    <td className="py-2.5 pr-3 font-mono text-neutral-400">{ev.eventId}</td>
                    <td className="py-2.5 pr-3">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-mono uppercase ${
                          ev.status === "SENT"
                            ? "bg-emerald-500/15 text-emerald-400"
                            : ev.status === "FAILED"
                              ? "bg-red-500/15 text-red-400"
                              : ev.status === "EXPIRED"
                                ? "bg-neutral-500/20 text-neutral-300"
                                : "bg-amber-500/15 text-amber-400"
                        }`}
                      >
                        {ev.status}
                      </span>
                    </td>
                    <td className="py-2.5 pr-3 font-mono text-neutral-400">{ev.attempts}</td>
                    <td className="py-2.5 pr-3 text-neutral-400 max-w-xs truncate">
                      {ev.lastError ? (
                        <span className={ev.status === "EXPIRED" ? "text-neutral-300" : "text-red-400"}>
                          {ev.lastError}
                        </span>
                      ) : ev.sentAt ? (
                        new Date(ev.sentAt).toLocaleString("en-GB")
                      ) : (
                        "Pending"
                      )}
                    </td>
                    <td className="py-2.5 text-right">
                      {ev.status !== "SENT" && ev.status !== "EXPIRED" && (
                        <button
                          type="button"
                          onClick={() => void handleRetrySingle(ev.id)}
                          disabled={retryingId === ev.id}
                          className="px-2.5 py-1 border border-white/20 text-white hover:border-white text-[10px] font-mono uppercase disabled:opacity-50"
                        >
                          {retryingId === ev.id ? "…" : "Retry"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pro Advertising Strategy Guide */}
      <div className="bg-gradient-to-br from-[#0e0e14] to-[#12121c] border border-brand-500/20 p-6 space-y-4">
        <div className="flex items-center gap-2 text-brand-400">
          <Sparkles className="w-5 h-5" />
          <h3 className="font-bold text-sm font-mono uppercase tracking-wider">
            Ad Budget Optimization &amp; Real Customer Strategy (ROAS Blueprint)
          </h3>
        </div>
        <div className="grid md:grid-cols-3 gap-4 text-xs text-neutral-300">
          <div className="border border-white/10 bg-black/40 p-4 space-y-1.5">
            <h4 className="font-bold text-white font-mono uppercase text-[11px]">1. Deduplicated 3-Stage Funnel</h4>
            <p className="text-neutral-400 leading-relaxed">
              Checkout uses matching <code className="text-neutral-200">cod-ORDER_NUMBER</code> across browser &amp; CAPI. Staff confirmations send <code className="text-neutral-200">QualifiedOrder</code>, and <code className="text-neutral-200">Purchase</code> fires strictly on <code className="text-neutral-200">DELIVERED + PAID</code>.
            </p>
          </div>
          <div className="border border-white/10 bg-black/40 p-4 space-y-1.5">
            <h4 className="font-bold text-white font-mono uppercase text-[11px]">2. Dynamic Retargeting (DPA)</h4>
            <p className="text-neutral-400 leading-relaxed">
              Using the Facebook Catalog feed above, create a Meta Catalog Sales campaign targeting &quot;Viewed or Added to Cart but not Purchased in last 14 days&quot; for high conversions with low ad spend.
            </p>
          </div>
          <div className="border border-white/10 bg-black/40 p-4 space-y-1.5">
            <h4 className="font-bold text-white font-mono uppercase text-[11px]">3. Custom Audience Exclusion</h4>
            <p className="text-neutral-400 leading-relaxed">
              Always exclude the &quot;Purchasers (last 30 days)&quot; custom audience from your cold prospecting campaigns so you don&apos;t waste ad budget showing ads to someone who just received their dress.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
