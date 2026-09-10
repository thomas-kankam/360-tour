import { useEffect, useState } from "react";
import publicAboutCmsServiceApi from "../apis/PublicAboutCmsServiceApi";
import { ABOUT_CMS_DEFAULTS, loadAboutCms, saveAboutCms } from "../utils/aboutCmsStorage";

export function useAboutCms() {
  const [cms, setCms] = useState(() => loadAboutCms() || ABOUT_CMS_DEFAULTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      const result = await publicAboutCmsServiceApi.getPublishedContent();
      if (!active) return;
      if (result.ok && result.content) {
        saveAboutCms(result.content);
        setCms(result.content);
      } else {
        setCms(ABOUT_CMS_DEFAULTS);
      }
      setLoading(false);
    }

    load();

    function handleLocalUpdate() {
      setCms(loadAboutCms() || ABOUT_CMS_DEFAULTS);
    }

    window.addEventListener("about-cms-updated", handleLocalUpdate);
    return () => {
      active = false;
      window.removeEventListener("about-cms-updated", handleLocalUpdate);
    };
  }, []);

  return { cms, loading };
}
