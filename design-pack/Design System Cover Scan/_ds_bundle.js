/* @ds-bundle: {"format":4,"namespace":"CoverScanDesignSystem_6debdf","components":[{"name":"Accordion","sourcePath":"components/base/Accordion.jsx"},{"name":"Badge","sourcePath":"components/base/Badge.jsx"},{"name":"Button","sourcePath":"components/base/Button.jsx"},{"name":"Card","sourcePath":"components/base/Card.jsx"},{"name":"DataTable","sourcePath":"components/base/DataTable.jsx"},{"name":"Icon","sourcePath":"components/base/Icon.jsx"},{"name":"Input","sourcePath":"components/base/Input.jsx"},{"name":"Progress","sourcePath":"components/base/Progress.jsx"},{"name":"Select","sourcePath":"components/base/Select.jsx"},{"name":"Sheet","sourcePath":"components/base/Sheet.jsx"},{"name":"Tabs","sourcePath":"components/base/Tabs.jsx"},{"name":"Tooltip","sourcePath":"components/base/Tooltip.jsx"},{"name":"CoverageGrid","sourcePath":"components/coverage/CoverageGrid.jsx"},{"name":"FindingsList","sourcePath":"components/coverage/FindingsList.jsx"},{"name":"GapBar","sourcePath":"components/coverage/GapBar.jsx"},{"name":"KpiCard","sourcePath":"components/coverage/KpiCard.jsx"},{"name":"DocumentViewer","sourcePath":"components/document/DocumentViewer.jsx"},{"name":"MaskedText","sourcePath":"components/document/MaskedText.jsx"},{"name":"PIPELINE_STEPS","sourcePath":"components/document/ProcessingStepper.jsx"},{"name":"ProcessingStepper","sourcePath":"components/document/ProcessingStepper.jsx"},{"name":"ProfileSwitcher","sourcePath":"components/document/ProfileSwitcher.jsx"},{"name":"BuildRequestEmail","sourcePath":"components/document/RequestEmailSheet.jsx"},{"name":"RequestEmailSheet","sourcePath":"components/document/RequestEmailSheet.jsx"},{"name":"ConfidenceDot","sourcePath":"components/verdict/ConfidenceDot.jsx"},{"name":"DecisionChip","sourcePath":"components/verdict/DecisionChip.jsx"},{"name":"ScoreRing","sourcePath":"components/verdict/ScoreRing.jsx"},{"name":"StatusMiniGrid","sourcePath":"components/verdict/StatusMiniGrid.jsx"},{"name":"SEAL_GATES","sourcePath":"components/verdict/VerificationSeal.jsx"},{"name":"VerificationSeal","sourcePath":"components/verdict/VerificationSeal.jsx"},{"name":"VerificationSealList","sourcePath":"components/verdict/VerificationSeal.jsx"}],"sourceHashes":{"components/base/Accordion.jsx":"75e61d0e3c5d","components/base/Badge.jsx":"a0a74c68a59d","components/base/Button.jsx":"ffd54f0d9a4f","components/base/Card.jsx":"c2d6270b8524","components/base/DataTable.jsx":"3f72a071ca1e","components/base/Icon.jsx":"4d14ee94ed47","components/base/Input.jsx":"140f53903f8d","components/base/Progress.jsx":"adaa07bad8d8","components/base/Select.jsx":"6332b3c6c3be","components/base/Sheet.jsx":"3880764d3314","components/base/Tabs.jsx":"4aa1b7d810b5","components/base/Tooltip.jsx":"8947dedf79b1","components/coverage/CoverageGrid.jsx":"7f9dc9312287","components/coverage/FindingsList.jsx":"8ce4e5a2ade8","components/coverage/GapBar.jsx":"c19d16a24870","components/coverage/KpiCard.jsx":"7d9c8dbdbfea","components/document/DocumentViewer.jsx":"f2c3cd22af82","components/document/MaskedText.jsx":"0f69eafd65d4","components/document/ProcessingStepper.jsx":"31917ccc9bd3","components/document/ProfileSwitcher.jsx":"5b2e2333b1b3","components/document/RequestEmailSheet.jsx":"d0c65fb3c095","components/verdict/ConfidenceDot.jsx":"6f8b801d8468","components/verdict/DecisionChip.jsx":"fcd342773f51","components/verdict/ScoreRing.jsx":"93ab8563e566","components/verdict/StatusMiniGrid.jsx":"0f019ef400e1","components/verdict/VerificationSeal.jsx":"503879fe204a","ui_kits/coverscan/AppShell.jsx":"acc41307939e","ui_kits/coverscan/CertificateScreen.jsx":"76ad84396a46","ui_kits/coverscan/CertificatesScreen.jsx":"3938f25e1a45","ui_kits/coverscan/MidFiScreens.jsx":"02e587d6cd37","ui_kits/coverscan/PortfolioScreen.jsx":"cafb806b5565","ui_kits/coverscan/data.js":"675527ad36fc"},"inlinedExternals":[],"unexposedExports":[{"name":"buildRequestEmail","sourcePath":"components/document/RequestEmailSheet.jsx"}]} */

(() => {

const __ds_ns = (window.CoverScanDesignSystem_6debdf = window.CoverScanDesignSystem_6debdf || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/base/Badge.jsx
try { (() => {
const TONES = {
  neutral: {
    fg: "var(--status-neutral)",
    bg: "var(--status-neutral-bg)"
  },
  go: {
    fg: "var(--status-go)",
    bg: "var(--status-go-bg)"
  },
  amber: {
    fg: "var(--status-amber)",
    bg: "var(--status-amber-bg)"
  },
  red: {
    fg: "var(--status-red)",
    bg: "var(--status-red-bg)"
  },
  review: {
    fg: "var(--status-review)",
    bg: "var(--status-review-bg)"
  },
  ink: {
    fg: "var(--foreground)",
    bg: "var(--muted)"
  }
};
function Badge({
  tone = "neutral",
  variant = "solid",
  size = "sm",
  icon,
  mono,
  children,
  style,
  title
}) {
  const t = TONES[tone] || TONES.neutral;
  const h = size === "lg" ? 28 : size === "md" ? 24 : 20;
  return /*#__PURE__*/React.createElement("span", {
    title: title,
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 5,
      height: h,
      padding: size === "lg" ? "0 12px" : "0 8px",
      borderRadius: "var(--radius-full)",
      fontSize: size === "lg" ? 13 : 12,
      fontWeight: 500,
      lineHeight: 1,
      whiteSpace: "nowrap",
      fontFamily: mono ? "var(--font-mono)" : "var(--font-sans)",
      fontVariantNumeric: mono ? "tabular-nums" : undefined,
      color: t.fg,
      background: variant === "solid" ? t.bg : "transparent",
      border: `1px solid ${variant === "outline" ? t.fg : "transparent"}`,
      ...style
    }
  }, icon, children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/base/Badge.jsx", error: String((e && e.message) || e) }); }

// components/base/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const VARIANTS = {
  primary: {
    background: "var(--primary)",
    color: "var(--primary-foreground)",
    border: "1px solid var(--primary)"
  },
  secondary: {
    background: "var(--secondary)",
    color: "var(--secondary-foreground)",
    border: "1px solid var(--border)"
  },
  outline: {
    background: "var(--card)",
    color: "var(--foreground)",
    border: "1px solid var(--border)"
  },
  ghost: {
    background: "transparent",
    color: "var(--foreground)",
    border: "1px solid transparent"
  },
  destructive: {
    background: "var(--destructive)",
    color: "var(--destructive-foreground)",
    border: "1px solid var(--destructive)"
  }
};
const SIZES = {
  sm: {
    height: 28,
    padding: "0 10px",
    fontSize: 13,
    gap: 6
  },
  md: {
    height: 32,
    padding: "0 12px",
    fontSize: 13,
    gap: 6
  },
  lg: {
    height: 36,
    padding: "0 16px",
    fontSize: 14,
    gap: 8
  }
};
function Button({
  variant = "outline",
  size = "md",
  disabled,
  iconLeft,
  iconRight,
  children,
  style,
  onClick,
  type = "button",
  title,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const v = VARIANTS[variant] || VARIANTS.outline;
  const s = SIZES[size] || SIZES.md;
  const hoverStyle = !disabled && hover ? variant === "primary" || variant === "destructive" ? {
    filter: "brightness(1.12)"
  } : {
    background: "var(--accent)",
    color: "var(--accent-foreground)"
  } : null;
  return /*#__PURE__*/React.createElement("button", _extends({
    type: type,
    disabled: disabled,
    onClick: onClick,
    title: title,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "var(--font-sans)",
      fontWeight: 500,
      borderRadius: "var(--radius-full)",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.45 : 1,
      whiteSpace: "nowrap",
      transition: "background 120ms var(--ease-standard), filter 120ms var(--ease-standard)",
      ...v,
      ...s,
      ...hoverStyle,
      ...style
    }
  }, rest), iconLeft, children, iconRight);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/base/Button.jsx", error: String((e && e.message) || e) }); }

// components/base/Card.jsx
try { (() => {
function Card({
  title,
  subtitle,
  actions,
  padded = true,
  children,
  style,
  bodyStyle
}) {
  return /*#__PURE__*/React.createElement("section", {
    style: {
      background: "var(--card)",
      color: "var(--card-foreground)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius-lg)",
      boxShadow: "var(--shadow-sm)",
      display: "flex",
      flexDirection: "column",
      minWidth: 0,
      ...style
    }
  }, (title || actions) && /*#__PURE__*/React.createElement("header", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      padding: "14px var(--card-pad)",
      borderBottom: "1px solid var(--border)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, title && /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: "var(--text-h3)",
      fontWeight: 600,
      letterSpacing: "-0.01em"
    }
  }, title), subtitle && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--muted-foreground)",
      marginTop: 2
    }
  }, subtitle)), actions && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      flex: "0 0 auto"
    }
  }, actions)), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: padded ? "var(--card-pad)" : 0,
      flex: 1,
      minWidth: 0,
      ...bodyStyle
    }
  }, children));
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/base/Card.jsx", error: String((e && e.message) || e) }); }

// components/base/DataTable.jsx
try { (() => {
function DataTable({
  columns = [],
  rows = [],
  dense,
  onRowClick,
  selectedId,
  rowKey = "id",
  stickyHeader = true,
  transition,
  emptyMessage = "No certificates match. Clear filters or upload one.",
  style
}) {
  const h = dense ? "var(--row-h-dense)" : "var(--row-h)";
  return /*#__PURE__*/React.createElement("div", {
    style: {
      overflow: "auto",
      ...style
    }
  }, /*#__PURE__*/React.createElement("table", {
    style: {
      width: "100%",
      fontSize: "var(--text-dense)",
      tableLayout: "auto"
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, columns.map(c => /*#__PURE__*/React.createElement("th", {
    key: c.key,
    style: {
      position: stickyHeader ? "sticky" : undefined,
      top: 0,
      zIndex: 2,
      textAlign: c.align || "left",
      fontWeight: 500,
      fontSize: 12,
      color: "var(--muted-foreground)",
      background: "var(--card)",
      padding: "0 10px",
      height: 32,
      whiteSpace: "nowrap",
      borderBottom: "1px solid var(--border)",
      width: c.width
    }
  }, c.header)))), /*#__PURE__*/React.createElement("tbody", null, rows.length === 0 && /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
    colSpan: columns.length,
    style: {
      padding: 24,
      textAlign: "center",
      color: "var(--muted-foreground)"
    }
  }, emptyMessage)), rows.map((r, i) => {
    const key = r[rowKey] != null ? r[rowKey] : i;
    const selected = selectedId != null && selectedId === r[rowKey];
    return /*#__PURE__*/React.createElement("tr", {
      key: key,
      onClick: onRowClick ? () => onRowClick(r) : undefined,
      style: {
        height: h,
        cursor: onRowClick ? "pointer" : "default",
        background: selected ? "var(--accent)" : "transparent",
        transition: transition ? `background var(--dur-recolour) var(--ease-standard)` : undefined
      },
      onMouseEnter: e => {
        if (!selected) e.currentTarget.style.background = "var(--accent)";
      },
      onMouseLeave: e => {
        if (!selected) e.currentTarget.style.background = "transparent";
      }
    }, columns.map(c => /*#__PURE__*/React.createElement("td", {
      key: c.key,
      style: {
        padding: "0 10px",
        borderBottom: "1px solid var(--border)",
        textAlign: c.align || "left",
        whiteSpace: c.wrap ? "normal" : "nowrap",
        fontFamily: c.mono ? "var(--font-mono)" : undefined,
        fontVariantNumeric: c.mono ? "tabular-nums" : undefined,
        color: c.muted ? "var(--muted-foreground)" : undefined
      }
    }, c.render ? c.render(r) : r[c.key])));
  }))));
}
Object.assign(__ds_scope, { DataTable });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/base/DataTable.jsx", error: String((e && e.message) || e) }); }

// components/base/Icon.jsx
try { (() => {
const CACHE = {};
const LISTENERS = {};

/** Inline a lucide-static SVG so `currentColor` and `stroke-width` follow CSS. */
function Icon({
  name,
  size = 16,
  strokeWidth = 1.75,
  color = "currentColor",
  basePath,
  style,
  title,
  ...rest
}) {
  const base = basePath || typeof window !== "undefined" && window.__CS_ICON_BASE__ || "../../assets/icons";
  const url = `${base}/${name}.svg`;
  const [markup, setMarkup] = React.useState(CACHE[url] || null);
  React.useEffect(() => {
    if (CACHE[url]) {
      setMarkup(CACHE[url]);
      return;
    }
    if (LISTENERS[url]) {
      LISTENERS[url].push(setMarkup);
      return;
    }
    LISTENERS[url] = [setMarkup];
    fetch(url).then(r => r.ok ? r.text() : "").then(txt => {
      const inner = txt.replace(/<\?xml[\s\S]*?\?>/, "").replace(/<svg[^>]*>/, "").replace(/<\/svg>/, "").trim();
      CACHE[url] = inner;
      (LISTENERS[url] || []).forEach(fn => fn(inner));
      delete LISTENERS[url];
    }).catch(() => {
      CACHE[url] = "";
    });
  }, [url]);
  return React.createElement("svg", {
    viewBox: "0 0 24 24",
    width: size,
    height: size,
    fill: "none",
    stroke: color,
    strokeWidth,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": title ? undefined : true,
    role: title ? "img" : undefined,
    style: {
      flex: "0 0 auto",
      display: "block",
      ...style
    },
    ...rest,
    dangerouslySetInnerHTML: {
      __html: (title ? `<title>${title}</title>` : "") + (markup || "")
    }
  });
}
Object.assign(__ds_scope, { Icon });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/base/Icon.jsx", error: String((e && e.message) || e) }); }

// components/base/Accordion.jsx
try { (() => {
function Accordion({
  items = [],
  defaultOpen = [],
  style
}) {
  const [open, setOpen] = React.useState(() => new Set(defaultOpen));
  const toggle = id => setOpen(prev => {
    const n = new Set(prev);
    n.has(id) ? n.delete(id) : n.add(id);
    return n;
  });
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      ...style
    }
  }, items.map((it, i) => {
    const id = it.id != null ? it.id : i;
    const isOpen = open.has(id);
    return /*#__PURE__*/React.createElement("div", {
      key: id,
      style: {
        borderBottom: "1px solid var(--border)"
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => toggle(id),
      "aria-expanded": isOpen,
      style: {
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: 8,
        background: "transparent",
        border: "none",
        cursor: "pointer",
        padding: "10px 4px",
        textAlign: "left",
        font: "inherit",
        color: "inherit"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--muted-foreground)",
        display: "flex",
        transform: isOpen ? "rotate(90deg)" : "none",
        transition: "transform 120ms var(--ease-standard)"
      }
    }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: "chevron-right",
      size: 14
    })), it.leading, /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        minWidth: 0,
        fontSize: 13,
        fontWeight: 500
      }
    }, it.title), it.trailing), isOpen && /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "0 4px 12px 30px"
      }
    }, it.content));
  }));
}
Object.assign(__ds_scope, { Accordion });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/base/Accordion.jsx", error: String((e && e.message) || e) }); }

// components/base/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Input({
  value,
  onChange,
  placeholder,
  multiline,
  rows = 6,
  mono,
  iconLeft,
  disabled,
  readOnly,
  size = "md",
  style,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const base = {
    width: "100%",
    background: "var(--card)",
    color: "var(--foreground)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    fontFamily: mono ? "var(--font-mono)" : "var(--font-sans)",
    fontVariantNumeric: mono ? "tabular-nums" : undefined,
    fontSize: size === "sm" ? 13 : 14,
    outline: "none",
    boxShadow: focus ? "var(--focus-ring)" : "none",
    padding: multiline ? "8px 10px" : size === "sm" ? "0 8px" : "0 10px",
    height: multiline ? undefined : size === "sm" ? 28 : 32,
    lineHeight: multiline ? 1.5 : undefined,
    resize: multiline ? "vertical" : undefined,
    opacity: disabled ? 0.5 : 1
  };
  const shared = {
    value,
    onChange,
    placeholder,
    disabled,
    readOnly,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false)
  };
  if (multiline) return /*#__PURE__*/React.createElement("textarea", _extends({
    rows: rows
  }, shared, {
    style: {
      ...base,
      ...style
    }
  }, rest));
  if (!iconLeft) return /*#__PURE__*/React.createElement("input", _extends({}, shared, {
    style: {
      ...base,
      ...style
    }
  }, rest));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 6,
      ...base,
      padding: "0 10px",
      boxShadow: focus ? "var(--focus-ring)" : "none",
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--muted-foreground)",
      display: "flex"
    }
  }, iconLeft), /*#__PURE__*/React.createElement("input", _extends({}, shared, {
    style: {
      flex: 1,
      border: "none",
      outline: "none",
      background: "transparent",
      color: "inherit",
      font: "inherit",
      height: "100%"
    }
  }, rest)));
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/base/Input.jsx", error: String((e && e.message) || e) }); }

// components/base/Progress.jsx
try { (() => {
function Progress({
  value = 0,
  max = 100,
  tone = "ink",
  height = 6,
  label,
  style
}) {
  const pct = Math.max(0, Math.min(100, value / max * 100));
  const fill = tone === "ink" ? "var(--gap-fill)" : tone === "go" ? "var(--status-go)" : tone === "amber" ? "var(--status-amber)" : tone === "red" ? "var(--status-red)" : "var(--primary)";
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    role: "progressbar",
    "aria-valuenow": value,
    "aria-valuemax": max,
    style: {
      flex: 1,
      height,
      background: "var(--gap-track)",
      borderRadius: height / 2,
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: `${pct}%`,
      height: "100%",
      background: fill,
      transition: "width var(--dur-step) var(--ease-out)"
    }
  })), label && /*#__PURE__*/React.createElement("span", {
    className: "cs-num",
    style: {
      fontSize: 12,
      color: "var(--muted-foreground)"
    }
  }, label));
}
Object.assign(__ds_scope, { Progress });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/base/Progress.jsx", error: String((e && e.message) || e) }); }

// components/base/Select.jsx
try { (() => {
function Select({
  value,
  options = [],
  onChange,
  label,
  size = "md",
  width,
  style
}) {
  const h = size === "sm" ? 28 : 32;
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: "var(--muted-foreground)",
      whiteSpace: "nowrap"
    }
  }, label), /*#__PURE__*/React.createElement("span", {
    style: {
      position: "relative",
      display: "inline-flex",
      alignItems: "center",
      width
    }
  }, /*#__PURE__*/React.createElement("select", {
    value: value,
    onChange: e => onChange && onChange(e.target.value),
    style: {
      appearance: "none",
      height: h,
      width: width || undefined,
      padding: "0 28px 0 10px",
      fontSize: 13,
      fontFamily: "var(--font-sans)",
      color: "var(--foreground)",
      background: "var(--card)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius)",
      cursor: "pointer"
    }
  }, options.map(o => {
    const val = typeof o === "string" ? o : o.value;
    const lab = typeof o === "string" ? o : o.label;
    return /*#__PURE__*/React.createElement("option", {
      key: val,
      value: val
    }, lab);
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      right: 8,
      pointerEvents: "none",
      color: "var(--muted-foreground)",
      display: "flex"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "chevron-down",
    size: 14
  }))));
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/base/Select.jsx", error: String((e && e.message) || e) }); }

// components/base/Sheet.jsx
try { (() => {
function Sheet({
  open,
  title,
  subtitle,
  onClose,
  footer,
  width = 520,
  children,
  style
}) {
  if (!open) return null;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      zIndex: 60,
      display: "flex",
      justifyContent: "flex-end"
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: onClose,
    style: {
      position: "absolute",
      inset: 0,
      background: "rgba(1,0,61,.32)"
    }
  }), /*#__PURE__*/React.createElement("aside", {
    style: {
      position: "relative",
      width,
      maxWidth: "100%",
      height: "100%",
      background: "var(--card)",
      borderLeft: "1px solid var(--border)",
      boxShadow: "var(--shadow-sheet)",
      display: "flex",
      flexDirection: "column",
      ...style
    }
  }, /*#__PURE__*/React.createElement("header", {
    style: {
      display: "flex",
      alignItems: "flex-start",
      gap: 12,
      padding: "14px 16px",
      borderBottom: "1px solid var(--border)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: "var(--text-h3)",
      fontWeight: 600
    }
  }, title), subtitle && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--muted-foreground)",
      marginTop: 2
    }
  }, subtitle)), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    "aria-label": "Close",
    style: {
      background: "transparent",
      border: "none",
      cursor: "pointer",
      color: "var(--muted-foreground)",
      padding: 2,
      display: "flex"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "x",
    size: 16
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflow: "auto",
      padding: 16
    }
  }, children), footer && /*#__PURE__*/React.createElement("footer", {
    style: {
      display: "flex",
      gap: 8,
      justifyContent: "flex-end",
      padding: "12px 16px",
      borderTop: "1px solid var(--border)"
    }
  }, footer)));
}
Object.assign(__ds_scope, { Sheet });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/base/Sheet.jsx", error: String((e && e.message) || e) }); }

