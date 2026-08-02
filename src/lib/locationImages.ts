import { supabase } from "@/integrations/supabase/client";

export const LOCATION_BUCKET = "location-images";
const SIGNED_TTL = 60 * 60 * 24 * 7; // 7 days

const cache = new Map<string, string>();

export const isAbsoluteUrl = (value: string) =>
  /^(https?:|data:|blob:)/.test(value) || value.startsWith("/");

/** Resolves storage object paths to displayable URLs (absolute URLs pass through). */
export const resolveImageUrls = async (paths: string[]): Promise<Record<string, string>> => {
  const result: Record<string, string> = {};
  const missing: string[] = [];

  for (const path of paths) {
    if (!path) continue;
    if (isAbsoluteUrl(path)) {
      result[path] = path;
    } else if (cache.has(path)) {
      result[path] = cache.get(path)!;
    } else if (!missing.includes(path)) {
      missing.push(path);
    }
  }

  if (missing.length > 0) {
    const { data } = await supabase.storage
      .from(LOCATION_BUCKET)
      .createSignedUrls(missing, SIGNED_TTL);

    data?.forEach((entry) => {
      if (entry.signedUrl && entry.path) {
        cache.set(entry.path, entry.signedUrl);
        result[entry.path] = entry.signedUrl;
      }
    });
  }

  return result;
};

/** Uploads files to storage and returns the stored object paths. */
export const uploadLocationImages = async (files: File[]): Promise<string[]> => {
  const paths: string[] = [];

  for (const file of files) {
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `uploads/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage
      .from(LOCATION_BUCKET)
      .upload(path, file, { contentType: file.type, upsert: false });

    if (error) throw error;
    paths.push(path);
  }

  return paths;
};

export const removeLocationImage = async (path: string) => {
  if (isAbsoluteUrl(path)) return;
  await supabase.storage.from(LOCATION_BUCKET).remove([path]);
  cache.delete(path);
};
