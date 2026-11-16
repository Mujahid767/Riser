// Delivery pricing — single source of truth, used by cart, checkout AND the server.
// Change the numbers here and everything updates.

export const SHIPPING_RATES = {
  /** Orders delivered inside Dhaka */
  dhaka: 70,
  /** Orders delivered anywhere else in Bangladesh */
  outsideDhaka: 120,
  /** Free delivery when subtotal reaches this amount. `null` = never free. */
  freeOver: null as number | null,
} as const;

export const MAX_QTY_PER_LINE = 10;

export const DISTRICTS = [
  "Dhaka", "Gazipur", "Narayanganj", "Narsingdi", "Manikganj", "Munshiganj", "Faridpur",
  "Gopalganj", "Madaripur", "Rajbari", "Shariatpur", "Kishoreganj", "Tangail",
  "Chattogram", "Cox's Bazar", "Cumilla", "Brahmanbaria", "Chandpur", "Feni", "Lakshmipur",
  "Noakhali", "Bandarban", "Khagrachhari", "Rangamati",
  "Rajshahi", "Bogura", "Joypurhat", "Naogaon", "Natore", "Chapainawabganj", "Pabna", "Sirajganj",
  "Khulna", "Bagerhat", "Chuadanga", "Jashore", "Jhenaidah", "Kushtia", "Magura", "Meherpur",
  "Narail", "Satkhira",
  "Barishal", "Barguna", "Bhola", "Jhalokati", "Patuakhali", "Pirojpur",
  "Sylhet", "Habiganj", "Moulvibazar", "Sunamganj",
  "Rangpur", "Dinajpur", "Gaibandha", "Kurigram", "Lalmonirhat", "Nilphamari", "Panchagarh",
  "Thakurgaon",
  "Mymensingh", "Jamalpur", "Netrokona", "Sherpur",
] as const;

export type District = (typeof DISTRICTS)[number];

/** Older / common English spellings, shown next to the official name so nobody can't find their district. */
const DISTRICT_ALIASES: Record<string, string> = {
  Chattogram: "Chittagong",
  Cumilla: "Comilla",
  Bogura: "Bogra",
  Barishal: "Barisal",
  Jashore: "Jessore",
  Chapainawabganj: "Nawabganj",
  Jhalokati: "Jhalakathi",
  Moulvibazar: "Maulvibazar",
  Netrokona: "Netrakona",
  Khagrachhari: "Khagrachari",
  Narsingdi: "Narsinghdi",
  Gopalganj: "Gopalgonj",
  Habiganj: "Hobiganj",
  Kishoreganj: "Kishorganj",
};

/** Label for the district dropdown, e.g. "Chattogram (Chittagong)". */
export function districtLabel(d: string): string {
  const alias = DISTRICT_ALIASES[d];
  return alias && alias !== d ? `${d} (${alias})` : d;
}

export function calculateShipping(district: string, subtotal: number): number {
  if (SHIPPING_RATES.freeOver !== null && subtotal >= SHIPPING_RATES.freeOver) return 0;
  return district === "Dhaka" ? SHIPPING_RATES.dhaka : SHIPPING_RATES.outsideDhaka;
}

/** Normalise a Bangladeshi mobile number to 01XXXXXXXXX. Returns null if invalid. */
export function normalizeBdPhone(input: string): string | null {
  const digits = input.replace(/[\s\-()]/g, "");
  const local = digits.replace(/^(\+?88)/, "");
  return /^01[3-9]\d{8}$/.test(local) ? local : null;
}
