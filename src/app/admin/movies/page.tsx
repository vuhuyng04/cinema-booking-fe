"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { api } from "@/lib/api";
import type { Movie } from "@/lib/types";

export default function AdminMoviesPage() {
  const { getToken } = useAuth();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    poster_url: "",
    genre: "",
    duration: 120,
    rating: 8.0,
    release_date: new Date().toISOString().slice(0, 10),
    status: "now_showing",
  });

  const refresh = async () => {
    const sb = supabase();
    const { data } = await sb.from("movies").select("*").order("created_at", { ascending: false });
    setMovies((data as Movie[] | null) ?? []);
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
      await api("/api/admin/movies", {
        method: "POST",
        token,
        body: JSON.stringify({
          ...form,
          genre: form.genre.split(",").map((g) => g.trim()).filter(Boolean),
        }),
      });
      setShowForm(false);
      setForm({ ...form, title: "", description: "", poster_url: "", genre: "" });
      await refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Lỗi");
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Xoá phim này?")) return;
    try {
      const token = await getToken();
      await api(`/api/admin/movies/${id}`, { method: "DELETE", token });
      await refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Lỗi");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Quản lý phim</h1>
        <button onClick={() => setShowForm(!showForm)} className="bg-[#fbbf24] text-[#0a0a0f] font-bold px-4 py-2 rounded-lg hover:bg-[#fbbf24]/90 transition flex items-center gap-2">
          <Plus size={18} /> Thêm phim
        </button>
      </div>

      {showForm && (
        <form onSubmit={create} className="bg-[#14141d] border border-[#2a2a3a] rounded-xl p-5 mb-6 space-y-3">
          <input className="input" placeholder="Tên phim" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <textarea className="input" placeholder="Mô tả" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          <input className="input" placeholder="URL poster (image.tmdb.org)" value={form.poster_url} onChange={(e) => setForm({ ...form, poster_url: e.target.value })} />
          <input className="input" placeholder="Thể loại (Action, Drama, ...)" value={form.genre} onChange={(e) => setForm({ ...form, genre: e.target.value })} />
          <div className="grid grid-cols-3 gap-3">
            <input type="number" className="input" placeholder="Thời lượng (phút)" value={form.duration} onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })} required />
            <input type="number" step="0.1" className="input" placeholder="Đánh giá" value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })} />
            <input type="date" className="input" value={form.release_date} onChange={(e) => setForm({ ...form, release_date: e.target.value })} />
          </div>
          <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="now_showing">Đang chiếu</option>
            <option value="coming_soon">Sắp chiếu</option>
            <option value="ended">Đã kết thúc</option>
          </select>
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
          <table className="w-full text-sm text-left">
            <thead className="text-white/50 border-b border-[#2a2a3a]">
              <tr>
                <th className="p-3">Tên</th>
                <th className="p-3">Thể loại</th>
                <th className="p-3">Thời lượng</th>
                <th className="p-3">Trạng thái</th>
                <th className="p-3">Đánh giá</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {movies.map((m) => (
                <tr key={m.id} className="border-b border-[#2a2a3a]/50 hover:bg-[#1c1c2a]/50">
                  <td className="p-3 text-white">{m.title}</td>
                  <td className="p-3 text-white/70">{m.genre?.join(", ")}</td>
                  <td className="p-3 text-white/70">{m.duration}p</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${
                      m.status === "now_showing" ? "bg-green-500/20 text-green-400" :
                      m.status === "coming_soon" ? "bg-yellow-500/20 text-yellow-400" :
                      "bg-white/10 text-white/50"
                    }`}>{m.status}</span>
                  </td>
                  <td className="p-3 text-[#fbbf24]">{m.rating ?? "-"}</td>
                  <td className="p-3">
                    <button onClick={() => remove(m.id)} className="text-red-400 hover:text-red-300">
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
