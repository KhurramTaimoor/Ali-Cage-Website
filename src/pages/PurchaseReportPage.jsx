import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import axios from "axios";
import SalesReportPage from "./SalesReportPage";

const installPurchaseReportApiAdapter = () => {
  const requestInterceptor = axios.interceptors.request.use((config) => {
    const url = String(config.url || "");
    config.__purchaseReportOriginalUrl = url;

    if (url.includes("/api/sales-report")) {
      config.url = url.replace("/api/sales-report", "/api/purchase-report");
    } else if (url.includes("/api/sales-invoices")) {
      config.url = url.replace(
        "/api/sales-invoices",
        "/api/purchase-invoices"
      );
    } else if (url.includes("/api/sales-returns")) {
      config.url = url.replace(
        "/api/sales-returns",
        "/api/purchase-returns"
      );
    }

    return config;
  });

  return () => {
    axios.interceptors.request.eject(requestInterceptor);
  };
};

const TEXT_REPLACEMENTS = [
  ["Sales Invoice & Return Report", "Purchase Invoice & Return Report"],
  ["Sales invoices and sales returns report", "Purchase invoices and purchase returns report"],
  ["Sales Report", "Purchase Report"],
  ["Sales Invoice", "Purchase Invoice"],
  ["Sales Return Details", "Purchase Return Details"],
  ["Sales Return", "Purchase Return"],
  ["Net Sales", "Net Purchases"],
  ["Search by Name", "Search by Supplier"],
  ["Type customer/person name", "Type supplier name"],
  ["customer/person", "supplier"],
  ["Customer/Person", "Supplier"],
  ["Paid Amount", "Paid Amount"],
  ["سیلز انوائس اور ریٹرن رپورٹ", "پرچیز انوائس اور ریٹرن رپورٹ"],
  ["سیلز رپورٹ", "پرچیز رپورٹ"],
  ["سیلز انوائس", "پرچیز انوائس"],
  ["سیلز ریٹرن تفصیل", "پرچیز ریٹرن تفصیل"],
  ["سیلز ریٹرن", "پرچیز ریٹرن"],
  ["نیٹ سیلز", "نیٹ پرچیز"],
  ["کسٹمر/شخص کا نام لکھیں", "سپلائر کا نام لکھیں"],
];

const replaceText = (value) => {
  let result = String(value ?? "");

  for (const [from, to] of TEXT_REPLACEMENTS) {
    result = result.split(from).join(to);
  }

  return result;
};

const hideShipmentUi = (root) => {
  root
    .querySelectorAll("label, span, p, th, td, div")
    .forEach((element) => {
      const text = String(element.textContent || "").trim();

      if (!/^(shipment to|ship to|شپ ٹو|شپ کس کو کیا)\s*:?\s*$/i.test(text)) {
        return;
      }

      let container = element;

      for (let depth = 0; depth < 5 && container; depth += 1) {
        const tag = container.tagName?.toLowerCase();

        if (
          tag === "th" ||
          tag === "td" ||
          container.querySelector?.("input, textarea, select")
        ) {
          container.style.display = "none";
          break;
        }

        container = container.parentElement;
      }
    });
};

const transformPurchaseReportDom = (root) => {
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

const installWindowOpenTransformer = () => {
  const originalOpen = window.open;

  const patchedOpen = function patchedWindowOpen(...args) {
    const popup = originalOpen.apply(window, args);

    if (!popup?.document) return popup;

    const originalClose = popup.document.close.bind(popup.document);

    popup.document.close = (...closeArgs) => {
      const result = originalClose(...closeArgs);

      window.setTimeout(() => {
        try {
          transformPurchaseReportDom(popup.document.body);
        } catch {
          // The print window may already be closed.
        }
      }, 0);

      return result;
    };

    return popup;
  };

  window.open = patchedOpen;

  return () => {
    if (window.open === patchedOpen) {
      window.open = originalOpen;
    }
  };
};

export default function PurchaseReportPage() {
  const rootRef = useRef(null);
  const [ready, setReady] = useState(false);

  useLayoutEffect(() => {
    const removeApiAdapter = installPurchaseReportApiAdapter();
    const removeWindowTransformer = installWindowOpenTransformer();

    setReady(true);

    return () => {
      removeApiAdapter();
      removeWindowTransformer();
    };
  }, []);

  useEffect(() => {
    if (!ready || !rootRef.current) return undefined;

    const root = rootRef.current;

    transformPurchaseReportDom(root);

    const observer = new MutationObserver(() => {
      transformPurchaseReportDom(root);
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
    <div ref={rootRef} data-page="purchase-report-sales-layout">
      <SalesReportPage />
    </div>
  );
}