// components/base/Tabs.jsx
try { (() => {
function Tabs({
  tabs = [],
  value,
  onChange,
  right,
  children,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      minHeight: 0,
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    role: "tablist",
    style: {
      display: "flex",
      alignItems: "center",
      gap: 2,
      borderBottom: "1px solid var(--border)",
      paddingLeft: 4,
      flex: "0 0 auto"
    }
  }, tabs.map(t => {
    const id = typeof t === "string" ? t : t.id;
    const label = typeof t === "string" ? t : t.label;
    const count = typeof t === "string" ? null : t.count;
    const icon = typeof t === "string" ? null : t.icon;
    const active = id === value;
    return /*#__PURE__*/React.createElement("button", {
      key: id,
      role: "tab",
      "aria-selected": active,
      onClick: () => onChange && onChange(id),
      style: {
        appearance: "none",
        background: "transparent",
        cursor: "pointer",
        border: "none",
        borderBottom: `2px solid ${active ? "var(--primary)" : "transparent"}`,
        padding: "0 10px",
        height: 38,
        fontSize: 13,
        fontFamily: "var(--font-sans)",
        fontWeight: active ? 600 : 500,
        color: active ? "var(--primary)" : "var(--muted-foreground)",
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        marginBottom: -1,
        transition: "color 120ms var(--ease-standard)"
      }
    }, icon && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: icon,
      size: 14
    }), label, count != null && /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "var(--font-mono)",
        fontSize: 11,
        color: "var(--muted-foreground)"
      }
    }, count));
  }), right && /*#__PURE__*/React.createElement("div", {
    style: {
      marginLeft: "auto",
      paddingRight: 8
    }
  }, right)), /*#__PURE__*/React.createElement("div", {
    role: "tabpanel",
    style: {
      flex: 1,
      minHeight: 0,
      overflow: "auto"
    }
  }, children));
}
Object.assign(__ds_scope, { Tabs });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/base/Tabs.jsx", error: String((e && e.message) || e) }); }

// components/base/Tooltip.jsx
try { (() => {
function Tooltip({
  content,
  side = "top",
  children,
  style
}) {
  const [open, setOpen] = React.useState(false);
  const pos = side === "top" ? {
    bottom: "calc(100% + 6px)",
    left: 0
  } : side === "bottom" ? {
    top: "calc(100% + 6px)",
    left: 0
  } : side === "left" ? {
    right: "calc(100% + 6px)",
    top: 0
  } : {
    left: "calc(100% + 6px)",
    top: 0
  };
  return /*#__PURE__*/React.createElement("span", {
    style: {
      position: "relative",
      display: "inline-flex",
      ...style
    },
    onMouseEnter: () => setOpen(true),
    onMouseLeave: () => setOpen(false),
    onFocus: () => setOpen(true),
    onBlur: () => setOpen(false),
    tabIndex: 0
  }, children, open && content && /*#__PURE__*/React.createElement("span", {
    role: "tooltip",
    style: {
      position: "absolute",
      zIndex: 40,
      ...pos,
      maxWidth: 320,
      width: "max-content",
      background: "var(--popover)",
      color: "var(--popover-foreground)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius)",
      boxShadow: "var(--shadow-popover)",
      padding: "8px 10px",
      fontSize: 12,
      lineHeight: 1.45,
      textAlign: "left",
      whiteSpace: "normal",
      pointerEvents: "none"
    }
  }, content));
}
Object.assign(__ds_scope, { Tooltip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/base/Tooltip.jsx", error: String((e && e.message) || e) }); }

// components/coverage/FindingsList.jsx
try { (() => {
const SEVERITY = {
  BLOCK: {
    tone: "var(--status-red)",
    bg: "var(--status-red-bg)",
    icon: "ban",
    rank: 0
  },
  CRITICAL: {
    tone: "var(--status-red)",
    bg: "var(--status-red-bg)",
    icon: "triangle-alert",
    rank: 1
  },
  WARNING: {
    tone: "var(--status-amber)",
    bg: "var(--status-amber-bg)",
    icon: "triangle-alert",
    rank: 2
  },
  INFO: {
    tone: "var(--status-neutral)",
    bg: "var(--status-neutral-bg)",
    icon: "info",
    rank: 3
  }
};
function FindingsList({
  findings = [],
  defaultOpen,
  onEvidenceClick,
  style
}) {
  const sorted = [...findings].sort((a, b) => (SEVERITY[a.severity] || SEVERITY.INFO).rank - (SEVERITY[b.severity] || SEVERITY.INFO).rank);
  const initial = defaultOpen || sorted.filter(f => f.severity === "BLOCK").map(f => f.ruleId);
  const [open, setOpen] = React.useState(() => new Set(initial));
  const toggle = id => setOpen(p => {
    const n = new Set(p);
    n.has(id) ? n.delete(id) : n.add(id);
    return n;
  });
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      ...style
    }
  }, sorted.map(f => {
    const s = SEVERITY[f.severity] || SEVERITY.INFO;
    const isOpen = open.has(f.ruleId);
    return /*#__PURE__*/React.createElement("div", {
      key: f.ruleId,
      style: {
        borderBottom: "1px solid var(--border)"
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => toggle(f.ruleId),
      "aria-expanded": isOpen,
      style: {
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "10px 4px",
        background: "transparent",
        border: "none",
        cursor: "pointer",
        textAlign: "left",
        font: "inherit",
        color: "inherit"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--muted-foreground)",
        display: "flex",
        transform: isOpen ? "rotate(90deg)" : "none",
        transition: "transform 120ms var(--ease-standard)"
      }
    }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: "chevron-right",
      size: 14
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        height: 20,
        padding: "0 7px",
        borderRadius: "var(--radius-full)",
        background: s.bg,
        color: s.tone,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: ".02em",
        flex: "0 0 auto"
      }
    }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: s.icon,
      size: 11
    }), f.severity), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        minWidth: 0,
        fontSize: 13,
        fontWeight: 500
      }
    }, f.title), /*#__PURE__*/React.createElement("span", {
      className: "cs-code",
      style: {
        flex: "0 0 auto"
      }
    }, f.ruleId)), isOpen && /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "0 4px 12px 30px",
        display: "grid",
        gap: 8
      }
    }, f.quote && /*#__PURE__*/React.createElement("div", {
      onClick: onEvidenceClick ? () => onEvidenceClick(f) : undefined,
      style: {
        cursor: onEvidenceClick ? "pointer" : "default"
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "cs-quote"
    }, "\xAB ", f.quote, " \xBB"), f.page != null && /*#__PURE__*/React.createElement("div", {
      className: "cs-code",
      style: {
        marginTop: 2
      }
    }, "Page ", f.page, f.lang ? ` · ${f.lang}` : "", " \u2014 click to highlight")), f.fix && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        lineHeight: 1.45,
        borderLeft: "2px solid var(--border)",
        paddingLeft: 10
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--muted-foreground)",
        fontSize: 11,
        display: "block",
        textTransform: "uppercase",
        letterSpacing: ".04em",
        marginBottom: 2
      }
    }, "Fix to request"), f.fix)));
  }));
}
Object.assign(__ds_scope, { FindingsList });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/coverage/FindingsList.jsx", error: String((e && e.message) || e) }); }

// components/coverage/GapBar.jsx
try { (() => {
const fmtCompact = v => {
  if (v == null) return "—";
  if (v >= 1e9) return `€${+(v / 1e9).toFixed(1)}bn`;
  if (v >= 1e6) return `€${+(v / 1e6).toFixed(v % 1e6 === 0 ? 0 : 1)}M`;
  if (v >= 1e3) return `€${Math.round(v / 1e3)}k`;
  return `€${v}`;
};
function GapBar({
  found,
  required,
  status = "BELOW_MINIMUM",
  width = 180,
  height = 6,
  showLabel = true,
  label,
  stacked,
  onClick,
  style
}) {
  const pct = required ? Math.max(0, Math.min(1, (found || 0) / required)) : 0;
  const pctText = required ? `${found ? Math.max(1, Math.round(pct * 100)) : 0} %` : "";
  const missing = status === "MISSING";
  const noAmount = status === "COVERED_NO_AMOUNT";
  const excluded = status === "EXCLUDED";
  const compliant = status === "COMPLIANT";
  const autoLabel = missing ? "missing" : noAmount ? "no amount" : excluded ? `${fmtCompact(found)} · excluded` : compliant ? `${fmtCompact(found)} · meets requirement` : `${fmtCompact(found)} · ${pctText}`;
  const labelColor = missing || excluded ? "var(--status-red)" : noAmount ? "var(--status-amber)" : compliant ? "var(--status-go)" : "var(--foreground)";
  return /*#__PURE__*/React.createElement("span", {
    onClick: onClick,
    style: {
      display: "inline-flex",
      flexDirection: stacked ? "column" : "row",
      alignItems: stacked ? "flex-start" : "center",
      gap: stacked ? 4 : 8,
      cursor: onClick ? "pointer" : "default",
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: "relative",
      width,
      height,
      flex: `0 0 ${width}px`,
      background: "var(--gap-track)",
      borderRadius: height / 2
    }
  }, noAmount ? /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      inset: 0,
      borderRadius: height / 2,
      backgroundImage: "repeating-linear-gradient(135deg, var(--gap-fill) 0 2px, transparent 2px 5px)",
      opacity: 0.55
    }
  }) : !missing && /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      left: 0,
      top: 0,
      bottom: 0,
      width: `${Math.max(compliant ? 100 : pct * 100, found ? 1.5 : 0)}%`,
      background: "var(--gap-fill)",
      borderRadius: height / 2,
      transition: "width var(--dur-recolour) var(--ease-standard)"
    }
  }), /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      position: "absolute",
      right: 0,
      top: -(height * 0.7),
      width: 2,
      height: height * 2.4,
      background: "var(--required-marker)",
      borderRadius: 1
    }
  })), showLabel && /*#__PURE__*/React.createElement("span", {
    className: "cs-num",
    style: {
      fontSize: stacked ? 11 : 13,
      color: labelColor,
      whiteSpace: "nowrap",
      fontWeight: 500
    }
  }, label || autoLabel));
}
Object.assign(__ds_scope, { GapBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/coverage/GapBar.jsx", error: String((e && e.message) || e) }); }

// components/coverage/KpiCard.jsx
try { (() => {
const TILE = {
  ink: ["var(--secondary)", "var(--primary)"],
  go: ["var(--status-go-bg)", "var(--status-go)"],
  amber: ["var(--status-amber-bg)", "var(--status-amber)"],
  red: ["var(--status-red-bg)", "var(--status-red)"],
  review: ["var(--status-review-bg)", "var(--status-review)"]
};
function KpiCard({
  label,
  value,
  unit,
  sub,
  tone = "ink",
  ring,
  icon,
  delta,
  deltaTone,
  onClick,
  style
}) {
  const [tileBg, tileFg] = TILE[tone] || TILE.ink;
  const [dBg, dFg] = TILE[deltaTone || "ink"] || TILE.ink;
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("section", {
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      background: "var(--card)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius-lg)",
      boxShadow: hover && onClick ? "var(--shadow-popover)" : "var(--shadow-sm)",
      transition: "box-shadow 150ms var(--ease-standard)",
      padding: "var(--card-pad)",
      display: "flex",
      flexDirection: "column",
      gap: 14,
      cursor: onClick ? "pointer" : "default",
      minWidth: 0,
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10
    }
  }, icon && /*#__PURE__*/React.createElement("span", {
    style: {
      width: 36,
      height: 36,
      borderRadius: 10,
      background: tileBg,
      color: tileFg,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      flex: "0 0 36px"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 17
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1
    }
  }), delta && /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
      height: 22,
      padding: "0 9px",
      borderRadius: "var(--radius-full)",
      background: dBg,
      color: dFg,
      fontFamily: "var(--font-mono)",
      fontVariantNumeric: "tabular-nums",
      fontSize: 11,
      fontWeight: 600
    }
  }, delta), ring), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "baseline",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontVariantNumeric: "tabular-nums",
      fontWeight: 600,
      fontSize: "var(--text-kpi)",
      lineHeight: 1,
      letterSpacing: "-0.02em",
      color: "var(--foreground)"
    }
  }, value), unit && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 14,
      color: "var(--muted-foreground)"
    }
  }, unit)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 500,
      marginTop: 8
    }
  }, label), sub && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--muted-foreground)",
      marginTop: 3,
      lineHeight: 1.35
    }
  }, sub)));
}
Object.assign(__ds_scope, { KpiCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/coverage/KpiCard.jsx", error: String((e && e.message) || e) }); }

// components/document/DocumentViewer.jsx
try { (() => {
function DocumentViewer({
  pages = [],
  activePage,
  onPageChange,
  highlights = [],
  activeHighlightId,
  showEvidence = true,
  onToggleEvidence,
  ocrUsed,
  fileName,
  style
}) {
  const [zoom, setZoom] = React.useState(1);
  const [page, setPage] = React.useState(activePage || pages[0] && pages[0].n || 1);
  React.useEffect(() => {
    if (activePage) setPage(activePage);
  }, [activePage]);
  const current = pages.find(p => p.n === page) || pages[0] || {};
  const pageHighlights = highlights.filter(h => h.page === page);
  const go = n => {
    setPage(n);
    onPageChange && onPageChange(n);
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      minHeight: 0,
      background: "var(--card)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius)",
      overflow: "hidden",
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      padding: "8px 10px",
      borderBottom: "1px solid var(--border)",
      flex: "0 0 auto"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: "var(--muted-foreground)"
    }
  }, "Page"), /*#__PURE__*/React.createElement("span", {
    className: "cs-num",
    style: {
      fontSize: 12
    }
  }, page, " / ", pages.length), current.lang && /*#__PURE__*/React.createElement(__ds_scope.Badge, {
    tone: "neutral",
    mono: true
  }, current.lang), (ocrUsed || current.ocrUsed) && /*#__PURE__*/React.createElement(__ds_scope.Badge, {
    tone: "amber",
    icon: /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: "triangle-alert",
      size: 11
    })
  }, "OCR"), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement(__ds_scope.Button, {
    size: "sm",
    variant: "ghost",
    onClick: onToggleEvidence,
    iconLeft: /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: showEvidence ? "eye" : "eye-off",
      size: 14
    })
  }, "Evidence"), /*#__PURE__*/React.createElement(__ds_scope.Button, {
    size: "sm",
    variant: "ghost",
    onClick: () => setZoom(z => Math.max(0.6, +(z - 0.2).toFixed(1))),
    title: "Zoom out"
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "zoom-out",
    size: 14
  })), /*#__PURE__*/React.createElement(__ds_scope.Button, {
    size: "sm",
    variant: "ghost",
    onClick: () => setZoom(z => Math.min(2.4, +(z + 0.2).toFixed(1))),
    title: "Zoom in"
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "zoom-in",
    size: 14
  })), /*#__PURE__*/React.createElement(__ds_scope.Button, {
    size: "sm",
    variant: "ghost",
    iconLeft: /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: "download",
      size: 14
    }),
    title: fileName
  }, "Original file")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      minHeight: 0,
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 76,
      flex: "0 0 76px",
      borderRight: "1px solid var(--border)",
      overflow: "auto",
      padding: 8,
      display: "grid",
      gap: 8,
      background: "var(--background)"
    }
  }, pages.map(p => /*#__PURE__*/React.createElement("button", {
    key: p.n,
    onClick: () => go(p.n),
    style: {
      padding: 0,
      cursor: "pointer",
      background: "var(--card)",
      border: `1px solid ${p.n === page ? "var(--primary)" : "var(--border)"}`,
      boxShadow: p.n === page ? "var(--focus-ring)" : "none",
      borderRadius: 3,
      overflow: "hidden",
      display: "block"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: p.imageUrl,
    alt: `Page ${p.n}`,
    style: {
      width: "100%",
      display: "block"
    }
  }), /*#__PURE__*/React.createElement("span", {
    className: "cs-num",
    style: {
      fontSize: 10,
      color: "var(--muted-foreground)",
      display: "block",
      padding: "2px 0"
    }
  }, p.n)))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0,
      overflow: "auto",
      background: "var(--background)",
      padding: 16,
      display: "flex",
      justifyContent: "center",
      alignItems: "flex-start"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      width: `${zoom * 100}%`,
      maxWidth: zoom <= 1 ? "100%" : "none",
      flex: "0 0 auto"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: current.imageUrl,
    alt: `Certificate page ${page}`,
    style: {
      width: "100%",
      display: "block",
      border: "1px solid var(--border)",
      background: "#fff"
    }
  }), showEvidence && pageHighlights.map(h => {
    const active = h.id === activeHighlightId;
    return /*#__PURE__*/React.createElement("span", {
      key: h.id,
      className: active ? "cs-pulse" : undefined,
      style: {
        position: "absolute",
        left: `${h.x * 100}%`,
        top: `${h.y * 100}%`,
        width: `${h.w * 100}%`,
        height: `${h.h * 100}%`,
        background: "var(--evidence)",
        outline: `1.5px solid ${active ? "var(--evidence-solid)" : "transparent"}`,
        borderRadius: 2,
        pointerEvents: "none"
      }
    });
  })))));
}
Object.assign(__ds_scope, { DocumentViewer });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/document/DocumentViewer.jsx", error: String((e && e.message) || e) }); }

// components/document/MaskedText.jsx
try { (() => {
function mask(value, kind) {
  if (!value) return "";
  if (kind === "email") {
    const [local, domain] = value.split("@");
    return `${local.slice(0, 1)}.•••@${domain || ""}`;
  }
  if (kind === "phone") return value.slice(0, 4) + " •• •• •• ••".slice(0, Math.max(0, value.length - 4));
  const parts = value.trim().split(/\s+/);
  return parts.map((p, i) => i === parts.length - 1 ? "•".repeat(Math.min(p.length, 6)) : p).join(" ");
}
function MaskedText({
  value,
  kind = "email",
  mono = true,
  onReveal,
  style
}) {
  const [revealed, setRevealed] = React.useState(false);
  const toggle = () => {
    if (!revealed) onReveal && onReveal(value);
    setRevealed(r => !r);
  };
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: mono ? "var(--font-mono)" : "var(--font-sans)",
      fontSize: 13,
      letterSpacing: revealed ? 0 : ".02em"
    }
  }, revealed ? value : mask(value, kind)), /*#__PURE__*/React.createElement("button", {
    onClick: toggle,
    "aria-label": revealed ? "Hide personal data" : "Reveal personal data",
    title: revealed ? "Hide" : "Reveal (logged)",
    style: {
      background: "transparent",
      border: "none",
      cursor: "pointer",
      color: "var(--muted-foreground)",
      padding: 0,
      display: "flex"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: revealed ? "eye-off" : "eye",
    size: 13
  })));
}
Object.assign(__ds_scope, { MaskedText });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/document/MaskedText.jsx", error: String((e && e.message) || e) }); }

// components/document/ProcessingStepper.jsx
try { (() => {
const PIPELINE_STEPS = ["Ingest", "Text layer / OCR", "Classify", "Extract (vision)", "Normalize & convert", "Verify insurer & entity", "Score", "Explain"];
function ProcessingStepper({
  steps = PIPELINE_STEPS,
  current = 0,
  timings = [],
  totalMs,
  style
}) {
  const total = totalMs != null ? totalMs : timings.slice(0, current).reduce((a, b) => a + (b || 0), 0);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gap: 2,
      ...style
    }
  }, steps.map((label, i) => {
    const done = i < current,
      active = i === current;
    const color = done ? "var(--status-go)" : active ? "var(--foreground)" : "var(--muted-foreground)";
    return /*#__PURE__*/React.createElement("div", {
      key: label,
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        height: 28,
        fontSize: 13,
        color,
        transition: "color var(--dur-step) var(--ease-out)"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 16,
        display: "flex",
        flex: "0 0 16px",
        color
      }
    }, done ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: "check",
      size: 14
    }) : active ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: "loader",
      size: 14
    }) : /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: "minus",
      size: 14
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        fontWeight: active ? 600 : 400
      }
    }, label), /*#__PURE__*/React.createElement("span", {
      className: "cs-num",
      style: {
        fontSize: 12,
        color: "var(--muted-foreground)"
      }
    }, done && timings[i] != null ? `${(timings[i] / 1000).toFixed(1)} s` : active ? "…" : ""));
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      marginTop: 6,
      paddingTop: 8,
      borderTop: "1px solid var(--border)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      fontSize: 12,
      color: "var(--muted-foreground)"
    }
  }, current >= steps.length ? "Analysis complete" : `Step ${Math.min(current + 1, steps.length)} of ${steps.length}`), /*#__PURE__*/React.createElement("span", {
    className: "cs-num",
    style: {
      fontSize: 14,
      fontWeight: 600
    }
  }, (total / 1000).toFixed(1), " s")), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 4,
      background: "var(--gap-track)",
      borderRadius: 2,
      overflow: "hidden",
      marginTop: 6
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: `${current / steps.length * 100}%`,
      height: "100%",
      background: "var(--gap-fill)",
      transition: "width var(--dur-step) var(--ease-out)"
    }
  })));
}
Object.assign(__ds_scope, { PIPELINE_STEPS, ProcessingStepper });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/document/ProcessingStepper.jsx", error: String((e && e.message) || e) }); }

