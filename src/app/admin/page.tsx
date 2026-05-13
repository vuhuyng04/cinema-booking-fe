"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Film, Calendar, Ticket, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function AdminDashboard() {
  const [stats, setStats] = useState<{ movies: number; showtimes: number; bookings: number } | null>(null);

  useEffect(() => {
    (async () => {
      const sb = supabase();
      const [m, st, b] = await Promise.all([
        sb.from("movies").select("*", { count: "exact", head: true }),
        sb.from("showtimes").select("*", { count: "exact", head: true }),
        sb.from("bookings").select("*", { count: "exact", head: true }),
      ]);
      setStats({
        movies: m.count ?? 0,
        showtimes: st.count ?? 0,
        bookings: b.count ?? 0,
      });
    })();
  }, []);

  if (!stats) return <Loader2 className="animate-spin text-[#fbbf24] mx-auto mt-20" />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/admin/movies" className="bg-[#14141d] hover:bg-[#1c1c2a] border border-[#2a2a3a] rounded-xl p-6 transition">
          <Film className="text-[#fbbf24] mb-3" size={28} />
          <div className="text-3xl font-black text-white">{stats.movies}</div>
          <div className="text-white/60 text-sm">Phim</div>
        </Link>
        <Link href="/admin/showtimes" className="bg-[#14141d] hover:bg-[#1c1c2a] border border-[#2a2a3a] rounded-xl p-6 transition">
          <Calendar className="text-[#fbbf24] mb-3" size={28} />
          <div className="text-3xl font-black text-white">{stats.showtimes}</div>
          <div className="text-white/60 text-sm">Suất chiếu</div>
        </Link>
        <div className="bg-[#14141d] border border-[#2a2a3a] rounded-xl p-6">
          <Ticket className="text-[#fbbf24] mb-3" size={28} />
          <div className="text-3xl font-black text-white">{stats.bookings}</div>
          <div className="text-white/60 text-sm">Vé đã đặt</div>
        </div>
      </div>
    </div>
  );
}
