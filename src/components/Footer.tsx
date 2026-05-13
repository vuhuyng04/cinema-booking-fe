import { Film } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#0a0a0f] border-t border-[#2a2a3a] mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <div className="flex items-center gap-2 font-black text-lg mb-2">
            <Film className="text-[#fbbf24]" size={20} />
            <span className="text-white">Cine<span className="text-[#fbbf24]">Book</span></span>
          </div>
          <p className="text-white/50 text-sm">Đặt vé xem phim online dễ dàng, nhanh chóng.</p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-2 text-sm">Hỗ trợ</h4>
          <ul className="space-y-1 text-white/50 text-sm">
            <li>Hotline: 1900 1234</li>
            <li>Email: support@cinebook.vn</li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-2 text-sm">Liên kết</h4>
          <ul className="space-y-1 text-white/50 text-sm">
            <li>Điều khoản sử dụng</li>
            <li>Chính sách bảo mật</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-[#2a2a3a] py-4 text-center text-white/40 text-xs">
        © {new Date().getFullYear()} CineBook. Built with Next.js + FastAPI + Supabase.
      </div>
    </footer>
  );
}
