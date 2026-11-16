"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  ShoppingBag,
  User,
  Menu,
  X,
  Heart,
  ChevronDown,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/lib/cart/cart-store";
import type { SiteContent } from "@/lib/cms/types";

const NAV_LINKS = [
  {
    label: "ALL PIECES",
    href: "/shop",
  },
  {
    label: "NAYRA & SKIRT",
    href: "/shop?category=nayra-dress-skirt",
    badge: "SIGNATURE",
  },
  {
    label: "BABY FROCKS",
    href: "/shop?category=baby-frock",
  },
  {
    label: "CO-ORDS & SUITS",
    href: "/shop",
    children: [
      {
        title: "PETITE ATELIER (KIDS)",
        links: [
          { label: "Baby Frocks (0-5Y)", href: "/shop?category=baby-frock" },
          { label: "Kids Two-Piece Sets", href: "/shop?category=two-piece-kids" },
          { label: "Kids Three-Piece Sets", href: "/shop?category=three-piece-kids" },
          { label: "Petite Nayra with Skirt", href: "/shop?category=nayra-dress-skirt" },
        ],
      },
      {
        title: "MAISON FEMME (WOMEN)",
        links: [
          { label: "Nayra Dress with Skirt", href: "/shop?category=nayra-dress-skirt" },
          { label: "Adult One-Piece Gowns", href: "/shop?category=adult-one-piece" },
          { label: "Adult Two-Piece Tailored", href: "/shop?category=adult-two-piece" },
          { label: "Adult Three-Piece Royal Suits", href: "/shop?category=adult-three-piece" },
          { label: "Architectural Short Tops", href: "/shop?category=short-tops" },
        ],
      },
    ],
  },
  {
    label: "SHORT TOPS",
    href: "/shop?category=short-tops",
  },
  {
    label: "THE ARCHIVE",
    href: "/shop?filter=archive",
  },
];

