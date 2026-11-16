import { getMeasurementsForSizes } from "@/lib/products/measurements";

export default function MeasurementChart({ sizes }: { sizes?: string[] }) {
  const rows = getMeasurementsForSizes(sizes);
  if (rows.length === 0) return null;

  return (
    <div className="border border-white/15 bg-[#0d0d12] p-4 sm:p-5">
      <p className="text-[10px] font-mono tracking-[0.3em] uppercase text-brand-400 font-bold mb-3">
        SIZE &amp; MEASUREMENT (DRESS LENGTH)
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {rows.map((r) => (
          <div
            key={r.age}
            className="flex items-center justify-between border border-white/10 bg-black/40 px-3 py-2 text-xs font-mono"
          >
            <span className="text-neutral-300 uppercase">Age {r.age}</span>
            <span className="text-white font-bold">{r.length}&quot; long</span>
          </div>
        ))}
      </div>
      <p className="text-[10px] font-mono text-neutral-500 mt-3">
        Size number = dress length in inches.
      </p>
    </div>
  );
}
