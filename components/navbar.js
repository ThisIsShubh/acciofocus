"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { 
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs';

const NAV_ITEMS = [
  { label: "Solo Study", href: "/study/solo" },
  { label: "Rooms", href: "/rooms" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const USER_NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Rooms", href: "/rooms" },
];

export default function Navbar() {
  const [visible, setVisible] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
    <>
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-transform duration-300 ${
          visible ? "translate-y-0" : "-translate-y-full"
        } bg-white bg-opacity-90`}
        style={{
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          boxShadow: "0 2px 16px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3 md:px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="Logo" className="h-8 w-8" />
            <span className="font-bold text-xl tracking-tight text-green-600">
              AccioFocus
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex flex-1 justify-center">
            <div className="flex items-center gap-6">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-gray-600 hover:text-green-700 font-medium transition-colors ${
                    item.label === "Solo Study" ? "font-semibold text-green-600" : ""
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-600 hover:text-green-700"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>

          {/* Right side: Auth buttons */}
          <div className="hidden md:flex items-center gap-3">
            <ClerkProvider>
              <SignedOut>
                <Link href="/login">
                  <button className="px-4 py-2 bg-white border border-green-600 text-green-600 rounded-lg font-semibold shadow hover:bg-green-50 transition">
                    Sign In
                  </button>
                </Link>
                <Link href="/signup">
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold shadow hover:bg-green-700 transition border-2 border-green-600">
                    Sign Up
                  </button>
                </Link>
              </SignedOut>
              <SignedIn>
                <div className="flex items-center gap-6">
                  {USER_NAV_ITEMS.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="text-gray-600 hover:text-green-700 font-medium transition-colors"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
                <div className="ml-4">
                  <UserButton afterSignOutUrl="/" />
                </div>
              </SignedIn>
            </ClerkProvider>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="fixed top-16 left-0 w-full bg-white z-40 md:hidden shadow-lg transition-all duration-300">
          <div className="px-4 py-6 border-t border-gray-100">
            <div className="flex flex-col gap-4">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-gray-700 hover:text-green-700 font-medium py-2 px-4 rounded-lg hover:bg-green-50 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
            
            <ClerkProvider>
              <SignedIn>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex flex-col gap-4">
                    {USER_NAV_ITEMS.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="text-gray-700 hover:text-green-700 font-medium py-2 px-4 rounded-lg hover:bg-green-50 transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </SignedIn>
              
              <div className="mt-6 flex flex-col gap-3">
                <SignedOut>
                  <Link href="/login">
                    <button
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full py-3 bg-white border border-green-600 text-green-600 rounded-lg font-semibold hover:bg-green-50 transition"
                    >
                      Sign In
                    </button>
                  </Link>
                  <Link href="/signup">
                    <button
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
                    >
                      Sign Up
                    </button>
                  </Link>
                </SignedOut>
                <SignedIn>
                  <div className="flex justify-center mt-4">
                    <UserButton afterSignOutUrl="/" />
                  </div>
                </SignedIn>
              </div>
            </ClerkProvider>
          </div>
        </div>
      )}
    </>
  );
}