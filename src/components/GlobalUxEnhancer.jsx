import { useEffect, useMemo, useRef, useState } from "react";

const SEARCH_HINT = /search|find|type .*name|name.*search|تلاش|نام لکھ/i;
const LONG_SELECT_MIN_OPTIONS = 7;

const normalize = (value) => String(value || "").trim();

function setNativeSelectValue(select, value) {
  const descriptor = Object.getOwnPropertyDescriptor(
    window.HTMLSelectElement.prototype,
    "value"
  );
  if (descriptor?.set) descriptor.set.call(select, value);
  else select.value = value;
  select.dispatchEvent(new Event("change", { bubbles: true }));
}

function selectOptions(select) {
  return Array.from(select.options || [])
    .map((option, index) => ({
      index,
      value: option.value,
      label: normalize(option.textContent),
      disabled: Boolean(option.disabled),
      hidden: Boolean(option.hidden),
    }))
    .filter((option) => !option.hidden);
}

export default function GlobalUxEnhancer() {
  const [picker, setPicker] = useState(null);
  const [term, setTerm] = useState("");
  const pickerRef = useRef(null);
  const searchRef = useRef(null);

  const closePicker = () => {
    setPicker(null);
    setTerm("");
  };

  const openPicker = (select) => {
    if (!(select instanceof HTMLSelectElement)) return false;
    if (select.disabled || select.multiple || select.dataset.noSearch === "true") return false;

    const options = selectOptions(select);
    const forced = select.dataset.searchable === "true";
    if (!forced && options.length < LONG_SELECT_MIN_OPTIONS) return false;

    const rect = select.getBoundingClientRect();
    const margin = 10;
    const width = Math.min(
      Math.max(rect.width, 320),
      Math.max(240, window.innerWidth - margin * 2)
    );
    const preferredHeight = Math.min(390, Math.max(250, window.innerHeight * 0.52));
    const roomBelow = window.innerHeight - rect.bottom - margin;
    const roomAbove = rect.top - margin;
    const openAbove = roomBelow < 250 && roomAbove > roomBelow;
    const maxHeight = Math.max(210, Math.min(preferredHeight, openAbove ? roomAbove : roomBelow));
    const left = Math.min(
      Math.max(margin, rect.left),
      Math.max(margin, window.innerWidth - width - margin)
    );
    const top = openAbove
      ? Math.max(margin, rect.top - Math.min(preferredHeight, roomAbove) - 6)
      : Math.min(window.innerHeight - margin - 210, rect.bottom + 6);

    const dir = select.closest("[dir]")?.getAttribute("dir") || document.documentElement.dir || "ltr";
    setTerm("");
    setPicker({
      select,
      options,
      selectedValue: String(select.value ?? ""),
      left,
      top,
      width,
      maxHeight,
      dir,
    });
    window.setTimeout(() => searchRef.current?.focus(), 0);
    return true;
  };

  useEffect(() => {
    const lists = new Map();

    const enhanceInput = (input, index) => {
      if (!(input instanceof HTMLInputElement)) return;
      if (input.dataset.noAutocomplete === "true") return;
      if (!["", "text", "search"].includes(input.type)) return;

      const hint = `${input.placeholder || ""} ${input.getAttribute("aria-label") || ""} ${input.name || ""}`;
      if (!SEARCH_HINT.test(hint)) return;

      const listId = input.dataset.globalDatalist || `global-search-suggestions-${index}`;
      let list = document.getElementById(listId);
      if (!list) {
        list = document.createElement("datalist");
        list.id = listId;
        document.body.appendChild(list);
      }
      input.dataset.globalDatalist = listId;
      input.setAttribute("list", listId);
      input.setAttribute("autocomplete", "off");
      lists.set(input, list);

      const refresh = () => {
        const inputTerm = normalize(input.value).toLowerCase();
        list.replaceChildren();

        const scope = input.closest("main") || input.closest("[class*='max-w']") || document;
        const values = new Set();
        scope.querySelectorAll("tbody td, option").forEach((node) => {
          const value = normalize(node.textContent);
          if (!value || value.length > 100 || /^[-₨\d.,%\s]+$/.test(value)) return;
          if (!inputTerm || value.toLowerCase().includes(inputTerm)) values.add(value);
        });

        [...values].slice(0, inputTerm ? 16 : 30).forEach((value) => {
          const option = document.createElement("option");
          option.value = value;
          list.appendChild(option);
        });
      };

      if (!input.dataset.globalAutocompleteBound) {
        input.addEventListener("input", refresh);
        input.addEventListener("focus", refresh);
        input.dataset.globalAutocompleteBound = "true";
      }
    };

    const enhanceTableActions = () => {
      const actionHint = /view|details?|edit|delete|remove|print|invoice|return|approve|cancel|history|assign|ledger|open|update|pay|call|تفصیل|ترمیم|حذف|پرنٹ/i;

      document.querySelectorAll(".camz-app main table tbody tr").forEach((row) => {
        if (!(row instanceof HTMLTableRowElement)) return;
        if (row.closest(".inputModalBox,.modal-box,.modal-content,.fullPageInputBox,[role='dialog']")) return;

        const cells = Array.from(row.cells || []);
        if (!cells.length) return;
        const actionCells = cells.filter((cell) => {
          const controls = Array.from(cell.querySelectorAll("button,a[href]"));
          if (!controls.length) return false;
          const labels = controls.map((control) => normalize(
            control.getAttribute("aria-label") || control.getAttribute("title") || control.textContent
          ));
          return controls.length >= 2 || labels.some((label) => actionHint.test(label));
        });
        if (!actionCells.length) return;

        actionCells.forEach((actionCell) => {
          const controls = Array.from(actionCell.querySelectorAll("button,a[href]"));
          if (!controls.length) return;
          actionCell.classList.add("camz-row-actions-cell");
          controls.forEach((control) => control.classList.add("camz-row-action-control"));

          const parent = controls[0]?.parentElement;
          if (parent && parent !== actionCell && controls.every((control) => control.parentElement === parent)) {
            parent.classList.add("camz-row-actions-host");
          }
        });
      });
    };

    const dateValue = (raw) => {
      const text = normalize(raw).replace(/\s+/g, " ");
      if (!text) return "";
      const iso = text.match(/(20\d{2}|19\d{2})[-/.](\d{1,2})[-/.](\d{1,2})/);
      if (iso) return `${iso[1]}-${String(iso[2]).padStart(2, "0")}-${String(iso[3]).padStart(2, "0")}`;
      const dmy = text.match(/(\d{1,2})[-/.](\d{1,2})[-/.](20\d{2}|19\d{2})/);
      if (dmy) {
        const a = Number(dmy[1]);
        const b = Number(dmy[2]);
        const day = a > 12 ? a : b > 12 ? b : a;
        const month = a > 12 ? b : b > 12 ? a : b;
        return `${dmy[3]}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      }
      return "";
    };

    const applyAutoPeriodFilter = (table) => {
      const index = Number(table.dataset.periodDateColumn);
      if (!Number.isInteger(index) || index < 0) return;
      const from = table.dataset.periodFrom || "";
      const to = table.dataset.periodTo || "";
      table.querySelectorAll("tbody tr").forEach((row) => {
        const cell = row.cells?.[index];
        if (!cell) return;
        const value = dateValue(cell.textContent);
        const visible = (!from || (value && value >= from)) && (!to || (value && value <= to));
        row.style.display = visible ? "" : "none";
      });
    };

    const enhanceDateTables = () => {
      document.querySelectorAll(".camz-app main table").forEach((table) => {
        if (!(table instanceof HTMLTableElement)) return;
        if (table.closest(".inputModalBox,.modal-box,.modal-content,.fullPageInputBox,[role='dialog']")) return;

        const main = table.closest("main");
        if (!main) return;

        // Pages with their own real From/To state should keep that logic; this is a fallback
        // for transaction lists that only had search or no date filter at all.
        const ownPeriod = main.querySelector(".camz-period-filter");
        const visibleDateInputs = Array.from(main.querySelectorAll('input[type="date"]')).filter(
          (input) => !input.closest(".inputModalBox,.modal-box,.modal-content,.fullPageInputBox,[role='dialog']")
        );
        if (ownPeriod || visibleDateInputs.length >= 2) {
          if (table.dataset.periodEnhanced === "true") applyAutoPeriodFilter(table);
          return;
        }

        const headers = Array.from(table.querySelectorAll("thead th"));
        const dateIndex = headers.findIndex((header) => {
          const label = normalize(header.textContent).toLowerCase();
          return /(^|\s)(date|dated)(\s|$)|تاریخ/.test(label) && !/due|delivery|clearance/.test(label);
        });
        if (dateIndex < 0) return;

        if (table.dataset.periodEnhanced === "true") {
          applyAutoPeriodFilter(table);
          return;
        }

        const wrap = table.parentElement;
        const host = wrap?.parentElement || wrap;
        if (!host || host.querySelector(':scope > [data-global-period-filter="true"]')) return;

        table.dataset.periodEnhanced = "true";
        table.dataset.periodDateColumn = String(dateIndex);
        table.dataset.periodFrom = "";
        table.dataset.periodTo = "";

        const rtl = Boolean(table.closest('[dir="rtl"]'));
        const toolbar = document.createElement("div");
        toolbar.dataset.globalPeriodFilter = "true";
        toolbar.className = "camz-auto-period-toolbar";
        toolbar.dir = rtl ? "rtl" : "ltr";
        toolbar.innerHTML = `
          <button type="button" class="camz-period-button active" data-period-all>${rtl ? "سب" : "All"}</button>
          <button type="button" class="camz-period-button" data-period-today>${rtl ? "آج" : "Today"}</button>
          <div class="camz-period-filter">
            <label><span>${rtl ? "شروع" : "From"}</span><input type="date" data-period-from /></label>
            <span class="camz-period-separator">→</span>
            <label><span>${rtl ? "اختتام" : "To"}</span><input type="date" data-period-to /></label>
          </div>
          <span class="camz-period-summary" data-period-summary style="display:none"></span>
        `;

        const allButton = toolbar.querySelector("[data-period-all]");
        const todayButton = toolbar.querySelector("[data-period-today]");
        const fromInput = toolbar.querySelector("[data-period-from]");
        const toInput = toolbar.querySelector("[data-period-to]");
        const summary = toolbar.querySelector("[data-period-summary]");

        const refresh = () => {
          table.dataset.periodFrom = fromInput.value || "";
          table.dataset.periodTo = toInput.value || "";
          if (table.dataset.periodFrom && table.dataset.periodTo && table.dataset.periodFrom > table.dataset.periodTo) {
            toInput.value = table.dataset.periodFrom;
            table.dataset.periodTo = table.dataset.periodFrom;
          }
          const isAll = !table.dataset.periodFrom && !table.dataset.periodTo;
          const today = new Date().toISOString().slice(0, 10);
          const isToday = table.dataset.periodFrom === today && table.dataset.periodTo === today;
          allButton.classList.toggle("active", isAll);
          todayButton.classList.toggle("active", isToday);
          if (isAll) {
            summary.style.display = "none";
          } else {
            summary.style.display = "inline-flex";
            summary.textContent = `${rtl ? "مدت" : "Period"}: ${table.dataset.periodFrom || "…"} — ${table.dataset.periodTo || "…"}`;
          }
          applyAutoPeriodFilter(table);
        };

        allButton.addEventListener("click", () => {
          fromInput.value = "";
          toInput.value = "";
          refresh();
        });
        todayButton.addEventListener("click", () => {
          const today = new Date().toISOString().slice(0, 10);
          fromInput.value = today;
          toInput.value = today;
          refresh();
        });
        fromInput.addEventListener("change", refresh);
        toInput.addEventListener("change", refresh);

        host.insertBefore(toolbar, wrap);
        applyAutoPeriodFilter(table);
      });
    };

    const scan = () => {
      document.querySelectorAll("input").forEach(enhanceInput);
      document.querySelectorAll("select").forEach((select) => {
        if (
          select instanceof HTMLSelectElement &&
          !select.multiple &&
          select.dataset.noSearch !== "true" &&
          (select.dataset.searchable === "true" || select.options.length >= LONG_SELECT_MIN_OPTIONS)
        ) {
          select.dataset.searchEnhanced = "true";
          select.title = select.title || "Click to search this list";
        }
      });
      enhanceTableActions();
      enhanceDateTables();
    };

    const onPointerDown = (event) => {
      if (pickerRef.current?.contains(event.target)) return;
      const select = event.target?.closest?.("select");
      if (select && openPicker(select)) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      if (picker) closePicker();
    };

    const onKeyDown = (event) => {
      if (event.key === "Escape" && picker) {
        event.preventDefault();
        closePicker();
        return;
      }
      const select = event.target instanceof HTMLSelectElement ? event.target : null;
      if (!select) return;
      if (["Enter", " ", "ArrowDown"].includes(event.key) && openPicker(select)) {
        event.preventDefault();
      }
    };

    const closeOnResize = () => closePicker();
    const closeOnScroll = (event) => {
      if (pickerRef.current?.contains(event.target)) return;
      closePicker();
    };

    scan();
    const observer = new MutationObserver(scan);
    observer.observe(document.body, { childList: true, subtree: true });
    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("keydown", onKeyDown, true);
    window.addEventListener("resize", closeOnResize);
    window.addEventListener("scroll", closeOnScroll, true);

    return () => {
      observer.disconnect();
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("keydown", onKeyDown, true);
      window.removeEventListener("resize", closeOnResize);
      window.removeEventListener("scroll", closeOnScroll, true);
      lists.forEach((list) => list.remove());
    };
  }, [picker]);

  const filteredOptions = useMemo(() => {
    if (!picker) return [];
    const q = normalize(term).toLocaleLowerCase();
    if (!q) return picker.options;
    return picker.options.filter((option) => option.label.toLocaleLowerCase().includes(q));
  }, [picker, term]);

  const choose = (option) => {
    if (!picker || option.disabled) return;
    const target = picker.select;
    setNativeSelectValue(target, option.value);
    closePicker();
    window.setTimeout(() => target?.focus?.(), 0);
  };

  if (!picker) return null;

  return (
    <div
      ref={pickerRef}
      data-global-select-picker="true"
      dir={picker.dir}
      style={{
        position: "fixed",
        zIndex: 100000,
        left: picker.left,
        top: picker.top,
        width: picker.width,
        maxWidth: "calc(100vw - 20px)",
        background: "#fff",
        border: "1px solid #E2E8F0",
        borderRadius: 12,
        boxShadow: "0 18px 45px rgba(15,23,42,.16)",
        overflow: "hidden",
        fontFamily: "Poppins, Plus Jakarta Sans, sans-serif",
      }}
    >
      <div style={{ padding: 10, borderBottom: "1px solid #EEF2F7", background: "#F8FAFD" }}>
        <div style={{ position: "relative" }}>
          <span
            aria-hidden="true"
            style={{
              position: "absolute",
              top: "50%",
              transform: "translateY(-50%)",
              insetInlineStart: 12,
              color: "#91A6C6",
              fontSize: 14,
              pointerEvents: "none",
            }}
          >
            ⌕
          </span>
          <input
            ref={searchRef}
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") closePicker();
              if (event.key === "Enter" && filteredOptions.length === 1) {
                event.preventDefault();
                choose(filteredOptions[0]);
              }
            }}
            placeholder="Search..."
            autoComplete="off"
            style={{
              width: "100%",
              height: 40,
              border: "1px solid #D6E0EE",
              borderRadius: 10,
              background: "#fff",
              color: "#334155",
              paddingInlineStart: 34,
              paddingInlineEnd: 12,
              outline: "none",
              fontSize: 12,
              fontWeight: 600,
            }}
          />
        </div>
      </div>
      <div style={{ maxHeight: Math.max(160, picker.maxHeight - 62), overflowY: "auto", padding: 6 }}>
        {filteredOptions.length ? (
          filteredOptions.map((option) => {
            const selected = String(option.value) === String(picker.selectedValue);
            return (
              <button
                key={`${option.index}-${option.value}`}
                type="button"
                disabled={option.disabled}
                onClick={() => choose(option)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 10,
                  width: "100%",
                  minHeight: 38,
                  margin: 0,
                  padding: "8px 10px",
                  border: 0,
                  borderRadius: 8,
                  background: selected ? "#EFF6FF" : "#fff",
                  color: selected ? "#0B4E9B" : "#334155",
                  textAlign: picker.dir === "rtl" ? "right" : "left",
                  fontSize: 12,
                  fontWeight: selected ? 800 : 600,
                  cursor: option.disabled ? "not-allowed" : "pointer",
                  opacity: option.disabled ? 0.5 : 1,
                }}
                onMouseEnter={(event) => {
                  if (!selected && !option.disabled) event.currentTarget.style.background = "#F8FAFD";
                }}
                onMouseLeave={(event) => {
                  if (!selected) event.currentTarget.style.background = "#fff";
                }}
              >
                <span style={{ whiteSpace: "normal", lineHeight: 1.45 }}>{option.label || "—"}</span>
                {selected ? <span style={{ color: "#4A86F7", fontWeight: 900 }}>✓</span> : null}
              </button>
            );
          })
        ) : (
          <div style={{ padding: "22px 12px", textAlign: "center", color: "#94A3B8", fontSize: 12 }}>
            No matching options
          </div>
        )}
      </div>
      <div
        style={{
          borderTop: "1px solid #EEF2F7",
          background: "#F8FAFD",
          padding: "7px 10px",
          color: "#94A3B8",
          fontSize: 10,
          fontWeight: 700,
        }}
      >
        {filteredOptions.length} option{filteredOptions.length === 1 ? "" : "s"}
      </div>
    </div>
  );
}
