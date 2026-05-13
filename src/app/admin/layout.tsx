"use client";
import Link from "next/link";
import { useUser, useAuth, RedirectToSignIn } from "@clerk/nextjs";
import { isAdminEmail } from "@/lib/admin";
import { Loader2 } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded: authLoaded } = useAuth();
  const { user, isLoaded: userLoaded } = useUser();

  if (!authLoaded || !userLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-[#fbbf24]" size={32} />
      </div>
    );
  }
  if (!isSignedIn) return <RedirectToSignIn />;

  const email = user?.primaryEmailAddress?.emailAddress;
  if (!isAdminEmail(email)) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center">
        <h1 className="text-2xl font-bold text-red-400 mb-2">Truy cập bị từ chối</h1>
        <p className="text-white/60">Email <span className="font-mono">{email}</span> không có quyền admin.</p>
        <Link href="/" className="inline-block mt-4 text-[#fbbf24] underline">Về trang chủ</Link>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-[#14141d] border-b border-[#2a2a3a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-6 text-sm">
          <span className="text-[#fbbf24] font-bold">Admin</span>
          <Link href="/admin" className="text-white/70 hover:text-white">Dashboard</Link>
          <Link href="/admin/movies" className="text-white/70 hover:text-white">Phim</Link>
          <Link href="/admin/showtimes" className="text-white/70 hover:text-white">Suất chiếu</Link>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">{children}</div>
    </div>
  );
}
