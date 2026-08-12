import GalleryPicture from "../home/GalleryPicture";
import { images } from "../../config/images";

const PANELS = {
  login: {
    imageKey: "capeCoastCastle",
    alt: "Cape Coast Castle, Ghana heritage tour",
  },
  signup: {
    imageKey: "kumasiCulturalTour",
    alt: "Kumasi cultural tour, Ghana",
  },
  verify: {
    imageKey: "accraCityTour",
    alt: "Accra city tour, Ghana",
  },
  admin: {
    sources: images.home.heroBanner,
    alt: "360 Tours and Investment Limited, Ghana",
  },
};

export default function AuthPanelBackground({ variant = "login", className = "" }) {
  const panel = PANELS[variant] ?? PANELS.login;

  return (
    <GalleryPicture
      imageKey={panel.imageKey}
      sources={panel.sources}
      alt={panel.alt}
      pictureClassName="absolute inset-0 block h-full w-full"
      className={["h-full w-full object-cover", className].filter(Boolean).join(" ")}
      loading="eager"
    />
  );
}
