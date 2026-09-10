import {
  Building2,
  CalendarDays,
  Car,
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
  Route,
  User,
  Users,
  Shield,
  Heart,
  Headphones,
  BadgeCheck,
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
  calendar: CalendarDays,
  route: Route,
  car: Car,
  user: User,
  users: Users,
  shield: Shield,
  heart: Heart,
  headphones: Headphones,
  badge: BadgeCheck,
};

export const GUEST_ICON_OPTIONS = Object.keys(GUEST_ICON_MAP).map((id) => ({
  id,
  label: id
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (c) => c.toUpperCase())
    .replace(/-/g, " "),
}));

export function GuestIcon({ name, className = "h-4 w-4", ...props }) {
  const Icon = GUEST_ICON_MAP[name] ?? Compass;
  return <Icon className={className} aria-hidden {...props} />;
}

export function resolveTourFallbackIcon(categories = []) {
  if (categories.includes("safari")) return "binoculars";
  if (categories.includes("beach")) return "waves";
  return "globe";
}
