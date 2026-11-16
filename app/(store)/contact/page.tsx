import type { Metadata } from "next";
import { getSiteContent } from "@/lib/cms/store";
import ContactClient from "@/components/store/contact-client";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with Riser. We're here to help with your orders, sizing questions, and more.",
};

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const content = await getSiteContent();
  return <ContactClient content={content} />;
}
