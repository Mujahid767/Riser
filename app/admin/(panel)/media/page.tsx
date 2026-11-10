import MediaLibrary from "@/components/admin/media-library";
import { listMedia } from "@/lib/cms/store";

export const metadata = {
  title: "Photos — Riser Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminMediaPage() {
  const media = await listMedia();
  return <MediaLibrary initial={media} />;
}
