import { resolvePublicMediaUrl } from "../../utils/mediaUrl";
import { useLandingCms } from "../../hooks/useLandingCms";
import { images } from "../../config/images";

const VARIANT_DEFAULTS = {
  login: {
    image: images.destinations.popular.capeCoastCastle,
    alt: "Cape Coast Castle, Ghana heritage tour",
  },
  signup: {
    image: images.destinations.popular.kumasiCulturalTour,
    alt: "Kumasi cultural tour, Ghana",
  },
  verify: {
    image: images.destinations.popular.accraCityTour,
    alt: "Accra city tour, Ghana",
  },
  admin: {
    image: images.home.heroBanner.webp,
    alt: "360 Tours and Investment Limited, Ghana",
  },
};

const VARIANT_CMS_KEYS = {
  login: "loginImage",
  signup: "signupImage",
  verify: "verifyImage",
  admin: "adminImage",
};

export default function AuthPanelBackground({ variant = "login", className = "" }) {
  const { cms } = useLandingCms();
  const defaults = VARIANT_DEFAULTS[variant] ?? VARIANT_DEFAULTS.login;
  const cmsKey = VARIANT_CMS_KEYS[variant] ?? VARIANT_CMS_KEYS.login;
  const cmsImage = cms?.auth?.[cmsKey];
  const src = resolvePublicMediaUrl(cmsImage || defaults.image);

  return (
    <img
      src={src}
      alt={defaults.alt}
      className={["absolute inset-0 h-full w-full object-cover", className].filter(Boolean).join(" ")}
      loading="eager"
      decoding="async"
    />
  );
}
