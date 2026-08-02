import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LocationItem, fetchLocations } from "./useLocations";

export interface LocationDraft {
  id?: string;
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
  amenities: { icon: string; label: string; description: string }[];
  featured: boolean;
  sort_order: number;
}

export const useLocationsAdmin = (enabled: boolean) => {
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const refresh = async () => {
    setLoading(true);
    try {
      setLocations(await fetchLocations());
    } catch {
      toast.error("Could not load locations");
    } finally {
      setLoading(false);
    }
  };

  const save = async (draft: LocationDraft) => {
    setSaving(true);
    const payload = {
      slug: draft.slug,
      name: draft.name,
      region: draft.region,
      description: draft.description,
      rating: draft.rating,
      price: draft.price,
      image: draft.image,
      images: draft.images,
      features: draft.features,
      details: draft.details,
      amenities: draft.amenities,
      featured: draft.featured,
      sort_order: draft.sort_order,
    };

    const { error } = draft.id
      ? await supabase.from("locations").update(payload).eq("id", draft.id)
      : await supabase.from("locations").insert(payload);

    setSaving(false);

    if (error) {
      toast.error(error.message);
      return false;
    }

    toast.success(draft.id ? "Location updated" : "Location created");
    await refresh();
    return true;
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("locations").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    setLocations((prev) => prev.filter((l) => l.id !== id));
    toast.success("Location deleted");
  };

  return { locations, loading, saving, refresh, save, remove, enabled };
};
