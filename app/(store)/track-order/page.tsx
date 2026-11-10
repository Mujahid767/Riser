"use client";

import { useState } from "react";
import { Search, Package, CheckCircle, Truck, MapPin, XCircle } from "lucide-react";
import type { Metadata } from "next";

const STATUS_STEPS = [
  { key: "PENDING", label: "Order Placed", icon: Package, desc: "Your order has been received" },
  { key: "CONFIRMED", label: "Confirmed", icon: CheckCircle, desc: "Order confirmed by our team" },
  { key: "PROCESSING", label: "Processing", icon: Package, desc: "Being prepared for dispatch" },
  { key: "PACKED", label: "Packed", icon: Package, desc: "Securely packed and ready" },
  { key: "SHIPPED", label: "Shipped", icon: Truck, desc: "Out for delivery" },
  { key: "DELIVERED", label: "Delivered", icon: CheckCircle, desc: "Successfully delivered" },
];

// Demo order for display
const DEMO_ORDER = {
  orderNumber: "RIS-2026-000123",
  status: "SHIPPED",
  customerName: "Demo Customer",
  createdAt: "28 Sep, 2026",
  items: [
    { name: "Floral Cotton Dress", size: "4-5Y", qty: 1 },
    { name: "Classic Party Frock", size: "5-6Y", qty: 2 },
  ],
  total: 2300,
};

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [searched, setSearched] = useState(false);
  const [found, setFound] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearched(true);
    // Demo: show result for any valid-format input
    setFound(orderNumber.toUpperCase().includes("RIS") || orderNumber.length > 4);
  };

  const currentStep = STATUS_STEPS.findIndex((s) => s.key === DEMO_ORDER.status);

  return (
    <div className="bg-neutral-50 min-h-screen py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="section-title mb-3">Track Your Order</h1>
          <p className="text-neutral-500">
            Enter your order number and phone number to see the latest status.
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="bg-white rounded-2xl border border-neutral-100 p-6 mb-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="track-order-number" className="block text-sm font-medium text-neutral-700 mb-1.5">
                Order Number
              </label>
              <input
                id="track-order-number"
                type="text"
                placeholder="RIS-2026-000123"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                required
                className="input-field font-mono"
              />
            </div>
            <div>
              <label htmlFor="track-phone" className="block text-sm font-medium text-neutral-700 mb-1.5">
                Phone Number
              </label>
              <input
                id="track-phone"
                type="tel"
                placeholder="01XXXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="input-field"
              />
            </div>
            <button type="submit" id="track-order-btn" className="btn-primary w-full py-3">
              <Search className="w-4 h-4" />
              Track Order
            </button>
          </div>
        </form>

        {/* Results */}
        {searched && !found && (
          <div className="bg-white rounded-2xl border border-neutral-100 p-8 text-center">
            <XCircle className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
            <h3 className="font-semibold text-neutral-900 mb-2">Order Not Found</h3>
            <p className="text-neutral-500 text-sm">
              We couldn't find an order matching those details. Please check and try again, or{" "}
              <a href="tel:+8801XXXXXXXXX" className="text-brand-600 hover:underline">
                contact us
              </a>
              .
            </p>
          </div>
        )}

        {searched && found && (
          <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
            {/* Order header */}
            <div className="bg-brand-500 text-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-brand-200 text-xs uppercase tracking-wide mb-1">Order Number</p>
                  <p className="font-bold text-lg font-mono">{DEMO_ORDER.orderNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-brand-200 text-xs uppercase tracking-wide mb-1">Placed on</p>
                  <p className="font-semibold">{DEMO_ORDER.createdAt}</p>
                </div>
              </div>
            </div>

            {/* Progress Tracker */}
            <div className="p-6">
              <h3 className="font-semibold text-neutral-900 mb-6">Delivery Status</h3>
              <div className="relative">
                {/* Progress line */}
                <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-neutral-100" />
                <div
                  className="absolute left-4 top-4 w-0.5 bg-brand-500 transition-all duration-700"
                  style={{ height: `${(currentStep / (STATUS_STEPS.length - 1)) * 100}%` }}
                />

                <div className="space-y-6 relative">
                  {STATUS_STEPS.map((step, idx) => {
                    const isCompleted = idx <= currentStep;
                    const isCurrent = idx === currentStep;
                    return (
                      <div key={step.key} className="flex items-start gap-4 pl-10">
                        {/* Circle */}
                        <div
                          className={`absolute left-0 w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all z-10 ${
                            isCompleted
                              ? "bg-brand-500 border-brand-500"
                              : "bg-white border-neutral-200"
                          } ${isCurrent ? "ring-4 ring-brand-100" : ""}`}
                        >
                          <step.icon
                            className={`w-4 h-4 ${isCompleted ? "text-white" : "text-neutral-300"}`}
                          />
                        </div>
                        <div className={isCompleted ? "" : "opacity-40"}>
                          <p className={`font-semibold text-sm ${isCurrent ? "text-brand-700" : "text-neutral-900"}`}>
                            {step.label}
                            {isCurrent && (
                              <span className="ml-2 text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full font-bold">
                                Current
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-neutral-500 mt-0.5">{step.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Items */}
              <div className="mt-8 pt-6 border-t border-neutral-100">
                <h4 className="font-semibold text-neutral-900 text-sm mb-3">Items in this order</h4>
                {DEMO_ORDER.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2 text-sm">
                    <span className="text-neutral-700">
                      {item.name} <span className="text-neutral-400">× {item.qty}</span>
                    </span>
                    <span className="text-xs bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full">
                      Size: {item.size}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
