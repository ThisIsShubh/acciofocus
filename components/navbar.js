"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";

const NAV_ITEMS = [
  { label: "Solo Study", href: "/study/solo" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Login", href: "/(auth)/login" },
  { label: "Signup", href: "/(auth)/signup" },
];

export default function Navbar() {
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
        setVisible(false); // scrolling down
      } else {
        setVisible(true); // scrolling up
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-transform duration-300 ${
        visible ? "translate-y-0" : "-translate-y-full"
      }`}
      style={{
        // background: "rgba(99, 59, 0, 1)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        boxShadow: "0 2px 16px rgba(0, 0, 0, 0.27)",
      }}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-3">
        {/* Logo */}
        <Link href="/">
          <span className="font-bold text-xl tracking-tight text-green-500 flex items-center gap-2">
            <img src="/logo.png" alt="Logo" className="h-8 w-8" />
            AccioFocus
          </span>
        </Link>

        {/* Centered nav items */}
        <div className="flex-1 flex justify-center">
          <div className="flex items-center gap-6">
            <Link
              href="/study/solo"
              className="text-green-600 hover:text-green-900 font-semibold transition-colors"
            >
              Solo Study
            </Link>
            <Link
              href="/about"
              className="text-gray-500 hover:text-green-800 font-medium transition-colors"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="text-gray-500 hover:text-green-800 font-medium transition-colors"
            >
              Contact
            </Link>
          </div>
        </div>

        {/* Right side: Login & Signup buttons */}
        <div className="flex items-center gap-3">
          <Link
            href="/(auth)/login"
            className="px-4 py-2 bg-white border border-green-500 text-green-500 rounded-lg font-semibold shadow hover:bg-green-50 transition"
          >
            Login
          </Link>
          <Link
            href="/(auth)/signup"
            className="px-4 py-2 bg-green-500 text-white rounded-lg font-semibold shadow hover:bg-green-700 transition border-2 border-green-500"
          >
            Signup
          </Link>
        </div>
      </div>
    </nav>
  );
}