// components/document/ProfileSwitcher.jsx
try { (() => {
function ProfileSwitcher({
  value,
  profiles = [],
  onChange,
  style
}) {
  const [open, setOpen] = React.useState(false);
  const active = profiles.find(p => p.id === value) || profiles[0] || {};
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      ...style
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setOpen(o => !o),
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      height: 32,
      padding: "0 10px",
      background: "var(--card)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius)",
      cursor: "pointer",
      font: "inherit",
      fontSize: 13,
      color: "var(--foreground)"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "sliders-horizontal",
    size: 14,
    color: "var(--muted-foreground)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--muted-foreground)"
    }
  }, "Profile"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 500
    }
  }, active.label), active.version && /*#__PURE__*/React.createElement("span", {
    className: "cs-code"
  }, active.version), /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "chevron-down",
    size: 14,
    color: "var(--muted-foreground)"
  })), open && /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      top: "calc(100% + 4px)",
      left: 0,
      zIndex: 50,
      minWidth: 280,
      background: "var(--popover)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius)",
      boxShadow: "var(--shadow-popover)",
      padding: 4
    }
  }, profiles.map(p => /*#__PURE__*/React.createElement("button", {
    key: p.id,
    onClick: () => {
      onChange && onChange(p.id);
      setOpen(false);
    },
    style: {
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      gap: 2,
      width: "100%",
      padding: "8px 10px",
      background: p.id === value ? "var(--accent)" : "transparent",
      border: "none",
      borderRadius: "var(--radius-sm)",
      cursor: "pointer",
      textAlign: "left",
      font: "inherit"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 6,
      fontSize: 13,
      fontWeight: 500
    }
  }, p.label, p.version && /*#__PURE__*/React.createElement("span", {
    className: "cs-code"
  }, p.version)), p.note && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: "var(--muted-foreground)"
    }
  }, p.note)))));
}
Object.assign(__ds_scope, { ProfileSwitcher });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/document/ProfileSwitcher.jsx", error: String((e && e.message) || e) }); }

// components/document/RequestEmailSheet.jsx
try { (() => {
function buildRequestEmail({
  supplier,
  contact = "Sir or Madam",
  policyNumber,
  insurer,
  validUntil,
  formalPoints = [],
  coveragePoints = [],
  dueDate,
  buyer = "FORVIA Purchasing"
}) {
  const block = (title, lines) => lines.length ? `${title}\n${lines.map(l => `- ${l}`).join("\n")}\n\n` : "";
  return `Subject: FORVIA — insurance certificate for ${supplier}: corrections required

Dear ${contact},

As part of FORVIA's supplier qualification, we reviewed the insurance certificate you provided
(policy ${policyNumber || "—"}, ${insurer || "—"}, valid until ${validUntil || "—"}). To be accepted under FORVIA's General Purchasing
Terms and Conditions, the following points must be addressed:

${block("Formal requirements", formalPoints)}${block("Coverage requirements (per FORVIA GPTC)", coveragePoints)}Please send an updated certificate via SAP Ariba by ${dueDate || "—"}. Do not hesitate to forward this message to your insurer or broker.

Kind regards,
${buyer} — FORVIA Purchasing`;
}

/** Capitalized alias — the bundle namespace only exposes capitalized exports. */
const BuildRequestEmail = buildRequestEmail;
function RequestEmailSheet({
  open,
  onClose,
  email,
  onChange,
  onCopy,
  onDownload,
  supplier,
  style
}) {
  const [copied, setCopied] = React.useState(false);
  const copy = () => {
    if (navigator.clipboard) navigator.clipboard.writeText(email || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
    onCopy && onCopy();
  };
  return /*#__PURE__*/React.createElement(__ds_scope.Sheet, {
    open: open,
    onClose: onClose,
    width: 560,
    style: style,
    title: "Request changes",
    subtitle: `Generated from the findings${supplier ? ` · ${supplier}` : ""} · editable · nothing is sent in the POC`,
    footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(__ds_scope.Button, {
      iconLeft: /*#__PURE__*/React.createElement(__ds_scope.Icon, {
        name: "copy",
        size: 14
      }),
      onClick: copy
    }, copied ? "Copied" : "Copy"), /*#__PURE__*/React.createElement(__ds_scope.Button, {
      variant: "primary",
      iconLeft: /*#__PURE__*/React.createElement(__ds_scope.Icon, {
        name: "download",
        size: 14
      }),
      onClick: onDownload
    }, "Download .eml"))
  }, /*#__PURE__*/React.createElement(__ds_scope.Input, {
    multiline: true,
    rows: 22,
    mono: true,
    value: email,
    onChange: onChange,
    style: {
      fontSize: 12,
      lineHeight: 1.6,
      height: "100%",
      minHeight: 420
    }
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 12,
      color: "var(--muted-foreground)",
      marginTop: 10,
      lineHeight: 1.45
    }
  }, "Every bracketed point comes from a finding. Editing the text here does not change the analysis."));
}
Object.assign(__ds_scope, { buildRequestEmail, BuildRequestEmail, RequestEmailSheet });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/document/RequestEmailSheet.jsx", error: String((e && e.message) || e) }); }

// components/verdict/ConfidenceDot.jsx
try { (() => {
function ConfidenceDot({
  value = 0,
  size = 10,
  showValue,
  page,
  quote,
  style
}) {
  const level = value >= 0.85 ? "high" : value >= 0.6 ? "mid" : "low";
  const color = level === "high" ? "var(--foreground)" : level === "mid" ? "var(--muted-foreground)" : "var(--muted-foreground)";
  const glyph = /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 5
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size,
    viewBox: "0 0 10 10",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "5",
    cy: "5",
    r: "4",
    fill: level === "high" ? color : "none",
    stroke: color,
    strokeWidth: "1.25"
  }), level === "mid" && /*#__PURE__*/React.createElement("path", {
    d: "M5 1 A4 4 0 0 0 5 9 Z",
    fill: color
  })), showValue && /*#__PURE__*/React.createElement("span", {
    className: "cs-num",
    style: {
      fontSize: 12,
      color: "var(--muted-foreground)"
    }
  }, Math.round(value * 100), " %"));
  const tip = page || quote ? /*#__PURE__*/React.createElement(React.Fragment, null, page != null && /*#__PURE__*/React.createElement(React.Fragment, null, "Page ", page), page != null && quote ? " · " : "", quote && /*#__PURE__*/React.createElement("em", null, "\xAB ", quote, " \xBB"), /*#__PURE__*/React.createElement("br", null), "Confidence ", Math.round(value * 100), " %") : `Confidence ${Math.round(value * 100)} %`;
  return /*#__PURE__*/React.createElement(__ds_scope.Tooltip, {
    content: tip,
    style: style
  }, glyph);
}
Object.assign(__ds_scope, { ConfidenceDot });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/verdict/ConfidenceDot.jsx", error: String((e && e.message) || e) }); }

// components/coverage/CoverageGrid.jsx
try { (() => {
const eur = v => v == null ? "—" : "€" + v.toLocaleString("en-US");
const eurC = v => v >= 1e6 ? `€${+(v / 1e6).toFixed(v % 1e6 ? 1 : 0)}M` : v >= 1e3 ? `€${Math.round(v / 1e3)}k` : `€${v}`;
const STATUS_TEXT = {
  COMPLIANT: ["Compliant", "var(--status-go)"],
  BELOW_MINIMUM: ["Below minimum", "var(--status-red)"],
  MISSING: ["Missing", "var(--status-red)"],
  COVERED_NO_AMOUNT: ["Covered, no amount", "var(--status-amber)"],
  EXCLUDED: ["Excluded", "var(--status-red)"],
  UNCLEAR: ["Unclear", "var(--status-review)"],
  PRESENT: ["Present", "var(--status-neutral)"]
};
function SectionRow({
  label
}) {
  return /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
    colSpan: 3,
    style: {
      padding: "10px 12px 4px",
      fontSize: 11,
      letterSpacing: ".04em",
      textTransform: "uppercase",
      color: "var(--muted-foreground)",
      background: "var(--background)",
      borderBottom: "1px solid var(--border)"
    }
  }, label));
}

/** Compact 4-column grid: Guarantee (with requirement), Found, Against requirement, Confidence.
    Original value + FX live in the Found tooltip; territory becomes an icon only when excluded. */
function CoverageGrid({
  rows = [],
  onEvidenceClick,
  activeId,
  style
}) {
  const head = {
    position: "sticky",
    top: 0,
    zIndex: 2,
    background: "var(--card)",
    borderBottom: "1px solid var(--border)",
    fontWeight: 500,
    fontSize: 11,
    color: "var(--muted-foreground)",
    padding: "0 10px",
    height: 30,
    textAlign: "left",
    whiteSpace: "nowrap"
  };
  const cell = {
    padding: "8px 10px",
    borderBottom: "1px solid var(--border)",
    verticalAlign: "middle"
  };
  const groups = [["critical", "Critical guarantees"], ["secondary", "Secondary guarantees"], ["other", "Other guarantees found"]];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      overflow: "auto",
      ...style
    }
  }, /*#__PURE__*/React.createElement("table", {
    style: {
      width: "100%",
      fontSize: "var(--text-dense)",
      tableLayout: "auto"
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", {
    style: head
  }, "Guarantee"), /*#__PURE__*/React.createElement("th", {
    style: {
      ...head,
      textAlign: "right"
    }
  }, "Found"), /*#__PURE__*/React.createElement("th", {
    style: {
      ...head,
      width: "34%"
    }
  }, "Against requirement"))), /*#__PURE__*/React.createElement("tbody", null, groups.map(([g, label]) => {
    const items = rows.filter(r => (r.group || "critical") === g);
    if (!items.length) return null;
    return /*#__PURE__*/React.createElement(React.Fragment, {
      key: g
    }, /*#__PURE__*/React.createElement(SectionRow, {
      label: label
    }), items.map(r => {
      const [txt, col] = STATUS_TEXT[r.status] || STATUS_TEXT.PRESENT;
      const active = activeId && activeId === r.id;
      const originalDiffers = r.foundOriginal && r.foundEur != null && !r.foundOriginal.startsWith("€");
      return /*#__PURE__*/React.createElement("tr", {
        key: r.id,
        style: {
          background: active ? "var(--accent)" : "transparent",
          transition: "background var(--dur-recolour) var(--ease-standard)"
        }
      }, /*#__PURE__*/React.createElement("td", {
        style: {
          ...cell,
          minWidth: 140
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          fontWeight: 500,
          display: "flex",
          alignItems: "center",
          gap: 6
        }
      }, /*#__PURE__*/React.createElement("span", null, r.guarantee), r.territoryExcluded && /*#__PURE__*/React.createElement(__ds_scope.Tooltip, {
        content: /*#__PURE__*/React.createElement(React.Fragment, null, "Territory: ", r.territory || "exclusion applies")
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          color: "var(--status-red)",
          display: "inline-flex"
        }
      }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
        name: "globe",
        size: 13
      })))), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 11,
          color: "var(--muted-foreground)",
          marginTop: 2
        }
      }, r.required ? /*#__PURE__*/React.createElement("span", {
        className: "cs-num"
      }, "required ", eur(r.required)) : r.basis || "no threshold", r.required && r.basis ? /*#__PURE__*/React.createElement("span", null, " \xB7 ", r.basis) : null, r.deductible ? /*#__PURE__*/React.createElement("span", null, " \xB7 deductible ", r.deductible) : null)), /*#__PURE__*/React.createElement("td", {
        style: {
          ...cell,
          textAlign: "right",
          whiteSpace: "nowrap"
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          display: "inline-flex",
          alignItems: "center",
          gap: 6
        }
      }, r.foundEur != null ? /*#__PURE__*/React.createElement(__ds_scope.Tooltip, {
        side: "left",
        content: /*#__PURE__*/React.createElement(React.Fragment, null, originalDiffers ? /*#__PURE__*/React.createElement(React.Fragment, null, r.foundOriginal, " \u2192 ", eur(r.foundEur), /*#__PURE__*/React.createElement("br", null)) : null, r.fxNote || (originalDiffers ? null : "As stated on the certificate"), r.page != null ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("br", null), "Page ", r.page) : null)
      }, /*#__PURE__*/React.createElement("span", {
        onClick: onEvidenceClick ? () => onEvidenceClick(r) : undefined,
        style: {
          cursor: onEvidenceClick ? "pointer" : "default",
          display: "inline-block"
        }
      }, /*#__PURE__*/React.createElement("span", {
        className: "cs-num",
        style: {
          borderBottom: "1px dotted var(--muted-foreground)",
          fontSize: 13
        }
      }, eur(r.foundEur)), originalDiffers && /*#__PURE__*/React.createElement("span", {
        className: "cs-num",
        style: {
          display: "block",
          fontSize: 10,
          color: "var(--muted-foreground)",
          marginTop: 1
        }
      }, r.foundOriginal))) : /*#__PURE__*/React.createElement("span", {
        style: {
          color: col,
          fontSize: 12,
          fontWeight: 500
        }
      }, txt), r.confidence != null && /*#__PURE__*/React.createElement(__ds_scope.ConfidenceDot, {
        value: r.confidence,
        page: r.page,
        quote: r.quote
      }))), /*#__PURE__*/React.createElement("td", {
        style: cell
      }, r.status === "COMPLIANT" ? /*#__PURE__*/React.createElement("span", {
        style: {
          display: "inline-flex",
          alignItems: "center",
          gap: 5,
          color: "var(--status-go)",
          fontSize: 12,
          fontWeight: 500,
          whiteSpace: "nowrap"
        }
      }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
        name: "check",
        size: 13
      }), "Meets ", r.required ? eurC(r.required) : "requirement") : r.status === "PRESENT" ? /*#__PURE__*/React.createElement("span", {
        style: {
          color: "var(--muted-foreground)",
          fontSize: 12
        }
      }, "\u2014") : /*#__PURE__*/React.createElement(__ds_scope.GapBar, {
        found: r.foundEur,
        required: r.required,
        status: r.status,
        width: 110,
        stacked: true,
        onClick: onEvidenceClick ? () => onEvidenceClick(r) : undefined
      })));
    }));
  }))));
}
Object.assign(__ds_scope, { CoverageGrid });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/coverage/CoverageGrid.jsx", error: String((e && e.message) || e) }); }

// components/verdict/DecisionChip.jsx
try { (() => {
const MAP = {
  GO: {
    label: "Compliant",
    tone: "go",
    icon: "shield-check",
    variant: "solid"
  },
  REQUEST_CHANGES: {
    label: "Request changes",
    tone: "amber",
    icon: "shield-alert",
    variant: "solid"
  },
  FORMAL_DEFECT: {
    label: "Not admissible · resubmit",
    tone: "red",
    icon: "shield-x",
    variant: "outline"
  },
  STRUCTURAL: {
    label: "Not admissible",
    tone: "red",
    icon: "shield-x",
    variant: "solid"
  },
  NEEDS_REVIEW: {
    label: "Needs review",
    tone: "review",
    icon: "eye",
    variant: "solid"
  },
  PROCESSING: {
    label: "Analysing…",
    tone: "neutral",
    icon: "loader",
    variant: "solid"
  },
  PENDING: {
    label: "Awaiting certificate",
    tone: "neutral",
    icon: "file-question-mark",
    variant: "dashed"
  }
};
const TONES = {
  go: ["var(--status-go)", "var(--status-go-bg)"],
  amber: ["var(--status-amber)", "var(--status-amber-bg)"],
  red: ["var(--status-red)", "var(--status-red-bg)"],
  review: ["var(--status-review)", "var(--status-review-bg)"],
  neutral: ["var(--status-neutral)", "var(--status-neutral-bg)"]
};
const SIZES = {
  sm: {
    h: 20,
    fs: 12,
    ic: 12,
    pad: "0 8px"
  },
  md: {
    h: 24,
    fs: 13,
    ic: 13,
    pad: "0 10px"
  },
  lg: {
    h: 28,
    fs: 14,
    ic: 15,
    pad: "0 12px"
  }
};
function DecisionChip({
  decision = "GO",
  size = "md",
  label,
  style
}) {
  const m = MAP[decision] || MAP.GO;
  const [fg, bg] = TONES[m.tone];
  const s = SIZES[size] || SIZES.md;
  const outline = m.variant === "outline";
  const dashed = m.variant === "dashed";
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      height: s.h,
      padding: s.pad,
      borderRadius: "var(--radius-full)",
      fontSize: s.fs,
      fontWeight: 500,
      lineHeight: 1,
      whiteSpace: "nowrap",
      color: fg,
      background: outline || dashed ? "transparent" : bg,
      border: `1px ${dashed ? "dashed" : "solid"} ${outline || dashed ? fg : "transparent"}`,
      ...style
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: m.icon,
    size: s.ic
  }), label || m.label);
}
Object.assign(__ds_scope, { DecisionChip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/verdict/DecisionChip.jsx", error: String((e && e.message) || e) }); }

// components/verdict/ScoreRing.jsx
try { (() => {
/**
 * Risk score 0–100, drawn as a broad open arc (240°) with rounded caps — big, graphic, ink-first.
 * Provisional (not admissible): grey, dashed track, explicit label.
 */
function ScoreRing({
  value = 0,
  size = 104,
  provisional,
  label = "Risk score",
  onClick,
  style
}) {
  const stroke = Math.max(7, Math.round(size / 11));
  const r = (size - stroke) / 2;
  const SWEEP = 240;
  const start = 90 + (360 - SWEEP) / 2; // gap opens at the bottom
  const polar = a => {
    const rad = (a - 90) * Math.PI / 180;
    return [size / 2 + r * Math.cos(rad), size / 2 + r * Math.sin(rad)];
  };
  const arc = (a0, a1) => {
    const [x0, y0] = polar(a0),
      [x1, y1] = polar(a1);
    return `M ${x0} ${y0} A ${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1} ${y1}`;
  };
  const pct = Math.max(0, Math.min(100, value)) / 100;
  const ink = provisional ? "var(--muted-foreground)" : "var(--foreground)";
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    role: "img",
    "aria-label": `${label} ${value} of 100${provisional ? ", provisional" : ""}`,
    style: {
      display: "inline-flex",
      flexDirection: "column",
      alignItems: "center",
      cursor: onClick ? "pointer" : "default",
      ...style
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size * 0.92,
    viewBox: `0 0 ${size} ${size * 0.92}`,
    style: {
      overflow: "visible"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: arc(start, start + SWEEP),
    fill: "none",
    stroke: "var(--gap-track)",
    strokeWidth: stroke,
    strokeLinecap: "round",
    strokeDasharray: provisional ? "0.5 7" : undefined
  }), pct > 0 && /*#__PURE__*/React.createElement("path", {
    d: arc(start, start + SWEEP * pct),
    fill: "none",
    stroke: ink,
    strokeWidth: stroke,
    strokeLinecap: "round",
    opacity: provisional ? 0.5 : 1,
    style: {
      transition: "opacity 150ms var(--ease-standard)"
    }
  }), /*#__PURE__*/React.createElement("text", {
    x: size / 2,
    y: size / 2 + size * 0.02,
    textAnchor: "middle",
    fontFamily: "var(--font-mono)",
    fontWeight: "600",
    fontSize: size * 0.30,
    fill: ink,
    style: {
      letterSpacing: "-0.03em"
    }
  }, value), /*#__PURE__*/React.createElement("text", {
    x: size / 2,
    y: size / 2 + size * 0.17,
    textAnchor: "middle",
    fontFamily: "var(--font-mono)",
    fontSize: size * 0.095,
    fill: "var(--muted-foreground)"
  }, "/ 100")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 2,
      fontSize: 11,
      fontWeight: provisional ? 400 : 500,
      color: onClick && hover ? "var(--primary)" : "var(--muted-foreground)",
      textAlign: "center",
      maxWidth: size + 70,
      lineHeight: 1.35,
      transition: "color 120ms var(--ease-standard)"
    }
  }, provisional ? "Provisional — shown for information" : label, onClick && !provisional ? " ›" : ""));
}
Object.assign(__ds_scope, { ScoreRing });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/verdict/ScoreRing.jsx", error: String((e && e.message) || e) }); }

// components/verdict/StatusMiniGrid.jsx
try { (() => {
const STATE = {
  COMPLIANT: {
    mark: "✓",
    fg: "var(--status-go)",
    bg: "var(--status-go-bg)"
  },
  BELOW_MINIMUM: {
    mark: "✗",
    fg: "var(--status-red)",
    bg: "var(--status-red-bg)"
  },
  MISSING: {
    mark: "–",
    fg: "var(--status-red)",
    bg: "var(--status-red-bg)"
  },
  COVERED_NO_AMOUNT: {
    mark: "≈",
    fg: "var(--status-amber)",
    bg: "var(--status-amber-bg)"
  },
  EXCLUDED: {
    mark: "✗",
    fg: "var(--status-red)",
    bg: "var(--status-red-bg)"
  },
  UNCLEAR: {
    mark: "?",
    fg: "var(--status-review)",
    bg: "var(--status-review-bg)"
  },
  PRESENT: {
    mark: "•",
    fg: "var(--status-neutral)",
    bg: "var(--status-neutral-bg)"
  }
};
const LABEL = {
  pl: "Product liability",
  recall: "Product recall",
  pfl: "Pure financial loss"
};
function StatusMiniGrid({
  pl,
  recall,
  pfl,
  tooltips = {},
  style
}) {
  const cells = [["pl", pl], ["recall", recall], ["pfl", pfl]];
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      gap: 2,
      ...style
    }
  }, cells.map(([key, st]) => {
    const s = STATE[st] || STATE.PRESENT;
    const cell = /*#__PURE__*/React.createElement("span", {
      style: {
        width: 16,
        height: 16,
        borderRadius: 3,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        background: s.bg,
        color: s.fg,
        fontFamily: "var(--font-mono)",
        fontSize: 11,
        fontWeight: 600,
        lineHeight: 1
      }
    }, s.mark);
    const tip = tooltips[key] || `${LABEL[key]} · ${String(st || "").toLowerCase().replace(/_/g, " ")}`;
    return /*#__PURE__*/React.createElement(__ds_scope.Tooltip, {
      key: key,
      content: tip
    }, cell);
  }));
}
Object.assign(__ds_scope, { StatusMiniGrid });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/verdict/StatusMiniGrid.jsx", error: String((e && e.message) || e) }); }

// components/verdict/VerificationSeal.jsx
try { (() => {
/** The 8 admissibility gates, in fixed order. */
const SEAL_GATES = [{
  id: "stamp",
  label: "Insurer stamp"
}, {
  id: "signature",
  label: "Insurer signature"
}, {
  id: "insurer",
  label: "Issuer is the insurer"
}, {
  id: "policyNumber",
  label: "Policy number"
}, {
  id: "dates",
  label: "Validity dates"
}, {
  id: "entity",
  label: "Contracting entity"
}, {
  id: "coinsurance",
  label: "Co-insurance shares"
}, {
  id: "documentType",
  label: "Document type"
}];
const COLOR = {
  pass: "var(--status-go)",
  fail: "var(--status-red)",
  review: "var(--status-review)",
  na: "var(--muted-foreground)"
};
function VerificationSeal({
  gates = {},
  size = 96,
  admissible,
  onGateClick,
  style
}) {
  const r = size / 2;
  const ringR = r - (size >= 72 ? 9 : 5);
  const tickLen = size >= 72 ? 7 : 4;
  const failing = SEAL_GATES.filter(g => (gates[g.id] || {}).state === "fail").length;
  const isAdmissible = admissible != null ? admissible : failing === 0;
  const centreColor = isAdmissible ? "var(--status-go)" : "var(--status-red)";
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "inline-flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 4,
      ...style
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size,
    viewBox: `0 0 ${size} ${size}`,
    role: "img",
    "aria-label": `${isAdmissible ? "Admissible" : "Not admissible"} — ${8 - failing} of 8 checks passed`
  }, /*#__PURE__*/React.createElement("circle", {
    cx: r,
    cy: r,
    r: ringR,
    fill: "none",
    stroke: "var(--border)",
    strokeWidth: "1"
  }), SEAL_GATES.map((g, i) => {
    const st = (gates[g.id] || {}).state || "na";
    const a = i / SEAL_GATES.length * Math.PI * 2 - Math.PI / 2;
    const x1 = r + Math.cos(a) * ringR,
      y1 = r + Math.sin(a) * ringR;
    const x2 = r + Math.cos(a) * (ringR + tickLen),
      y2 = r + Math.sin(a) * (ringR + tickLen);
    return /*#__PURE__*/React.createElement("g", {
      key: g.id,
      onClick: onGateClick ? () => onGateClick(g.id) : undefined,
      style: {
        cursor: onGateClick ? "pointer" : "default"
      }
    }, /*#__PURE__*/React.createElement("line", {
      x1: x1,
      y1: y1,
      x2: x2,
      y2: y2,
      stroke: COLOR[st],
      strokeWidth: st === "na" ? 1.5 : 2.5,
      strokeLinecap: "round"
    }), size >= 72 && st !== "na" && /*#__PURE__*/React.createElement("circle", {
      cx: x2 + Math.cos(a) * 3,
      cy: y2 + Math.sin(a) * 3,
      r: "1.6",
      fill: COLOR[st]
    }));
  }), size >= 72 ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("text", {
    x: r,
    y: r - 2,
    textAnchor: "middle",
    fontFamily: "var(--font-mono)",
    fontSize: size * 0.24,
    fontWeight: "600",
    fill: centreColor,
    style: {
      letterSpacing: "-0.02em"
    }
  }, 8 - failing, /*#__PURE__*/React.createElement("tspan", {
    fontSize: size * 0.15,
    fill: "var(--muted-foreground)"
  }, "/8")), /*#__PURE__*/React.createElement("text", {
    x: r,
    y: r + size * 0.16,
    textAnchor: "middle",
    fontFamily: "var(--font-sans)",
    fontSize: size * 0.105,
    fill: "var(--muted-foreground)"
  }, isAdmissible ? "Admissible" : "Not admissible")) : /*#__PURE__*/React.createElement("text", {
    x: r,
    y: r + size * 0.115,
    textAnchor: "middle",
    fontFamily: "var(--font-mono)",
    fontSize: size * 0.34,
    fontWeight: "600",
    fill: centreColor
  }, 8 - failing)));
}

