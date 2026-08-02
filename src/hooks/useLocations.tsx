import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { resolveImageUrls } from "@/lib/locationImages";

export interface Amenity {
  icon: string;
  label: string;
  description: string;
}

export interface Review {
  author: string;
  rating: number;
  date: string;
  comment: string;
}

export interface LocationItem {
  id: string;
  slug: string;
  name: string;
  region: string;
  description: string;
  rating: number;
  price: number;
  image: string | null;
  images: string[];
  features: string[];
  details: string[];
  amenities: Amenity[];
  reviews: Review[];
  featured: boolean;
  sort_order: number;
  /** Displayable URLs resolved from storage paths */
  imageUrl: string;
  imageUrls: string[];
}

const FALLBACK_IMAGE = "/placeholder.svg";

const hydrate = async (rows: any[]): Promise<LocationItem[]> => {
  const paths = rows.flatMap((row) => [row.image, ...(row.images ?? [])]).filter(Boolean);
  const urls = await resolveImageUrls(paths);

  return rows.map((row) => ({
    ...row,
    rating: Number(row.rating),
    amenities: Array.isArray(row.amenities) ? (row.amenities as Amenity[]) : [],
    reviews: Array.isArray(row.reviews) ? (row.reviews as Review[]) : [],
    imageUrl: (row.image && urls[row.image]) || FALLBACK_IMAGE,
    imageUrls: ((row.images ?? []) as string[]).map((p) => urls[p]).filter(Boolean),
  }));
};

export const fetchLocations = async (): Promise<LocationItem[]> => {
  const { data, error } = await supabase
    .from("locations")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw error;
  return hydrate(data ?? []);
};

export const useLocations = () => {
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setLocations(await fetchLocations());
      setError(null);
    } catch (e: any) {
      setError(e.message ?? "Could not load locations");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { locations, loading, error, refresh };
};

export const useFeaturedLocations = () => {
  const { locations, loading, error, refresh } = useLocations();
  return { locations: locations.filter((l) => l.featured), loading, error, refresh };
};

export const useLocation = (slug: string | undefined) => {
  const [location, setLocation] = useState<LocationItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const run = async () => {
      if (!slug) {
        setLocation(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      const { data } = await supabase.from("locations").select("*").eq("slug", slug).maybeSingle();
      const hydrated = data ? (await hydrate([data]))[0] : null;
      if (!active) return;
      setLocation(hydrated);
      setLoading(false);
    };

    run();
    return () => {
      active = false;
    };
  }, [slug]);

  return { location, loading };
};
