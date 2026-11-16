"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Clock, MessageCircle, CheckCircle2 } from "lucide-react";
import type { SiteContent } from "@/lib/cms/types";

export default function ContactClient({ content }: { content: SiteContent }) {
  const phone = content.contact?.phone || "01577049566";
  const whatsapp = content.contact?.whatsapp || "01577049566";
  const email = content.contact?.email || "atelier@riser.com.bd";
  const address = content.contact?.address || "Gulshan 2 • Banani • Dhanmondi, Dhaka";
  const hours = content.contact?.businessHours || "Sat–Thu, 10am–8pm";
  const facebook = content.contact?.facebook || "https://facebook.com/riser.atelier";

  const waDigits = whatsapp.replace(/\D/g, "");
  const waUrl = `https://wa.me/${waDigits.startsWith("88") ? waDigits : `88${waDigits}`}?text=${encodeURIComponent(
    content.contact?.whatsappMessage || "Hello Riser Atelier, I have an inquiry about an order / dress."
  )}`;

  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", subject: "Order inquiry", message: "" });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  const contactItems = [
    { icon: Phone, label: "Phone Call", value: phone, href: `tel:${phone.replace(/\s+/g, "")}` },
    { icon: MessageCircle, label: "WhatsApp Business", value: `${whatsapp} (Click to Chat)`, href: waUrl },
    { icon: Mail, label: "Email", value: email, href: `mailto:${email}` },
    { icon: MessageCircle, label: "Facebook Page", value: facebook.replace(/^https?:\/\//, ""), href: facebook },
    { icon: MapPin, label: "Atelier & Outlets", value: address, href: null },
    { icon: Clock, label: "Business Hours", value: hours, href: null },
  ];

  return (
    <div className="bg-white min-h-screen">
      <div className="bg-neutral-50 border-b border-neutral-100">
        <div className="container-store py-10">
          <h1 className="section-title">Contact Us</h1>
          <p className="text-neutral-500 mt-2">We&apos;d love to hear from you.</p>
        </div>
      </div>

      <div className="container-store py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div>
            <h2 className="text-xl font-semibold text-neutral-900 mb-6">Get in Touch</h2>
            <div className="space-y-4">
              {contactItems.map((item) => (
                <div
                  key={item.label}
                  className="flex items-start gap-4 p-4 rounded-2xl border border-neutral-100 hover:border-neutral-300 transition-colors"
                >
                  <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center shrink-0">
                    <item.icon className="w-5 h-5 text-brand-500" />
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 font-medium mb-0.5">{item.label}</p>
                    {item.href ? (
                      <a
                        href={item.href}
                        target={item.href.startsWith("http") ? "_blank" : undefined}
                        rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                        className="text-neutral-900 font-medium hover:text-brand-600 transition-colors text-sm"
                      >
                        {item.value}
                      </a>
                    ) : (
                      <p className="text-neutral-900 font-medium text-sm">{item.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick WhatsApp Action Box */}
            <div className="mt-6 p-5 rounded-2xl bg-emerald-50 border border-emerald-200">
              <h3 className="font-bold text-emerald-950 text-sm flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-emerald-600" /> Chat Directly on WhatsApp
              </h3>
              <p className="text-xs text-emerald-800 mt-1 mb-3">
                Have questions about size, length measurement, fabric or custom order? Our concierge is available on
                WhatsApp.
              </p>
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold tracking-wider transition-colors"
              >
                OPEN WHATSAPP ({whatsapp}) &rarr;
              </a>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <h2 className="text-xl font-semibold text-neutral-900 mb-6">Send Us a Message</h2>
            {submitted ? (
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h3 className="text-base font-bold text-emerald-950">Thank you! Message received.</h3>
                <p className="text-xs text-emerald-800">
                  Our team will call or WhatsApp you within business hours.
                </p>
              </div>
            ) : (
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="contact-name" className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Name
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Your full name"
                    className="input-field"
                  />
                </div>
                <div>
                  <label htmlFor="contact-phone" className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Phone
                  </label>
                  <input
                    id="contact-phone"
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="01XXXXXXXXX"
                    className="input-field"
                  />
                </div>
                <div>
                  <label htmlFor="contact-subject" className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Subject
                  </label>
                  <select
                    id="contact-subject"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="input-field"
                  >
                    <option>Order inquiry</option>
                    <option>Product &amp; size question</option>
                    <option>Sizing help</option>
                    <option>Return / Exchange</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="contact-message" className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Message
                  </label>
                  <textarea
                    id="contact-message"
                    rows={5}
                    required
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="How can we help?"
                    className="input-field resize-none"
                  />
                </div>
                <button type="submit" className="btn-primary w-full py-3">
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
