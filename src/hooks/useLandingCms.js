import { useCallback, useEffect, useState } from "react";
import publicLandingCmsServiceApi from "../apis/PublicLandingCmsServiceApi";
import { loadLandingCms, saveLandingCms, STORAGE_KEY } from "../utils/landingCmsStorage";

export function useLandingCms() {
  const [cms, setCms] = useState(() => loadLandingCms());
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const cached = loadLandingCms();
    setCms(cached);

    const result = await publicLandingCmsServiceApi.getPublishedContent();
    if (result.ok && result.content) {
      saveLandingCms(result.content);
      setCms(result.content);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();

    function handleStorage(event) {
      if (event.key === STORAGE_KEY) refresh();
    }

    function handleLocalUpdate() {
      setCms(loadLandingCms());
    }

    window.addEventListener("storage", handleStorage);
    window.addEventListener("landing-cms-updated", handleLocalUpdate);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("landing-cms-updated", handleLocalUpdate);
    };
  }, [refresh]);

  return { cms, loading, refresh };
}
