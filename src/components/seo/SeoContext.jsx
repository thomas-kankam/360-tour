import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const SeoContext = createContext({
  override: null,
  jsonLd: null,
  jsonLdId: "page-json-ld",
  setOverride: () => {},
  setJsonLd: () => {},
});

export function SeoProvider({ children }) {
  const [override, setOverrideState] = useState(null);
  const [jsonLd, setJsonLdState] = useState(null);
  const [jsonLdId, setJsonLdId] = useState("page-json-ld");

  const setOverride = useCallback((value) => setOverrideState(value), []);
  const setJsonLd = useCallback((value, id = "page-json-ld") => {
    setJsonLdId(id);
    setJsonLdState(value);
  }, []);

  const value = useMemo(
    () => ({ override, jsonLd, jsonLdId, setOverride, setJsonLd }),
    [override, jsonLd, jsonLdId, setOverride, setJsonLd],
  );

  return <SeoContext.Provider value={value}>{children}</SeoContext.Provider>;
}

export function useSeoContext() {
  return useContext(SeoContext);
}

/** Pages call this to override route-default SEO (cleared on unmount). */
export function usePageSeo(seoOverride, jsonLd = null, jsonLdId = "page-json-ld") {
  const { setOverride, setJsonLd } = useSeoContext();

  useEffect(() => {
    setOverride(seoOverride || null);
    setJsonLd(jsonLd, jsonLdId);
    return () => {
      setOverride(null);
      setJsonLd(null);
    };
  }, [seoOverride, jsonLd, jsonLdId, setOverride, setJsonLd]);
}
