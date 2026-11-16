"use client";

import { useState } from "react";
import { CheckCircle2, Eye, EyeOff, Truck } from "lucide-react";
import type { SteadfastSettingsView } from "@/lib/courier/settings";

const inputClass =
  "w-full bg-black/40 border border-white/10 px-3 py-2.5 text-sm text-white outline-none focus:border-white/50 placeholder:text-neutral-600";
const labelClass = "text-[10px] uppercase tracking-widest text-neutral-500";

function SecretInput({
  label,
  value,
  onChange,
  masked,
  placeholder,
  autoComplete = "off",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  masked?: string;
  placeholder: string;
  autoComplete?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <label className="block space-y-1.5">
      <span className={labelClass}>{label}</span>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={masked ? `Saved: ${masked} — leave blank to keep` : placeholder}
          autoComplete={autoComplete}
          className={`${inputClass} pr-10`}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
          aria-label={show ? "Hide" : "Show"}
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </label>
  );
}

export default function CourierSettingsClient({ initial }: { initial: SteadfastSettingsView }) {
  const [settings, setSettings] = useState(initial);
  const [email, setEmail] = useState(initial.email);
  const [password, setPassword] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [enabled, setEnabled] = useState(initial.enabled);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    const res = await fetch("/api/admin/courier/steadfast", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, apiKey, secretKey, enabled }),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string; settings?: SteadfastSettingsView };
    setSaving(false);
    if (!res.ok || !data.settings) {
      setMessage({ kind: "error", text: data.error ?? "Could not save settings." });
      return;
    }
    setSettings(data.settings);
    setPassword("");
    setApiKey("");
    setSecretKey("");
    setMessage({ kind: "ok", text: "Steadfast settings saved." });
  }

  async function testConnection() {
    setTesting(true);
    setMessage(null);
    const res = await fetch("/api/admin/courier/steadfast", { method: "POST" });
    const data = (await res.json().catch(() => ({}))) as { error?: string; balance?: number };
    setTesting(false);
    if (!res.ok) {
      setMessage({ kind: "error", text: data.error ?? "Connection failed." });
      return;
    }
    setMessage({ kind: "ok", text: `Connected to Steadfast ✓  Balance: ৳${(data.balance ?? 0).toLocaleString()}` });
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Truck className="w-6 h-6" /> Courier settings
        </h1>
        <p className="text-neutral-500 text-sm mt-1">
          Connect your Steadfast merchant account. After that, every order has a{" "}
          <span className="text-white">Send to Steadfast</span> button that creates the parcel consignment for you.
        </p>
      </div>

      <div
        className={`flex items-center gap-2 text-sm px-4 py-3 border ${
          settings.configured ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" : "border-amber-500/30 bg-amber-500/10 text-amber-400"
        }`}
      >
        <CheckCircle2 className="w-4 h-4" />
        {settings.configured ? "Steadfast is connected — API key and secret key are saved." : "Not set up yet — enter your API key and secret key below."}
      </div>

      <form onSubmit={save} className="bg-admin-card border border-admin-border p-5 space-y-5">
        <h2 className="text-white font-semibold text-sm uppercase tracking-wider">Steadfast</h2>

        <label className="block space-y-1.5">
          <span className={labelClass}>Steadfast email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="off"
            className={inputClass}
          />
        </label>

        <SecretInput
          label="Steadfast password"
          value={password}
          onChange={setPassword}
          masked={settings.hasPassword ? "••••••••" : undefined}
          placeholder="Your Steadfast login password"
          autoComplete="new-password"
        />

        <SecretInput
          label="Merchant API key"
          value={apiKey}
          onChange={setApiKey}
          masked={settings.apiKeyMasked || undefined}
          placeholder="Api-Key from Steadfast → Settings → API"
        />

        <SecretInput
          label="Merchant secret key"
          value={secretKey}
          onChange={setSecretKey}
          masked={settings.secretKeyMasked || undefined}
          placeholder="Secret-Key from Steadfast → Settings → API"
        />

        <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
          <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} className="accent-white" />
          Enable Steadfast (shows the “Send to Steadfast” button on orders)
        </label>

        {message && (
          <p className={`text-sm ${message.kind === "ok" ? "text-emerald-400" : "text-red-400"}`}>{message.text}</p>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={saving}
            className="bg-white text-black px-6 py-3 text-xs font-bold tracking-[0.18em] uppercase disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save settings"}
          </button>
          <button
            type="button"
            onClick={() => void testConnection()}
            disabled={testing || !settings.configured}
            className="border border-white/20 text-white px-6 py-3 text-xs font-bold tracking-[0.18em] uppercase disabled:opacity-40"
          >
            {testing ? "Testing…" : "Test connection"}
          </button>
        </div>
      </form>

      <p className="text-xs text-neutral-500 leading-relaxed">
        Keys and password are stored encrypted on the server and are never shown again — only a short preview is displayed.
        Steadfast&apos;s API authenticates with the <b>API key + secret key</b> only; the email and password are saved for your
        reference and are not sent when creating consignments.
      </p>
    </div>
  );
}
