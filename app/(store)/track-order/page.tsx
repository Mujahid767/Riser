"use client";

import { useState } from "react";
import {
  Search,
  Package,
  CheckCircle,
  Truck,
  XCircle,
  Clock,
} from "lucide-react";

const STATUS_STEPS = [
  {
    key: "PENDING",
    label: "Order Placed",
    icon: Clock,
    desc: "Your order has been received",
  },
  {
    key: "CONFIRMED",
    label: "Confirmed",
    icon: CheckCircle,
    desc: "Order confirmed by our team",
  },
  {
    key: "PROCESSING",
    label: "Processing",
    icon: Package,
    desc: "Being prepared for dispatch",
  },
  {
    key: "PACKED",
    label: "Packed",
    icon: Package,
    desc: "Securely packed and ready",
  },
  {
    key: "SHIPPED",
    label: "Shipped",
    icon: Truck,
    desc: "Out for delivery",
  },
  {
    key: "DELIVERED",
    label: "Delivered",
    icon: CheckCircle,
    desc: "Successfully delivered",
  },
];

type TrackResult = {
  orderNumber: string;
  status: string;
  customerName: string;
  createdAt: string;
  district: string;
  trackingNumber?: string;
  total: number;
  shippingFee: number;
  items: { productName: string; size?: string; color?: string; qty: number; unitPrice: number }[];
};

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<TrackResult | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    setSearched(false);

    try {
      const res = await fetch(
        `/api/orders/track?orderNumber=${encodeURIComponent(orderNumber.trim())}&phone=${encodeURIComponent(phone.trim())}`
      );
      setSearched(true);
      if (res.ok) {
        const data = (await res.json()) as TrackResult;
        setResult(data);
      } else {
        setResult(null);
      }
    } catch {
      setError("Could not connect. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const currentStep = result
    ? STATUS_STEPS.findIndex((s) => s.key === result.status)
    : -1;

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
        <form
          onSubmit={handleSearch}
          className="bg-white rounded-2xl border border-neutral-100 p-6 mb-6"
        >
          <div className="space-y-4">
            <div>
              <label
                htmlFor="track-order-number"
                className="block text-sm font-medium text-neutral-700 mb-1.5"
              >
                Order Number
              </label>
              <input
                id="track-order-number"
                type="text"
                placeholder="RIS-2026-000001"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                required
                className="input-field font-mono"
              />
            </div>
            <div>
              <label
                htmlFor="track-phone"
                className="block text-sm font-medium text-neutral-700 mb-1.5"
              >
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
            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
            <button
              type="submit"
              id="track-order-btn"
              disabled={loading}
              className="btn-primary w-full py-3 disabled:opacity-60"
            >
              <Search className="w-4 h-4" />
              {loading ? "Searching…" : "Track Order"}
            </button>
          </div>
        </form>

        {/* Not found */}
        {searched && !result && !loading && (
          <div className="bg-white rounded-2xl border border-neutral-100 p-8 text-center">
            <XCircle className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
            <h3 className="font-semibold text-neutral-900 mb-2">
              Order Not Found
            </h3>
            <p className="text-neutral-500 text-sm">
              We couldn&apos;t find an order matching those details. Please
              check and try again, or{" "}
              <a href="tel:+8801700000000" className="text-brand-600 hover:underline">
                contact us
              </a>
              .
            </p>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
            {/* Order header */}
            <div className="bg-brand-500 text-white p-6">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <p className="text-brand-200 text-xs uppercase tracking-wide mb-1">
                    Order Number
                  </p>
                  <p className="font-bold text-lg font-mono">
                    {result.orderNumber}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-brand-200 text-xs uppercase tracking-wide mb-1">
                    Placed on
                  </p>
                  <p className="font-semibold">
                    {new Date(result.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
              {result.trackingNumber && (
                <div className="mt-3 pt-3 border-t border-brand-400">
                  <p className="text-brand-200 text-xs uppercase tracking-wide mb-1">
                    Tracking Number
                  </p>
                  <p className="font-mono font-semibold">
                    {result.trackingNumber}
                  </p>
                </div>
              )}
            </div>

            {/* Progress Tracker */}
            <div className="p-6">
              <h3 className="font-semibold text-neutral-900 mb-6">
                Delivery Status
              </h3>
              <div className="relative">
                {/* Background line */}
                <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-neutral-100" />
                {/* Filled line */}
                {currentStep >= 0 && (
                  <div
                    className="absolute left-4 top-4 w-0.5 bg-brand-500 transition-all duration-700"
                    style={{
                      height: `${
                        (currentStep / (STATUS_STEPS.length - 1)) * 100
                      }%`,
                    }}
                  />
                )}

                <div className="space-y-6 relative">
                  {STATUS_STEPS.map((step, idx) => {
                    const isCompleted = idx <= currentStep;
                    const isCurrent = idx === currentStep;
                    return (
                      <div
                        key={step.key}
                        className="flex items-start gap-4 pl-10"
                      >
                        <div
                          className={`absolute left-0 w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all z-10 ${
                            isCompleted
                              ? "bg-brand-500 border-brand-500"
                              : "bg-white border-neutral-200"
                          } ${isCurrent ? "ring-4 ring-brand-100" : ""}`}
                        >
                          <step.icon
                            className={`w-4 h-4 ${
                              isCompleted ? "text-white" : "text-neutral-300"
                            }`}
                          />
                        </div>
                        <div className={isCompleted ? "" : "opacity-40"}>
                          <p
                            className={`font-semibold text-sm ${
                              isCurrent
                                ? "text-brand-700"
                                : "text-neutral-900"
                            }`}
                          >
                            {step.label}
                            {isCurrent && (
                              <span className="ml-2 text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full font-bold">
                                Current
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-neutral-500 mt-0.5">
                            {step.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Items */}
              <div className="mt-8 pt-6 border-t border-neutral-100">
                <h4 className="font-semibold text-neutral-900 text-sm mb-3">
                  Items in this order
                </h4>
                {result.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-2 text-sm border-b border-neutral-50 last:border-0"
                  >
                    <div>
                      <span className="text-neutral-700">{item.productName}</span>
                      <span className="text-neutral-400 ml-1">× {item.qty}</span>
                      {(item.size || item.color) && (
                        <span className="ml-2 text-xs text-neutral-400">
                          {[item.size, item.color].filter(Boolean).join(" · ")}
                        </span>
                      )}
                    </div>
                    <span className="font-medium text-neutral-800">
                      ৳{(item.unitPrice * item.qty).toLocaleString()}
                    </span>
                  </div>
                ))}
                <div className="mt-3 pt-3 border-t border-neutral-100 space-y-1">
                  <div className="flex justify-between text-sm text-neutral-500">
                    <span>Shipping ({result.district})</span>
                    <span>৳{result.shippingFee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold text-neutral-900">
                    <span>Total</span>
                    <span>৳{result.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
