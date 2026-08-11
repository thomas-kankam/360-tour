import { useCallback, useEffect, useState } from "react";
import { loadLandingCms } from "../utils/landingCmsStorage";

export function useLandingCms() {
  const [cms, setCms] = useState(() => loadLandingCms());

  const refresh = useCallback(() => {
    setCms(loadLandingCms());
  }, []);

  useEffect(() => {
    function handleStorage(event) {
      if (event.key === "360tours_landing_cms") refresh();
    }
    function handleLocalUpdate() {
      refresh();
    }
    window.addEventListener("storage", handleStorage);
    window.addEventListener("landing-cms-updated", handleLocalUpdate);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("landing-cms-updated", handleLocalUpdate);
    };
  }, [refresh]);

  return { cms, refresh };
}
