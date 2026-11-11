"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import type { AdminProduct } from "@/lib/products/types";
import { CATEGORIES } from "@/lib/products/types";
import { Plus, Search, Pencil, Trash2, Eye, Package, AlertTriangle } from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  active: "bg-emerald-500/15 text-emerald-400",
  draft: "bg-neutral-500/15 text-neutral-400",
  archived: "bg-red-500/15 text-red-400",
};

type StockFilter = "" | "in" | "out" | "low";

const STOCK_TABS: { value: StockFilter; label: string }[] = [
  { value: "", label: "All" },
  { value: "in", label: "In stock" },
  { value: "out", label: "Out of stock" },
  { value: "low", label: "Low stock (≤5)" },
];

function StockBadge({ stock }: { stock: number }) {
  if (stock === 0)
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-400 bg-red-500/10 px-2 py-0.5">
        Out of stock
      </span>
    );
  if (stock <= 5)
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5">
        <AlertTriangle className="w-3 h-3" /> {stock} left
      </span>
    );
  return <span className="text-sm text-emerald-400 font-semibold">{stock}</span>;
}

export default function ProductList() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [stockFilter, setStockFilter] = useState<StockFilter>("");
  const [deletingId, setDeletingId] = useState("");

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (categoryFilter) params.set("category", categoryFilter);
    if (stockFilter) params.set("stock", stockFilter);
    const res = await fetch(`/api/admin/products?${params.toString()}`);
    const data = (await res.json().catch(() => ({}))) as { products?: AdminProduct[] };
    setProducts(data.products ?? []);
    setLoading(false);
  }, [categoryFilter, stockFilter]);

  useEffect(() => { void fetchProducts(); }, [fetchProducts]);

  async function deleteProduct(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeletingId(id);
    await fetch(`/api/admin/products?id=${id}`, { method: "DELETE" });
    setProducts((p) => p.filter((x) => x.id !== id));
    setDeletingId("");
  }

  const filtered = products.filter(
    (p) =>
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.includes(search.toLowerCase())
  );

  // Summary counts (from full unfiltered data for display)
  const outOfStockCount = filtered.filter((p) => p.stock === 0).length;
  const lowStockCount = filtered.filter((p) => p.stock > 0 && p.stock <= 5).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Products</h1>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-neutral-500 text-sm">
              {products.length} product{products.length !== 1 ? "s" : ""}
            </p>
            {outOfStockCount > 0 && (
              <span className="text-xs text-red-400 bg-red-500/10 px-2 py-0.5 font-semibold">
                {outOfStockCount} out of stock
              </span>
            )}
            {lowStockCount > 0 && (
              <span className="text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 font-semibold">
                {lowStockCount} low stock
              </span>
            )}
          </div>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 bg-white text-black px-5 py-3 text-xs font-bold tracking-[0.18em] uppercase"
        >
          <Plus className="w-4 h-4" /> Add product
        </Link>
      </div>

      {/* Stock filter tabs */}
      <div className="flex gap-1 border-b border-admin-border">
        {STOCK_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setStockFilter(tab.value)}
            className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-widest border-b-2 -mb-px transition-colors ${
              stockFilter === tab.value
                ? "border-white text-white"
                : "border-transparent text-neutral-500 hover:text-neutral-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search + category filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products…"
            className="w-full bg-admin-card border border-admin-border pl-10 pr-4 py-2.5 text-sm text-white outline-none focus:border-white/40"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-admin-card border border-admin-border px-4 py-2.5 text-sm text-white outline-none"
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="bg-admin-card border border-admin-border p-12 text-center text-neutral-500">
          Loading…
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-admin-card border border-admin-border p-12 text-center">
          <Package className="w-10 h-10 text-neutral-700 mx-auto mb-3" />
          <p className="text-neutral-400 font-medium">
            {stockFilter === "out"
              ? "No out-of-stock products 🎉"
              : stockFilter === "low"
              ? "No low-stock products"
              : "No products found."}
          </p>
          {!stockFilter && !search && (
            <p className="text-neutral-600 text-sm mt-1">
              <Link href="/admin/products/new" className="underline text-white">
                Add your first product
              </Link>
            </p>
          )}
        </div>
      ) : (
        <div className="bg-admin-card border border-admin-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-admin-border">
                  {["Product", "Category", "Price", "Stock", "Status", ""].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-widest whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-admin-border">
                {filtered.map((p) => {
                  const catLabel =
                    CATEGORIES.find((c) => c.value === p.category)?.label ?? p.category;
                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-white/[0.02] transition-colors ${
                        p.stock === 0 ? "opacity-70" : ""
                      }`}
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-14 bg-black border border-white/10 shrink-0 overflow-hidden">
                            {p.imageUrl ? (
                              <img
                                src={p.imageUrl}
                                alt={p.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package className="w-5 h-5 text-neutral-700 m-auto mt-4" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-white leading-tight truncate max-w-[200px]">
                              {p.name}
                            </p>
                            <p className="text-xs text-neutral-500 font-mono mt-0.5">{p.slug}</p>
                            <div className="flex gap-1 mt-1 flex-wrap">
                              {p.isNew && (
                                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5">
                                  NEW
                                </span>
                              )}
                              {p.isBestSeller && (
                                <span className="text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5">
                                  BEST
                                </span>
                              )}
                              {p.isLimited && (
                                <span className="text-[10px] text-purple-400 bg-purple-500/10 px-1.5 py-0.5">
                                  LIMITED
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-sm text-neutral-400 whitespace-nowrap">
                        {catLabel}
                      </td>
                      <td className="px-5 py-3 whitespace-nowrap">
                        <p className="text-sm font-semibold text-white">
                          ৳{p.price.toLocaleString()}
                        </p>
                        {p.compareAtPrice && (
                          <p className="text-xs text-neutral-500 line-through">
                            ৳{p.compareAtPrice.toLocaleString()}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-3 whitespace-nowrap">
                        <StockBadge stock={p.stock} />
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 ${
                            STATUS_STYLES[p.status] ?? STATUS_STYLES.draft
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1">
                          <Link
                            href={`/admin/products/${p.id}`}
                            className="p-1.5 text-neutral-400 hover:text-white transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/shop/product/${p.slug}`}
                            target="_blank"
                            className="p-1.5 text-neutral-400 hover:text-white transition-colors"
                            title="View on store"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => void deleteProduct(p.id, p.name)}
                            disabled={deletingId === p.id}
                            className="p-1.5 text-neutral-500 hover:text-red-400 transition-colors disabled:opacity-40"
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

          {/* Footer summary */}
          <div className="px-5 py-3 border-t border-admin-border text-xs text-neutral-500 flex gap-6">
            <span>Showing {filtered.length} of {products.length}</span>
            <span className="text-emerald-400">
              {filtered.filter((p) => p.stock > 5).length} in stock
            </span>
            <span className="text-amber-400">
              {filtered.filter((p) => p.stock > 0 && p.stock <= 5).length} low stock
            </span>
            <span className="text-red-400">
              {filtered.filter((p) => p.stock === 0).length} out of stock
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
