import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import CustomerSalesLedgerPage from "./CustomerSalesLedgerPage";

const API_ROOT = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"
).replace(/\/$/, "");

const normalizeList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.suppliers)) return payload.suppliers;
  if (Array.isArray(payload?.records)) return payload.records;
  return [];
};

const createJsonResponse = (response, payload) =>
  new Response(JSON.stringify(payload), {
    status: response.status,
    statusText: response.statusText,
    headers: {
      "Content-Type": "application/json",
    },
  });

const installSupplierLedgerFetchAdapter = () => {
  const originalFetch = window.fetch.bind(window);

  const patchedFetch = async (input, init) => {
    const originalUrl =
      typeof input === "string" ? input : String(input?.url || "");

    if (/\/api\/customers(?:\?|$)/i.test(originalUrl)) {
      const response = await originalFetch(
        `${API_ROOT}/api/supplier-ledger/suppliers`,
        init
      );
      const payload = await response.json().catch(() => []);
      const suppliers = normalizeList(payload).map((supplier) => {
        const id =
          supplier.id ?? supplier.supplier_id ?? supplier.value ?? "";

        const name =
          supplier.supplier_name ??
          supplier.name ??
          supplier.name_en ??
          supplier.company_name ??
          "-";

        return {
          ...supplier,
          id: String(id),
          customer_id: String(id),
          customer_name: String(name),
          customer_name_en: String(name),
          phone: String(
            supplier.phone ??
              supplier.mobile ??
              supplier.contact_no ??
              supplier.contact_number ??
              ""
          ),
          city: String(
            supplier.city ??
              supplier.city_en ??
              supplier.address ??
              supplier.location ??
              ""
          ),
          city_en: String(
            supplier.city ??
              supplier.city_en ??
              supplier.address ??
              supplier.location ??
              ""
          ),
          opening_balance: Number(supplier.opening_balance || 0),
        };
      });

      return createJsonResponse(response, suppliers);
    }

    const ledgerMatch = originalUrl.match(
      /\/api\/ledger\/customer\/([^/?]+)\/details(\?[^#]*)?/i
    );

    if (ledgerMatch) {
      const supplierId = ledgerMatch[1];
      const query = ledgerMatch[2] || "";
      return originalFetch(
        `${API_ROOT}/api/supplier-ledger/${supplierId}/details${query}`,
        init
      );
    }

    return originalFetch(input, init);
  };

  window.fetch = patchedFetch;

  return () => {
    if (window.fetch === patchedFetch) {
      window.fetch = originalFetch;
    }
  };
};

const TEXT_REPLACEMENTS = [
  [
    "Complete customer statement with invoice products, sales returns, shipping details and running balance.",
    "Complete supplier statement with purchase invoice products, purchase returns and running balance.",
  ],
  ["Customer Detail Ledger", "Supplier Detail Ledger"],
  ["Customer Sales Ledger", "Supplier Purchase Ledger"],
  ["Detailed Customer Ledger", "Detailed Supplier Ledger"],
  ["customer statement", "supplier statement"],
  ["Customer Invoices", "Supplier Invoices"],
  ["Customer Ledger", "Supplier Ledger"],
  ["Select Customer", "Select Supplier"],
  ["Choose Customer", "Choose Supplier"],
  ["Search customer by name, phone or city", "Search supplier by name, phone or city"],
  ["Loading customers", "Loading suppliers"],
  ["Loading detailed customer ledger", "Loading detailed supplier ledger"],
  ["Select a customer to view the complete ledger.", "Select a supplier to view the complete ledger."],
  ["Products Sold", "Products Purchased"],
  ["Sold Qty", "Purchased Qty"],
  ["Sales Invoice", "Purchase Invoice"],
  ["Sales Return", "Purchase Return"],
  ["sales returns", "purchase returns"],
  ["sales invoices", "purchase invoices"],
  ["customer", "supplier"],
  ["Customer", "Supplier"],
  ["Shipping Information", "Purchase Information"],
  ["Ship To", "Supplier"],
  [
    "انوائس پروڈکٹس، سیلز ریٹرن، شپنگ تفصیل اور رننگ بیلنس کے ساتھ مکمل کسٹمر اسٹیٹمنٹ۔",
    "پرچیز انوائس پروڈکٹس، پرچیز ریٹرن اور رننگ بیلنس کے ساتھ مکمل سپلائر اسٹیٹمنٹ۔",
  ],
  ["کسٹمر تفصیلی لیجر", "سپلائر تفصیلی لیجر"],
  ["کسٹمر لیجر", "سپلائر لیجر"],
  ["کسٹمر منتخب کریں", "سپلائر منتخب کریں"],
  ["کسٹمر تلاش کریں", "سپلائر تلاش کریں"],
  ["کسٹمر لوڈ ہو رہے ہیں", "سپلائر لوڈ ہو رہے ہیں"],
  ["فروخت شدہ پروڈکٹس", "خریدے گئے پروڈکٹس"],
  ["فروخت مقدار", "خریدی گئی مقدار"],
  ["سیلز انوائس", "پرچیز انوائس"],
  ["سیلز ریٹرن", "پرچیز ریٹرن"],
  ["شپنگ کی معلومات", "پرچیز کی معلومات"],
  ["شپ کس کو کیا", "سپلائر"],
  ["کسٹمر", "سپلائر"],
];

const replaceText = (value) => {
  let result = String(value ?? "");

  for (const [from, to] of TEXT_REPLACEMENTS) {
    result = result.split(from).join(to);
  }

  return result;
};

const shouldHideShipmentElement = (element) => {
  const text = String(element?.textContent || "").trim();

  return /^(shipping information|ship to|شپنگ کی معلومات|شپ کس کو کیا)\s*:?\s*$/i.test(
    text
  );
};

const hideShipmentUi = (root) => {
  root
    .querySelectorAll("label, span, p, th, td, div, section")
    .forEach((element) => {
      if (!shouldHideShipmentElement(element)) return;

      let container = element;

      for (let depth = 0; depth < 5 && container; depth += 1) {
        const tag = container.tagName?.toLowerCase();

        if (
          tag === "th" ||
          tag === "td" ||
          container.querySelector?.("input, textarea, select") ||
          container.className?.toString().includes("info")
        ) {
          container.style.display = "none";
          break;
        }

        container = container.parentElement;
      }
    });
};

const transformSupplierLedgerDom = (root) => {
  if (!root) return;

  hideShipmentUi(root);

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes = [];

  while (walker.nextNode()) {
    nodes.push(walker.currentNode);
  }

  nodes.forEach((node) => {
    const updated = replaceText(node.nodeValue);

    if (updated !== node.nodeValue) {
      node.nodeValue = updated;
    }
  });

  root.querySelectorAll("input, textarea").forEach((element) => {
    if (element.placeholder) {
      const updated = replaceText(element.placeholder);

      if (updated !== element.placeholder) {
        element.placeholder = updated;
      }
    }
  });
};

const installPrintTransformer = () => {
  const originalPrint = window.print.bind(window);

  const patchedPrint = (...args) => {
    transformSupplierLedgerDom(document.body);
    return originalPrint(...args);
  };

  window.print = patchedPrint;

  return () => {
    if (window.print === patchedPrint) {
      window.print = originalPrint;
    }
  };
};

export default function SupplierLedgerPage() {
  const rootRef = useRef(null);
  const [ready, setReady] = useState(false);

  useLayoutEffect(() => {
    const removeFetchAdapter = installSupplierLedgerFetchAdapter();
    const removePrintTransformer = installPrintTransformer();

    setReady(true);

    return () => {
      removeFetchAdapter();
      removePrintTransformer();
    };
  }, []);

  useEffect(() => {
    if (!ready || !rootRef.current) return undefined;

    const root = rootRef.current;

    transformSupplierLedgerDom(root);

    const observer = new MutationObserver(() => {
      transformSupplierLedgerDom(root);
    });

    observer.observe(root, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => observer.disconnect();
  }, [ready]);

  if (!ready) return null;

  return (
    <div ref={rootRef} data-page="supplier-ledger-customer-layout">
      <CustomerSalesLedgerPage />
    </div>
  );
}
