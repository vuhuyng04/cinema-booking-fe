import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Star, Ticket } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Movie } from "@/lib/types";
import MovieCard from "@/components/MovieCard";

export const revalidate = 60;

export default async function HomePage() {
  const sb = supabase();
  const { data: nowShowing } = await sb
    .from("movies")
    .select("*")
    .eq("status", "now_showing")
    .order("rating", { ascending: false })
    .limit(8);
  const { data: comingSoon } = await sb
    .from("movies")
    .select("*")
    .eq("status", "coming_soon")
    .limit(4);

  const featured = (nowShowing as Movie[] | null)?.[0];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      {featured && (
        <section className="relative h-[60vh] min-h-[420px] overflow-hidden">
          <Image
            src={featured.poster_url ?? ""}
            alt={featured.title}
            fill
            priority
            className="object-cover blur-sm scale-110 opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0f] via-[#0a0a0f]/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] to-transparent" />

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full items-center">
              <div className="hidden md:block relative aspect-[2/3] rounded-xl overflow-hidden shadow-2xl">
                <Image src={featured.poster_url ?? ""} alt={featured.title} fill className="object-cover" />
              </div>
              <div className="md:col-span-2 max-w-2xl">
                <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wide bg-[#fbbf24] text-[#0a0a0f] rounded mb-4">
                  Phim hot tuần này
                </span>
                <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-3">{featured.title}</h1>
                <div className="flex items-center gap-4 text-sm text-white/70 mb-4">
                  {featured.rating && (
                    <span className="flex items-center gap-1 text-[#fbbf24] font-bold">
                      <Star size={16} fill="currentColor" /> {featured.rating}
                    </span>
                  )}
                  <span>{featured.duration} phút</span>
                  {featured.genre?.[0] && <span>• {featured.genre.join(", ")}</span>}
                </div>
                <p className="text-white/70 text-base leading-relaxed mb-6 line-clamp-3">{featured.description}</p>
                <Link
                  href={`/movies/${featured.id}`}
                  className="inline-flex items-center gap-2 bg-[#fbbf24] hover:bg-[#fbbf24]/90 text-[#0a0a0f] font-bold px-6 py-3 rounded-full transition"
                >
                  <Ticket size={18} /> Đặt vé ngay
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Now Showing */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-white">
            Phim đang chiếu <span className="text-[#fbbf24]">.</span>
          </h2>
          <Link href="/movies" className="text-sm text-[#fbbf24] hover:underline flex items-center gap-1">
            Xem tất cả <ChevronRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {(nowShowing as Movie[] | null)?.map((m) => (
            <MovieCard key={m.id} movie={m} />
          ))}
        </div>
      </section>

      {/* Coming Soon */}
      {comingSoon && comingSoon.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
          <h2 className="text-2xl font-black text-white mb-6">
            Sắp chiếu <span className="text-[#fbbf24]">.</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {(comingSoon as Movie[]).map((m) => (
              <MovieCard key={m.id} movie={m} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
