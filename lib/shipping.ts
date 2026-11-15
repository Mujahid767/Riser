// Delivery pricing — single source of truth, used by cart, checkout AND the server.
// Change the numbers here and everything updates.

export const SHIPPING_RATES = {
  /** Orders delivered inside Dhaka */
  dhaka: 60,
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
