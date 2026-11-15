import type { Metadata } from "next";
import WishlistClient from "@/components/store/wishlist-client";

export const metadata: Metadata = {
  title: "My Wishlist — Riser",
  description: "Your saved Riser pieces. Add to bag or keep browsing.",
};

export default function WishlistPage() {
  return (
    <div className="bg-white min-h-screen">
      <div className="bg-neutral-50 border-b border-neutral-100">
        <div className="container-store py-10">
          <h1 className="section-title">My Wishlist</h1>
        </div>
      </div>
      <div className="container-store py-12">
        <WishlistClient />
      </div>
    </div>
  );
}
