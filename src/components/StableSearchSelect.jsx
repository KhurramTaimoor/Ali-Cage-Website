import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

/**
 * Searchable ERP account selector.
 * Intentionally does NOT dismiss on blur, scroll, window resize, or touch
 * outside: Android/iOS keyboard activation used to close the global picker.
 * A user dismisses only with Close / Escape, or selects an option.
 */
export default function StableSearchSelect({
  options = [], value = "", onChange, disabled = false,
  placeholder = "Select account", searchPlaceholder = "Search by name...",
  className = "", label = "Select account", dir = "ltr",
  moreLabel = "Show more accounts", emptyLabel = "No matching accounts",
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(70);
  const inputRef = useRef(null);
  const selected = useMemo(
    () => options.find((row) => String(row.id ?? row.value) === String(value)),
    [options, value]
  );
  const visible = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    if (!query) return options.slice(0, limit);
    return options.filter((row) =>
      String(row.name ?? row.label ?? "").toLocaleLowerCase().includes(query)
    ).slice(0, limit);
  }, [options, search, limit]);

  const openSearch = () => {
    if (disabled) return;
    setSearch("");
    setLimit(70);
    setOpen(true);
  };
  const closeSearch = () => setOpen(false);

  useEffect(() => {
    if (!open) return undefined;
    // iOS/Android virtual keyboards may change viewport/focus during portal mount.
    // Do not open the keyboard programmatically on touch devices: let the user
    // tap the always-visible search field, without dismissing the picker.
    const isTouch = navigator.maxTouchPoints > 0 || window.matchMedia?.("(pointer: coarse)")?.matches;
    if (isTouch) return undefined;
    const frame = window.requestAnimationFrame(() => {
      try { inputRef.current?.focus({ preventScroll: true }); }
      catch { inputRef.current?.focus(); }
    });
    return () => window.cancelAnimationFrame(frame);
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const onEscape = (event) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onEscape);
    return () => document.removeEventListener("keydown", onEscape);
  }, [open]);

  const select = (row) => {
    const nextValue = String(row.id ?? row.value ?? "");
    setOpen(false);
    onChange?.(nextValue);
  };

  return (
    <>
      <button
        type="button"
        aria-label={label}
        aria-haspopup="dialog"
        aria-expanded={open}
        disabled={disabled}
        className={className}
        onClick={openSearch}
        style={{
          width: "100%", textAlign: dir === "rtl" ? "right" : "left",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: 10, overflow: "hidden", cursor: disabled ? "not-allowed" : "pointer",
          backgroundColor: disabled ? "#f1f5f9" : "#fff",
          minHeight: 42, borderRadius: 9, border: "1px solid #cbd5e1",
          padding: "8px 12px", fontSize: 14,
        }}
      >
        <span style={{ whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
          {selected ? String(selected.name ?? selected.label ?? "") : placeholder}
        </span>
        <span aria-hidden="true" style={{ flexShrink: 0, color: "#64748b" }}>⌄</span>
      </button>
      {open && createPortal(
        <div
          data-stable-search-dialog="true"
          role="presentation"
          onPointerDown={(event) => event.stopPropagation()}
          onMouseDown={(event) => event.stopPropagation()}
          onTouchStart={(event) => event.stopPropagation()}
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => {
            if (event.key === "Escape") setOpen(false);
            event.stopPropagation();
          }}
          style={{
            position: "fixed", inset: 0, zIndex: 120000,
            background: "rgba(15,23,42,.52)",
            display: "flex", justifyContent: "center", alignItems: "flex-start",
            overflowY: "auto", padding: "max(12px, env(safe-area-inset-top)) 12px 12px",
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-label={label}
            dir={dir}
            style={{
              width: "min(580px, 100%)",
              maxHeight: "min(580px, calc(100dvh - 24px))",
              background: "#fff", borderRadius: 16, overflow: "hidden",
              display: "flex", flexDirection: "column",
              border: "1px solid #e2e8f0",
              boxShadow: "0 18px 45px rgba(15,23,42,.24)",
            }}
          >
            <div style={{ padding: "15px 16px", borderBottom: "1px solid #e2e8f0", flexShrink: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <strong style={{ fontSize: 15, color: "#13263a" }}>{label}</strong>
                <button type="button" onClick={closeSearch}
                  style={{ border: "1px solid #cbd5e1", background: "#f8fafc", borderRadius: 8, padding: "8px 12px", color: "#334155", fontWeight: 700 }}>
                  ✕ Close
                </button>
              </div>
              <input
                ref={inputRef}
                data-stable-search-input="true"
                data-no-autocomplete="true"
                type="search"
                autoComplete="off"
                spellCheck={false}
                autoCorrect="off"
                autoCapitalize="none"
                inputMode="search"
                name="erp-stable-account-filter"
                aria-label={searchPlaceholder}
                placeholder={searchPlaceholder}
                value={search}
                onChange={(event) => { setSearch(event.target.value); setLimit(70); }}
                onFocus={(event) => event.stopPropagation()}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && visible.length === 1) {
                    event.preventDefault();
                    select(visible[0]);
                  }
                }}
                style={{
                  width: "100%", height: 46, borderRadius: 10,
                  border: "1px solid #93b4de", padding: "9px 12px",
                  fontSize: 16, color: "#13263a", background: "white",
                  outlineOffset: 2, boxSizing: "border-box",
                  WebkitUserSelect: "text", userSelect: "text",
                }}
              />
            </div>
            <div style={{
              overflowY: "auto", overscrollBehavior: "contain",
              WebkitOverflowScrolling: "touch", touchAction: "pan-y",
              padding: 8, flex: 1, minHeight: 60,
            }}>
              {visible.length ? visible.map((row, index) => {
                const id = String(row.id ?? row.value ?? "");
                return (
                  <button
                    key={id + "-" + index}
                    type="button"
                    onClick={() => select(row)}
                    style={{
                      display: "block", width: "100%", minHeight: 44,
                      textAlign: dir === "rtl" ? "right" : "left",
                      background: String(value) === id ? "#eff6ff" : "#fff",
                      border: 0, borderBottom: "1px solid #f1f5f9",
                      padding: "10px 12px", borderRadius: 8,
                      color: "#1e293b", fontWeight: String(value) === id ? 800 : 600,
                      fontSize: 14, cursor: "pointer", whiteSpace: "normal",
                      overflowWrap: "anywhere",
                    }}
                  >
                    {String(row.name ?? row.label ?? "")}
                  </button>
                );
              }) : (
                <p style={{ textAlign: "center", padding: 20, fontSize: 13, color: "#64748b" }}>
                  {emptyLabel}
                </p>
              )}
              {options.length > limit && visible.length === limit && (
                <button type="button" onClick={() => setLimit((count) => count + 100)}
                  style={{
                    width: "100%", marginTop: 6, padding: 10, borderRadius: 8,
                    background: "#eff6ff", border: "1px solid #bfdbfe",
                    color: "#1d4ed8", fontWeight: 700, fontSize: 13,
                  }}>
                  {moreLabel}
                </button>
              )}
            </div>
          </section>
        </div>, document.body
      )}
    </>
  );
}
