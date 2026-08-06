import {
  Bell,
  Calendar,
  ClipboardList,
  Globe,
  Landmark,
  LayoutGrid,
  Lock,
  Luggage,
  Map,
  MessageCircle,
  ShieldCheck,
  User,
} from "lucide-react";

const ICON_MAP = {
  luggage: Luggage,
  landmark: Landmark,
  map: Map,
  bell: Bell,
  "message-circle": MessageCircle,
  globe: Globe,
  "clipboard-list": ClipboardList,
  lock: Lock,
  grid: LayoutGrid,
  calendar: Calendar,
  shield: ShieldCheck,
  user: User,
};

export default function AppIcon({ name, className = "h-5 w-5", strokeWidth = 1.75 }) {
  const Icon = ICON_MAP[name];
  if (!Icon) return null;
  return <Icon className={className} strokeWidth={strokeWidth} aria-hidden />;
}

export function RoleIcon({ role, className = "h-6 w-6 text-brand-green" }) {
  const name = role === "administrator" ? "shield" : role === "site_operator" ? "landmark" : "luggage";
  return <AppIcon name={name} className={className} strokeWidth={1.75} />;
}
