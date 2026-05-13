import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Star, Clock, Calendar, Ticket } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { fmtDate, fmtTime, vnd } from "@/lib/api";
import type { Movie, Showtime, Hall, Cinema } from "@/lib/types";

export const revalidate = 30;

type Props = { params: Promise<{ id: string }> };

export default async function MovieDetailPage({ params }: Props) {
  const { id } = await params;
  const sb = supabase();

  const { data: movie } = await sb.from("movies").select("*").eq("id", id).single();
  if (!movie) return notFound();

  const { data: showtimes } = await sb
    .from("showtimes")
    .select("*, hall:halls(*, cinema:cinemas(*))")
    .eq("movie_id", id)
    .gte("start_time", new Date().toISOString())
    .order("start_time");

  const m = movie as Movie;
  const st = (showtimes as (Showtime & { hall: Hall & { cinema: Cinema } })[] | null) ?? [];

  // Group showtimes by date → cinema
  const byDate = new Map<string, Map<string, typeof st>>();
  for (const s of st) {
    const dateKey = fmtDate(s.start_time);
    const cinemaName = s.hall.cinema.name;
    if (!byDate.has(dateKey)) byDate.set(dateKey, new Map());
    if (!byDate.get(dateKey)!.has(cinemaName)) byDate.get(dateKey)!.set(cinemaName, []);
    byDate.get(dateKey)!.get(cinemaName)!.push(s);
  }

  return (
    <div>
      {/* Hero banner */}
      <section className="relative h-[50vh] min-h-[360px] overflow-hidden">
        {m.poster_url && (
          <Image src={m.poster_url} alt={m.title} fill priority className="object-cover blur-md scale-110 opacity-30" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] to-transparent" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-end pb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end w-full">
            <div className="hidden md:block relative aspect-[2/3] rounded-xl overflow-hidden shadow-2xl">
              {m.poster_url && <Image src={m.poster_url} alt={m.title} fill className="object-cover" />}
            </div>
            <div className="md:col-span-3">
              <h1 className="text-3xl md:text-5xl font-black text-white mb-3">{m.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-white/70">
                {m.rating && (
                  <span className="flex items-center gap-1 text-[#fbbf24] font-bold">
                    <Star size={16} fill="currentColor" /> {m.rating}/10
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Clock size={14} /> {m.duration} phút
                </span>
                {m.release_date && (
                  <span className="flex items-center gap-1">
                    <Calendar size={14} /> {new Date(m.release_date).toLocaleDateString("vi-VN")}
                  </span>
                )}
                {m.genre?.map((g) => (
                  <span key={g} className="px-2 py-0.5 bg-[#1c1c2a] rounded text-xs">
                    {g}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Description */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-white mb-3">Nội dung phim</h2>
          <p className="text-white/70 leading-relaxed max-w-3xl">{m.description}</p>
        </section>

        {/* Showtimes */}
        <section>
          <h2 className="text-xl font-bold text-white mb-4">Lịch chiếu</h2>
          {byDate.size === 0 ? (
            <div className="bg-[#14141d] rounded-xl p-8 text-center text-white/50 border border-[#2a2a3a]">
              {m.status === "coming_soon" ? "Phim chưa khởi chiếu." : "Chưa có suất chiếu."}
            </div>
          ) : (
            <div className="space-y-6">
              {[...byDate.entries()].map(([date, cinemas]) => (
                <div key={date}>
                  <h3 className="text-[#fbbf24] font-bold mb-3 capitalize">{date}</h3>
                  <div className="space-y-3">
                    {[...cinemas.entries()].map(([cinemaName, sts]) => (
                      <div key={cinemaName} className="bg-[#14141d] rounded-xl p-4 border border-[#2a2a3a]">
                        <div className="font-semibold text-white mb-1">{cinemaName}</div>
                        <div className="text-xs text-white/50 mb-3">{sts[0].hall.cinema.address}</div>
                        <div className="flex flex-wrap gap-2">
                          {sts.map((s) => (
                            <Link
                              key={s.id}
                              href={`/booking/${s.id}`}
                              className="group px-4 py-2 bg-[#1c1c2a] hover:bg-[#fbbf24] hover:text-[#0a0a0f] rounded-lg border border-[#2a2a3a] hover:border-[#fbbf24] transition flex flex-col items-center min-w-[80px]"
                            >
                              <span className="font-bold text-white group-hover:text-[#0a0a0f]">{fmtTime(s.start_time)}</span>
                              <span className="text-[10px] text-white/40 group-hover:text-[#0a0a0f]/70">{vnd(Number(s.price_standard))}</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
