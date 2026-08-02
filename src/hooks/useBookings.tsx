import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type BookingStatus = "pending" | "confirmed" | "cancelled";

export interface BookingRecord {
  id: string;
  location_id: string;
  guest_name: string;
  email: string;
  phone: string | null;
  check_in: string;
  check_out: string;
  guests: number;
  status: string;
  notes: string | null;
  created_at: string;

  locations?: {
    name: string;
  } | null;
}

export const useBookings = (enabled: boolean) => {
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("bookings")
.select(`
  *,
  locations (
    name
  )
`)
.order("check_in", { ascending: true });

    if (error) {
      toast.error("Could not load bookings");
    } else {
      setBookings((data ?? []) as BookingRecord[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    fetchBookings();
  }, [enabled, fetchBookings]);

  const updateStatus = async (id: string, status: BookingStatus) => {
    const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
    if (error) {
      toast.error("Could not update booking");
      return;
    }
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
    toast.success(`Booking marked as ${status}`);
  };

  const deleteBooking = async (id: string) => {
  const { error } = await supabase
    .from("bookings")
    .delete()
    .eq("id", id);

  if (error) {
    toast.error("Could not delete booking");
    return;
  }

  setBookings((prev) => prev.filter((b) => b.id !== id));
  toast.success("Booking deleted");
};

  return { bookings, loading, refresh: fetchBookings, updateStatus, deleteBooking };
};
