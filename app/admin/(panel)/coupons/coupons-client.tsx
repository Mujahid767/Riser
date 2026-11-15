"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import type { AdminCoupon } from "@/lib/coupons";

export default function CouponsClient() {
  const [coupons, setCoupons] = useState<AdminCoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    code: "",
    type: "PERCENT" as "PERCENT" | "FIXED",
    value: "",
    minOrderAmount: "",
    maxUses: "",
    expiresAt: "",
    description: "",
  });

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/coupons");
    const data = await res.json();
    setCoupons(data.coupons ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const res = await fetch("/api/admin/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: form.code,
        type: form.type,
        value: Number(form.value),
        minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : null,
        maxUses: form.maxUses ? Number(form.maxUses) : null,
        expiresAt: form.expiresAt || null,
        description: form.description || undefined,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Failed to create.");
    } else {
      setShowForm(false);
      setForm({ code: "", type: "PERCENT", value: "", minOrderAmount: "", maxUses: "", expiresAt: "", description: "" });
      load();
    }
    setSaving(false);
  }

  async function toggleActive(coupon: AdminCoupon) {
    await fetch(`/api/admin/coupons?id=${coupon.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !coupon.active }),
    });
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this coupon?")) return;
    await fetch(`/api/admin/coupons?id=${id}`, { method: "DELETE" });
    load();
  }

  const inputClass =
    "w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-400 transition-colors";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-neutral-900">Coupons</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-neutral-900 text-white text-xs font-mono uppercase tracking-widest px-4 py-2.5 hover:bg-neutral-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Coupon
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-neutral-50 border border-neutral-200 rounded-2xl p-6 mb-6 space-y-4"
        >
          <h2 className="text-sm font-semibold text-neutral-900">Create Coupon</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-1">
                Code *
              </label>
              <input
                required
                type="text"
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                placeholder="e.g. EID30"
                maxLength={30}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-1">
                Type *
              </label>
              <select
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as "PERCENT" | "FIXED" }))}
                className={inputClass}
              >
                <option value="PERCENT">Percentage (%)</option>
                <option value="FIXED">Fixed Amount (৳)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-1">
                Value * {form.type === "PERCENT" ? "(%)" : "(৳)"}
              </label>
              <input
                required
                type="number"
                min="1"
                max={form.type === "PERCENT" ? "100" : "100000"}
                value={form.value}
                onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
                placeholder={form.type === "PERCENT" ? "30" : "500"}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-1">
                Min Order Amount (৳)
              </label>
              <input
                type="number"
                min="0"
                value={form.minOrderAmount}
                onChange={(e) => setForm((f) => ({ ...f, minOrderAmount: e.target.value }))}
                placeholder="e.g. 1000 (optional)"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-1">
                Max Uses (blank = unlimited)
              </label>
              <input
                type="number"
                min="1"
                value={form.maxUses}
                onChange={(e) => setForm((f) => ({ ...f, maxUses: e.target.value }))}
                placeholder="e.g. 100"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-1">
                Expires At (optional)
              </label>
              <input
                type="datetime-local"
                value={form.expiresAt}
                onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
                className={inputClass}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-1">
              Description / Note
            </label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Internal note (not shown to customers)"
              maxLength={200}
              className={inputClass}
            />
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="bg-neutral-900 text-white text-xs font-mono uppercase tracking-widest px-5 py-2.5 hover:bg-neutral-700 transition-colors disabled:opacity-60"
            >
              {saving ? "Saving..." : "Create Coupon"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-xs font-mono uppercase tracking-widest px-5 py-2.5 border border-neutral-200 hover:border-neutral-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin h-8 w-8 border-2 border-neutral-900 border-t-transparent rounded-full" />
        </div>
      ) : coupons.length === 0 ? (
        <div className="text-center py-16 text-sm text-neutral-400">
          No coupons yet. Create your first one above.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-neutral-200 rounded-2xl overflow-hidden">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200 text-xs font-mono uppercase tracking-wider text-neutral-500">
                <th className="px-4 py-3 text-left">Code</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-left">Value</th>
                <th className="px-4 py-3 text-left">Min Order</th>
                <th className="px-4 py-3 text-left">Uses</th>
                <th className="px-4 py-3 text-left">Expires</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {coupons.map((c) => {
                const expired = c.expiresAt ? new Date(c.expiresAt) < new Date() : false;
                const exhausted = c.maxUses !== null && c.usedCount >= c.maxUses;
                return (
                  <tr key={c.id} className="hover:bg-neutral-50/50">
                    <td className="px-4 py-3 font-mono font-bold text-neutral-900">{c.code}</td>
                    <td className="px-4 py-3 text-neutral-600">{c.type}</td>
                    <td className="px-4 py-3 text-neutral-900">
                      {c.type === "PERCENT" ? `${c.value}%` : `৳${c.value.toLocaleString()}`}
                    </td>
                    <td className="px-4 py-3 text-neutral-600">
                      {c.minOrderAmount ? `৳${c.minOrderAmount.toLocaleString()}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-neutral-600">
                      {c.usedCount}{c.maxUses !== null ? ` / ${c.maxUses}` : ""}
                    </td>
                    <td className="px-4 py-3 text-neutral-600">
                      {c.expiresAt
                        ? new Date(c.expiresAt).toLocaleDateString("en-GB")
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono ${
                          !c.active || expired || exhausted
                            ? "bg-neutral-100 text-neutral-500"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {!c.active ? "Disabled" : expired ? "Expired" : exhausted ? "Exhausted" : "Active"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleActive(c)}
                          className="text-neutral-400 hover:text-neutral-900 transition-colors"
                          title={c.active ? "Disable" : "Enable"}
                        >
                          {c.active ? (
                            <ToggleRight className="w-5 h-5 text-green-600" />
                          ) : (
                            <ToggleLeft className="w-5 h-5" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="text-neutral-400 hover:text-red-500 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
