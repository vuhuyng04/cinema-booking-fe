"use client";
import Link from "next/link";
import { UserButton, useAuth, useUser } from "@clerk/nextjs";
import { Film, Ticket, Menu, X } from "lucide-react";
import { useState } from "react";
import { isAdminEmail } from "@/lib/admin";

export default function Navbar() {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const isAdmin = isAdminEmail(user?.primaryEmailAddress?.emailAddress);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-[#0a0a0f]/80 border-b border-[#2a2a3a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-black text-xl">
          <Film className="text-[#fbbf24]" size={24} />
          <span className="text-white">
            Cine<span className="text-[#fbbf24]">Book</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link href="/" className="text-white/70 hover:text-[#fbbf24] transition">Trang chủ</Link>
          <Link href="/movies" className="text-white/70 hover:text-[#fbbf24] transition">Phim</Link>
          {isSignedIn && (
            <Link href="/my-bookings" className="text-white/70 hover:text-[#fbbf24] transition">
              Vé của tôi
            </Link>
          )}
          {isSignedIn && isAdmin && (
            <Link href="/admin" className="text-[#fbbf24] hover:text-[#fbbf24]/80 transition">Admin</Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {isLoaded && !isSignedIn && (
            <Link
              href="/sign-in"
              className="hidden sm:inline-flex px-4 py-2 text-sm font-semibold text-white border border-[#fbbf24] rounded-full hover:bg-[#fbbf24] hover:text-[#0a0a0f] transition"
            >
              Đăng nhập
            </Link>
          )}
          {isSignedIn && <UserButton appearance={{ elements: { avatarBox: "w-9 h-9" } }} />}
          <button className="md:hidden text-white" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-[#2a2a3a] bg-[#14141d]">
          <nav className="flex flex-col p-4 gap-3 text-sm">
            <Link href="/" onClick={() => setOpen(false)} className="text-white/80 hover:text-[#fbbf24]">Trang chủ</Link>
            <Link href="/movies" onClick={() => setOpen(false)} className="text-white/80 hover:text-[#fbbf24]">Phim</Link>
            {isSignedIn && (
              <Link href="/my-bookings" onClick={() => setOpen(false)} className="text-white/80 hover:text-[#fbbf24] flex items-center gap-2">
                <Ticket size={16} /> Vé của tôi
              </Link>
            )}
            {isSignedIn && isAdmin && (
              <Link href="/admin" onClick={() => setOpen(false)} className="text-[#fbbf24]">Admin</Link>
            )}
            {isLoaded && !isSignedIn && (
              <Link href="/sign-in" onClick={() => setOpen(false)} className="text-[#fbbf24] font-semibold">Đăng nhập</Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