/** The checklist the seal summarises — always shown next to it on the Summary tab. */
function VerificationSealList({
  gates = {},
  onGateClick,
  style
}) {
  return /*#__PURE__*/React.createElement("ul", {
    style: {
      listStyle: "none",
      margin: 0,
      padding: 0,
      display: "grid",
      gap: 6,
      ...style
    }
  }, SEAL_GATES.map(g => {
    const e = gates[g.id] || {};
    const st = e.state || "na";
    const mark = st === "pass" ? "✓" : st === "fail" ? "✗" : st === "review" ? "?" : "–";
    return /*#__PURE__*/React.createElement("li", {
      key: g.id,
      onClick: onGateClick ? () => onGateClick(g.id) : undefined,
      style: {
        display: "flex",
        gap: 8,
        alignItems: "baseline",
        fontSize: 13,
        cursor: onGateClick ? "pointer" : "default"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: COLOR[st],
        fontFamily: "var(--font-mono)",
        fontWeight: 600,
        width: 12,
        flex: "0 0 12px"
      }
    }, mark), /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: 500,
        flex: "0 0 auto"
      }
    }, g.label), e.note && /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--muted-foreground)",
        minWidth: 0
      }
    }, "\u2014 ", e.note));
  }));
}
Object.assign(__ds_scope, { SEAL_GATES, VerificationSeal, VerificationSealList });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/verdict/VerificationSeal.jsx", error: String((e && e.message) || e) }); }

