import type { Metadata } from "next";
import ReviewsClient from "./reviews-client";

export const metadata: Metadata = { title: "Reviews — Riser Admin" };

export default function ReviewsPage() {
  return <ReviewsClient />;
}
