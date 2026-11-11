"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AdminProduct } from "@/lib/products/types";
import { CATEGORIES, DEPARTMENTS, KIDS_SIZES, WOMEN_SIZES } from "@/lib/products/types";
import ImagePicker from "@/components/admin/image-picker";
import { X, Plus } from "lucide-react";

type Mode = "new" | "edit";

interface Props {
  mode: Mode;
  initial?: AdminProduct;
}

const BLANK: Omit<AdminProduct, "id" | "createdAt" | "updatedAt"> = {
  name: "",
  slug: "",
  category: "baby-frock",
  department: "petite",
  status: "active",
  price: 0,
  compareAtPrice: undefined,
  imageUrl: "",
  secondaryImageUrl: "",
  images: [],
  colors: [],
  sizes: [],
  fabric: "",
  description: "",
  editionBadge: "",
  isNew: true,
  isBestSeller: false,
  isLimited: false,
  isOnSale: false,
  tags: [],
  stock: 0,
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-[10px] uppercase tracking-widest text-neutral-500 block">{label}</span>
      {children}
    </label>
  );
}

const inputClass = "w-full bg-black/40 border border-white/10 px-3 py-2.5 text-sm text-white outline-none focus:border-white/50 placeholder:text-neutral-700";

export default function ProductForm({ mode, initial }: Props) {
  const router = useRouter();
  const [data, setData] = useState<Omit<AdminProduct, "id" | "createdAt" | "updatedAt">>(
    initial ?? BLANK
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // helpers
  const set = (patch: Partial<typeof data>) => setData((d) => ({ ...d, ...patch }));

  const sizeOptions = ["adult-one-piece", "adult-two-piece", "adult-three-piece", "short-tops", "nayra-dress-skirt"].includes(data.category)
    ? WOMEN_SIZES
    : KIDS_SIZES;

  function toggleSize(s: string) {
    set({ sizes: data.sizes.includes(s) ? data.sizes.filter((x) => x !== s) : [...data.sizes, s] });
  }

  function autoSlug() {
    if (!data.slug) {
      set({ slug: data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") });
    }
  }

  async function save() {
    setSaving(true);
    setError("");
    const url = mode === "edit" && initial ? `/api/admin/products?id=${initial.id}` : "/api/admin/products";
    const method = mode === "edit" ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = (await res.json().catch(() => ({}))) as { error?: string; product?: AdminProduct };
    setSaving(false);
    if (!res.ok || !json.product) {
      setError(json.error ?? "Could not save product.");
      return;
    }
    router.push("/admin/products");
    router.refresh();
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {mode === "new" ? "New product" : "Edit product"}
          </h1>
          <p className="text-neutral-500 text-sm mt-1">
            {mode === "new" ? "Add a product to the Riser catalogue." : `Editing: ${initial?.name}`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2.5 text-xs uppercase tracking-widest border border-white/15 text-neutral-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void save()}
            disabled={saving}
            className="px-6 py-2.5 bg-white text-black text-xs font-bold tracking-[0.18em] uppercase disabled:opacity-60"
          >
            {saving ? "Saving…" : mode === "new" ? "Create product" : "Save changes"}
          </button>
        </div>
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        {/* Left column */}
        <div className="space-y-6">
          {/* Basic info */}
          <section className="bg-admin-card border border-admin-border p-5 space-y-5">
            <h2 className="text-white font-semibold text-sm uppercase tracking-wider">Basic info</h2>
            <Field label="Product name *">
              <input
                value={data.name}
                onChange={(e) => set({ name: e.target.value })}
                onBlur={autoSlug}
                placeholder="e.g. Crimson Velvet Nayra Suit"
                className={inputClass}
              />
            </Field>
            <Field label="URL slug">
              <input
                value={data.slug}
                onChange={(e) => set({ slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })}
                placeholder="auto-generated from name"
                className={inputClass}
              />
            </Field>
            <Field label="Description">
              <textarea
                value={data.description}
                onChange={(e) => set({ description: e.target.value })}
                rows={4}
                placeholder="Product details, fabric, craftsmanship…"
                className={inputClass}
              />
            </Field>
            <div className="grid sm:grid-cols-2 gap-5">
              <Field label="Fabric">
                <input value={data.fabric} onChange={(e) => set({ fabric: e.target.value })} placeholder="e.g. Pure Raw Mulberry Silk" className={inputClass} />
              </Field>
              <Field label="Edition badge">
                <input value={data.editionBadge ?? ""} onChange={(e) => set({ editionBadge: e.target.value })} placeholder="e.g. SIGNATURE DROP 01" className={inputClass} />
              </Field>
            </div>
          </section>

          {/* Photos */}
          <section className="bg-admin-card border border-admin-border p-5 space-y-5">
            <h2 className="text-white font-semibold text-sm uppercase tracking-wider">Photos</h2>
            <ImagePicker label="Main photo *" value={data.imageUrl} onChange={(url) => set({ imageUrl: url })} />
            <ImagePicker label="Secondary / hover photo" value={data.secondaryImageUrl ?? ""} onChange={(url) => set({ secondaryImageUrl: url })} />

            {/* Gallery extras */}
            <div>
              <span className="text-[10px] uppercase tracking-widest text-neutral-500 block mb-2">Gallery (extra photos)</span>
              <div className="flex flex-wrap gap-2 mb-2">
                {data.images.map((img, i) => (
                  <div key={i} className="relative w-20 h-20 border border-white/10 overflow-hidden group">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => set({ images: data.images.filter((_, j) => j !== i) })}
                      className="absolute top-0.5 right-0.5 bg-black/70 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
              <ImagePicker
                label="Add gallery photo"
                value=""
                onChange={(url) => { if (url) set({ images: [...data.images, url] }); }}
              />
            </div>
          </section>

          {/* Sizes */}
          <section className="bg-admin-card border border-admin-border p-5 space-y-4">
            <h2 className="text-white font-semibold text-sm uppercase tracking-wider">Sizes</h2>
            <div className="flex flex-wrap gap-2">
              {sizeOptions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSize(s)}
                  className={`px-3 py-1.5 text-xs font-mono border transition-colors ${
                    data.sizes.includes(s)
                      ? "border-white bg-white text-black"
                      : "border-white/15 text-neutral-400 hover:border-white/40"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-neutral-600">Selected: {data.sizes.length === 0 ? "none" : data.sizes.join(", ")}</p>
          </section>

          {/* Colors */}
          <section className="bg-admin-card border border-admin-border p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-semibold text-sm uppercase tracking-wider">Colors</h2>
              <button
                type="button"
                onClick={() => set({ colors: [...data.colors, { name: "", value: "#1a1a1a" }] })}
                className="inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-white"
              >
                <Plus className="w-3.5 h-3.5" /> Add color
              </button>
            </div>
            {data.colors.map((col, i) => (
              <div key={i} className="flex items-center gap-3">
                <input
                  type="color"
                  value={col.value}
                  onChange={(e) => {
                    const colors = [...data.colors];
                    colors[i] = { ...col, value: e.target.value };
                    set({ colors });
                  }}
                  className="w-10 h-10 border border-white/15 bg-transparent cursor-pointer"
                />
                <input
                  value={col.name}
                  onChange={(e) => {
                    const colors = [...data.colors];
                    colors[i] = { ...col, name: e.target.value };
                    set({ colors });
                  }}
                  placeholder="Color name"
                  className="flex-1 bg-black/40 border border-white/10 px-3 py-2 text-sm text-white outline-none focus:border-white/50"
                />
                <button
                  type="button"
                  onClick={() => set({ colors: data.colors.filter((_, j) => j !== i) })}
                  className="text-neutral-500 hover:text-red-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </section>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Pricing */}
          <section className="bg-admin-card border border-admin-border p-5 space-y-5">
            <h2 className="text-white font-semibold text-sm uppercase tracking-wider">Pricing</h2>
            <Field label="Price (৳) *">
              <input
                type="number"
                value={data.price || ""}
                onChange={(e) => set({ price: Number(e.target.value) })}
                placeholder="0"
                min={0}
                className={inputClass}
              />
            </Field>
            <Field label="Compare-at price (৳)">
              <input
                type="number"
                value={data.compareAtPrice ?? ""}
                onChange={(e) => set({ compareAtPrice: e.target.value ? Number(e.target.value) : undefined })}
                placeholder="Original price"
                min={0}
                className={inputClass}
              />
            </Field>
            <Field label="Stock qty">
              <input
                type="number"
                value={data.stock}
                onChange={(e) => set({ stock: Number(e.target.value) })}
                min={0}
                className={inputClass}
              />
            </Field>
          </section>

          {/* Organisation */}
          <section className="bg-admin-card border border-admin-border p-5 space-y-5">
            <h2 className="text-white font-semibold text-sm uppercase tracking-wider">Organisation</h2>
            <Field label="Category *">
              <select
                value={data.category}
                onChange={(e) => set({ category: e.target.value as AdminProduct["category"] })}
                className={inputClass}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </Field>
            <Field label="Department">
              <select
                value={data.department}
                onChange={(e) => set({ department: e.target.value as AdminProduct["department"] })}
                className={inputClass}
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </Field>
            <Field label="Status">
              <select
                value={data.status}
                onChange={(e) => set({ status: e.target.value as AdminProduct["status"] })}
                className={inputClass}
              >
                <option value="active">Active (visible on store)</option>
                <option value="draft">Draft (hidden)</option>
                <option value="archived">Archived</option>
              </select>
            </Field>
          </section>

          {/* Badges */}
          <section className="bg-admin-card border border-admin-border p-5 space-y-3">
            <h2 className="text-white font-semibold text-sm uppercase tracking-wider">Labels</h2>
            {(
              [
                { key: "isNew", label: "New arrival" },
                { key: "isBestSeller", label: "Best seller" },
                { key: "isLimited", label: "Limited edition" },
                { key: "isOnSale", label: "On sale" },
              ] as { key: keyof Pick<typeof data, "isNew" | "isBestSeller" | "isLimited" | "isOnSale">; label: string }[]
            ).map(({ key, label }) => (
              <label key={key} className="flex items-center gap-3 cursor-pointer group">
                <div
                  className={`w-10 h-5 border flex items-center px-0.5 transition-colors ${
                    data[key] ? "bg-white border-white" : "bg-transparent border-white/20"
                  }`}
                  onClick={() => set({ [key]: !data[key] } as Partial<typeof data>)}
                >
                  <div
                    className={`w-4 h-4 transition-all ${
                      data[key] ? "bg-black translate-x-5" : "bg-white/30"
                    }`}
                  />
                </div>
                <span className="text-sm text-neutral-300 group-hover:text-white transition-colors">{label}</span>
              </label>
            ))}
          </section>
        </div>
      </div>
    </div>
  );
}

