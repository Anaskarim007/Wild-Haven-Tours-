import { Flame, Droplets, WifiOff, Wifi, Users, Tent, Mountain, TreePine, Utensils, Dog, Car, Sun, ShowerHead, Zap, Waves, Bath, type LucideIcon } from "lucide-react";

export const amenityIcons: Record<string, LucideIcon> = {
  flame: Flame,
  droplets: Droplets,
  "wifi-off": WifiOff,
  wifi: Wifi,
  users: Users,
  tent: Tent,
  mountain: Mountain,
  tree: TreePine,
  utensils: Utensils,
  dog: Dog,
  car: Car,
  sun: Sun,
  shower: ShowerHead,
  power: Zap,
  waves: Waves,
  bath: Bath,
};

export const amenityIconOptions = Object.keys(amenityIcons);

export const getAmenityIcon = (name?: string): LucideIcon =>
  (name && amenityIcons[name]) || Tent;
