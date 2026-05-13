"use client";
import { useEffect, useState, use } from "react";
import { QRCodeSVG } from "qrcode.react";
import { CheckCircle2, Loader2, Ticket } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { fmtDateTime, vnd } from "@/lib/api";

type BookingDetail = {
  id: string;
  user_email: string | null;
  total_price: number;
  status: string;
  created_at: string;
  showtime: {
    start_time: string;
    hall: { name: string; cinema: { name: string; address: string } };
    movie: { title: string; poster_url: string | null };
  };
  seats: { row_label: string; col_number: number; seat_type: string }[];
};

export default function SuccessPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const sb = supabase();
      const { data: b } = await sb
        .from("bookings")
        .select(`
          id, user_email, total_price, status, created_at,
          showtime:showtimes(
            start_time,
            hall:halls(name, cinema:cinemas(name, address)),
            movie:movies(title, poster_url)
          )
        `)
        .eq("id", id)
        .single();

      if (b) {
        const { data: bs } = await sb
          .from("booking_seats")
          .select("seat:seats(row_label, col_number, seat_type)")
          .eq("booking_id", id);
        const seats = (bs ?? []).map((x) => x.seat).flat() as BookingDetail["seats"];
        setBooking({ ...(b as unknown as BookingDetail), seats });
      }
      setLoading(false);
    })();
  }, [id]);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-[#fbbf24]" size={32} />
      </div>
    );
  if (!booking)
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-white/60">Không tìm thấy vé</p>
      </div>
    );

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <div className="text-center mb-6">
        <CheckCircle2 className="text-green-400 mx-auto mb-3" size={64} />
        <h1 className="text-3xl font-black text-white">Đặt vé thành công!</h1>
        <p className="text-white/60 mt-2">Vui lòng xuất trình mã QR tại quầy để vào rạp.</p>
      </div>

      <div className="bg-[#14141d] rounded-2xl border border-[#2a2a3a] overflow-hidden shadow-2xl">
        <div className="bg-gradient-to-r from-[#fbbf24] to-[#d4a017] p-5 text-[#0a0a0f]">
          <div className="flex items-center gap-2 font-black text-xl">
            <Ticket size={24} /> CineBook E-Ticket
          </div>
          <div className="text-xs opacity-80 mt-1 font-mono">#{booking.id.slice(0, 8).toUpperCase()}</div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="flex justify-center">
            <div className="bg-white p-4 rounded-lg">
              <QRCodeSVG value={booking.id} size={180} level="M" />
            </div>
          </div>
          <div className="space-y-3 text-sm">
            <div>
              <div className="text-white/40 text-xs uppercase">Phim</div>
              <div className="text-white font-bold">{booking.showtime.movie.title}</div>
            </div>
            <div>
              <div className="text-white/40 text-xs uppercase">Suất chiếu</div>
              <div className="text-white">{fmtDateTime(booking.showtime.start_time)}</div>
            </div>
            <div>
              <div className="text-white/40 text-xs uppercase">Rạp</div>
              <div className="text-white">{booking.showtime.hall.cinema.name}</div>
              <div className="text-white/50 text-xs">{booking.showtime.hall.cinema.address}</div>
            </div>
            <div>
              <div className="text-white/40 text-xs uppercase">Phòng / Ghế</div>
              <div className="text-white">
                {booking.showtime.hall.name} •{" "}
                <span className="text-[#fbbf24] font-mono font-bold">
                  {booking.seats.map((s) => `${s.row_label}${s.col_number}`).join(", ")}
                </span>
              </div>
            </div>
            <div className="border-t border-[#2a2a3a] pt-3">
              <div className="text-white/40 text-xs uppercase">Tổng</div>
              <div className="text-2xl font-black text-[#fbbf24]">{vnd(Number(booking.total_price))}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex gap-3 justify-center">
        <Link href="/my-bookings" className="px-5 py-2.5 bg-[#1c1c2a] hover:bg-[#2a2a3a] text-white rounded-lg text-sm font-semibold transition">
          Xem vé của tôi
        </Link>
        <Link href="/" className="px-5 py-2.5 bg-[#fbbf24] hover:bg-[#fbbf24]/90 text-[#0a0a0f] rounded-lg text-sm font-bold transition">
          Về trang chủ
        </Link>
      </div>
    </div>
  );
}
