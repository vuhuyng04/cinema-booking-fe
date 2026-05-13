"use client";
import type { Seat } from "@/lib/types";

type Props = {
  seats: Seat[];
  takenSeatIds: Set<string>;
  selectedSeatIds: Set<string>;
  onToggle: (seat: Seat) => void;
};

export default function SeatMap({ seats, takenSeatIds, selectedSeatIds, onToggle }: Props) {
  // group by row
  const rows = new Map<string, Seat[]>();
  for (const s of seats) {
    if (!rows.has(s.row_label)) rows.set(s.row_label, []);
    rows.get(s.row_label)!.push(s);
  }
  const sortedRows = [...rows.entries()].sort(([a], [b]) => a.localeCompare(b));
  for (const [, rs] of sortedRows) rs.sort((a, b) => a.col_number - b.col_number);

  return (
    <div className="bg-[#14141d] rounded-xl p-6 border border-[#2a2a3a]">
      {/* Screen */}
      <div className="mb-8">
        <div
          className="mx-auto h-2 rounded-full max-w-md"
          style={{
            background: "linear-gradient(180deg,#fbbf24 0%,transparent 100%)",
            transform: "perspective(200px) rotateX(-30deg)",
          }}
        />
        <p className="text-center text-white/40 text-xs mt-3 uppercase tracking-widest">Màn hình</p>
      </div>

      {/* Seats */}
      <div className="flex flex-col items-center gap-2 overflow-x-auto pb-2">
        {sortedRows.map(([rowLabel, rowSeats]) => (
          <div key={rowLabel} className="flex items-center gap-2">
            <span className="text-white/40 text-xs font-mono w-4 text-right">{rowLabel}</span>
            <div className="flex gap-1.5">
              {rowSeats.map((s) => {
                const taken = takenSeatIds.has(s.id);
                const selected = selectedSeatIds.has(s.id);
                return (
                  <button
                    key={s.id}
                    type="button"
                    disabled={taken}
                    onClick={() => !taken && onToggle(s)}
                    className={`seat ${s.seat_type} ${taken ? "taken" : ""} ${selected ? "selected" : ""}`}
                    title={`${rowLabel}${s.col_number} • ${s.seat_type}${taken ? " (đã đặt)" : ""}`}
                  >
                    {s.col_number}
                  </button>
                );
              })}
            </div>
            <span className="text-white/40 text-xs font-mono w-4">{rowLabel}</span>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-white/60">
        <span className="flex items-center gap-1.5"><span className="seat standard" style={{ width: 16, height: 16 }} /> Thường</span>
        <span className="flex items-center gap-1.5"><span className="seat vip" style={{ width: 16, height: 16 }} /> VIP</span>
        <span className="flex items-center gap-1.5"><span className="seat couple" style={{ width: 16, height: 16 }} /> Couple</span>
        <span className="flex items-center gap-1.5"><span className="seat selected" style={{ width: 16, height: 16 }} /> Chọn</span>
        <span className="flex items-center gap-1.5"><span className="seat taken" style={{ width: 16, height: 16 }} /> Đã đặt</span>
      </div>
    </div>
  );
}
