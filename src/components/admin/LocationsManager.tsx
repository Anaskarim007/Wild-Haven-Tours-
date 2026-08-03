import { useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Star, Upload, X, RefreshCw, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocationsAdmin, LocationDraft } from "@/hooks/useLocationsAdmin";
import { LocationItem } from "@/hooks/useLocations";
import { resolveImageUrls, uploadLocationImages } from "@/lib/locationImages";
import { amenityIconOptions, getAmenityIcon } from "@/lib/amenityIcons";

const emptyDraft: LocationDraft = {
  slug: "",
  name: "",
  region: "",
  description: "",
  rating: 5,
  price: 0,
  image: null,
  images: [],
  features: [],
  details: [],
  amenities: [],
  featured: false,
  sort_order: 0,
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const LocationsManager = () => {
  const admin = useLocationsAdmin(true);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<LocationDraft>(emptyDraft);
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    admin.refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = <K extends keyof LocationDraft>(key: K, value: LocationDraft[K]) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  const openNew = () => {
    setDraft({ ...emptyDraft, sort_order: admin.locations.length + 1 });
    setPreviews({});
    setOpen(true);
  };

  const openEdit = (location: LocationItem) => {
    setDraft({
      id: location.id,
      slug: location.slug,
      name: location.name,
      region: location.region,
      description: location.description,
      rating: location.rating,
      price: location.price,
      image: location.image,
      images: location.images,
      features: location.features,
      details: location.details,
      amenities: location.amenities,
      featured: location.featured,
      sort_order: location.sort_order,
    });
    setPreviews({});
    setOpen(true);
  };

  const allDraftPaths = useMemo(
    () => [draft.image, ...draft.images].filter(Boolean) as string[],
    [draft.image, draft.images]
  );

  useEffect(() => {
    if (allDraftPaths.length === 0) return;
    resolveImageUrls(allDraftPaths).then((urls) =>
      setPreviews((prev) => ({ ...prev, ...urls }))
    );
  }, [allDraftPaths]);

  const handleUpload = async (files: FileList | null, target: "cover" | "gallery") => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const paths = await uploadLocationImages(Array.from(files));
      if (target === "cover") {
        set("image", paths[0]);
      } else {
        set("images", [...draft.images, ...paths]);
      }
      toast.success(`${paths.length} image(s) uploaded`);
    } catch (e: any) {
      toast.error(e.message ?? "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const submit = async () => {
    if (!draft.name.trim()) {
      toast.error("Name is required");
      return;
    }
    const payload = { ...draft, slug: draft.slug.trim() || slugify(draft.name) };
    const ok = await admin.save(payload);
    if (ok) setOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-light tracking-tight">Locations</h2>
          <p className="text-xs text-muted-foreground font-light">
            {admin.locations.length} location(s) stored in the database
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={admin.refresh} className="text-[11px] uppercase tracking-wider font-normal">
            <RefreshCw className="mr-2 h-3 w-3" />
            Refresh
          </Button>
          <Button size="sm" onClick={openNew} className="rounded-full text-[11px] uppercase tracking-wider font-normal">
            <Plus className="mr-2 h-3 w-3" />
            Add Location
          </Button>
        </div>
      </div>

      {admin.loading ? (
        <p className="text-sm text-muted-foreground font-light py-8 text-center">Loading locations...</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {admin.locations.map((location) => (
            <Card key={location.id} className="overflow-hidden border border-border shadow-soft">
              <div className="relative h-36">
                <img src={location.imageUrl} alt={location.name} className="w-full h-full object-cover" />
                {location.featured && (
                  <Badge className="absolute top-2 left-2 gap-1 text-[10px] font-light">
                    <Star className="h-3 w-3" />
                    Featured
                  </Badge>
                )}
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <p className="text-sm font-normal">{location.name}</p>
                  <p className="text-xs text-muted-foreground font-light">{location.region}</p>
                </div>
                <div className="flex items-center justify-between text-xs font-light text-muted-foreground">
                  <span>PKR{location.price}/night</span>
                  <span>★ {location.rating}</span>
                  <span>{location.images.length + (location.image ? 1 : 0)} photos</span>
                </div>
                <div className="flex justify-end gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(location)} title="Edit">
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    title="Delete"
                    onClick={() => {
                      if (confirm(`Delete "${location.name}"?`)) admin.remove(location.id);
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-light tracking-tight">
              {draft.id ? "Edit location" : "New location"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-[11px] uppercase tracking-wider font-normal">Name</Label>
                <Input
                  value={draft.name}
                  onChange={(e) => {
                    set("name", e.target.value);
                    if (!draft.id && !draft.slug) set("slug", slugify(e.target.value));
                  }}
                  className="mt-2 text-sm font-light"
                  maxLength={120}
                />
              </div>
              <div>
                <Label className="text-[11px] uppercase tracking-wider font-normal">Slug (URL)</Label>
                <Input
                  value={draft.slug}
                  onChange={(e) => set("slug", slugify(e.target.value))}
                  className="mt-2 text-sm font-light"
                  maxLength={80}
                />
              </div>
              <div>
                <Label className="text-[11px] uppercase tracking-wider font-normal">Region</Label>
                <Input value={draft.region} onChange={(e) => set("region", e.target.value)} className="mt-2 text-sm font-light" maxLength={120} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-[11px] uppercase tracking-wider font-normal">Price</Label>
                  <Input type="number" min={0} value={draft.price} onChange={(e) => set("price", Number(e.target.value))} className="mt-2 text-sm font-light" />
                </div>
                <div>
                  <Label className="text-[11px] uppercase tracking-wider font-normal">Rating</Label>
                  <Input type="number" min={0} max={5} step={0.1} value={draft.rating} onChange={(e) => set("rating", Number(e.target.value))} className="mt-2 text-sm font-light" />
                </div>
                <div>
                  <Label className="text-[11px] uppercase tracking-wider font-normal">Order</Label>
                  <Input type="number" value={draft.sort_order} onChange={(e) => set("sort_order", Number(e.target.value))} className="mt-2 text-sm font-light" />
                </div>
              </div>
            </div>

            <div>
              <Label className="text-[11px] uppercase tracking-wider font-normal">Description</Label>
              <Textarea value={draft.description} onChange={(e) => set("description", e.target.value)} rows={4} className="mt-2 text-sm font-light" maxLength={2000} />
            </div>

            <div className="flex items-center justify-between rounded-md border border-border p-4">
              <div>
                <p className="text-sm font-normal">Featured location</p>
                <p className="text-xs text-muted-foreground font-light">Shown on the homepage</p>
              </div>
              <Switch checked={draft.featured} onCheckedChange={(v) => set("featured", v)} />
            </div>

            {/* Cover image */}
            <div className="space-y-3">
              <Label className="text-[11px] uppercase tracking-wider font-normal">Cover image</Label>
              <div className="flex items-center gap-4">
                {draft.image && (
                  <div className="relative">
                    <img src={previews[draft.image] ?? "/placeholder.svg"} alt="Cover" className="h-20 w-28 rounded-md object-cover" />
                    <button
                      type="button"
                      onClick={() => set("image", null)}
                      className="absolute -top-2 -right-2 rounded-full bg-destructive text-destructive-foreground p-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
                <label className="cursor-pointer inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-xs font-light">
                  <Upload className="h-3 w-3" />
                  Choose file
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload(e.target.files, "cover")} />
                </label>
              </div>
            </div>

            {/* Gallery */}
            <div className="space-y-3">
              <Label className="text-[11px] uppercase tracking-wider font-normal">Gallery images (multiple)</Label>
              <div className="flex flex-wrap items-center gap-3">
                {draft.images.map((path) => (
                  <div key={path} className="relative">
                    <img src={previews[path] ?? "/placeholder.svg"} alt="Gallery" className="h-20 w-28 rounded-md object-cover" />
                    <button
                      type="button"
                      onClick={() => set("images", draft.images.filter((p) => p !== path))}
                      className="absolute -top-2 -right-2 rounded-full bg-destructive text-destructive-foreground p-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <label className="cursor-pointer inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-xs font-light">
                  {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                  Upload images
                  <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleUpload(e.target.files, "gallery")} />
                </label>
              </div>
            </div>

            {/* Features */}
            <ListEditor
              label="Features (badges)"
              items={draft.features}
              onChange={(items) => set("features", items)}
              placeholder="e.g. Waterfront"
            />

            {/* Details */}
            <ListEditor
              label="What's included"
              items={draft.details}
              onChange={(items) => set("details", items)}
              placeholder="e.g. Fresh spring water access"
            />

            {/* Amenities */}
            <div className="space-y-3">
              <Label className="text-[11px] uppercase tracking-wider font-normal">Amenities</Label>
              {draft.amenities.map((amenity, index) => {
                const Icon = getAmenityIcon(amenity.icon);
                return (
                  <div key={index} className="grid md:grid-cols-[auto_1fr_2fr_auto] gap-2 items-center">
                    <Select
                      value={amenity.icon || "tent"}
                      onValueChange={(icon) =>
                        set("amenities", draft.amenities.map((a, i) => (i === index ? { ...a, icon } : a)))
                      }
                    >
                      <SelectTrigger className="w-[110px] text-xs font-light">
                        <div className="flex items-center gap-2">
                          <Icon className="h-3 w-3" />
                          <SelectValue />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {amenityIconOptions.map((icon) => (
                          <SelectItem key={icon} value={icon} className="text-xs">
                            {icon}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      value={amenity.label}
                      placeholder="Label"
                      onChange={(e) =>
                        set("amenities", draft.amenities.map((a, i) => (i === index ? { ...a, label: e.target.value } : a)))
                      }
                      className="text-sm font-light"
                    />
                    <Input
                      value={amenity.description}
                      placeholder="Description"
                      onChange={(e) =>
                        set("amenities", draft.amenities.map((a, i) => (i === index ? { ...a, description: e.target.value } : a)))
                      }
                      className="text-sm font-light"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => set("amenities", draft.amenities.filter((_, i) => i !== index))}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                );
              })}
              <Button
                variant="outline"
                size="sm"
                className="text-[11px] uppercase tracking-wider font-normal"
                onClick={() => set("amenities", [...draft.amenities, { icon: "tent", label: "", description: "" }])}
              >
                <Plus className="mr-2 h-3 w-3" />
                Add amenity
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setOpen(false)} className="text-[11px] uppercase tracking-wider font-normal">
              Cancel
            </Button>
            <Button size="sm" onClick={submit} disabled={admin.saving} className="rounded-full text-[11px] uppercase tracking-wider font-normal">
              {admin.saving ? "Saving..." : draft.id ? "Save changes" : "Create location"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const ListEditor = ({
  label,
  items,
  onChange,
  placeholder,
}: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder: string;
}) => {
  const [value, setValue] = useState("");

  const add = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onChange([...items, trimmed]);
    setValue("");
  };

  return (
    <div className="space-y-3">
      <Label className="text-[11px] uppercase tracking-wider font-normal">{label}</Label>
      <div className="flex flex-wrap gap-2">
        {items.map((item, index) => (
          <Badge key={`${item}-${index}`} variant="outline" className="gap-2 text-xs font-light">
            {item}
            <button type="button" onClick={() => onChange(items.filter((_, i) => i !== index))}>
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={value}
          placeholder={placeholder}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          className="text-sm font-light"
          maxLength={160}
        />
        <Button variant="outline" size="sm" onClick={add} className="text-[11px] uppercase tracking-wider font-normal">
          Add
        </Button>
      </div>
    </div>
  );
};

export default LocationsManager;
