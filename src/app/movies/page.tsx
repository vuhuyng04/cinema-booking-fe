import { supabase } from "@/lib/supabase";
import type { Movie } from "@/lib/types";
import MovieCard from "@/components/MovieCard";
import Link from "next/link";

export const revalidate = 60;

type Props = {
  searchParams: Promise<{ status?: string }>;
};

export default async function MoviesPage({ searchParams }: Props) {
  const { status } = await searchParams;
  const filter = status === "coming_soon" ? "coming_soon" : "now_showing";

  const sb = supabase();
  const { data } = await sb.from("movies").select("*").eq("status", filter).order("rating", { ascending: false });
  const movies = (data as Movie[] | null) ?? [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-black text-white mb-2">Danh sách phim</h1>
      <p className="text-white/50 mb-6">Chọn phim bạn yêu thích và đặt vé ngay.</p>

      <div className="flex gap-2 mb-8 border-b border-[#2a2a3a] pb-3">
        <Link
          href="/movies?status=now_showing"
          className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
            filter === "now_showing"
              ? "bg-[#fbbf24] text-[#0a0a0f]"
              : "bg-[#14141d] text-white/70 hover:bg-[#1c1c2a]"
          }`}
        >
          Đang chiếu
        </Link>
        <Link
          href="/movies?status=coming_soon"
          className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
            filter === "coming_soon"
              ? "bg-[#fbbf24] text-[#0a0a0f]"
              : "bg-[#14141d] text-white/70 hover:bg-[#1c1c2a]"
          }`}
        >
          Sắp chiếu
        </Link>
      </div>

      {movies.length === 0 ? (
        <div className="text-center py-16 text-white/50">Chưa có phim nào.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {movies.map((m) => (
            <MovieCard key={m.id} movie={m} />
          ))}
        </div>
      )}
    </div>
  );
}