export default function Header({
  announcement,
}: {
  announcement?: SiteContent["announcement"];
} = {}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { count: cartCount } = useCart();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const searchRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setActiveDropdown(null);
    setIsSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (isSearchOpen) searchRef.current?.focus();
  }, [isSearchOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
    }
  };

  return (
    <>
      {/* Ticker Marquee Announcement */}
      <div className="bg-[#050507] border-b border-white/10 text-neutral-300 text-[10px] sm:text-xs py-2 px-4 overflow-hidden select-none">
        <div className="flex items-center justify-between container-store">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
            <span className="font-mono tracking-[0.2em] uppercase text-white font-semibold">
              {announcement?.badge || "DROP NOCTURNE // EDITION 2026"}
            </span>
          </div>
          <div className="hidden md:flex items-center gap-6 font-mono text-[10px] text-neutral-400 tracking-widest uppercase">
            {(announcement?.items || ["NAYRA CUT & SKIRT", "ROYAL BABY FROCKS", "TWO & THREE PIECE", "SHORT TOPS"]).map(
              (item, idx, arr) => (
                <React.Fragment key={idx}>
                  <span>{item}</span>
                  {idx < arr.length - 1 && <span className="text-white/20">•</span>}
                </React.Fragment>
              )
            )}
          </div>
          <div className="flex items-center gap-4 text-[10px] font-mono tracking-widest text-neutral-400 uppercase">
            <span className="text-white font-bold">BDT ৳</span>
            <span className="hidden sm:inline">{announcement?.rightNote || "DHAKA & NATIONWIDE DISPATCH"}</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header
        className={cn(
          "sticky top-0 z-50 transition-all duration-300 border-b",
          isScrolled
            ? "bg-[#070709]/95 backdrop-blur-xl border-white/15 shadow-2xl shadow-black/80"
            : "bg-[#070709] border-white/10"
        )}
      >
        <div className="container-store">
          <div className="flex items-center justify-between h-18 sm:h-20">
            {/* Left: Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 text-white/80 hover:text-white transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Logo: D'YAVOL X Architectural Style */}
            <Link href="/" className="flex flex-col items-start group select-none py-1">
              <span className="font-sans text-2xl sm:text-3xl font-black text-white tracking-[0.3em] leading-none transition-colors group-hover:text-brand-500">
                RISER
              </span>
              <span className="text-[7.5px] sm:text-[8px] text-neutral-400 tracking-[0.45em] uppercase font-mono mt-1 font-semibold group-hover:text-neutral-200 transition-colors">
                ATELIER &bull; COUTURE
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-6 xl:gap-8" ref={dropdownRef}>
              {NAV_LINKS.map((link) => (
                <div key={link.label} className="relative group">
                  {link.children ? (
                    <button
                      onClick={() =>
                        setActiveDropdown(activeDropdown === link.label ? null : link.label)
                      }
                      onMouseEnter={() => setActiveDropdown(link.label)}
                      className={cn(
                        "flex items-center gap-1.5 py-2 text-[11px] font-mono tracking-[0.22em] uppercase font-bold transition-colors cursor-pointer",
                        activeDropdown === link.label
                          ? "text-white"
                          : "text-neutral-400 hover:text-white"
                      )}
                    >
                      {link.label}
                      <ChevronDown
                        className={cn(
                          "w-3 h-3 transition-transform duration-200",
                          activeDropdown === link.label ? "rotate-180 text-brand-500" : ""
                        )}
                      />
                    </button>
                  ) : (
                    <Link
                      href={link.href}
                      className={cn(
                        "relative py-2 text-[11px] font-mono tracking-[0.22em] uppercase font-bold transition-colors flex items-center gap-1.5",
                        pathname === link.href ? "text-white" : "text-neutral-400 hover:text-white"
                      )}
                    >
                      {link.label}
                      {link.badge && (
                        <span className="px-1.5 py-0.2 text-[8px] font-mono uppercase bg-brand-600 text-white font-bold tracking-widest">
                          {link.badge}
                        </span>
                      )}
                    </Link>
                  )}

                  {/* Mega Dropdown */}
                  {link.children && activeDropdown === link.label && (
                    <div
                      onMouseLeave={() => setActiveDropdown(null)}
                      className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[540px] bg-[#0c0c10] border border-white/15 p-6 shadow-2xl shadow-black/90 backdrop-blur-2xl grid grid-cols-2 gap-8 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
                    >
                      {link.children.map((column) => (
                        <div key={column.title}>
                          <h4 className="text-[10px] font-mono uppercase tracking-[0.25em] text-brand-500 font-bold mb-4 pb-2 border-b border-white/10">
                            {column.title}
                          </h4>
                          <ul className="space-y-3">
                            {column.links.map((sublink) => (
                              <li key={sublink.label}>
                                <Link
                                  href={sublink.href}
                                  className="text-xs font-sans text-neutral-300 hover:text-white transition-colors flex items-center justify-between group/sub"
                                >
                                  <span>{sublink.label}</span>
                                  <ArrowRight className="w-3 h-3 text-neutral-600 group-hover/sub:text-white group-hover/sub:translate-x-1 transition-all" />
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* Right Icons: Search, Wishlist, Account, Bag */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Search Button */}
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2 text-neutral-300 hover:text-white transition-colors"
                aria-label="Search collection"
              >
                <Search className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Wishlist Link */}
              <Link
                href="/wishlist"
                className="hidden sm:flex p-2 text-neutral-300 hover:text-white transition-colors"
                aria-label="Wishlist"
              >
                <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
              </Link>

              {/* Account / Admin */}
              <Link
                href="/admin"
                className="hidden sm:flex p-2 text-neutral-300 hover:text-white transition-colors"
                aria-label="Account"
                title="Atelier Admin"
              >
                <User className="w-4 h-4 sm:w-5 sm:h-5" />
              </Link>

              {/* Cart Bag */}
              <Link
                href="/cart"
                className="relative p-2 text-neutral-300 hover:text-white transition-colors flex items-center gap-1.5"
                aria-label="Shopping bag"
              >
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="font-mono text-[11px] font-bold text-white bg-brand-600 px-1.5 py-0.2 rounded-none">
                  {cartCount}
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* Expandable Luxury Search Drawer */}
        {isSearchOpen && (
          <div className="border-t border-white/10 bg-[#09090c] py-4 px-4 shadow-2xl">
            <div className="container-store max-w-3xl">
              <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                <Search className="absolute left-4 w-5 h-5 text-neutral-400" />
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="SEARCH NAYRA CUT, BABY FROCKS, TWO-PIECE, THREE-PIECE, SHORT TOPS..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-black/60 border border-white/20 pl-12 pr-28 py-3 text-xs sm:text-sm font-mono tracking-wider text-white placeholder-neutral-500 focus:outline-none focus:border-white transition-colors"
                />
                <button
                  type="submit"
                  className="absolute right-2 px-4 py-1.5 bg-white text-black text-[10px] font-mono tracking-widest uppercase font-bold hover:bg-neutral-200 transition-colors"
                >
                  DISCOVER
                </button>
              </form>
              <div className="flex items-center gap-2 mt-3 text-[10px] font-mono text-neutral-500 uppercase tracking-widest overflow-x-auto scrollbar-none">
                <span>QUICK FILTERS:</span>
                <Link
                  href="/shop?category=nayra-dress-skirt"
                  className="text-neutral-400 hover:text-white underline underline-offset-4"
                >
                  Nayra & Skirt
                </Link>
                <span>•</span>
                <Link
                  href="/shop?category=baby-frock"
                  className="text-neutral-400 hover:text-white underline underline-offset-4"
                >
                  Baby Frock
                </Link>
                <span>•</span>
                <Link
                  href="/shop?category=two-piece-kids"
                  className="text-neutral-400 hover:text-white underline underline-offset-4"
                >
                  Two-Piece
                </Link>
                <span>•</span>
                <Link
                  href="/shop?category=adult-three-piece"
                  className="text-neutral-400 hover:text-white underline underline-offset-4"
                >
                  Adult Three-Piece
                </Link>
                <span>•</span>
                <Link
                  href="/shop?category=short-tops"
                  className="text-neutral-400 hover:text-white underline underline-offset-4"
                >
                  Short Tops
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Drawer (High Fashion Dark Minimalist) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer Container */}
          <div className="fixed inset-y-0 left-0 w-full max-w-sm bg-[#09090c] border-r border-white/10 p-6 flex flex-col justify-between overflow-y-auto">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-6 border-b border-white/10">
                <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
                  <span className="font-sans text-2xl font-black text-white tracking-[0.3em]">
                    RISER
                  </span>
                  <p className="text-[8px] font-mono text-neutral-400 tracking-[0.4em] uppercase">
                    ATELIER &bull; COUTURE
                  </p>
                </Link>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-neutral-400 hover:text-white"
                  aria-label="Close menu"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Navigation Items */}
              <div className="py-6 space-y-6">
                <div>
                  <p className="text-[10px] font-mono text-brand-500 uppercase tracking-[0.3em] font-bold mb-3">
                    SIGNATURE CATEGORIES
                  </p>
                  <ul className="space-y-3 font-mono text-sm tracking-wider uppercase">
                    <li>
                      <Link
                        href="/shop?category=nayra-dress-skirt"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-white hover:text-brand-400 flex items-center justify-between py-1"
                      >
                        <span>Nayra Dress with Skirt</span>
                        <span className="text-[9px] px-1.5 py-0.5 bg-brand-600 text-white font-bold">
                          HOT
                        </span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/shop?category=baby-frock"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-neutral-300 hover:text-white flex items-center justify-between py-1"
                      >
                        <span>Baby Frocks</span>
                        <span className="text-[9px] text-neutral-500">0-5Y</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/shop?category=two-piece-kids"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-neutral-300 hover:text-white py-1 block"
                      >
                        Kids Two-Piece Sets
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/shop?category=three-piece-kids"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-neutral-300 hover:text-white py-1 block"
                      >
                        Kids Three-Piece Sets
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/shop?category=adult-one-piece"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-neutral-300 hover:text-white py-1 block"
                      >
                        Adult Girls One-Piece
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/shop?category=adult-two-piece"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-neutral-300 hover:text-white py-1 block"
                      >
                        Adult Girls Two-Piece
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/shop?category=adult-three-piece"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-neutral-300 hover:text-white py-1 block"
                      >
                        Adult Girls Three-Piece
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/shop?category=short-tops"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-neutral-300 hover:text-white py-1 block"
                      >
                        Architectural Short Tops
                      </Link>
                    </li>
                  </ul>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <Link
                    href="/shop"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full btn-luxury-white text-center py-3 block text-xs"
                  >
                    VIEW ENTIRE ARCHIVE
                  </Link>
                </div>
              </div>
            </div>

            {/* Bottom Contact */}
            <div className="pt-6 border-t border-white/10 text-[10px] font-mono text-neutral-400 space-y-2">
              <p className="tracking-widest uppercase">DHAKA FLAGSHIP ATELIER</p>
              <p>DIRECT CLIENT LIAISON: 01XXXXXXXXX</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
