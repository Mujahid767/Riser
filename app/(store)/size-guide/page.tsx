import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Size Guide — Children's Clothing",
  description:
    "Riser's comprehensive size guide for girls' clothing, ages 1–12 years. Find the perfect fit with age-based sizing and measurements.",
};

const sizeData = [
  { size: "1-2Y", age: "1–2 years", height: "80–92 cm", chest: "48–50 cm", waist: "45–47 cm", length: "52–58 cm" },
  { size: "2-3Y", age: "2–3 years", height: "92–98 cm", chest: "50–52 cm", waist: "47–48 cm", length: "58–64 cm" },
  { size: "3-4Y", age: "3–4 years", height: "98–104 cm", chest: "52–54 cm", waist: "48–50 cm", length: "64–70 cm" },
  { size: "4-5Y", age: "4–5 years", height: "104–110 cm", chest: "54–57 cm", waist: "50–52 cm", length: "70–76 cm" },
  { size: "5-6Y", age: "5–6 years", height: "110–116 cm", chest: "57–59 cm", waist: "52–54 cm", length: "76–82 cm" },
  { size: "6-7Y", age: "6–7 years", height: "116–122 cm", chest: "59–62 cm", waist: "54–56 cm", length: "82–88 cm" },
  { size: "7-8Y", age: "7–8 years", height: "122–128 cm", chest: "62–65 cm", waist: "56–58 cm", length: "88–94 cm" },
  { size: "8-9Y", age: "8–9 years", height: "128–134 cm", chest: "65–68 cm", waist: "58–60 cm", length: "94–100 cm" },
  { size: "9-10Y", age: "9–10 years", height: "134–140 cm", chest: "68–72 cm", waist: "60–62 cm", length: "100–106 cm" },
  { size: "10-11Y", age: "10–11 years", height: "140–146 cm", chest: "72–76 cm", waist: "62–64 cm", length: "106–112 cm" },
  { size: "11-12Y", age: "11–12 years", height: "146–152 cm", chest: "76–80 cm", waist: "64–66 cm", length: "112–118 cm" },
];

export default function SizeGuidePage() {
  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="bg-neutral-50 border-b border-neutral-100">
        <div className="container-store py-10">
          <h1 className="section-title">Size Guide</h1>
          <p className="text-neutral-500 mt-2 max-w-xl">
            Finding the right size is important! Use this guide to choose the
            perfect fit for your child.
          </p>
        </div>
      </div>

      <div className="container-store py-12">
        {/* How to measure */}
        <div className="bg-brand-50 border border-brand-100 rounded-2xl p-6 mb-10">
          <h2 className="font-semibold text-brand-900 mb-4">📏 How to Measure</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            {[
              { name: "Chest", desc: "Measure around the fullest part of the chest" },
              { name: "Waist", desc: "Measure around the natural waistline" },
              { name: "Length", desc: "Measure from shoulder to hem" },
              { name: "Height", desc: "Stand straight without shoes" },
            ].map((m) => (
              <div key={m.name} className="bg-white rounded-xl p-3">
                <p className="font-semibold text-brand-700">{m.name}</p>
                <p className="text-neutral-600 text-xs mt-1">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Size Table */}
        <h2 className="font-semibold text-neutral-900 text-xl mb-4">Girls' Clothing Sizes</h2>
        <div className="overflow-x-auto rounded-2xl border border-neutral-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200">
                {["Size", "Age", "Height", "Chest", "Waist", "Length"].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-left font-semibold text-neutral-700 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {sizeData.map((row, idx) => (
                <tr key={row.size} className={idx % 2 === 0 ? "bg-white" : "bg-neutral-50/50"}>
                  <td className="px-5 py-3.5">
                    <span className="font-bold text-brand-600 bg-brand-50 px-2 py-1 rounded-lg text-xs">
                      {row.size}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-neutral-600">{row.age}</td>
                  <td className="px-5 py-3.5 text-neutral-600">{row.height}</td>
                  <td className="px-5 py-3.5 text-neutral-600">{row.chest}</td>
                  <td className="px-5 py-3.5 text-neutral-600">{row.waist}</td>
                  <td className="px-5 py-3.5 text-neutral-600">{row.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Note */}
        <div className="mt-8 p-5 bg-amber-50 border border-amber-100 rounded-2xl">
          <p className="text-sm text-amber-900">
            <strong>Note:</strong> These measurements are approximate guidelines.
            Children's bodies vary, so if your child is between sizes, we recommend
            sizing up for room to grow. If you're unsure, feel free to{" "}
            <a href="/contact" className="text-brand-600 hover:underline font-medium">
              contact us
            </a>{" "}
            and we'll help you choose.
          </p>
        </div>
      </div>
    </div>
  );
}
