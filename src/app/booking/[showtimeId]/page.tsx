"use client";
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useUser, SignInButton } from "@clerk/nextjs";
import { Loader2, Ticket, ArrowLeft } from "lucide-react";
import Link from "next/link";
import SeatMap from "@/components/SeatMap";
import { supabase } from "@/lib/supabase";
import { api, fmtDateTime, vnd } from "@/lib/api";
import type { Movie, Hall, Cinema, Showtime, Seat } from "@/lib/types";

type FullShowtime = Showtime & { hall: Hall & { cinema: Cinema; seats: Seat[]; movie: Movie } };

export default function BookingPage({ params }: { params: Promise<{ showtimeId: string }> }) {
  const { showtimeId } = use(params);
  const router = useRouter();
  const { isSignedIn, getToken } = useAuth();
  const { user } = useUser();

  const [data, setData] = useState<{
    showtime: FullShowtime;
    seats: Seat[];
    takenIds: string[];
  } | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const sb = supabase();
        const { data: showtime, error: e1 } = await sb
          .from("showtimes")
          .select("*, hall:halls(*, cinema:cinemas(*), seats(*))")
          .eq("id", showtimeId)
          .single();
        if (e1) throw e1;
        if (!showtime) throw new Error("Suất chiếu không tồn tại");

        const { data: movie, error: e2 } = await sb
          .from("movies")
          .select("*")
          .eq("id", showtime.movie_id)
          .single();
        if (e2) throw e2;

        const { data: takenSeats } = await sb
          .from("booking_seats")
          .select("seat_id")
          .eq("showtime_id", showtimeId);

        if (!active) return;
        const full = { ...showtime, hall: { ...showtime.hall, movie } } as FullShowtime;
        setData({
          showtime: full,
          seats: full.hall.seats,
          takenIds: (takenSeats ?? []).map((t: { seat_id: string }) => t.seat_id),
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Lỗi tải dữ liệu");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [showtimeId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-[#fbbf24]" size={32} />
      </div>
    );
  }
  if (error || !data) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-red-400 mb-4">{error ?? "Không thể tải"}</p>
        <Link href="/movies" className="text-[#fbbf24] underline">
          Quay lại danh sách phim
        </Link>
      </div>
    );
  }

  const { showtime, seats, takenIds } = data;
  const taken = new Set(takenIds);
  const movie = showtime.hall.movie;

  const priceFor = (seat: Seat) => {
    if (seat.seat_type === "vip") return Number(showtime.price_vip);
    if (seat.seat_type === "couple") return Number(showtime.price_couple);
    return Number(showtime.price_standard);
  };

  const total = [...selected].reduce((sum, id) => {
    const s = seats.find((x) => x.id === id);
    return sum + (s ? priceFor(s) : 0);
  }, 0);

  const toggle = (s: Seat) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(s.id)) next.delete(s.id);
      else next.add(s.id);
      return next;
    });
  };

  const submit = async () => {
    if (!isSignedIn) return;
    if (selected.size === 0) {
      setError("Vui lòng chọn ít nhất 1 ghế");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const token = await getToken();
      const seatItems = [...selected].map((seatId) => {
        const s = seats.find((x) => x.id === seatId)!;
        return { seat_id: seatId, price: priceFor(s) };
      });
      const result = await api<{ id: string }>("/api/bookings", {
        method: "POST",
        token,
        body: JSON.stringify({
          showtime_id: showtimeId,
          user_email: user?.primaryEmailAddress?.emailAddress ?? null,
          seats: seatItems,
        }),
      });
      router.push(`/booking/${result.id}/success`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đặt vé thất bại — có thể ghế vừa bị người khác đặt. Tải lại trang.");
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
      <Link href={`/movies/${movie.id}`} className="inline-flex items-center gap-1 text-white/60 hover:text-[#fbbf24] mb-4 text-sm">
        <ArrowLeft size={16} /> Quay lại
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Seat picker */}
        <div className="lg:col-span-2">
          <div className="mb-4">
            <h1 className="text-2xl font-black text-white">{movie.title}</h1>
            <p className="text-white/60 text-sm mt-1">
              {showtime.hall.cinema.name} • {showtime.hall.name} • {fmtDateTime(showtime.start_time)}
            </p>
          </div>
          <SeatMap
            seats={seats}
            takenSeatIds={taken}
            selectedSeatIds={selected}
            onToggle={toggle}
          />
        </div>

        {/* Summary */}
        <aside className="bg-[#14141d] rounded-xl p-5 border border-[#2a2a3a] h-fit lg:sticky lg:top-20">
          <h3 className="font-bold text-white mb-4">Thông tin vé</h3>
          <div className="space-y-2 text-sm mb-4">
            <div className="flex justify-between text-white/60">
              <span>Phim</span>
              <span className="text-white text-right line-clamp-1 max-w-[60%]">{movie.title}</span>
            </div>
            <div className="flex justify-between text-white/60">
              <span>Suất</span>
              <span className="text-white">{fmtDateTime(showtime.start_time)}</span>
            </div>
            <div className="flex justify-between text-white/60">
              <span>Rạp</span>
              <span className="text-white text-right">{showtime.hall.cinema.name}</span>
            </div>
            <div className="flex justify-between text-white/60">
              <span>Phòng</span>
              <span className="text-white">{showtime.hall.name}</span>
            </div>
          </div>

          <div className="border-t border-[#2a2a3a] pt-4 mb-4">
            <div className="flex justify-between text-white/60 text-sm mb-2">
              <span>Ghế đã chọn ({selected.size})</span>
            </div>
            {selected.size === 0 ? (
              <p className="text-white/40 text-xs italic">Chưa chọn ghế nào</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {[...selected].map((id) => {
                  const s = seats.find((x) => x.id === id);
                  if (!s) return null;
                  return (
                    <span key={id} className="px-2 py-0.5 bg-[#fbbf24]/20 text-[#fbbf24] text-xs font-mono rounded">
                      {s.row_label}
                      {s.col_number}
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          <div className="border-t border-[#2a2a3a] pt-4 mb-4">
            <div className="flex justify-between items-baseline">
              <span className="text-white/60 text-sm">Tổng</span>
              <span className="text-2xl font-black text-[#fbbf24]">{vnd(total)}</span>
            </div>
          </div>

          {error && <p className="text-red-400 text-xs mb-3">{error}</p>}

          {isSignedIn ? (
            <button
              onClick={submit}
              disabled={submitting || selected.size === 0}
              className="w-full bg-[#fbbf24] hover:bg-[#fbbf24]/90 disabled:opacity-40 disabled:cursor-not-allowed text-[#0a0a0f] font-bold py-3 rounded-lg transition flex items-center justify-center gap-2"
            >
              {submitting ? <Loader2 className="animate-spin" size={18} /> : <Ticket size={18} />}
              {submitting ? "Đang xử lý..." : "Xác nhận đặt vé"}
            </button>
          ) : (
            <SignInButton mode="modal">
              <button className="w-full bg-[#fbbf24] hover:bg-[#fbbf24]/90 text-[#0a0a0f] font-bold py-3 rounded-lg transition">
                Đăng nhập để đặt vé
              </button>
            </SignInButton>
          )}
        </aside>
      </div>
    </div>
  );
}
