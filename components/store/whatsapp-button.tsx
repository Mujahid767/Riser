"use client";

import { MessageCircle } from "lucide-react";

export default function WhatsAppButton({
  phoneNumber = "01577049566",
  message = "Hello Riser Atelier, I want to inquire about a dress.",
}: {
  phoneNumber?: string;
  message?: string;
}) {
  const digits = phoneNumber.replace(/\D/g, "");
  const normalized = digits.startsWith("88") ? digits : digits.startsWith("0") ? `88${digits}` : `880${digits}`;
  const encodedMsg = encodeURIComponent(message);
  const waUrl = `https://wa.me/${normalized}?text=${encodedMsg}`;

  return (
    <aside aria-label="Customer Support" className="fixed bottom-6 right-6 z-40 flex items-center group">
      {/* Tooltip on hover */}
      <span className="hidden sm:inline-block mr-3 px-3 py-1.5 rounded-lg bg-[#0c0c12] border border-white/15 text-xs text-white font-mono shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
        Talk to us on WhatsApp
      </span>

      {/* Floating Action Button */}
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
        className="relative w-14 h-14 bg-emerald-500 hover:bg-emerald-400 text-white rounded-full flex items-center justify-center shadow-[0_4px_24px_rgba(16,185,129,0.4)] transition-all duration-300 hover:scale-110 active:scale-95"
      >
        <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-25" />
        <MessageCircle className="w-7 h-7 fill-white stroke-emerald-500" />
      </a>
    </aside>
  );
}
