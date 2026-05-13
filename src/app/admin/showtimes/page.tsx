"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { api, fmtDateTime, vnd } from "@/lib/api";
import type { Movie, Hall, Cinema, Showtime } from "@/lib/types";

export default function AdminShowtimesPage() {
  const { getToken } = useAuth();
  const [showtimes, setShowtimes] = useState<(Showtime & { hall: Hall & { cinema: Cinema }; movie: Movie })[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [halls, setHalls] = useState<(Hall & { cinema: Cinema })[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    movie_id: "",
    hall_id: "",
    start_time: "",
    duration_min: 120,
    price_standard: 80000,
    price_vip: 120000,
    price_couple: 200000,
  });

  const refresh = async () => {
    const sb = supabase();
    const [{ data: stData }, { data: mData }, { data: hData }] = await Promise.all([
      sb.from("showtimes").select("*, hall:halls(*, cinema:cinemas(*)), movie:movies(*)").order("start_time", { ascending: false }),
      sb.from("movies").select("*").order("title"),
      sb.from("halls").select("*, cinema:cinemas(*)").order("name"),
    ]);
    setShowtimes(((stData as unknown) as typeof showtimes) ?? []);
    setMovies((mData as Movie[] | null) ?? []);
    setHalls(((hData as unknown) as typeof halls) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = await getToken();
      const start = new Date(form.start_time);
      const end = new Date(start.getTime() + form.duration_min * 60_000);
      await api("/api/admin/showtimes", {
        method: "POST",
        token,
        body: JSON.stringify({
          movie_id: form.movie_id,
          hall_id: form.hall_id,
          start_time: start.toISOString(),
          end_time: end.toISOString(),
          price_standard: form.price_standard,
          price_vip: form.price_vip,
          price_couple: form.price_couple,
        }),
      });
      setShowForm(false);
      await refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Lỗi");
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Xoá suất chiếu này?")) return;
    const token = await getToken();
    await api(`/api/admin/showtimes/${id}`, { method: "DELETE", token });
    await refresh();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Quản lý suất chiếu</h1>
        <button onClick={() => setShowForm(!showForm)} className="bg-[#fbbf24] text-[#0a0a0f] font-bold px-4 py-2 rounded-lg hover:bg-[#fbbf24]/90 transition flex items-center gap-2">
          <Plus size={18} /> Thêm suất
        </button>
      </div>

      {showForm && (
        <form onSubmit={create} className="bg-[#14141d] border border-[#2a2a3a] rounded-xl p-5 mb-6 space-y-3">
          <select className="input" value={form.movie_id} onChange={(e) => setForm({ ...form, movie_id: e.target.value })} required>
            <option value="">Chọn phim</option>
            {movies.map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}
          </select>
          <select className="input" value={form.hall_id} onChange={(e) => setForm({ ...form, hall_id: e.target.value })} required>
            <option value="">Chọn phòng</option>
            {halls.map((h) => <option key={h.id} value={h.id}>{h.cinema.name} - {h.name}</option>)}
          </select>
          <input type="datetime-local" className="input" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} required />
          <input type="number" className="input" placeholder="Thời lượng (phút)" value={form.duration_min} onChange={(e) => setForm({ ...form, duration_min: Number(e.target.value) })} required />
          <div className="grid grid-cols-3 gap-3">
            <input type="number" className="input" placeholder="Giá thường" value={form.price_standard} onChange={(e) => setForm({ ...form, price_standard: Number(e.target.value) })} />
            <input type="number" className="input" placeholder="Giá VIP" value={form.price_vip} onChange={(e) => setForm({ ...form, price_vip: Number(e.target.value) })} />
            <input type="number" className="input" placeholder="Giá Couple" value={form.price_couple} onChange={(e) => setForm({ ...form, price_couple: Number(e.target.value) })} />
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={submitting} className="bg-[#fbbf24] text-[#0a0a0f] font-bold px-4 py-2 rounded-lg disabled:opacity-50">
              {submitting ? <Loader2 className="animate-spin" size={18} /> : "Lưu"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-white/70 hover:text-white">Huỷ</button>
          </div>
          <style jsx>{`
            .input { width: 100%; padding: 8px 12px; background: #0a0a0f; color: white; border: 1px solid #2a2a3a; border-radius: 8px; font-size: 14px; }
            .input:focus { outline: none; border-color: #fbbf24; }
          `}</style>
        </form>
      )}

      {loading ? (
        <Loader2 className="animate-spin text-[#fbbf24] mx-auto mt-20" />
      ) : (
        <div className="bg-[#14141d] rounded-xl border border-[#2a2a3a] overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-white/50 border-b border-[#2a2a3a] text-left">
              <tr>
                <th className="p-3">Phim</th>
                <th className="p-3">Rạp / Phòng</th>
                <th className="p-3">Bắt đầu</th>
                <th className="p-3">Giá</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {showtimes.map((s) => (
                <tr key={s.id} className="border-b border-[#2a2a3a]/50 hover:bg-[#1c1c2a]/50">
                  <td className="p-3 text-white">{s.movie?.title ?? "-"}</td>
                  <td className="p-3 text-white/70">{s.hall.cinema.name} / {s.hall.name}</td>
                  <td className="p-3 text-white/70">{fmtDateTime(s.start_time)}</td>
                  <td className="p-3 text-[#fbbf24]">{vnd(Number(s.price_standard))}</td>
                  <td className="p-3">
                    <button onClick={() => remove(s.id)} className="text-red-400 hover:text-red-300">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
