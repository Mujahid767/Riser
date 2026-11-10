"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("admin@riser.com.bd");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = (await response.json().catch(() => ({}))) as { error?: string };
    setPending(false);
    if (!response.ok) {
      setError(data.error || "Could not sign in.");
      return;
    }
    const next = params.get("next");
    router.replace(next && next.startsWith("/admin") ? next : "/admin/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-md bg-[#121216] border border-white/10 p-8 space-y-5">
      <div>
        <p className="text-[10px] tracking-[0.35em] text-neutral-500 uppercase">Riser Atelier</p>
        <h1 className="mt-2 text-3xl font-black tracking-widest text-white">ADMIN</h1>
        <p className="mt-2 text-sm text-neutral-400">
          Sign in to change photos and the words on the storefront.
        </p>
      </div>
      <label className="block space-y-1.5">
        <span className="text-[10px] uppercase tracking-widest text-neutral-500">Email</span>
        <input
          type="email"
          autoComplete="username"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full bg-black/50 border border-white/15 px-3 py-3 text-sm text-white outline-none focus:border-white"
          required
        />
      </label>
      <label className="block space-y-1.5">
        <span className="text-[10px] uppercase tracking-widest text-neutral-500">Password</span>
        <input
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full bg-black/50 border border-white/15 px-3 py-3 text-sm text-white outline-none focus:border-white"
          required
        />
      </label>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full bg-white text-black py-3 text-xs font-bold tracking-[0.2em] uppercase disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
