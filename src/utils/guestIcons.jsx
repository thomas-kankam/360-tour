import {
  Building2,
  Crown,
  Globe,
  GraduationCap,
  Landmark,
  MapPin,
  MessageCircle,
  Mountain,
  PartyPopper,
  Palmtree,
  Plane,
  ClipboardList,
  CheckCircle2,
  Briefcase,
  Handshake,
  Drama,
  Waves,
  Binoculars,
  Compass,
  Luggage,
} from "lucide-react";

export const GUEST_ICON_MAP = {
  globe: Globe,
  mapPin: MapPin,
  building: Building2,
  crown: Crown,
  mountain: Mountain,
  party: PartyPopper,
  landmark: Landmark,
  drama: Drama,
  waves: Waves,
  binoculars: Binoculars,
  graduation: GraduationCap,
  briefcase: Briefcase,
  handshake: Handshake,
  palm: Palmtree,
  plane: Plane,
  message: MessageCircle,
  clipboard: ClipboardList,
  check: CheckCircle2,
  compass: Compass,
  luggage: Luggage,
};

export function GuestIcon({ name, className = "h-4 w-4", ...props }) {
  const Icon = GUEST_ICON_MAP[name] ?? Compass;
  return <Icon className={className} aria-hidden {...props} />;
}

export function resolveTourFallbackIcon(categories = []) {
  if (categories.includes("safari")) return "binoculars";
  if (categories.includes("beach")) return "waves";
  return "globe";
}
