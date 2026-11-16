import Header from "@/components/store/header";
import Footer from "@/components/store/footer";
import WhatsAppButton from "@/components/store/whatsapp-button";
import { getSiteContent } from "@/lib/cms/store";

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const content = await getSiteContent();

  return (
    <div className="bg-[#070709] text-white min-h-screen flex flex-col justify-between relative">
      <Header announcement={content.announcement} />
      <main className="flex-1">{children}</main>
      <Footer content={content} />
      <WhatsAppButton
        phoneNumber={content.contact?.whatsapp || "01577049566"}
        message={content.contact?.whatsappMessage}
      />
    </div>
  );
}
