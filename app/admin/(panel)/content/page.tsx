import ContentEditor from "@/components/admin/content-editor";
import { getSiteContent } from "@/lib/cms/store";

export const metadata = {
  title: "Page text — Riser Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminContentPage() {
  const content = await getSiteContent();
  return <ContentEditor initial={content} />;
}
