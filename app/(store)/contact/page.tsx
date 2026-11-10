import type { Metadata } from "next";
import Link from "next/link";
import { Mail, Phone, MapPin, Clock, MessageCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with Riser. We're here to help with your orders, sizing questions, and more.",
};

export default function ContactPage() {
  return (
    <div className="bg-white min-h-screen">
      <div className="bg-neutral-50 border-b border-neutral-100">
        <div className="container-store py-10">
          <h1 className="section-title">Contact Us</h1>
          <p className="text-neutral-500 mt-2">We'd love to hear from you.</p>
        </div>
      </div>

      <div className="container-store py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div>
            <h2 className="text-xl font-semibold text-neutral-900 mb-6">Get in Touch</h2>
            <div className="space-y-5">
              {[
                { icon: Phone, label: "Phone / WhatsApp", value: "01XXXXXXXXX", href: "tel:+8801XXXXXXXXX" },
                { icon: Mail, label: "Email", value: "hello@riser.com.bd", href: "mailto:hello@riser.com.bd" },
                { icon: MessageCircle, label: "Facebook", value: "facebook.com/riser.bd", href: "#" },
                { icon: MapPin, label: "Head Office", value: "Dhaka, Bangladesh", href: null },
                { icon: Clock, label: "Business Hours", value: "Sat–Thu, 10am–8pm", href: null },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-4 p-4 rounded-2xl border border-neutral-100">
                  <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center shrink-0">
                    <item.icon className="w-5 h-5 text-brand-500" />
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 font-medium mb-0.5">{item.label}</p>
                    {item.href ? (
                      <a href={item.href} className="text-neutral-900 font-medium hover:text-brand-600 transition-colors text-sm">
                        {item.value}
                      </a>
                    ) : (
                      <p className="text-neutral-900 font-medium text-sm">{item.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <h2 className="text-xl font-semibold text-neutral-900 mb-6">Send Us a Message</h2>
            <form className="space-y-4">
              <div>
                <label htmlFor="contact-name" className="block text-sm font-medium text-neutral-700 mb-1.5">Name</label>
                <input id="contact-name" type="text" placeholder="Your name" className="input-field" />
              </div>
              <div>
                <label htmlFor="contact-phone" className="block text-sm font-medium text-neutral-700 mb-1.5">Phone</label>
                <input id="contact-phone" type="tel" placeholder="01XXXXXXXXX" className="input-field" />
              </div>
              <div>
                <label htmlFor="contact-subject" className="block text-sm font-medium text-neutral-700 mb-1.5">Subject</label>
                <select id="contact-subject" className="input-field">
                  <option>Order inquiry</option>
                  <option>Product question</option>
                  <option>Sizing help</option>
                  <option>Return / Exchange</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label htmlFor="contact-message" className="block text-sm font-medium text-neutral-700 mb-1.5">Message</label>
                <textarea id="contact-message" rows={5} placeholder="How can we help?" className="input-field resize-none" />
              </div>
              <button type="submit" className="btn-primary w-full py-3">Send Message</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
