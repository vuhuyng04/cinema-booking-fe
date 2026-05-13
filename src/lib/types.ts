export type Movie = {
  id: string;
  title: string;
  description: string | null;
  poster_url: string | null;
  trailer_url: string | null;
  genre: string[] | null;
  duration: number;
  rating: number | null;
  release_date: string | null;
  status: "coming_soon" | "now_showing" | "ended";
  created_at: string;
};

export type Cinema = {
  id: string;
  name: string;
  address: string;
  city: string;
};

export type Hall = {
  id: string;
  cinema_id: string;
  name: string;
  rows: number;
  cols: number;
};

export type Seat = {
  id: string;
  hall_id: string;
  row_label: string;
  col_number: number;
  seat_type: "standard" | "vip" | "couple";
};

export type Showtime = {
  id: string;
  movie_id: string;
  hall_id: string;
  start_time: string;
  end_time: string;
  price_standard: number;
  price_vip: number;
  price_couple: number;
};

export type Booking = {
  id: string;
  user_id: string;
  user_email: string | null;
  showtime_id: string;
  total_price: number;
  status: "pending" | "confirmed" | "cancelled";
  created_at: string;
};

export type BookingSeat = {
  id: string;
  booking_id: string;
  showtime_id: string;
  seat_id: string;
  price: number;
};
