import React from "react";

const CACHE = {};
const LISTENERS = {};

/** Inline a lucide-static SVG so `currentColor` and `stroke-width` follow CSS. */
export function Icon({ name, size = 16, strokeWidth = 1.75, color = "currentColor", basePath, style, title, ...rest }) {
  const base = basePath || (typeof window !== "undefined" && window.__CS_ICON_BASE__) || "../../assets/icons";
  const url = `${base}/${name}.svg`;
  const [markup, setMarkup] = React.useState(CACHE[url] || null);

  React.useEffect(() => {
    if (CACHE[url]) { setMarkup(CACHE[url]); return; }
    if (LISTENERS[url]) { LISTENERS[url].push(setMarkup); return; }
    LISTENERS[url] = [setMarkup];
    fetch(url).then(r => r.ok ? r.text() : "").then(txt => {
      const inner = txt.replace(/<\?xml[\s\S]*?\?>/, "").replace(/<svg[^>]*>/, "").replace(/<\/svg>/, "").trim();
      CACHE[url] = inner;
      (LISTENERS[url] || []).forEach(fn => fn(inner));
      delete LISTENERS[url];
    }).catch(() => { CACHE[url] = ""; });
  }, [url]);

  return React.createElement("svg", {
    viewBox: "0 0 24 24", width: size, height: size, fill: "none",
    stroke: color, strokeWidth, strokeLinecap: "round", strokeLinejoin: "round",
    "aria-hidden": title ? undefined : true, role: title ? "img" : undefined,
    style: { flex: "0 0 auto", display: "block", ...style }, ...rest,
    dangerouslySetInnerHTML: { __html: (title ? `<title>${title}</title>` : "") + (markup || "") }
  });
}
