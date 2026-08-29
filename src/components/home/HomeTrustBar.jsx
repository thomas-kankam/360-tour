import { Camera, Leaf, MapPin, UtensilsCrossed, Users } from "lucide-react";
import Container from "../layout/Container";
import ScrollReveal, { ScrollStagger, ScrollStaggerItem } from "../motion/ScrollReveal";

const TRUST_ITEMS = [
  { icon: MapPin, label: "Guided tours", desc: "Local experts across Ghana" },
  { icon: Leaf, label: "Eco experiences", desc: "Nature & heritage routes" },
  { icon: Camera, label: "Scenic moments", desc: "Unforgettable photo stops" },
  { icon: Users, label: "Personal guides", desc: "Small groups, big care" },
  { icon: UtensilsCrossed, label: "Meals included", desc: "Authentic local cuisine" },
];

export default function HomeTrustBar() {
  return (
    <section className="relative bg-brand-secondary py-10 sm:py-12">
      <div aria-hidden className="kente-weave absolute inset-x-0 top-0 h-1" />
      <Container>
        <ScrollStagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {TRUST_ITEMS.map(({ icon: Icon, label, desc }) => (
            <ScrollStaggerItem key={label}>
              <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-accent/15 text-brand-accent ring-1 ring-brand-accent/30">
                  <Icon className="h-5 w-5" strokeWidth={2} aria-hidden />
                </span>
                <p className="mt-3 text-sm font-bold text-white">{label}</p>
                <p className="mt-0.5 text-xs text-white/60">{desc}</p>
              </div>
            </ScrollStaggerItem>
          ))}
        </ScrollStagger>
      </Container>
    </section>
  );
}
