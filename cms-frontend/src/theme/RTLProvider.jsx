import React from "react";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import rtlPlugin from "stylis-plugin-rtl";

function createRtlCache() {
  return createCache({ key: "mui-rtl", stylisPlugins: [rtlPlugin] });
}

function createLtrCache() {
  return createCache({ key: "mui", stylisPlugins: [] });
}

export default function RTLProvider({ isRTL, children }) {
  const cache = React.useMemo(
    () => (isRTL ? createRtlCache() : createLtrCache()),
    [isRTL]
  );

  React.useEffect(() => {
    document.documentElement.setAttribute("dir", isRTL ? "rtl" : "ltr");
  }, [isRTL]);

  return <CacheProvider value={cache}>{children}</CacheProvider>;
}
