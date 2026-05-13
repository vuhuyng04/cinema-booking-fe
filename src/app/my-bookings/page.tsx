"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth, RedirectToSignIn } from "@clerk/nextjs";
import { Loader2, Ticket, ChevronRight } from "lucide-react";
import { api, fmtDateTime, vnd } from "@/lib/api";

type MyBooking = {
  id: string;
  total_price: number;
  status: string;
  created_at: string;
  showtime: {
    start_time: string;
    hall: { name: string; cinema: { name: string } };
    movie: { id: string; title: string; poster_url: string | null };
  };
  seats: { row_label: string; col_number: number }[];
};

export default function MyBookingsPage() {
  const { isSignedIn, isLoaded, getToken } = useAuth();
  const [bookings, setBookings] = useState<MyBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    (async () => {
      try {
        const token = await getToken();
        const data = await api<MyBooking[]>("/api/bookings/me", { token });
        setBookings(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Lỗi tải vé");
      } finally {
        setLoading(false);
      }
    })();
  }, [isLoaded, isSignedIn, getToken]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-[#fbbf24]" size={32} />
      </div>
    );
  }
  if (!isSignedIn) return <RedirectToSignIn />;

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-[#fbbf24]" size={32} />
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-black text-white mb-6">Vé của tôi</h1>
      {error && <p className="text-red-400 mb-4">{error}</p>}
      {bookings.length === 0 ? (
        <div className="bg-[#14141d] rounded-xl p-12 text-center border border-[#2a2a3a]">
          <Ticket className="mx-auto text-white/20 mb-4" size={48} />
          <p className="text-white/60 mb-4">Bạn chưa có vé nào.</p>
          <Link href="/movies" className="inline-block px-5 py-2.5 bg-[#fbbf24] text-[#0a0a0f] font-bold rounded-lg hover:bg-[#fbbf24]/90 transition">
            Đặt vé ngay
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <Link
              key={b.id}
              href={`/booking/${b.id}/success`}
              className="block bg-[#14141d] hover:bg-[#1c1c2a] border border-[#2a2a3a] hover:border-[#fbbf24] rounded-xl p-4 transition group"
            >
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-white font-bold">{b.showtime.movie.title}</h3>
                    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${
                      b.status === "confirmed" ? "bg-green-500/20 text-green-400" :
                      b.status === "cancelled" ? "bg-red-500/20 text-red-400" :
                      "bg-yellow-500/20 text-yellow-400"
                    }`}>
                      {b.status === "confirmed" ? "Đã xác nhận" : b.status === "cancelled" ? "Đã huỷ" : "Chờ xử lý"}
                    </span>
                  </div>
                  <div className="text-white/50 text-sm">
                    {fmtDateTime(b.showtime.start_time)} • {b.showtime.hall.cinema.name} • {b.showtime.hall.name}
                  </div>
                  <div className="text-white/50 text-sm mt-1">
                    Ghế: <span className="text-[#fbbf24] font-mono">{b.seats.map((s) => `${s.row_label}${s.col_number}`).join(", ")}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[#fbbf24] font-black text-lg">{vnd(Number(b.total_price))}</div>
                  <ChevronRight className="text-white/30 group-hover:text-[#fbbf24] inline-block mt-1" size={20} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