// ui_kits/coverscan/AppShell.jsx
try { (() => {
/* CoverScan app shell — sidebar, header, role and profile switches. */
const DS_shell = window.CoverScanDesignSystem_6debdf || {};
const {
  Icon: ShIcon,
  Input: ShInput,
  Select: ShSelect,
  ProfileSwitcher: ShProfile,
  Button: ShButton
} = DS_shell;
const NAV = [{
  group: "Monitor",
  items: [{
    id: "portfolio",
    label: "Portfolio",
    icon: "layout-dashboard"
  }, {
    id: "certificates",
    label: "Certificates",
    icon: "table"
  }, {
    id: "review",
    label: "Review queue",
    icon: "eye",
    count: 16
  }]
}, {
  group: "Manage",
  items: [{
    id: "suppliers",
    label: "Suppliers",
    icon: "users"
  }, {
    id: "requirements",
    label: "Requirements",
    icon: "sliders-horizontal"
  }, {
    id: "integrations",
    label: "Integrations",
    icon: "plug"
  }]
}];
function Sidebar({
  route,
  onNavigate,
  collapsed,
  onToggle
}) {
  const w = collapsed ? "var(--sidebar-w-collapsed)" : "var(--sidebar-w)";
  return /*#__PURE__*/React.createElement("nav", {
    style: {
      width: w,
      flex: `0 0 ${w}`,
      borderRight: "1px solid var(--border)",
      background: "var(--card)",
      display: "flex",
      flexDirection: "column",
      transition: "width 150ms var(--ease-standard)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: "var(--header-h)",
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "0 14px",
      borderBottom: "1px solid var(--border)"
    }
  }, collapsed ? /*#__PURE__*/React.createElement("img", {
    src: "../../assets/logo-mark.svg",
    alt: "FORVIA",
    style: {
      height: 16,
      display: "block"
    }
  }) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/logo-wordmark.png",
    alt: "FORVIA",
    style: {
      height: 14,
      display: "block"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 1,
      height: 18,
      background: "var(--border)"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 600
    }
  }, "CoverScan"))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "12px 10px",
      display: "grid",
      gap: 4,
      flex: 1,
      alignContent: "start"
    }
  }, NAV.map(g => /*#__PURE__*/React.createElement(React.Fragment, {
    key: g.group
  }, !collapsed && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      fontWeight: 600,
      letterSpacing: ".08em",
      textTransform: "uppercase",
      color: "var(--muted-foreground)",
      padding: "10px 10px 4px"
    }
  }, g.group), collapsed && /*#__PURE__*/React.createElement("div", {
    style: {
      height: 8
    }
  }), g.items.map(n => {
    const active = n.id === route;
    return /*#__PURE__*/React.createElement("button", {
      key: n.id,
      onClick: () => onNavigate(n.id),
      title: n.label,
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        height: 36,
        padding: "0 10px",
        background: active ? "var(--accent)" : "transparent",
        color: active ? "var(--primary)" : "var(--foreground)",
        border: "none",
        borderRadius: "var(--radius)",
        cursor: "pointer",
        font: "inherit",
        fontSize: 13,
        fontWeight: active ? 600 : 450,
        textAlign: "left",
        width: "100%",
        transition: "background 120ms var(--ease-standard)"
      },
      onMouseEnter: e => {
        if (!active) e.currentTarget.style.background = "var(--muted)";
      },
      onMouseLeave: e => {
        if (!active) e.currentTarget.style.background = active ? "var(--accent)" : "transparent";
      }
    }, /*#__PURE__*/React.createElement(ShIcon, {
      name: n.icon,
      size: 15
    }), !collapsed && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1
      }
    }, n.label), n.count != null && /*#__PURE__*/React.createElement("span", {
      style: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: 20,
        height: 18,
        padding: "0 5px",
        borderRadius: "var(--radius-full)",
        background: "var(--status-review-bg)",
        color: "var(--status-review)",
        fontFamily: "var(--font-mono)",
        fontSize: 10,
        fontWeight: 600
      }
    }, n.count)));
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 8,
      borderTop: "1px solid var(--border)"
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onToggle,
    title: "Collapse sidebar",
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      height: 30,
      width: "100%",
      padding: "0 8px",
      background: "transparent",
      border: "none",
      borderRadius: "var(--radius)",
      cursor: "pointer",
      color: "var(--muted-foreground)",
      font: "inherit",
      fontSize: 12
    }
  }, /*#__PURE__*/React.createElement(ShIcon, {
    name: "panel-left",
    size: 15
  }), !collapsed && "Collapse")));
}
function Header({
  role,
  onRole,
  profile,
  onProfile,
  profiles,
  onUpload,
  theme,
  onTheme
}) {
  return /*#__PURE__*/React.createElement("header", {
    style: {
      height: "var(--header-h)",
      flex: "0 0 var(--header-h)",
      borderBottom: "1px solid var(--border)",
      background: "var(--card)",
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "0 16px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 320
    }
  }, /*#__PURE__*/React.createElement(ShInput, {
    size: "sm",
    iconLeft: /*#__PURE__*/React.createElement(ShIcon, {
      name: "search",
      size: 14
    }),
    placeholder: "Search supplier or policy number",
    style: {
      borderRadius: "var(--radius-full)",
      paddingLeft: 12
    }
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement("span", {
    title: "All dates in the demo are computed against this reference date",
    style: {
      fontSize: 11,
      color: "var(--muted-foreground)",
      display: "inline-flex",
      alignItems: "center",
      gap: 5
    }
  }, /*#__PURE__*/React.createElement(ShIcon, {
    name: "clock",
    size: 12
  }), /*#__PURE__*/React.createElement("span", {
    className: "cs-num"
  }, "15 Apr 2025")), /*#__PURE__*/React.createElement(ShProfile, {
    value: profile,
    profiles: profiles,
    onChange: onProfile
  }), /*#__PURE__*/React.createElement(ShSelect, {
    size: "sm",
    value: role,
    onChange: onRole,
    options: ["Buyer", "Insurance analyst", "Director", "Admin"]
  }), /*#__PURE__*/React.createElement(ShButton, {
    size: "sm",
    variant: "primary",
    iconLeft: /*#__PURE__*/React.createElement(ShIcon, {
      name: "upload",
      size: 14
    }),
    onClick: onUpload
  }, "Upload"), /*#__PURE__*/React.createElement(ShButton, {
    size: "sm",
    variant: "ghost",
    title: "Toggle dark theme",
    onClick: onTheme
  }, /*#__PURE__*/React.createElement(ShIcon, {
    name: theme === "dark" ? "eye" : "eye-off",
    size: 14
  })));
}
function PageHeading({
  title,
  sub,
  actions
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-start",
      gap: 12,
      padding: "18px 24px 0"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: "var(--text-h1)"
    }
  }, title), sub && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: "var(--muted-foreground)",
      marginTop: 4
    }
  }, sub)), actions && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      alignItems: "center"
    }
  }, actions));
}
Object.assign(window, {
  Sidebar,
  Header,
  PageHeading,
  NAV
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/coverscan/AppShell.jsx", error: String((e && e.message) || e) }); }

// ui_kits/coverscan/CertificateScreen.jsx
try { (() => {
/* Screen 1 (the core) — Certificate analysis: document left, FORVIA grid right, one decision. */
const DS_ca = window.CoverScanDesignSystem_6debdf || {};
const {
  DocumentViewer,
  CoverageGrid,
  FindingsList,
  VerificationSeal,
  VerificationSealList,
  ScoreRing,
  DecisionChip: CaChip,
  Badge: CaBadge,
  Button: CaButton,
  Icon: CaIcon,
  Tabs: CaTabs,
  Card: CaCard,
  Tooltip: CaTooltip,
  ConfidenceDot: CaDot,
  ProcessingStepper,
  RequestEmailSheet,
  BuildRequestEmail,
  MaskedText: CaMasked,
  Input: CaInput,
  Select: CaSelect,
  GapBar: CaGap
} = DS_ca;
const caBuildEmail = BuildRequestEmail || (i => {
  const block = (t, l) => l && l.length ? `${t}\n${l.map(x => `- ${x}`).join("\n")}\n\n` : "";
  return `Subject: FORVIA — insurance certificate for ${i.supplier}: corrections required\n\nDear ${i.contact || "Sir or Madam"},\n\nAs part of FORVIA's supplier qualification, we reviewed the insurance certificate you provided\n(policy ${i.policyNumber || "—"}, ${i.insurer || "—"}, valid until ${i.validUntil || "—"}). To be accepted under FORVIA's General Purchasing\nTerms and Conditions, the following points must be addressed:\n\n${block("Formal requirements", i.formalPoints)}${block("Coverage requirements (per FORVIA GPTC)", i.coveragePoints)}Please send an updated certificate via SAP Ariba by ${i.dueDate || "—"}. Do not hesitate to forward this message to your insurer or broker.\n\nKind regards,\n${i.buyer || "FORVIA Purchasing"} — FORVIA Purchasing`;
});
function TopBar({
  c,
  effectiveDecision
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "12px 24px",
      borderBottom: "1px solid var(--border)",
      background: "var(--card)",
      display: "flex",
      alignItems: "center",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: "var(--text-h2)"
    }
  }, c.supplier), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: "var(--muted-foreground)"
    }
  }, c.country), /*#__PURE__*/React.createElement("span", {
    className: "cs-code"
  }, c.aribaId)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      marginTop: 4,
      fontSize: 12,
      color: "var(--muted-foreground)",
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 5
    }
  }, /*#__PURE__*/React.createElement(CaIcon, {
    name: "building-2",
    size: 12
  }), c.insurer), /*#__PURE__*/React.createElement(CaBadge, {
    tone: "ink",
    mono: true
  }, c.rating), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 5
    }
  }, /*#__PURE__*/React.createElement(CaIcon, {
    name: "hash",
    size: 12
  }), /*#__PURE__*/React.createElement("span", {
    className: "cs-num"
  }, c.policyNumber)), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 5
    }
  }, /*#__PURE__*/React.createElement(CaIcon, {
    name: "calendar-clock",
    size: 12
  }), /*#__PURE__*/React.createElement("span", {
    className: "cs-num"
  }, c.expiry), c.expiryDays != null && /*#__PURE__*/React.createElement("span", {
    style: {
      color: c.expiryDays < 0 ? "var(--status-red)" : undefined
    }
  }, "\xB7 ", c.expiryDays < 0 ? "expired" : `valid · ${c.expiryDays} days left`)))), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement("div", {
    title: `Profile GPTC default v3 · reference date ${c.received} · model ${c.model} · run ${c.runId}`,
    style: {
      textAlign: "right",
      fontSize: 11,
      color: "var(--muted-foreground)",
      lineHeight: 1.4,
      maxWidth: 180
    }
  }, "Analysed in ", /*#__PURE__*/React.createElement("span", {
    className: "cs-num"
  }, c.seconds, " s"), /*#__PURE__*/React.createElement("br", null), "GPTC default v3"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(CaDot, {
    value: c.accuracy,
    showValue: true
  }), /*#__PURE__*/React.createElement(CaChip, {
    decision: effectiveDecision,
    size: "lg"
  }), c.needsReview && /*#__PURE__*/React.createElement(CaChip, {
    decision: "NEEDS_REVIEW",
    size: "lg"
  })));
}
const DECISION_HERO = {
  GO: {
    icon: "shield-check",
    fg: "var(--status-go)",
    bg: "var(--status-go-bg)"
  },
  REQUEST_CHANGES: {
    icon: "shield-alert",
    fg: "var(--status-amber)",
    bg: "var(--status-amber-bg)"
  },
  FORMAL_DEFECT: {
    icon: "shield-x",
    fg: "var(--status-red)",
    bg: "var(--status-red-bg)"
  },
  STRUCTURAL: {
    icon: "shield-x",
    fg: "var(--status-red)",
    bg: "var(--status-red-bg)"
  }
};
const GATE_LABELS = (DS_ca.SEAL_GATES || []).length ? DS_ca.SEAL_GATES : [{
  id: "stamp",
  label: "Insurer stamp"
}, {
  id: "signature",
  label: "Insurer signature"
}, {
  id: "insurer",
  label: "Issuer is the insurer"
}, {
  id: "policyNumber",
  label: "Policy number"
}, {
  id: "dates",
  label: "Validity dates"
}, {
  id: "entity",
  label: "Contracting entity"
}, {
  id: "coinsurance",
  label: "Co-insurance shares"
}, {
  id: "documentType",
  label: "Document type"
}];
function SummaryPane({
  c,
  onEvidence,
  activeId,
  effectiveDecision
}) {
  const hero = DECISION_HERO[effectiveDecision] || DECISION_HERO.REQUEST_CHANGES;
  const sentences = (c.summary || "").split(/(?<=\.)\s+/);
  const headline = sentences[0];
  const rest = sentences.slice(1).join(" ");
  const gateTarget = id => ({
    id,
    page: id === "stamp" ? 1 : (c.pages[c.pages.length - 1] || {}).n
  });
  const failing = GATE_LABELS.filter(g => {
    const s = (c.gates[g.id] || {}).state;
    return s === "fail" || s === "review";
  });
  const passing = GATE_LABELS.filter(g => {
    const s = (c.gates[g.id] || {}).state;
    return s !== "fail" && s !== "review";
  });
  const critical = c.coverage.filter(r => (r.group || "critical") === "critical");
  const more = c.coverage.filter(r => (r.group || "critical") !== "critical");
  const [showMore, setShowMore] = React.useState(false);
  const majors = c.findings.filter(f => f.severity === "BLOCK" || f.severity === "CRITICAL");
  const minors = c.findings.filter(f => f.severity !== "BLOCK" && f.severity !== "CRITICAL");
  const [showMinors, setShowMinors] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 20,
      display: "grid",
      gap: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr auto",
      gap: 24,
      alignItems: "center",
      padding: "18px 20px",
      borderRadius: "var(--radius-lg)",
      background: hero.bg,
      border: `1px solid color-mix(in oklch, ${hero.fg} 18%, transparent)`
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 14,
      alignItems: "flex-start",
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 44,
      height: 44,
      borderRadius: 12,
      background: "var(--card)",
      color: hero.fg,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      flex: "0 0 44px",
      boxShadow: "var(--shadow-sm)"
    }
  }, /*#__PURE__*/React.createElement(CaIcon, {
    name: hero.icon,
    size: 22
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 600,
      lineHeight: 1.45,
      textWrap: "pretty",
      maxWidth: "58ch"
    }
  }, headline), rest && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      lineHeight: 1.5,
      color: "var(--muted-foreground)",
      marginTop: 6,
      textWrap: "pretty",
      maxWidth: "66ch"
    }
  }, rest))), /*#__PURE__*/React.createElement(ScoreRing, {
    value: c.score,
    provisional: c.provisional,
    size: 104
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "120px 1fr",
      gap: 20,
      alignItems: "center",
      padding: "16px 20px",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius-lg)",
      background: "var(--card)"
    }
  }, /*#__PURE__*/React.createElement(VerificationSeal, {
    gates: c.gates,
    size: 104,
    onGateClick: id => onEvidence(gateTarget(id))
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0,
      display: "grid",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 600,
      textTransform: "uppercase",
      letterSpacing: ".06em",
      color: "var(--muted-foreground)"
    }
  }, "Admissibility \xB7 ", 8 - failing.filter(g => (c.gates[g.id] || {}).state === "fail").length, " of 8 checks passed"), failing.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gap: 8
    }
  }, failing.map(g => {
    const e = c.gates[g.id] || {};
    const review = e.state === "review";
    return /*#__PURE__*/React.createElement("button", {
      key: g.id,
      onClick: () => onEvidence(gateTarget(g.id)),
      style: {
        display: "flex",
        gap: 8,
        alignItems: "baseline",
        background: "transparent",
        border: "none",
        padding: 0,
        cursor: "pointer",
        font: "inherit",
        textAlign: "left"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: review ? "var(--status-review)" : "var(--status-red)",
        fontFamily: "var(--font-mono)",
        fontWeight: 600,
        flex: "0 0 12px"
      }
    }, review ? "?" : "✗"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 13,
        fontWeight: 600,
        flex: "0 0 auto"
      }
    }, g.label), e.note && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 13,
        color: "var(--muted-foreground)",
        minWidth: 0
      }
    }, "\u2014 ", e.note));
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: 6
    }
  }, passing.map(g => {
    const e = c.gates[g.id] || {};
    const na = (e.state || "na") === "na";
    return /*#__PURE__*/React.createElement(CaTooltip, {
      key: g.id,
      content: e.note || (na ? "Not applicable to this certificate" : "Verified")
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        height: 24,
        padding: "0 10px",
        borderRadius: "var(--radius-full)",
        background: "var(--muted)",
        color: "var(--muted-foreground)",
        fontSize: 12,
        cursor: "default",
        transition: "color 120ms var(--ease-standard)"
      },
      onMouseEnter: e2 => {
        e2.currentTarget.style.color = "var(--foreground)";
      },
      onMouseLeave: e2 => {
        e2.currentTarget.style.color = "var(--muted-foreground)";
      }
    }, /*#__PURE__*/React.createElement(CaIcon, {
      name: na ? "minus" : "check",
      size: 12,
      color: na ? undefined : "var(--status-go)"
    }), g.label));
  })))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "baseline",
      gap: 8,
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: "var(--text-h3)",
      display: "inline-flex",
      alignItems: "center",
      gap: 7
    }
  }, /*#__PURE__*/React.createElement(CaIcon, {
    name: "coins",
    size: 15,
    color: "var(--primary)"
  }), "Coverage against FORVIA GPTC"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: "var(--muted-foreground)"
    }
  }, "Click a figure to see it on the document")), /*#__PURE__*/React.createElement("div", {
    style: {
      border: "1px solid var(--border)",
      borderRadius: "var(--radius-lg)",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement(CoverageGrid, {
    rows: showMore ? c.coverage : critical,
    activeId: activeId,
    onEvidenceClick: onEvidence
  })), more.length > 0 && /*#__PURE__*/React.createElement("button", {
    onClick: () => setShowMore(v => !v),
    style: {
      marginTop: 8,
      background: "transparent",
      border: "none",
      cursor: "pointer",
      font: "inherit",
      fontSize: 12,
      fontWeight: 500,
      color: "var(--primary)",
      display: "inline-flex",
      alignItems: "center",
      gap: 5,
      padding: 0
    }
  }, /*#__PURE__*/React.createElement(CaIcon, {
    name: showMore ? "chevron-up" : "chevron-down",
    size: 13
  }), showMore ? "Hide" : "Show", " ", more.length, " secondary guarantee", more.length > 1 ? "s" : "")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: "var(--text-h3)",
      marginBottom: 6,
      display: "inline-flex",
      alignItems: "center",
      gap: 7
    }
  }, /*#__PURE__*/React.createElement(CaIcon, {
    name: "triangle-alert",
    size: 15,
    color: "var(--primary)"
  }), "What to fix"), /*#__PURE__*/React.createElement(FindingsList, {
    findings: majors,
    onEvidenceClick: f => onEvidence({
      id: f.ruleId,
      page: f.page
    })
  }), minors.length > 0 && !showMinors && /*#__PURE__*/React.createElement("button", {
    onClick: () => setShowMinors(true),
    style: {
      marginTop: 8,
      background: "transparent",
      border: "none",
      cursor: "pointer",
      font: "inherit",
      fontSize: 12,
      fontWeight: 500,
      color: "var(--primary)",
      display: "inline-flex",
      alignItems: "center",
      gap: 5,
      padding: 0
    }
  }, /*#__PURE__*/React.createElement(CaIcon, {
    name: "chevron-down",
    size: 13
  }), "Show ", minors.length, " minor finding", minors.length > 1 ? "s" : ""), showMinors && /*#__PURE__*/React.createElement(FindingsList, {
    findings: minors,
    onEvidenceClick: f => onEvidence({
      id: f.ruleId,
      page: f.page
    })
  })));
}
function ExtractedPane({
  c,
  onEvidence
}) {
  const rows = c.coverage.filter(r => r.foundOriginal || r.status === "MISSING");
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 16,
      display: "grid",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--muted-foreground)"
    }
  }, "Every field with its original text, the normalised value, the page and the confidence. Editing a value re-scores instantly and logs an override."), c.currency !== "EUR" && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      padding: "8px 10px",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius)",
      background: "var(--card)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "cs-num"
  }, c.currency, "\u2192EUR 1.07"), " \xB7 ECB 2024-04-26 \u2014 applied to every amount on this certificate"), /*#__PURE__*/React.createElement("table", {
    style: {
      width: "100%",
      fontSize: 13
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, ["Field", "Original text", "Normalised", "Page", "Conf."].map(h => /*#__PURE__*/React.createElement("th", {
    key: h,
    style: {
      textAlign: "left",
      fontSize: 11,
      fontWeight: 500,
      color: "var(--muted-foreground)",
      padding: "0 8px 6px",
      borderBottom: "1px solid var(--border)"
    }
  }, h)))), /*#__PURE__*/React.createElement("tbody", null, rows.map(r => /*#__PURE__*/React.createElement("tr", {
    key: r.id,
    style: {
      height: 40
    }
  }, /*#__PURE__*/React.createElement("td", {
    style: {
      padding: "0 8px",
      borderBottom: "1px solid var(--border)"
    }
  }, r.guarantee), /*#__PURE__*/React.createElement("td", {
    className: "cs-quote",
    style: {
      padding: "0 8px",
      borderBottom: "1px solid var(--border)",
      maxWidth: 260
    }
  }, r.quote ? `« ${r.quote} »` : "—"), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: "0 8px",
      borderBottom: "1px solid var(--border)"
    }
  }, r.foundOriginal ? /*#__PURE__*/React.createElement(CaInput, {
    mono: true,
    size: "sm",
    defaultValue: r.foundOriginal,
    style: {
      width: 130
    }
  }) : /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--status-red)",
      fontSize: 12
    }
  }, "missing")), /*#__PURE__*/React.createElement("td", {
    className: "cs-num",
    style: {
      padding: "0 8px",
      borderBottom: "1px solid var(--border)",
      color: "var(--muted-foreground)"
    }
  }, r.page != null ? /*#__PURE__*/React.createElement("button", {
    onClick: () => onEvidence(r),
    style: {
      background: "transparent",
      border: "none",
      cursor: "pointer",
      font: "inherit",
      color: "var(--primary)",
      padding: 0
    }
  }, "p.", r.page) : "—"), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: "0 8px",
      borderBottom: "1px solid var(--border)"
    }
  }, r.confidence != null && /*#__PURE__*/React.createElement(CaDot, {
    value: r.confidence,
    page: r.page,
    quote: r.quote
  })))))), c.contact && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      display: "flex",
      alignItems: "center",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--muted-foreground)"
    }
  }, "Contact on cover letter"), /*#__PURE__*/React.createElement(CaMasked, {
    value: c.contact
  })));
}
function TerritoryPane({
  c
}) {
  const cells = [{
    label: "Worldwide",
    state: "included"
  }, {
    label: "USA / Canada",
    state: c.coverage.some(r => r.territoryExcluded) ? "excluded" : "unclear"
  }, {
    label: "Other territories",
    state: "included"
  }];
  const color = s => s === "included" ? "var(--status-go)" : s === "excluded" ? "var(--status-red)" : "var(--status-review)";
  const exclusions = c.coverage.filter(r => r.territoryExcluded || r.status === "EXCLUDED");
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 16,
      display: "grid",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: 12
    }
  }, cells.map(t => /*#__PURE__*/React.createElement("div", {
    key: t.label,
    style: {
      border: "1px solid var(--border)",
      borderRadius: "var(--radius)",
      padding: 12,
      background: "var(--card)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 6,
      fontSize: 12,
      color: "var(--muted-foreground)",
      marginBottom: 6
    }
  }, /*#__PURE__*/React.createElement(CaIcon, {
    name: "globe",
    size: 13
  }), t.label), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 500,
      color: color(t.state),
      textTransform: "capitalize"
    }
  }, t.state)))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: "var(--text-h3)",
      marginBottom: 8
    }
  }, "Exclusions that matter"), exclusions.length === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: "var(--muted-foreground)"
    }
  }, "No critical exclusion detected."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gap: 8
    }
  }, exclusions.map(r => /*#__PURE__*/React.createElement("div", {
    key: r.id,
    style: {
      display: "flex",
      gap: 10,
      alignItems: "baseline",
      fontSize: 13,
      paddingBottom: 8,
      borderBottom: "1px solid var(--border)"
    }
  }, /*#__PURE__*/React.createElement(CaBadge, {
    tone: "red",
    icon: /*#__PURE__*/React.createElement(CaIcon, {
      name: "ban",
      size: 11
    })
  }, "Critical"), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1
    }
  }, r.guarantee, " \u2014 ", r.territory || "excluded"), r.quote && /*#__PURE__*/React.createElement("span", {
    className: "cs-quote",
    style: {
      flex: "0 0 42%"
    }
  }, "\xAB ", r.quote, " \xBB"))))));
}
function HistoryPane({
  c
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 16,
      display: "grid",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      alignItems: "center",
      padding: "10px 12px",
      border: "1px solid var(--status-amber)",
      background: "var(--status-amber-bg)",
      borderRadius: "var(--radius)",
      fontSize: 13,
      color: "var(--status-amber)"
    }
  }, /*#__PURE__*/React.createElement(CaIcon, {
    name: "triangle-alert",
    size: 15
  }), /*#__PURE__*/React.createElement("span", null, "No previous certificate on file for ", c.supplier, ". Change detection starts from this analysis.")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: "var(--muted-foreground)"
    }
  }, "Policy numbers kept for claims: ", /*#__PURE__*/React.createElement("span", {
    className: "cs-num"
  }, c.policyNumber)));
}
function AuditPane({
  data
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gap: 0
    }
  }, data.audit.map((a, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: "grid",
      gridTemplateColumns: "132px 1fr 130px 90px",
      gap: 10,
      alignItems: "baseline",
      padding: "10px 0",
      borderBottom: "1px solid var(--border)",
      fontSize: 13
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "cs-num",
    style: {
      color: "var(--muted-foreground)",
      fontSize: 12
    }
  }, a.at), /*#__PURE__*/React.createElement("span", null, a.what), /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--muted-foreground)"
    }
  }, a.who), /*#__PURE__*/React.createElement("span", {
    className: "cs-code"
  }, a.ref)))));
}
function DecisionPanel({
  c,
  effectiveDecision,
  onRequest,
  onApprove,
  onReject,
  onAriba,
  onMarkReviewed
}) {
  const canApprove = effectiveDecision === "GO";
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "10px 16px",
      borderTop: "1px solid var(--border)",
      background: "var(--card)",
      boxShadow: "var(--shadow-sticky)",
      display: "flex",
      alignItems: "center",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(CaButton, {
    variant: "primary",
    size: "lg",
    iconLeft: /*#__PURE__*/React.createElement(CaIcon, {
      name: "mail",
      size: 15
    }),
    onClick: onRequest
  }, "Request changes"), /*#__PURE__*/React.createElement(CaTooltip, {
    content: canApprove ? "Approve this certificate" : "Approve requires a Compliant decision, or an override with justification"
  }, /*#__PURE__*/React.createElement(CaButton, {
    size: "lg",
    disabled: !canApprove,
    onClick: onApprove
  }, "Approve")), /*#__PURE__*/React.createElement(CaButton, {
    size: "lg",
    variant: "ghost",
    onClick: onReject
  }, "Reject"), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1
    }
  }), c.needsReview && /*#__PURE__*/React.createElement(CaButton, {
    size: "lg",
    variant: "ghost",
    iconLeft: /*#__PURE__*/React.createElement(CaIcon, {
      name: "check",
      size: 14
    }),
    onClick: onMarkReviewed
  }, "Mark reviewed"), /*#__PURE__*/React.createElement(CaButton, {
    size: "lg",
    variant: "secondary",
    iconLeft: /*#__PURE__*/React.createElement(CaIcon, {
      name: "external-link",
      size: 14
    }),
    onClick: onAriba
  }, "Send to SAP Ariba"));
}
function CertificateScreen({
  c,
  data,
  processing,
  profile,
  onBack
}) {
  const [tab, setTab] = React.useState("summary");
  const [page, setPage] = React.useState(c.pages && c.pages[0] && c.pages[0].n || 1);
  const [active, setActive] = React.useState(null);
  const [evidenceOn, setEvidenceOn] = React.useState(true);
  const [sheet, setSheet] = React.useState(null);
  const [reviewed, setReviewed] = React.useState(false);
  const effective = profile === "expert" && c.flipsOnExpert ? "REQUEST_CHANGES" : c.decision;
  const email = React.useMemo(() => {
    const e = c.email || {};
    return caBuildEmail({
      supplier: c.supplier,
      contact: e.contact,
      policyNumber: c.policyNumber,
      insurer: c.insurer,
      validUntil: e.validUntil || c.expiry,
      dueDate: e.dueDate || "30 April 2025",
      formalPoints: e.formalPoints || c.findings.filter(f => f.severity === "BLOCK").map(f => f.fix).filter(Boolean),
      coveragePoints: e.coveragePoints || c.findings.filter(f => f.severity === "CRITICAL").map(f => f.fix).filter(Boolean),
      buyer: "L. Fontaine"
    });
  }, [c]);
  const [emailText, setEmailText] = React.useState(email);
  React.useEffect(() => setEmailText(email), [email]);
  const onEvidence = target => {
    const hl = (c.highlights || []).find(h => h.id === (target.id || target));
    const p = hl && hl.page || target.page || page;
    setPage(p);
    setActive(null);
    requestAnimationFrame(() => setActive(target.id || target));
  };
  const cert = {
    ...c,
    needsReview: c.needsReview && !reviewed
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      minHeight: 0,
      flex: 1,
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "10px 24px 0"
    }
  }, /*#__PURE__*/React.createElement(CaButton, {
    size: "sm",
    variant: "ghost",
    iconLeft: /*#__PURE__*/React.createElement(CaIcon, {
      name: "arrow-right",
      size: 13,
      style: {
        transform: "rotate(180deg)"
      }
    }),
    onClick: onBack
  }, "Certificates")), /*#__PURE__*/React.createElement(TopBar, {
    c: cert,
    effectiveDecision: effective
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "var(--split-gutter)",
      flex: 1,
      minHeight: 0,
      padding: "14px 24px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: "0 0 43%",
      minWidth: 0,
      display: "flex"
    }
  }, /*#__PURE__*/React.createElement(DocumentViewer, {
    pages: c.pages || [],
    activePage: page,
    onPageChange: setPage,
    highlights: c.highlights || [],
    activeHighlightId: active,
    showEvidence: evidenceOn,
    onToggleEvidence: () => setEvidenceOn(v => !v),
    ocrUsed: c.ocrUsed,
    fileName: `${c.supplier}.pdf`,
    style: {
      flex: 1,
      minWidth: 0
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 6,
      flex: "0 0 6px",
      cursor: "col-resize",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 2,
      height: 28,
      background: "var(--border)",
      borderRadius: 1
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0,
      display: "flex",
      flexDirection: "column",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius)",
      background: "var(--card)",
      overflow: "hidden"
    }
  }, processing ? /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 20,
      display: "grid",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: "var(--text-h3)"
    }
  }, "Analysing certificate"), /*#__PURE__*/React.createElement(ProcessingStepper, {
    current: processing.current,
    timings: processing.timings
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gap: 8
    }
  }, [64, 120, 96].map((h, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      height: h,
      borderRadius: "var(--radius)",
      background: "var(--muted)"
    }
  })))) : /*#__PURE__*/React.createElement(CaTabs, {
    value: tab,
    onChange: setTab,
    style: {
      flex: 1,
      minHeight: 0
    },
    tabs: [{
      id: "summary",
      label: "Summary",
      icon: "file-text"
    }, {
      id: "data",
      label: "Extracted data",
      icon: "table",
      count: c.coverage.length
    }, {
      id: "excl",
      label: "Exclusions & territory",
      icon: "globe"
    }, {
      id: "hist",
      label: "History",
      icon: "clock"
    }, {
      id: "audit",
      label: "Audit",
      icon: "eye"
    }]
  }, tab === "summary" && /*#__PURE__*/React.createElement(SummaryPane, {
    c: cert,
    onEvidence: onEvidence,
    activeId: active,
    effectiveDecision: effective
  }), tab === "data" && /*#__PURE__*/React.createElement(ExtractedPane, {
    c: cert,
    onEvidence: onEvidence
  }), tab === "excl" && /*#__PURE__*/React.createElement(TerritoryPane, {
    c: cert
  }), tab === "hist" && /*#__PURE__*/React.createElement(HistoryPane, {
    c: cert
  }), tab === "audit" && /*#__PURE__*/React.createElement(AuditPane, {
    data: data
  })))), !processing && /*#__PURE__*/React.createElement(DecisionPanel, {
    c: cert,
    effectiveDecision: effective,
    onRequest: () => setSheet("email"),
    onApprove: () => setSheet("approve"),
    onReject: () => setSheet("reject"),
    onAriba: () => setSheet("ariba"),
    onMarkReviewed: () => setReviewed(true)
  }), /*#__PURE__*/React.createElement(RequestEmailSheet, {
    open: sheet === "email",
    onClose: () => setSheet(null),
    supplier: c.supplier,
    email: emailText,
    onChange: e => setEmailText(e.target.value)
  }), sheet === "ariba" && /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      zIndex: 60,
      display: "flex",
      justifyContent: "flex-end"
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: () => setSheet(null),
    style: {
      position: "absolute",
      inset: 0,
      background: "rgba(1,0,61,.32)"
    }
  }), /*#__PURE__*/React.createElement("aside", {
    style: {
      position: "relative",
      width: 520,
      height: "100%",
      background: "var(--card)",
      borderLeft: "1px solid var(--border)",
      boxShadow: "var(--shadow-sheet)",
      display: "flex",
      flexDirection: "column"
    }
  }, /*#__PURE__*/React.createElement("header", {
    style: {
      padding: "14px 16px",
      borderBottom: "1px solid var(--border)",
      display: "flex",
      alignItems: "center",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: "var(--text-h3)"
    }
  }, "SAP Ariba payload"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--muted-foreground)",
      marginTop: 2
    }
  }, "Preview only \u2014 sync is mocked in the POC")), /*#__PURE__*/React.createElement(CaButton, {
    size: "sm",
    variant: "ghost",
    onClick: () => setSheet(null)
  }, /*#__PURE__*/React.createElement(CaIcon, {
    name: "x",
    size: 15
  }))), /*#__PURE__*/React.createElement("pre", {
    style: {
      flex: 1,
      overflow: "auto",
      margin: 0,
      padding: 16,
      fontFamily: "var(--font-mono)",
      fontSize: 12,
      lineHeight: 1.6,
      color: "var(--foreground)"
    }
  }, JSON.stringify({
    supplierId: c.aribaId,
    certificateId: c.id,
    decision: effective,
    riskScore: c.provisional ? null : c.score,
    provisionalScore: c.provisional ? c.score : undefined,
    profile: "FORVIA_GPTC_DEFAULT@v3",
    guarantees: c.coverage.filter(r => r.required).map(r => ({
      code: r.id,
      requiredEur: r.required,
      foundEur: r.foundEur || null,
      status: r.status
    })),
    validUntil: c.expiry,
    needsHumanReview: !!c.needsReview,
    runId: c.runId
  }, null, 2)), /*#__PURE__*/React.createElement("footer", {
    style: {
      padding: "12px 16px",
      borderTop: "1px solid var(--border)",
      display: "flex",
      justifyContent: "flex-end",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(CaButton, {
    onClick: () => setSheet(null)
  }, "Close"), /*#__PURE__*/React.createElement(CaButton, {
    variant: "primary",
    onClick: () => setSheet(null)
  }, "Sync now")))), (sheet === "reject" || sheet === "approve") && /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      zIndex: 60,
      display: "grid",
      placeItems: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: () => setSheet(null),
    style: {
      position: "absolute",
      inset: 0,
      background: "rgba(1,0,61,.32)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      width: 420,
      background: "var(--card)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius)",
      boxShadow: "var(--shadow-popover)",
      padding: 16,
      display: "grid",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: "var(--text-h3)"
    }
  }, sheet === "reject" ? "Reject certificate" : "Approve with override"), sheet === "reject" ? /*#__PURE__*/React.createElement(CaSelect, {
    label: "Reason",
    width: 240,
    value: "Not admissible \u2014 broker-issued",
    options: ["Not admissible — broker-issued", "Not admissible — no insurer stamp", "Coverage insufficient", "Document is a quote", "Other"]
  }) : /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: "var(--muted-foreground)"
    }
  }, "This certificate is not compliant. A written justification is required and will be logged against your name."), /*#__PURE__*/React.createElement(CaInput, {
    multiline: true,
    rows: 4,
    placeholder: "Note (logged)"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "flex-end",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(CaButton, {
    onClick: () => setSheet(null)
  }, "Cancel"), /*#__PURE__*/React.createElement(CaButton, {
    variant: sheet === "reject" ? "destructive" : "primary",
    onClick: () => setSheet(null)
  }, sheet === "reject" ? "Reject" : "Approve")))));
}
Object.assign(window, {
  CertificateScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/coverscan/CertificateScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/coverscan/CertificatesScreen.jsx
try { (() => {
/* Screen 3 — Certificates queue and table. */
const DS_cq = window.CoverScanDesignSystem_6debdf || {};
const {
  Card: CqCard,
  DataTable: CqTable,
  DecisionChip: CqChip,
  StatusMiniGrid: CqMini,
  ConfidenceDot: CqDot,
  Badge: CqBadge,
  Button: CqButton,
  Icon: CqIcon,
  Select: CqSelect,
  Input: CqInput,
  Tooltip: CqTooltip
} = DS_cq;
const VIEWS = ["All", "Needs review", "Not admissible", "Expiring", "My suppliers"];
function UploadZone({
  onUpload
}) {
  const [over, setOver] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", {
    onClick: onUpload,
    onDragOver: e => {
      e.preventDefault();
      setOver(true);
    },
    onDragLeave: () => setOver(false),
    onDrop: e => {
      e.preventDefault();
      setOver(false);
      onUpload();
    },
    style: {
      border: `1px dashed ${over ? "var(--primary)" : "var(--border)"}`,
      borderRadius: "var(--radius-lg)",
      background: over ? "var(--accent)" : "transparent",
      padding: "9px 14px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: 10,
      transition: "background 120ms var(--ease-standard)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 28,
      height: 28,
      borderRadius: 8,
      background: "var(--secondary)",
      color: "var(--primary)",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      flex: "0 0 28px"
    }
  }, /*#__PURE__*/React.createElement(CqIcon, {
    name: "upload",
    size: 14
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 500
    }
  }, "Drop a certificate here"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: "var(--muted-foreground)"
    }
  }, "PDF or PNG \xB7 analysed in under 30 s"), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 500,
      color: "var(--primary)"
    }
  }, "Browse files"));
}
function CertificatesScreen({
  data,
  view,
  onView,
  onOpen,
  onUpload,
  profile,
  filter
}) {
  const all = data.certificates;
  const rows = React.useMemo(() => {
    let r = all;
    if (view === "Needs review") r = r.filter(c => c.needsReview);
    if (view === "Not admissible") r = r.filter(c => c.decision === "FORMAL_DEFECT" || c.decision === "STRUCTURAL");
    if (view === "Expiring") r = r.filter(c => c.expiryDays != null && c.expiryDays <= 90);
    if (view === "My suppliers") r = r.filter(c => c.assignee === "L. Fontaine");
    if (filter) r = r.filter(c => c.country === filter || c.decision === "STRUCTURAL" || c.decision === "FORMAL_DEFECT");
    return r;
  }, [view, filter, all]);
  const effective = c => profile === "expert" && c.flipsOnExpert ? "REQUEST_CHANGES" : c.decision;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "16px 24px 28px",
      display: "grid",
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 2,
      background: "var(--muted)",
      padding: 3,
      borderRadius: "var(--radius-full)"
    }
  }, VIEWS.map(v => /*#__PURE__*/React.createElement("button", {
    key: v,
    onClick: () => onView(v),
    style: {
      height: 26,
      padding: "0 12px",
      fontSize: 12,
      fontWeight: v === view ? 600 : 450,
      background: v === view ? "var(--card)" : "transparent",
      color: "var(--foreground)",
      border: "none",
      borderRadius: "var(--radius-full)",
      cursor: "pointer",
      font: "inherit",
      boxShadow: v === view ? "var(--shadow-sm)" : "none"
    }
  }, v))), /*#__PURE__*/React.createElement(CqSelect, {
    size: "sm",
    value: "All countries",
    options: ["All countries", "Germany", "France", "Spain", "Italy", "Switzerland", "India"]
  }), /*#__PURE__*/React.createElement(CqSelect, {
    size: "sm",
    value: "All insurers",
    options: ["All insurers", "Allianz", "Chubb", "Generali", "Zurich", "Swiss Mobiliar", "ICICI Lombard", "MMA"]
  }), /*#__PURE__*/React.createElement(CqButton, {
    size: "sm",
    variant: "ghost",
    iconLeft: /*#__PURE__*/React.createElement(CqIcon, {
      name: "funnel",
      size: 13
    })
  }, "More filters"), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement(CqButton, {
    size: "sm",
    iconLeft: /*#__PURE__*/React.createElement(CqIcon, {
      name: "refresh-cw",
      size: 13
    })
  }, "Re-run with profile"), /*#__PURE__*/React.createElement(CqButton, {
    size: "sm",
    iconLeft: /*#__PURE__*/React.createElement(CqIcon, {
      name: "download",
      size: 13
    })
  }, "Export Excel")), /*#__PURE__*/React.createElement(UploadZone, {
    onUpload: onUpload
  }), /*#__PURE__*/React.createElement(CqCard, {
    padded: false,
    subtitle: null,
    title: null
  }, /*#__PURE__*/React.createElement(CqTable, {
    rows: rows,
    onRowClick: onOpen,
    transition: true,
    emptyMessage: "No certificates match. Clear filters or upload one.",
    columns: [{
      key: "decision",
      header: "Status",
      render: r => /*#__PURE__*/React.createElement("span", {
        style: {
          display: "inline-flex",
          alignItems: "center",
          gap: 6
        }
      }, /*#__PURE__*/React.createElement(CqChip, {
        decision: effective(r),
        size: "sm"
      }), r.needsReview && /*#__PURE__*/React.createElement(CqChip, {
        decision: "NEEDS_REVIEW",
        size: "sm"
      }))
    }, {
      key: "supplier",
      header: "Supplier",
      render: r => /*#__PURE__*/React.createElement("span", {
        style: {
          display: "inline-flex",
          alignItems: "baseline",
          gap: 6
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          fontWeight: 500
        }
      }, r.supplier), /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 11,
          color: "var(--muted-foreground)"
        }
      }, r.code))
    }, {
      key: "insurer",
      header: "Insurer",
      render: r => /*#__PURE__*/React.createElement("span", {
        style: {
          display: "inline-flex",
          alignItems: "center",
          gap: 6
        }
      }, r.insurer, /*#__PURE__*/React.createElement(CqBadge, {
        tone: "ink",
        mono: true
      }, r.rating))
    }, {
      key: "mini",
      header: "PL · Recall · PFL",
      align: "center",
      render: r => /*#__PURE__*/React.createElement(CqMini, {
        pl: r.mini.pl,
        recall: r.mini.recall,
        pfl: r.mini.pfl
      })
    }, {
      key: "score",
      header: "Score",
      align: "right",
      mono: true,
      render: r => r.provisional ? /*#__PURE__*/React.createElement(CqTooltip, {
        content: `Provisional ${r.score} — not admissible, shown for information`
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          color: "var(--muted-foreground)"
        }
      }, "\u2014")) : /*#__PURE__*/React.createElement("span", null, r.score)
    }, {
      key: "accuracy",
      header: "Accuracy",
      align: "center",
      render: r => /*#__PURE__*/React.createElement(CqDot, {
        value: r.accuracy
      })
    }, {
      key: "expiry",
      header: "Expiry",
      mono: true,
      render: r => /*#__PURE__*/React.createElement("span", {
        style: {
          color: r.expiryDays != null && r.expiryDays < 0 ? "var(--status-red)" : undefined
        }
      }, r.expiry, r.expiryDays != null && /*#__PURE__*/React.createElement("span", {
        style: {
          color: "var(--muted-foreground)"
        }
      }, " \xB7 ", r.expiryDays < 0 ? "expired" : `in ${r.expiryDays} d`))
    }, {
      key: "received",
      header: "Received",
      mono: true,
      muted: true
    }, {
      key: "assignee",
      header: "Assignee",
      render: r => r.assignee && r.assignee !== "—" ? /*#__PURE__*/React.createElement("span", {
        title: r.assignee,
        style: {
          display: "inline-flex",
          alignItems: "center",
          gap: 7
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          width: 22,
          height: 22,
          borderRadius: "var(--radius-full)",
          background: "var(--secondary)",
          color: "var(--primary)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: ".02em"
        }
      }, r.assignee.split(/[.\s]+/).filter(Boolean).map(p => p[0]).join("").slice(0, 2).toUpperCase()), /*#__PURE__*/React.createElement("span", {
        style: {
          color: "var(--muted-foreground)",
          fontSize: 12
        }
      }, r.assignee)) : /*#__PURE__*/React.createElement("span", {
        style: {
          color: "var(--muted-foreground)"
        }
      }, "\u2014")
    }]
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "var(--muted-foreground)",
      padding: "0 6px"
    }
  }, "Showing ", rows.length, " of 150 \xB7 the 10 real FORVIA certificates are shown; 140 synthetic rows are hidden in this mockup."));
}
Object.assign(window, {
  CertificatesScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/coverscan/CertificatesScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/coverscan/MidFiScreens.jsx
try { (() => {
/* Screens 4–6, mid-fidelity: Supplier 360, Requirements profiles, Integrations. */
const DS_ms = window.CoverScanDesignSystem_6debdf || {};
const {
  Card: MsCard,
  Button: MsButton,
  Icon: MsIcon,
  Badge: MsBadge,
  Input: MsInput,
  Select: MsSelect,
  DataTable: MsTable,
  DecisionChip: MsChip,
  StatusMiniGrid: MsMini,
  MaskedText: MsMasked,
  Progress: MsProgress
} = DS_ms;
function Supplier360Screen({
  data,
  onOpen
}) {
  const c = data.certificates.find(x => x.id === "10");
  const facts = [["Country", "Italy"], ["Ariba id", "SUP-0066012"], ["Category", "Metal components"], ["Spend tier", "Tier 2"], ["Contracting entity", "Faurecia Emissions Control Technologies Italy"]];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "16px 24px 28px",
      display: "grid",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      alignItems: "center",
      padding: "10px 12px",
      border: "1px solid var(--status-amber)",
      background: "var(--status-amber-bg)",
      borderRadius: "var(--radius)",
      fontSize: 13,
      color: "var(--status-amber)"
    }
  }, /*#__PURE__*/React.createElement(MsIcon, {
    name: "triangle-alert",
    size: 15
  }), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("b", {
    style: {
      fontWeight: 600
    }
  }, "Change detected"), " \u2014 product recall dropped from \u20AC15,000,000 to \u20AC10,000,000 between the 2024 and 2025 certificates."), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement(MsButton, {
    size: "sm"
  }, "Compare")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1.2fr 1fr 1fr",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(MsCard, {
    title: "Metraton S.r.l.",
    subtitle: "Supplier profile"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gap: 8
    }
  }, facts.map(([k, v]) => /*#__PURE__*/React.createElement("div", {
    key: k,
    style: {
      display: "flex",
      gap: 10,
      fontSize: 13
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 132,
      flex: "0 0 132px",
      color: "var(--muted-foreground)"
    }
  }, k), /*#__PURE__*/React.createElement("span", null, v))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      fontSize: 13
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 132,
      flex: "0 0 132px",
      color: "var(--muted-foreground)"
    }
  }, "Contact"), /*#__PURE__*/React.createElement(MsMasked, {
    value: "a.ferrari@metraton.it"
  })))), /*#__PURE__*/React.createElement(MsCard, {
    title: "Current status"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(MsChip, {
    decision: "FORMAL_DEFECT",
    size: "md"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: "var(--muted-foreground)"
    }
  }, "Best coverage in the batch \u2014 one-line fix: recall 10 \u2192 15M and the insurer's stamp."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 16,
      marginTop: 4
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--muted-foreground)"
    }
  }, "Insurer"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13
    }
  }, "Generali Italia ", /*#__PURE__*/React.createElement(MsBadge, {
    tone: "ink",
    mono: true
  }, "A \xB7 S&P"))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--muted-foreground)"
    }
  }, "Next expiry"), /*#__PURE__*/React.createElement("div", {
    className: "cs-num",
    style: {
      fontSize: 13
    }
  }, "12 Jul 2025"))))), /*#__PURE__*/React.createElement(MsCard, {
    title: "Policy numbers on file",
    subtitle: "Kept for claims"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gap: 6,
      fontSize: 13
    }
  }, [["2025", "IT-GEN-902244"], ["2024", "IT-GEN-881190"], ["2023", "IT-GEN-844021"]].map(([y, p]) => /*#__PURE__*/React.createElement("div", {
    key: y,
    style: {
      display: "flex",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "cs-num",
    style: {
      color: "var(--muted-foreground)"
    }
  }, y), /*#__PURE__*/React.createElement("span", {
    className: "cs-num"
  }, p)))))), /*#__PURE__*/React.createElement(MsCard, {
    title: "Certificates by year",
    padded: false
  }, /*#__PURE__*/React.createElement(MsTable, {
    rows: [{
      id: "2025",
      year: "2025",
      decision: "FORMAL_DEFECT",
      mini: {
        pl: "COMPLIANT",
        recall: "BELOW_MINIMUM",
        pfl: "COMPLIANT"
      },
      pl: "€50,000,000",
      recall: "€10,000,000",
      pfl: "€15,000,000",
      received: "22 Feb 2025"
    }, {
      id: "2024",
      year: "2024",
      decision: "REQUEST_CHANGES",
      mini: {
        pl: "COMPLIANT",
        recall: "COMPLIANT",
        pfl: "COMPLIANT"
      },
      pl: "€50,000,000",
      recall: "€15,000,000",
      pfl: "€15,000,000",
      received: "19 Feb 2024"
    }, {
      id: "2023",
      year: "2023",
      decision: "REQUEST_CHANGES",
      mini: {
        pl: "COMPLIANT",
        recall: "BELOW_MINIMUM",
        pfl: "BELOW_MINIMUM"
      },
      pl: "€50,000,000",
      recall: "€8,000,000",
      pfl: "€5,000,000",
      received: "27 Feb 2023"
    }],
    onRowClick: () => onOpen && onOpen(c),
    columns: [{
      key: "year",
      header: "Year",
      mono: true
    }, {
      key: "decision",
      header: "Decision",
      render: r => /*#__PURE__*/React.createElement(MsChip, {
        decision: r.decision,
        size: "sm"
      })
    }, {
      key: "mini",
      header: "PL · Recall · PFL",
      align: "center",
      render: r => /*#__PURE__*/React.createElement(MsMini, {
        pl: r.mini.pl,
        recall: r.mini.recall,
        pfl: r.mini.pfl
      })
    }, {
      key: "pl",
      header: "Product liability",
      mono: true,
      align: "right"
    }, {
      key: "recall",
      header: "Recall",
      mono: true,
      align: "right"
    }, {
      key: "pfl",
      header: "Pure financial loss",
      mono: true,
      align: "right"
    }, {
      key: "received",
      header: "Received",
      mono: true,
      muted: true
    }]
  })));
}
function RequirementsScreen({
  data,
  profile,
  onProfile
}) {
  const weights = [["Product liability", 35], ["Product recall", 30], ["Pure financial loss", 20], ["Territory", 10], ["Insurer rating", 5]];
  const sum = weights.reduce((a, w) => a + w[1], 0);
  const expert = profile === "expert";
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "16px 24px 28px",
      display: "grid",
      gridTemplateColumns: "260px 1fr",
      gap: 12,
      alignItems: "start"
    }
  }, /*#__PURE__*/React.createElement(MsCard, {
    title: "Profiles",
    padded: false
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 6,
      display: "grid",
      gap: 2
    }
  }, data.profiles.map(p => /*#__PURE__*/React.createElement("button", {
    key: p.id,
    onClick: () => onProfile(p.id),
    style: {
      textAlign: "left",
      padding: "8px 10px",
      borderRadius: "var(--radius-sm)",
      border: "none",
      cursor: "pointer",
      background: p.id === profile ? "var(--accent)" : "transparent",
      font: "inherit"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 500,
      display: "flex",
      gap: 6,
      alignItems: "center"
    }
  }, p.label, /*#__PURE__*/React.createElement("span", {
    className: "cs-code"
  }, p.version)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--muted-foreground)",
      marginTop: 2
    }
  }, p.note))), /*#__PURE__*/React.createElement("button", {
    style: {
      textAlign: "left",
      padding: "8px 10px",
      borderRadius: "var(--radius-sm)",
      border: "none",
      cursor: "pointer",
      background: "transparent",
      font: "inherit",
      fontSize: 13,
      color: "var(--muted-foreground)"
    }
  }, "+ New profile"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(MsCard, {
    title: "Critical thresholds",
    subtitle: "Applied to every certificate analysed under this profile",
    actions: /*#__PURE__*/React.createElement(MsButton, {
      size: "sm",
      variant: "primary"
    }, "Simulate on portfolio")
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gap: 10
    }
  }, [["Product liability", "20,000,000"], ["Product recall / withdrawal", expert ? "5,000,000" : "15,000,000"], ["Pure financial loss", expert ? "10,000,000" : "15,000,000"]].map(([l, v]) => /*#__PURE__*/React.createElement("div", {
    key: l,
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      width: 220,
      flex: "0 0 220px"
    }
  }, l), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: "var(--muted-foreground)"
    }
  }, "EUR"), /*#__PURE__*/React.createElement(MsInput, {
    mono: true,
    size: "sm",
    value: v,
    readOnly: true,
    style: {
      width: 150
    }
  }))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(MsCard, {
    title: "Gates and severity"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gap: 10
    }
  }, [["Insurer stamp missing", expert ? "Request changes" : "Block"], ["Issued by a broker", "Block"], ["Signature missing", "Block"], ["Document is a quote", "Block"], ["Expiry within 90 days", "Warning"], ["Insurer rating below A-", "Warning"]].map(([l, v]) => /*#__PURE__*/React.createElement("div", {
    key: l,
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      flex: 1
    }
  }, l), /*#__PURE__*/React.createElement(MsSelect, {
    size: "sm",
    value: v,
    options: ["Block", "Request changes", "Warning", "Info"]
  }))))), /*#__PURE__*/React.createElement(MsCard, {
    title: "Weights",
    subtitle: `Must sum to 100 — currently ${sum}`
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gap: 10
    }
  }, weights.map(([l, w]) => /*#__PURE__*/React.createElement("div", {
    key: l,
    style: {
      display: "grid",
      gridTemplateColumns: "150px 1fr 34px",
      gap: 10,
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13
    }
  }, l), /*#__PURE__*/React.createElement(MsProgress, {
    value: w,
    max: 40
  }), /*#__PURE__*/React.createElement("span", {
    className: "cs-num",
    style: {
      fontSize: 13,
      textAlign: "right"
    }
  }, w))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 6,
      fontSize: 12,
      color: sum === 100 ? "var(--status-go)" : "var(--status-red)",
      marginTop: 4
    }
  }, /*#__PURE__*/React.createElement(MsIcon, {
    name: sum === 100 ? "circle-check" : "triangle-alert",
    size: 13
  }), sum === 100 ? "Weights are valid" : `Weights sum to ${sum}`)))), /*#__PURE__*/React.createElement(MsCard, {
    title: "Simulation on the current portfolio",
    subtitle: "Powered by stored breakdowns \u2014 no re-analysis needed"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 32,
      flexWrap: "wrap"
    }
  }, [["Decisions changed", expert ? "17" : "0"], ["Becomes compliant", expert ? "11" : "0"], ["Becomes request changes", expert ? "6" : "0"], ["Still not admissible", expert ? "47" : "64"]].map(([l, v]) => /*#__PURE__*/React.createElement("div", {
    key: l
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--muted-foreground)",
      marginBottom: 4
    }
  }, l), /*#__PURE__*/React.createElement("div", {
    className: "cs-num",
    style: {
      fontSize: 20,
      fontWeight: 600
    }
  }, v)))))));
}
function IntegrationsScreen({
  data
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "16px 24px 28px",
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 12,
      alignItems: "start"
    }
  }, /*#__PURE__*/React.createElement(MsCard, {
    title: "SAP Ariba",
    subtitle: "Supplier qualification questionnaire",
    actions: /*#__PURE__*/React.createElement(MsBadge, {
      tone: "go",
      icon: /*#__PURE__*/React.createElement(MsIcon, {
        name: "circle-check",
        size: 11
      })
    }, "Connected")
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gap: 10,
      fontSize: 13
    }
  }, [["Last sync", "15 Apr 2025 06:00"], ["Schedule", "Daily at 06:00 CET"], ["Environment", "Sandbox (POC)"]].map(([k, v]) => /*#__PURE__*/React.createElement("div", {
    key: k,
    style: {
      display: "flex",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 120,
      flex: "0 0 120px",
      color: "var(--muted-foreground)"
    }
  }, k), /*#__PURE__*/React.createElement("span", {
    className: "cs-num"
  }, v))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 4,
      fontSize: 12,
      color: "var(--muted-foreground)"
    }
  }, "Mapped questionnaire fields"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: 6
    }
  }, ["decision", "riskScore", "validUntil", "productLiabilityEur", "recallEur", "pureFinancialLossEur", "needsHumanReview", "profileVersion"].map(f => /*#__PURE__*/React.createElement("span", {
    key: f,
    className: "cs-code",
    style: {
      border: "1px solid var(--border)",
      borderRadius: "var(--radius-full)",
      padding: "2px 8px"
    }
  }, f))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      marginTop: 6
    }
  }, /*#__PURE__*/React.createElement(MsButton, {
    size: "sm"
  }, "Payload preview"), /*#__PURE__*/React.createElement(MsButton, {
    size: "sm",
    variant: "primary"
  }, "Sync now")))), /*#__PURE__*/React.createElement(MsCard, {
    title: "Excel export",
    subtitle: "One row per certificate, findings as text"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(MsSelect, {
    label: "View",
    value: "All",
    options: ["All", "Needs review", "Not admissible", "Expiring", "My suppliers"]
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--muted-foreground)"
    }
  }, "Includes every grid column, the provisional score, and the FX rate used for each amount."), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(MsButton, {
    size: "sm",
    iconLeft: /*#__PURE__*/React.createElement(MsIcon, {
      name: "download",
      size: 13
    })
  }, "Download .xlsx")))), /*#__PURE__*/React.createElement(MsCard, {
    title: "Registry & rates"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gap: 10,
      fontSize: 13
    }
  }, [["Insurer registry", "v2025-03 · 1,412 entries"], ["Last ECB rates fetch", "15 Apr 2025 06:02"], ["ORIAS intermediary list", "v2025-01"]].map(([k, v]) => /*#__PURE__*/React.createElement("div", {
    key: k,
    style: {
      display: "flex",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 168,
      flex: "0 0 168px",
      color: "var(--muted-foreground)"
    }
  }, k), /*#__PURE__*/React.createElement("span", {
    className: "cs-num"
  }, v))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(MsButton, {
    size: "sm",
    iconLeft: /*#__PURE__*/React.createElement(MsIcon, {
      name: "refresh-cw",
      size: 13
    })
  }, "Refresh registry")))), /*#__PURE__*/React.createElement(MsCard, {
    title: "Model & prompts",
    subtitle: "Recorded with every analysis for audit"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gap: 10,
      fontSize: 13
    }
  }, [["Vision model", "v0.4"], ["Extraction prompt", "v3"], ["Scoring rules", "GPTC default v3"], ["Average analysis", "18 s"]].map(([k, v]) => /*#__PURE__*/React.createElement("div", {
    key: k,
    style: {
      display: "flex",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 168,
      flex: "0 0 168px",
      color: "var(--muted-foreground)"
    }
  }, k), /*#__PURE__*/React.createElement("span", {
    className: "cs-num"
  }, v))))));
}
Object.assign(window, {
  Supplier360Screen,
  RequirementsScreen,
  IntegrationsScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/coverscan/MidFiScreens.jsx", error: String((e && e.message) || e) }); }

// ui_kits/coverscan/PortfolioScreen.jsx
try { (() => {
/* Screen 2 (brief priority) — Portfolio: exposure at a glance. */
const DS_pf = window.CoverScanDesignSystem_6debdf || {};
const {
  Card: PfCard,
  KpiCard,
  GapBar: PfGapBar,
  DecisionChip: PfChip,
  Button: PfButton,
  Icon: PfIcon,
  DataTable: PfTable,
  Tooltip: PfTooltip
} = DS_pf;
const compact = v => v >= 1e6 ? `€${+(v / 1e6).toFixed(v % 1e6 ? 1 : 0)}M` : v >= 1e3 ? `€${Math.round(v / 1e3)}k` : `€${v}`;
function CardTitle({
  icon,
  children
}) {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 7
    }
  }, /*#__PURE__*/React.createElement(PfIcon, {
    name: icon,
    size: 15,
    color: "var(--primary)"
  }), children);
}
function ComplianceByCountry({
  rows,
  onSelect
}) {
  const max = Math.max(...rows.map(r => r.total));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gap: 10
    }
  }, rows.map(r => /*#__PURE__*/React.createElement("div", {
    key: r.code,
    onClick: () => onSelect && onSelect(r),
    style: {
      display: "grid",
      gridTemplateColumns: "104px 1fr 40px",
      alignItems: "center",
      gap: 10,
      cursor: "pointer"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis"
    }
  }, r.country), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      height: 14,
      width: `${r.total / max * 100}%`,
      borderRadius: 2,
      overflow: "hidden",
      background: "var(--gap-track)"
    }
  }, /*#__PURE__*/React.createElement(PfTooltip, {
    content: `${r.go} compliant`,
    style: {
      width: `${r.go / r.total * 100}%`
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: "100%",
      background: "var(--status-go)",
      height: 14,
      display: "block"
    }
  })), /*#__PURE__*/React.createElement(PfTooltip, {
    content: `${r.request} request changes`,
    style: {
      width: `${r.request / r.total * 100}%`
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: "100%",
      background: "var(--status-amber)",
      height: 14,
      display: "block"
    }
  })), /*#__PURE__*/React.createElement(PfTooltip, {
    content: `${r.nogo} not admissible`,
    style: {
      width: `${r.nogo / r.total * 100}%`
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: "100%",
      background: "var(--status-red)",
      height: 14,
      display: "block"
    }
  }))), /*#__PURE__*/React.createElement("span", {
    className: "cs-num",
    style: {
      fontSize: 12,
      textAlign: "right",
      color: "var(--muted-foreground)"
    }
  }, r.total))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 14,
      marginTop: 4,
      fontSize: 11,
      color: "var(--muted-foreground)"
    }
  }, [["Compliant", "var(--status-go)"], ["Request changes", "var(--status-amber)"], ["Not admissible", "var(--status-red)"]].map(([l, c]) => /*#__PURE__*/React.createElement("span", {
    key: l,
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 5
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 8,
      height: 8,
      borderRadius: 2,
      background: c
    }
  }), l))));
}
function GapByGuarantee({
  rows
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gap: 14
    }
  }, rows.map(r => /*#__PURE__*/React.createElement("div", {
    key: r.guarantee,
    style: {
      display: "grid",
      gap: 5
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "baseline",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 500,
      flex: 1
    }
  }, r.guarantee), /*#__PURE__*/React.createElement("span", {
    className: "cs-num",
    style: {
      fontSize: 12,
      color: "var(--muted-foreground)"
    }
  }, "required ", compact(r.required)), /*#__PURE__*/React.createElement("span", {
    className: "cs-num",
    style: {
      fontSize: 12,
      color: "var(--status-go)"
    }
  }, Math.round(r.compliantShare * 100), " % compliant")), /*#__PURE__*/React.createElement(PfGapBar, {
    found: r.median,
    required: r.required,
    width: 340,
    label: `median ${compact(r.median)} · ${Math.round(r.median / r.required * 100)} %`
  }))));
}
function ExpiringTimeline({
  items
}) {
  const buckets = [{
    k: -1,
    label: "Expired"
  }, {
    k: 30,
    label: "≤ 30 days"
  }, {
    k: 60,
    label: "≤ 60 days"
  }, {
    k: 90,
    label: "≤ 90 days"
  }];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gap: 12
    }
  }, buckets.map(b => {
    const list = items.filter(i => i.bucket === b.k);
    return /*#__PURE__*/React.createElement("div", {
      key: b.k,
      style: {
        display: "grid",
        gridTemplateColumns: "86px 1fr",
        gap: 12,
        alignItems: "start"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        color: b.k === -1 ? "var(--status-red)" : "var(--muted-foreground)",
        paddingTop: 3
      }
    }, b.label), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexWrap: "wrap",
        gap: 6
      }
    }, list.length === 0 && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        color: "var(--muted-foreground)"
      }
    }, "\u2014"), list.map(i => /*#__PURE__*/React.createElement("span", {
      key: i.supplier,
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        height: 22,
        padding: "0 8px",
        borderRadius: "var(--radius-full)",
        border: "1px solid var(--border)",
        background: "var(--card)",
        fontSize: 12
      }
    }, i.supplier, /*#__PURE__*/React.createElement("span", {
      className: "cs-num",
      style: {
        color: "var(--muted-foreground)"
      }
    }, i.date)))));
  }));
}
function PortfolioScreen({
  data,
  onOpen,
  onFilter
}) {
  const p = data.portfolio;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "16px 24px 28px",
      display: "grid",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(KpiCard, {
    label: "Suppliers covered",
    value: `${p.compliant} / ${p.total}`,
    icon: "shield-check",
    tone: "go",
    delta: "+2",
    deltaTone: "go",
    sub: "6 % of the portfolio is compliant"
  }), /*#__PURE__*/React.createElement(KpiCard, {
    label: "Not admissible",
    value: p.notAdmissible,
    tone: "red",
    icon: "shield-x",
    sub: `${p.formal} formal · ${p.structural} structural`,
    onClick: () => onFilter && onFilter("Not admissible")
  }), /*#__PURE__*/React.createElement(KpiCard, {
    label: "Critical gaps",
    value: 118,
    tone: "amber",
    icon: "coins",
    sub: "Recall is the #1 gap (78 %)"
  }), /*#__PURE__*/React.createElement(KpiCard, {
    label: "Expiring \u2264 90 days",
    value: p.expiring90,
    tone: "review",
    icon: "calendar-clock",
    delta: `${p.expired} expired`,
    deltaTone: "red",
    sub: "Chubb and IMI renew before July",
    onClick: () => onFilter && onFilter("Expiring")
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(PfCard, {
    title: /*#__PURE__*/React.createElement(CardTitle, {
      icon: "globe"
    }, "Compliance by country"),
    subtitle: "Click a country to filter the certificates table"
  }, /*#__PURE__*/React.createElement(ComplianceByCountry, {
    rows: data.byCountry,
    onSelect: r => onFilter && onFilter(r.country)
  })), /*#__PURE__*/React.createElement(PfCard, {
    title: /*#__PURE__*/React.createElement(CardTitle, {
      icon: "coins"
    }, "Coverage gap by guarantee"),
    subtitle: "Median found against FORVIA GPTC requirement"
  }, /*#__PURE__*/React.createElement(GapByGuarantee, {
    rows: data.gapByGuarantee
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1.4fr 1fr",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(PfCard, {
    title: /*#__PURE__*/React.createElement(CardTitle, {
      icon: "triangle-alert"
    }, "Top 10 risks"),
    padded: false,
    actions: /*#__PURE__*/React.createElement(PfButton, {
      size: "sm",
      iconLeft: /*#__PURE__*/React.createElement(PfIcon, {
        name: "download",
        size: 13
      })
    }, "Export Excel")
  }, /*#__PURE__*/React.createElement(PfTable, {
    rows: data.topRisks,
    onRowClick: onOpen,
    columns: [{
      key: "decision",
      header: "Status",
      render: r => /*#__PURE__*/React.createElement(PfChip, {
        decision: r.decision,
        size: "sm"
      })
    }, {
      key: "supplier",
      header: "Supplier"
    }, {
      key: "country",
      header: "Country",
      muted: true
    }, {
      key: "worst",
      header: "Worst finding",
      wrap: true
    }, {
      key: "spend",
      header: "Spend",
      muted: true
    }, {
      key: "open",
      header: "",
      align: "right",
      render: () => /*#__PURE__*/React.createElement(PfIcon, {
        name: "arrow-up-right",
        size: 14,
        color: "var(--muted-foreground)"
      })
    }]
  })), /*#__PURE__*/React.createElement(PfCard, {
    title: /*#__PURE__*/React.createElement(CardTitle, {
      icon: "calendar-clock"
    }, "Expiring soon"),
    subtitle: "Next 90 days at the demo clock"
  }, /*#__PURE__*/React.createElement(ExpiringTimeline, {
    items: data.expiring
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "baseline",
      gap: 6,
      flexWrap: "wrap",
      padding: "2px 6px 0",
      fontSize: 12,
      color: "var(--muted-foreground)"
    }
  }, [[`${p.total}`, "analysed this month"], [`${p.avgSeconds} s`, "average per certificate"], [`${Math.round(p.reviewShare * 100)} %`, "sent to human review"], [`${Math.round(p.fieldAccuracy * 100)} %`, "field accuracy on the reviewed set"]].map(([v, l], i) => /*#__PURE__*/React.createElement("span", {
    key: l,
    style: {
      display: "inline-flex",
      alignItems: "baseline",
      gap: 5
    }
  }, i > 0 && /*#__PURE__*/React.createElement("span", {
    style: {
      margin: "0 8px",
      color: "var(--border)"
    }
  }, "\xB7"), /*#__PURE__*/React.createElement("span", {
    className: "cs-num",
    style: {
      fontWeight: 600,
      color: "var(--foreground)"
    }
  }, v), l)), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement("span", null, "Demo dataset: 10 real + 140 synthetic")));
}
Object.assign(window, {
  PortfolioScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/coverscan/PortfolioScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/coverscan/data.js
try { (() => {
/* Demo dataset — the 10 real FORVIA certificates from design-pack/04_real_content_10_certificates.md,
   plus the portfolio aggregates for the 150-certificate demo set (10 real + 140 synthetic).
   Demo clock: 2025-04-15. */
window.CS = function () {
  const REQUIRED = {
    pl: 20000000,
    recall: 15000000,
    pfl: 15000000
  };
  const portfolio = {
    total: 150,
    compliant: 9,
    requestChanges: 61,
    notAdmissible: 64,
    formal: 41,
    structural: 23,
    needsReview: 16,
    expired: 12,
    expiring90: 23,
    avgSeconds: 18,
    fieldAccuracy: 0.93,
    reviewShare: 0.11,
    demoClock: "15 Apr 2025"
  };
  const byCountry = [{
    country: "Germany",
    code: "DE",
    total: 44,
    go: 3,
    request: 18,
    nogo: 23
  }, {
    country: "France",
    code: "FR",
    total: 31,
    go: 2,
    request: 13,
    nogo: 16
  }, {
    country: "Spain",
    code: "ES",
    total: 22,
    go: 2,
    request: 11,
    nogo: 9
  }, {
    country: "Italy",
    code: "IT",
    total: 18,
    go: 1,
    request: 8,
    nogo: 9
  }, {
    country: "Czechia",
    code: "CZ",
    total: 14,
    go: 1,
    request: 5,
    nogo: 8
  }, {
    country: "Switzerland",
    code: "CH",
    total: 11,
    go: 0,
    request: 4,
    nogo: 7
  }, {
    country: "India",
    code: "IN",
    total: 10,
    go: 0,
    request: 2,
    nogo: 8
  }];
  const gapByGuarantee = [{
    guarantee: "Product liability",
    required: REQUIRED.pl,
    median: 5000000,
    compliantShare: 0.14
  }, {
    guarantee: "Product recall / withdrawal",
    required: REQUIRED.recall,
    median: 4000000,
    compliantShare: 0.06
  }, {
    guarantee: "Pure financial loss",
    required: REQUIRED.pfl,
    median: 1500000,
    compliantShare: 0.09
  }, {
    guarantee: "Dismantling and refitting",
    required: REQUIRED.recall,
    median: 2000000,
    compliantShare: 0.11
  }];
  const expiring = [{
    supplier: "Air Products SAS",
    date: "31 May 2025",
    days: 46,
    bucket: 60
  }, {
    supplier: "Norgren GmbH (IMI)",
    date: "29 Jun 2025",
    days: 75,
    bucket: 90
  }, {
    supplier: "Scherdel GmbH",
    date: "30 Apr 2025",
    days: 15,
    bucket: 30
  }, {
    supplier: "EKKO-MEISTER AG",
    date: "31 Jan 2026",
    days: 291,
    bucket: 0
  }, {
    supplier: "Metraton S.r.l.",
    date: "12 Jul 2025",
    days: 88,
    bucket: 90
  }, {
    supplier: "Polyvlies Franz Beyer",
    date: "01 Apr 2025",
    days: -14,
    bucket: -1
  }];

  /* ---- the 10 real certificates ---- */
  const certificates = [{
    id: "01",
    supplier: "Air Products SAS",
    country: "France",
    code: "FR",
    insurer: "Chubb",
    rating: "A++ · AM Best",
    policyNumber: "FRBOPX 7654321",
    decision: "REQUEST_CHANGES",
    subtype: null,
    score: 12,
    provisional: false,
    accuracy: 0.90,
    currency: "USD",
    expiry: "31 May 2025",
    expiryDays: 46,
    received: "03 May 2024",
    assignee: "L. Fontaine",
    lastAction: "Analysed",
    aribaId: "SUP-0084219",
    entity: "Faurecia Systèmes d'Échappement",
    seconds: 18,
    model: "v0.4",
    runId: "8f21c",
    lang: "fr-en",
    needsReview: true,
    mini: {
      pl: "BELOW_MINIMUM",
      recall: "MISSING",
      pfl: "BELOW_MINIMUM"
    },
    pages: [{
      n: 1,
      imageUrl: "../../assets/pages/chubb_air-products_p1.jpeg",
      lang: "en"
    }],
    summary: "Combined general and product liability of USD 5,000,000 converts to €4,672,897, about a quarter of the €20,000,000 required by FORVIA's purchasing terms. Product recall is not mentioned at all and pure financial loss is capped at USD 200,000. The signature could not be read with confidence, so the certificate is flagged for human review.",
    gates: {
      stamp: {
        state: "review",
        note: "faint stamp detected p.1, low contrast"
      },
      signature: {
        state: "review",
        note: "signature present but not attributable"
      },
      insurer: {
        state: "pass",
        note: "Chubb European Group SE — registry hit"
      },
      policyNumber: {
        state: "pass",
        note: "FRBOPX 7654321"
      },
      dates: {
        state: "pass",
        note: "01 Jun 2024 → 31 May 2025"
      },
      entity: {
        state: "pass",
        note: "Faurecia Systèmes d'Échappement listed"
      },
      coinsurance: {
        state: "na"
      },
      documentType: {
        state: "pass",
        note: "certificate of insurance"
      }
    },
    coverage: [{
      id: "pl",
      guarantee: "Product liability",
      required: REQUIRED.pl,
      foundOriginal: "USD 5,000,000",
      foundEur: 4672897,
      status: "BELOW_MINIMUM",
      basis: "combined GL + PL, per occurrence",
      territory: "Worldwide",
      confidence: 0.9,
      page: 1,
      fxNote: "USD→EUR 1.07 · ECB 26 Apr 2024",
      quote: "Combined single limit USD 5,000,000"
    }, {
      id: "recall",
      guarantee: "Product recall / withdrawal costs",
      required: REQUIRED.recall,
      status: "MISSING",
      confidence: 0.88,
      page: 1
    }, {
      id: "pfl",
      guarantee: "Pure financial loss",
      required: REQUIRED.pfl,
      foundOriginal: "USD 200,000",
      foundEur: 186916,
      status: "BELOW_MINIMUM",
      confidence: 0.85,
      page: 1,
      fxNote: "USD→EUR 1.07 · ECB 26 Apr 2024"
    }, {
      id: "consequential",
      guarantee: "Consequential loss",
      required: null,
      status: "MISSING",
      group: "secondary",
      confidence: 0.8,
      page: 1
    }, {
      id: "dic",
      guarantee: "Difference in conditions / limits",
      status: "MISSING",
      group: "secondary",
      confidence: 0.75
    }, {
      id: "employers",
      guarantee: "Employer's liability",
      status: "COVERED_NO_AMOUNT",
      group: "other",
      confidence: 0.68,
      page: 1
    }],
    findings: [{
      ruleId: "PL_BELOW_MIN",
      severity: "CRITICAL",
      title: "Product liability at €4,672,897 against €20,000,000 required",
      quote: "Combined single limit USD 5,000,000",
      page: 1,
      lang: "en",
      fix: "Request product liability of at least EUR 20,000,000, or a difference-in-limits cover on top of the current policy."
    }, {
      ruleId: "RECALL_MISSING",
      severity: "CRITICAL",
      title: "Product recall and withdrawal costs are not covered",
      page: 1,
      lang: "en",
      fix: "Request product recall / withdrawal costs of at least EUR 15,000,000, worldwide including USA and Canada."
    }, {
      ruleId: "PFL_BELOW_MIN",
      severity: "CRITICAL",
      title: "Pure financial loss capped at €186,916 against €15,000,000 required",
      quote: "Pure financial loss USD 200,000",
      page: 1,
      lang: "en",
      fix: "Request pure financial loss cover of at least EUR 15,000,000."
    }, {
      ruleId: "SIGNATURE_AMBIGUOUS",
      severity: "WARNING",
      title: "Signature present but not attributable to the insurer",
      page: 1,
      lang: "en",
      fix: "Request a certificate signed by a named representative of Chubb."
    }, {
      ruleId: "EXPIRY_WINDOW",
      severity: "WARNING",
      title: "Certificate expires in 46 days",
      page: 1,
      lang: "en",
      fix: "Request the renewal certificate before 31 May 2025."
    }, {
      ruleId: "FX_APPLIED",
      severity: "INFO",
      title: "USD converted at ECB 1.07 on 26 April 2024",
      page: 1,
      lang: "en"
    }],
    highlights: [{
      id: "pl",
      page: 1,
      x: 0.10,
      y: 0.42,
      w: 0.80,
      h: 0.028
    }, {
      id: "pfl",
      page: 1,
      x: 0.10,
      y: 0.50,
      w: 0.80,
      h: 0.026
    }]
  }, {
    id: "04",
    supplier: "M.T.S. SAS",
    country: "France",
    code: "FR",
    insurer: "MMA — issued by Marron & Associés",
    rating: "A · registry",
    policyNumber: "144 725 803",
    decision: "STRUCTURAL",
    subtype: "Broker-issued",
    score: 3,
    provisional: true,
    accuracy: 0.82,
    currency: "EUR",
    expiry: "31 Dec 2025",
    expiryDays: 260,
    received: "12 Jan 2025",
    assignee: "L. Fontaine",
    lastAction: "Analysed",
    aribaId: "SUP-0091774",
    entity: "Faurecia Intérieur Industrie",
    seconds: 18,
    model: "v0.4",
    runId: "3c7ab",
    lang: "fr",
    ocrUsed: true,
    needsReview: false,
    mini: {
      pl: "BELOW_MINIMUM",
      recall: "BELOW_MINIMUM",
      pfl: "MISSING"
    },
    pages: [{
      n: 1,
      imageUrl: "../../assets/pages/marron_mts_p1.jpeg",
      lang: "fr",
      ocrUsed: true
    }, {
      n: 2,
      imageUrl: "../../assets/pages/marron_mts_p2.jpeg",
      lang: "fr",
      ocrUsed: true
    }],
    summary: "This certificate was issued by a broker (Marron & Associés), not by the insurer, so it has no legal value for FORVIA. Even if reissued by MMA, recall/withdrawal costs are limited to €305,000 against €15M required and are excluded for USA/Canada. Recommended action: request a certificate issued and stamped by MMA with recall ≥ €15M worldwide.",
    gates: {
      stamp: {
        state: "fail",
        note: "broker's stamp found p.1, no insurer stamp"
      },
      signature: {
        state: "fail",
        note: "no insurer signature"
      },
      insurer: {
        state: "fail",
        note: "issuer is an intermediary — ORIAS 07 002 497"
      },
      policyNumber: {
        state: "pass",
        note: "144 725 803"
      },
      dates: {
        state: "pass",
        note: "01 Jan 2025 → 31 Dec 2025"
      },
      entity: {
        state: "pass",
        note: "M.T.S. SAS named as policyholder"
      },
      coinsurance: {
        state: "na"
      },
      documentType: {
        state: "pass",
        note: "attestation d'assurance"
      }
    },
    coverage: [{
      id: "pl",
      guarantee: "Product liability",
      required: REQUIRED.pl,
      foundOriginal: "€10,000,000",
      foundEur: 10000000,
      status: "BELOW_MINIMUM",
      basis: "tous dommages confondus, per claim",
      territory: "Worldwide excl. USA/Canada",
      territoryExcluded: true,
      confidence: 0.88,
      page: 2,
      quote: "Tous dommages confondus 10.000.000 €"
    }, {
      id: "recall",
      guarantee: "Product recall / withdrawal costs",
      required: REQUIRED.recall,
      foundOriginal: "€305,000",
      foundEur: 305000,
      status: "BELOW_MINIMUM",
      basis: "frais de retrait engagés par l'assuré",
      deductible: "€3,000",
      territory: "Excluded for USA/Canada",
      territoryExcluded: true,
      confidence: 0.82,
      page: 2,
      quote: "Frais de retrait engagés par l'assuré 305.000 €"
    }, {
      id: "pfl",
      guarantee: "Pure financial loss",
      required: REQUIRED.pfl,
      foundOriginal: "€305,000",
      foundEur: 305000,
      status: "BELOW_MINIMUM",
      basis: "dommages immatériels non consécutifs",
      deductible: "€1,500",
      confidence: 0.79,
      page: 2,
      quote: "Dommages immatériels non consécutifs 305.000 €"
    }, {
      id: "dismantling",
      guarantee: "Dismantling and refitting costs",
      required: null,
      foundOriginal: "€305,000",
      foundEur: 305000,
      status: "EXCLUDED",
      basis: "frais de dépose repose",
      territory: "Excluded for USA/Canada",
      territoryExcluded: true,
      group: "secondary",
      confidence: 0.77,
      page: 2,
      quote: "Frais de dépose repose engagés par l'assuré ou par un tiers — Exclu"
    }, {
      id: "environmental",
      guarantee: "Environmental impairment",
      foundOriginal: "€750,000",
      foundEur: 750000,
      status: "PRESENT",
      group: "secondary",
      confidence: 0.84,
      page: 2
    }, {
      id: "ecological",
      guarantee: "Ecological damage",
      foundOriginal: "€500,000",
      foundEur: 500000,
      status: "PRESENT",
      group: "other",
      confidence: 0.81,
      page: 2
    }, {
      id: "usca",
      guarantee: "USA / Canada sub-limit",
      foundOriginal: "€2,000,000",
      foundEur: 2000000,
      status: "PRESENT",
      basis: "tous dommages confondus",
      deductible: "€15,000",
      group: "other",
      confidence: 0.8,
      page: 2
    }],
    findings: [{
      ruleId: "ISSUER_IS_BROKER",
      severity: "BLOCK",
      title: "Certificate issued by a broker, not by the insurer",
      quote: "SARL MARRON & ASSOCIES — N° ORIAS 07 002 497 — Agent Général Exclusif MMA et Courtier en assurance",
      page: 2,
      lang: "fr",
      fix: "Request a certificate issued, signed and stamped by MMA itself."
    }, {
      ruleId: "STAMP_MISSING",
      severity: "BLOCK",
      title: "No insurer stamp — only the broker's stamp is present",
      page: 1,
      lang: "fr",
      fix: "Request the insurer's stamp on the certificate."
    }, {
      ruleId: "RECALL_BELOW_MIN",
      severity: "CRITICAL",
      title: "Product recall costs at €305,000 against €15,000,000 required",
      quote: "Frais de retrait engagés par l'assuré 305.000 €",
      page: 2,
      lang: "fr",
      fix: "Request product recall / withdrawal costs of at least EUR 15,000,000, worldwide."
    }, {
      ruleId: "TERRITORY_EXCL_US_CA",
      severity: "CRITICAL",
      title: "Recall and refitting costs excluded for USA and Canada",
      quote: "Dont GARANTIE « ETATS UNIS D'AMERIQUE ET/OU CANADA » — Frais de retrait engagés par l'assuré ou par un tiers : Exclu",
      page: 2,
      lang: "fr",
      fix: "Request worldwide cover for recall and refitting, including USA and Canada."
    }, {
      ruleId: "PL_BELOW_MIN",
      severity: "CRITICAL",
      title: "Product liability at €10,000,000 against €20,000,000 required",
      quote: "Tous dommages confondus 10.000.000 €",
      page: 2,
      lang: "fr",
      fix: "Request product liability of at least EUR 20,000,000."
    }, {
      ruleId: "PFL_BELOW_MIN",
      severity: "CRITICAL",
      title: "Pure financial loss at €305,000 against €15,000,000 required",
      quote: "Dommages immatériels non consécutifs 305.000 €",
      page: 2,
      lang: "fr",
      fix: "Request pure financial loss cover of at least EUR 15,000,000."
    }, {
      ruleId: "OCR_PATH_USED",
      severity: "INFO",
      title: "Scanned document — read through OCR, field accuracy 82 %",
      page: 1,
      lang: "fr"
    }],
    highlights: [{
      id: "pl",
      page: 2,
      x: 0.131,
      y: 0.277,
      w: 0.744,
      h: 0.024
    }, {
      id: "pfl",
      page: 2,
      x: 0.131,
      y: 0.350,
      w: 0.744,
      h: 0.021
    }, {
      id: "recall",
      page: 2,
      x: 0.131,
      y: 0.636,
      w: 0.744,
      h: 0.022
    }, {
      id: "dismantling",
      page: 2,
      x: 0.131,
      y: 0.612,
      w: 0.744,
      h: 0.022
    }, {
      id: "environmental",
      page: 2,
      x: 0.131,
      y: 0.383,
      w: 0.744,
      h: 0.040
    }, {
      id: "ecological",
      page: 2,
      x: 0.131,
      y: 0.450,
      w: 0.744,
      h: 0.020
    }, {
      id: "usca",
      page: 2,
      x: 0.131,
      y: 0.712,
      w: 0.744,
      h: 0.026
    }, {
      id: "TERRITORY_EXCL_US_CA",
      page: 2,
      x: 0.131,
      y: 0.795,
      w: 0.744,
      h: 0.024
    }, {
      id: "ISSUER_IS_BROKER",
      page: 2,
      x: 0.155,
      y: 0.905,
      w: 0.700,
      h: 0.016
    }, {
      id: "STAMP_MISSING",
      page: 1,
      x: 0.60,
      y: 0.80,
      w: 0.30,
      h: 0.10
    }],
    email: {
      contact: "Sir or Madam",
      validUntil: "31 December 2025",
      dueDate: "30 April 2025",
      formalPoints: ["The certificate must be issued, signed and stamped by the insurer (MMA), not by a broker or agent.", "Please ensure the certificate is issued in the name of Faurecia Intérieur Industrie."],
      coveragePoints: ["Product liability: at least EUR 20,000,000 (found: EUR 10,000,000).", "Product recall / withdrawal costs: at least EUR 15,000,000, worldwide including USA/Canada (found: EUR 305,000, excluded for USA/Canada).", "Pure financial loss: at least EUR 15,000,000 (found: EUR 305,000).", "Dismantling and refitting costs to be explicitly covered, including USA/Canada."]
    }
  }, {
    id: "06",
    supplier: "Componentes de Vehículos de Galicia",
    country: "Spain",
    code: "ES",
    insurer: "Zurich ES",
    rating: "AA- · S&P",
    policyNumber: "ES-0089-441207",
    decision: "REQUEST_CHANGES",
    subtype: null,
    score: 56,
    provisional: false,
    accuracy: 0.86,
    currency: "EUR",
    expiry: "31 Dec 2025",
    expiryDays: 260,
    received: "20 Feb 2025",
    assignee: "R. Mekouar",
    lastAction: "In review",
    aribaId: "SUP-0077310",
    entity: "Faurecia Automotive Exteriors España",
    seconds: 21,
    model: "v0.4",
    runId: "b41f9",
    lang: "en",
    ocrUsed: true,
    needsReview: true,
    mini: {
      pl: "COMPLIANT",
      recall: "BELOW_MINIMUM",
      pfl: "BELOW_MINIMUM"
    },
    pages: [{
      n: 1,
      imageUrl: "../../assets/pages/zurich_copo_p1.jpeg",
      lang: "en",
      ocrUsed: true
    }],
    summary: "Product liability reaches €20,000,000 and meets FORVIA's requirement — the only certificate in the batch that does. Product recall is capped at €4,000,000 and pure financial loss at €3,000,000, both well below the €15,000,000 required. The supplier appears as an additional insured of its parent Grupo COPO and the signature is unclear, so a human check is required before the request is sent.",
    gates: {
      stamp: {
        state: "pass",
        note: "insurer stamp found p.1"
      },
      signature: {
        state: "review",
        note: "scribble, no printed name"
      },
      insurer: {
        state: "pass",
        note: "Zurich Insurance plc, Spanish branch"
      },
      policyNumber: {
        state: "pass",
        note: "ES-0089-441207"
      },
      dates: {
        state: "pass",
        note: "01 Jan 2025 → 31 Dec 2025"
      },
      entity: {
        state: "review",
        note: "additional insured of Grupo COPO — parent policy"
      },
      coinsurance: {
        state: "na"
      },
      documentType: {
        state: "pass",
        note: "certificate of insurance"
      }
    },
    coverage: [{
      id: "pl",
      guarantee: "Product liability",
      required: REQUIRED.pl,
      foundOriginal: "€20,000,000",
      foundEur: 20000000,
      status: "COMPLIANT",
      basis: "per occurrence and aggregate",
      territory: "Worldwide",
      confidence: 0.9,
      page: 1
    }, {
      id: "recall",
      guarantee: "Product recall / withdrawal costs",
      required: REQUIRED.recall,
      foundOriginal: "€4,000,000",
      foundEur: 4000000,
      status: "BELOW_MINIMUM",
      confidence: 0.84,
      page: 1
    }, {
      id: "pfl",
      guarantee: "Pure financial loss",
      required: REQUIRED.pfl,
      foundOriginal: "€3,000,000",
      foundEur: 3000000,
      status: "BELOW_MINIMUM",
      confidence: 0.82,
      page: 1
    }, {
      id: "dismantling",
      guarantee: "Dismantling and refitting costs",
      required: null,
      foundOriginal: "€4,000,000",
      foundEur: 4000000,
      status: "PRESENT",
      group: "secondary",
      confidence: 0.8,
      page: 1
    }],
    findings: [{
      ruleId: "RECALL_BELOW_MIN",
      severity: "CRITICAL",
      title: "Product recall costs at €4,000,000 against €15,000,000 required",
      page: 1,
      lang: "en",
      fix: "Request product recall / withdrawal costs of at least EUR 15,000,000."
    }, {
      ruleId: "PFL_BELOW_MIN",
      severity: "CRITICAL",
      title: "Pure financial loss at €3,000,000 against €15,000,000 required",
      page: 1,
      lang: "en",
      fix: "Request pure financial loss cover of at least EUR 15,000,000."
    }, {
      ruleId: "SIGNATURE_UNCLEAR",
      severity: "WARNING",
      title: "Signature is a scribble with no printed name",
      page: 1,
      lang: "en",
      fix: "Request a certificate signed by a named representative of Zurich."
    }, {
      ruleId: "ADDITIONAL_INSURED",
      severity: "WARNING",
      title: "Cover comes from the parent policy of Grupo COPO",
      page: 1,
      lang: "en",
      fix: "Confirm that Componentes de Vehículos de Galicia is an insured party for the full limits."
    }, {
      ruleId: "OCR_PATH_USED",
      severity: "INFO",
      title: "Garbled text layer — read through OCR and vision model",
      page: 1,
      lang: "en"
    }],
    highlights: [{
      id: "pl",
      page: 1,
      x: 0.10,
      y: 0.45,
      w: 0.80,
      h: 0.03
    }]
  }, {
    id: "02",
    supplier: "Scherdel GmbH",
    country: "Germany",
    code: "DE",
    insurer: "Generali DE",
    rating: "A · S&P",
    policyNumber: "DE-77-114508",
    decision: "FORMAL_DEFECT",
    subtype: "No stamp",
    score: 20,
    provisional: true,
    accuracy: 0.93,
    currency: "EUR",
    expiry: "30 Apr 2025",
    expiryDays: 15,
    received: "18 Mar 2025",
    assignee: "—",
    lastAction: "Analysed",
    needsReview: false,
    mini: {
      pl: "MISSING",
      recall: "BELOW_MINIMUM",
      pfl: "MISSING"
    },
    secondary: "Recall-only document — not a liability certificate"
  }, {
    id: "03",
    supplier: "EKKO-MEISTER AG",
    country: "Switzerland",
    code: "CH",
    insurer: "Swiss Mobiliar",
    rating: "A · registry",
    policyNumber: "CH-4471-09",
    decision: "FORMAL_DEFECT",
    subtype: "No stamp",
    score: 50,
    provisional: true,
    accuracy: 0.94,
    currency: "CHF",
    expiry: "31 Jan 2026",
    expiryDays: 291,
    received: "05 Feb 2025",
    assignee: "—",
    lastAction: "Analysed",
    needsReview: false,
    mini: {
      pl: "COMPLIANT",
      recall: "BELOW_MINIMUM",
      pfl: "COVERED_NO_AMOUNT"
    },
    secondary: "CHF 20,000,000 converts to €20.8M — borderline compliant"
  }, {
    id: "05",
    supplier: "Naxnova Technologies",
    country: "India",
    code: "IN",
    insurer: "ICICI Lombard",
    rating: "— · not rated",
    policyNumber: "quote, no number",
    decision: "STRUCTURAL",
    subtype: "Quote, not a certificate",
    score: 22,
    provisional: true,
    accuracy: 0.91,
    currency: "INR",
    expiry: "—",
    expiryDays: null,
    received: "28 Jan 2025",
    assignee: "R. Mekouar",
    lastAction: "Analysed",
    needsReview: false,
    mini: {
      pl: "BELOW_MINIMUM",
      recall: "MISSING",
      pfl: "MISSING"
    },
    secondary: "Quote at 20 % capacity, claims-made, automotive exclusion"
  }, {
    id: "07",
    supplier: "Norgren GmbH (IMI)",
    country: "Germany",
    code: "DE",
    insurer: "Zurich DE",
    rating: "AA- · S&P",
    policyNumber: "DE-0089-778812",
    decision: "FORMAL_DEFECT",
    subtype: "No stamp",
    score: 22,
    provisional: true,
    accuracy: 0.95,
    currency: "EUR",
    expiry: "29 Jun 2025",
    expiryDays: 75,
    received: "11 Mar 2025",
    assignee: "—",
    lastAction: "Analysed",
    needsReview: false,
    mini: {
      pl: "BELOW_MINIMUM",
      recall: "MISSING",
      pfl: "BELOW_MINIMUM"
    },
    secondary: "16 co-insured entities — contracting entity found on the list"
  }, {
    id: "08",
    supplier: "CeramTec GmbH",
    country: "Germany",
    code: "DE",
    insurer: "Allianz AGCS",
    rating: "AA · S&P",
    policyNumber: "DE-AGCS-55014",
    decision: "FORMAL_DEFECT",
    subtype: "No stamp",
    score: 20,
    provisional: true,
    accuracy: 0.96,
    currency: "EUR",
    expiry: "31 Dec 2025",
    expiryDays: 260,
    received: "02 Apr 2025",
    assignee: "R. Mekouar",
    lastAction: "Analysed",
    needsReview: false,
    mini: {
      pl: "MISSING",
      recall: "BELOW_MINIMUM",
      pfl: "MISSING"
    },
    secondary: "Recall €5M — compliant under the Expert profile",
    flipsOnExpert: true
  }, {
    id: "09",
    supplier: "Polyvlies Franz Beyer",
    country: "Germany",
    code: "DE",
    insurer: "Allianz DE",
    rating: "AA · S&P",
    policyNumber: "DE-AZ-330871",
    decision: "FORMAL_DEFECT",
    subtype: "No stamp",
    score: 50,
    provisional: true,
    accuracy: 0.92,
    currency: "EUR",
    expiry: "01 Apr 2025",
    expiryDays: -14,
    received: "14 Jan 2025",
    assignee: "L. Fontaine",
    lastAction: "Expired",
    needsReview: false,
    mini: {
      pl: "BELOW_MINIMUM",
      recall: "COVERED_NO_AMOUNT",
      pfl: "BELOW_MINIMUM"
    },
    secondary: "Cover letter carries personal data — masked",
    contact: "nicole.hoffmann@polyvlies.de"
  }, {
    id: "10",
    supplier: "Metraton S.r.l.",
    country: "Italy",
    code: "IT",
    insurer: "Generali Italia",
    rating: "A · S&P",
    policyNumber: "IT-GEN-902244",
    decision: "FORMAL_DEFECT",
    subtype: "No stamp",
    score: 60,
    provisional: true,
    accuracy: 0.88,
    currency: "EUR",
    expiry: "12 Jul 2025",
    expiryDays: 88,
    received: "22 Feb 2025",
    assignee: "—",
    lastAction: "Analysed",
    needsReview: false,
    mini: {
      pl: "COMPLIANT",
      recall: "BELOW_MINIMUM",
      pfl: "COMPLIANT"
    },
    secondary: "Best coverage in the batch — PL €50M, recall €10M"
  }];
  const profiles = [{
    id: "gptc",
    label: "GPTC default",
    version: "v3",
    note: "PL €20M · recall and PFL €15M · missing stamp blocks"
  }, {
    id: "expert",
    label: "Expert (R. Mekouar)",
    version: "v1",
    note: "Recall €5M accepted · missing stamp requests changes"
  }];
  const topRisks = certificates.filter(c => c.decision !== "GO").slice(0, 10).map(c => ({
    ...c,
    worst: c.findings && c.findings[0] && c.findings[0].title || c.secondary || "—",
    spend: c.id === "04" ? "Tier 1" : c.id === "01" ? "Tier 1" : "Tier 2"
  }));
  const audit = [{
    at: "15 Apr 2025 09:12",
    what: "Ingested from SAP Ariba questionnaire",
    who: "system",
    ref: "run 3c7ab"
  }, {
    at: "15 Apr 2025 09:12",
    what: "Analysed — 8 steps, 18.0 s",
    who: "pipeline v0.4",
    ref: "prompt v3"
  }, {
    at: "15 Apr 2025 09:31",
    what: "Opened by buyer",
    who: "L. Fontaine",
    ref: "—"
  }, {
    at: "15 Apr 2025 09:33",
    what: "Evidence revealed on page 2",
    who: "L. Fontaine",
    ref: "recall"
  }, {
    at: "15 Apr 2025 09:35",
    what: "Request changes email generated",
    who: "L. Fontaine",
    ref: "email v1"
  }];
  return {
    REQUIRED,
    portfolio,
    byCountry,
    gapByGuarantee,
    expiring,
    certificates,
    profiles,
    topRisks,
    audit
  };
}();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/coverscan/data.js", error: String((e && e.message) || e) }); }

__ds_ns.Accordion = __ds_scope.Accordion;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.DataTable = __ds_scope.DataTable;

__ds_ns.Icon = __ds_scope.Icon;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Progress = __ds_scope.Progress;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.Sheet = __ds_scope.Sheet;

__ds_ns.Tabs = __ds_scope.Tabs;

__ds_ns.Tooltip = __ds_scope.Tooltip;

__ds_ns.CoverageGrid = __ds_scope.CoverageGrid;

__ds_ns.FindingsList = __ds_scope.FindingsList;

__ds_ns.GapBar = __ds_scope.GapBar;

__ds_ns.KpiCard = __ds_scope.KpiCard;

__ds_ns.DocumentViewer = __ds_scope.DocumentViewer;

__ds_ns.MaskedText = __ds_scope.MaskedText;

__ds_ns.PIPELINE_STEPS = __ds_scope.PIPELINE_STEPS;

__ds_ns.ProcessingStepper = __ds_scope.ProcessingStepper;

__ds_ns.ProfileSwitcher = __ds_scope.ProfileSwitcher;

__ds_ns.BuildRequestEmail = __ds_scope.BuildRequestEmail;

__ds_ns.RequestEmailSheet = __ds_scope.RequestEmailSheet;

__ds_ns.ConfidenceDot = __ds_scope.ConfidenceDot;

__ds_ns.DecisionChip = __ds_scope.DecisionChip;

__ds_ns.ScoreRing = __ds_scope.ScoreRing;

__ds_ns.StatusMiniGrid = __ds_scope.StatusMiniGrid;

__ds_ns.SEAL_GATES = __ds_scope.SEAL_GATES;

__ds_ns.VerificationSeal = __ds_scope.VerificationSeal;

__ds_ns.VerificationSealList = __ds_scope.VerificationSealList;

})();
