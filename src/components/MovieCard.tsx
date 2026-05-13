import Link from "next/link";
import Image from "next/image";
import { Star, Clock } from "lucide-react";
import type { Movie } from "@/lib/types";

export default function MovieCard({ movie }: { movie: Movie }) {
  return (
    <Link href={`/movies/${movie.id}`} className="group block">
      <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-[#14141d] border border-[#2a2a3a] group-hover:border-[#fbbf24] transition">
        {movie.poster_url ? (
          <Image
            src={movie.poster_url}
            alt={movie.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-white/30">No poster</div>
        )}
        {movie.status === "coming_soon" && (
          <span className="absolute top-2 left-2 px-2 py-0.5 text-[10px] font-bold uppercase bg-[#dc2626] text-white rounded">
            Sắp chiếu
          </span>
        )}
        {movie.rating && (
          <span className="absolute top-2 right-2 px-2 py-0.5 text-xs font-bold bg-black/70 text-[#fbbf24] rounded flex items-center gap-1">
            <Star size={12} fill="currentColor" /> {movie.rating}
          </span>
        )}
      </div>
      <div className="mt-2 px-1">
        <h3 className="text-white text-sm font-semibold line-clamp-1 group-hover:text-[#fbbf24] transition">
          {movie.title}
        </h3>
        <div className="flex items-center justify-between mt-1 text-xs text-white/50">
          <span className="flex items-center gap-1">
            <Clock size={12} /> {movie.duration} phút
          </span>
          {movie.genre && movie.genre[0] && <span className="truncate max-w-[60%] text-right">{movie.genre[0]}</span>}
        </div>
      </div>
    </Link>
  );
}
