import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import axios from "axios";
import SalesInvoicePage from "./SalesInvoicePage";

const API_ROOT = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"
).replace(/\/$/, "");

const PURCHASE_INVOICES_API = `${API_ROOT}/api/purchase-invoices`;

const getList = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.rows)) return value.rows;
  if (Array.isArray(value?.result)) return value.result;
  if (Array.isArray(value?.products)) return value.products;
  return [];
};

const toNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const getRecordId = (row) =>
  row?.id ??
  row?.value ??
  row?.product_id ??
  row?.category_id ??
  row?.unit_id ??
  row?.supplier_id ??
  row?.product_type_id ??
  "";

const pickText = (row, keys) => {
  for (const key of keys) {
    if (
      row?.[key] !== undefined &&
      row?.[key] !== null &&
      String(row[key]).trim()
    ) {
      return String(row[key]).trim();
    }
  }
  return "";
};

const cache = {
  suppliers: [],
  products: [],
  categories: [],
  units: [],
  productTypes: [],
  invoices: [],
};

const findById = (list, id) =>
  list.find((row) => String(getRecordId(row)) === String(id));

const supplierName = (row) =>
  pickText(row, [
    "supplier_name",
    "supplier_name_en",
    "vendor_name",
    "company_name",
    "name",
    "name_en",
    "title",
  ]);

const productName = (row) =>
  pickText(row, [
    "product_name",
    "product_name_en",
    "item_name",
    "name",
    "name_en",
    "title",
  ]);

const categoryName = (row) =>
  pickText(row, [
    "category_name",
    "category_name_en",
    "name",
    "name_en",
    "title",
  ]);

const unitName = (row) =>
  pickText(row, [
    "unit_name",
    "unit_name_en",
    "symbol",
    "name",
    "name_en",
    "title",
  ]);

const typeName = (row) =>
  pickText(row, [
    "product_type_en",
    "product_type",
    "product_type_name",
    "type_name",
    "type",
    "name",
    "name_en",
    "title",
  ]);

const findIdByName = (list, name, nameGetter) => {
  const target = String(name || "").trim().toLowerCase();
  if (!target) return "";
  const found = list.find(
    (row) => String(nameGetter(row) || "").trim().toLowerCase() === target
  );
  return found ? String(getRecordId(found)) : "";
};

const parseData = (data) => {
  if (typeof data !== "string") return data || {};
  try {
    return JSON.parse(data);
  } catch {
    return {};
  }
};

const makeAxiosResponse = (config, data, status = 200) => ({
  data,
  status,
  statusText: status >= 200 && status < 300 ? "OK" : "Error",
  headers: {},
  config,
  request: null,
});

const emptyAdapter = (data) => async (config) =>
  makeAxiosResponse(config, data);

const resolveProduct = (item) => findById(cache.products, item?.product_id);
const resolveCategory = (item) =>
  findById(cache.categories, item?.category_id);
const resolveUnit = (item) => findById(cache.units, item?.unit_id);
const resolveType = (item) =>
  findById(cache.productTypes, item?.product_type_id);

const mapSalesItemToPurchase = (item) => {
  const product = resolveProduct(item);
  const category = resolveCategory(item);
  const unit = resolveUnit(item);
  const productType = resolveType(item);

  const quantity = toNumber(
    item?.qty ??
      item?.quantity ??
      item?.pieces_qty ??
      item?.carton_qty ??
      item?.order_qty
  );
  const rate = toNumber(item?.rate);
  const amount = toNumber(item?.amount) || quantity * rate;

  return {
    product_name:
      item?.product_name ||
      productName(product) ||
      String(item?.product_description || "").trim() ||
      `Product #${item?.product_id || ""}`,
    unit_name: item?.unit_name || unitName(unit),
    category_name: item?.category_name || categoryName(category),
    type_name:
      item?.type_name ||
      item?.product_type ||
      typeName(productType) ||
      typeName(product),
    quantity,
    rate,
    amount: Number(amount.toFixed(2)),
  };
};

const mapSalesPayloadToPurchase = (body) => {
  const items = getList(
    body?.items || body?.invoice_items || body?.sales_invoice_items || []
  )
    .map(mapSalesItemToPurchase)
    .filter(
      (item) =>
        item.product_name ||
        item.quantity > 0 ||
        item.rate > 0 ||
        item.amount > 0
    );

  const calculated = items.reduce(
    (sum, item) => sum + toNumber(item.amount),
    0
  );

  const total =
    toNumber(body?.grand_total) ||
    toNumber(body?.invoice_total) ||
    toNumber(body?.total_amount) ||
    calculated;

  const selectedSupplier = findById(
    cache.suppliers,
    body?.supplier_id || body?.party_id
  );

  return {
    invoice_no: String(body?.invoice_no || "").trim(),
    supplier_name:
      String(
        body?.party_name ||
          body?.supplier_name ||
          body?.customer_name_en ||
          body?.customer_name ||
          supplierName(selectedSupplier) ||
          ""
      ).trim(),
    invoice_date: body?.invoice_date || "",
    total_amount: Number(total.toFixed(2)),
    debit: Number(total.toFixed(2)),
    credit: 0,
    status: body?.status || "pending",
    items,
  };
};

const mapPurchaseItemToSales = (item, index) => {
  const productId =
    item?.product_id ||
    findIdByName(cache.products, item?.product_name, productName);
  const categoryId =
    item?.category_id ||
    findIdByName(cache.categories, item?.category_name, categoryName);
  const unitId =
    item?.unit_id ||
    findIdByName(cache.units, item?.unit_name, unitName);
  const productTypeId =
    item?.product_type_id ||
    findIdByName(cache.productTypes, item?.type_name, typeName);

  const quantity = toNumber(item?.quantity ?? item?.qty);
  const rate = toNumber(item?.rate);
  const amount = toNumber(item?.amount) || quantity * rate;

  return {
    ...item,
    sr: item?.sr || index + 1,
    product_id: productId || "",
    category_id: categoryId || "",
    unit_id: unitId || "",
    product_type_id: productTypeId || "",
    product_name: item?.product_name || "",
    product_description: item?.product_description || "",
    description: item?.product_description || "",
    sale_type: item?.sale_type || "single",
    carton_qty: 0,
    pieces_qty: quantity,
    qty: quantity,
    quantity,
    pieces_per_carton: 0,
    rate,
    amount,
    debit: 0,
    credit: 0,
  };
};

const mapPurchaseInvoiceToSales = (invoice) => {
  if (!invoice || typeof invoice !== "object") return invoice;

  const supplierId =
    invoice?.supplier_id ||
    invoice?.party_id ||
    findIdByName(cache.suppliers, invoice?.supplier_name, supplierName);

  const items = Array.isArray(invoice?.items)
    ? invoice.items.map(mapPurchaseItemToSales)
    : [];

  const total =
    toNumber(invoice?.total_amount) ||
    items.reduce((sum, item) => sum + toNumber(item.amount), 0);

  return {
    ...invoice,
    party_type: "supplier",
    customer_type: "supplier",
    party_id: supplierId || "",
    supplier_id: supplierId || "",
    party_name: invoice?.supplier_name || "",
    customer_name: invoice?.supplier_name || "",
    customer_name_en: invoice?.supplier_name || "",
    customer_id: null,
    employee_id: null,
    general_ledger_id: null,
    reference_no: invoice?.reference_no || "",
    shipment_to: "",
    address: invoice?.address || "",
    previous_balance: toNumber(invoice?.previous_balance),
    delivery_charges: toNumber(invoice?.delivery_charges),
    discount: toNumber(invoice?.discount),
    invoice_total: total,
    total_amount: total,
    grand_total: total,
    total_qty: items.reduce((sum, item) => sum + toNumber(item.qty), 0),
    items_count: items.length,
    items,
  };
};

const mapInvoiceResponse = (responseData) => {
  if (Array.isArray(responseData)) {
    const mapped = responseData.map(mapPurchaseInvoiceToSales);
    cache.invoices = mapped;
    return mapped;
  }

  if (!responseData || typeof responseData !== "object") {
    return responseData;
  }

  const next = { ...responseData };

  if (Array.isArray(next.data)) {
    next.data = next.data.map(mapPurchaseInvoiceToSales);
    cache.invoices = next.data;
  } else if (next.data && typeof next.data === "object") {
    next.data = mapPurchaseInvoiceToSales(next.data);
  }

  if (Array.isArray(next.invoices)) {
    next.invoices = next.invoices.map(mapPurchaseInvoiceToSales);
    cache.invoices = next.invoices;
  }

  if (next.invoice && typeof next.invoice === "object") {
    next.invoice = mapPurchaseInvoiceToSales(next.invoice);
  }

  if (
    next.id &&
    !next.data &&
    !next.invoice &&
    !Array.isArray(next.invoices)
  ) {
    return mapPurchaseInvoiceToSales(next);
  }

  return next;
};

const cacheMasterResponse = (url, responseData) => {
  const list = getList(responseData);

  if (url.includes("/api/suppliers")) cache.suppliers = list;
  if (url.includes("/api/products")) cache.products = list;
  if (url.includes("/api/categories")) cache.categories = list;
  if (url.includes("/api/units")) cache.units = list;
  if (url.includes("/api/product-types")) cache.productTypes = list;
};

const installPurchaseInvoiceApiAdapter = () => {
  const requestId = axios.interceptors.request.use((config) => {
    const rawUrl = String(config.url || "");
    const originalUrl = rawUrl.replace("/api/api/", "/api/");
    config.url = originalUrl;
    config.__purchaseInvoiceOriginalUrl = originalUrl;

    // SalesInvoicePage initially opens with party_type="customer".
    // Return the supplier list through that lookup as well, so the exact
    // Sales layout always has supplier names before the DOM forces Supplier.
    if (originalUrl.includes("/api/customers")) {
      config.url = originalUrl
        .replace("/api/api/customers", "/api/suppliers")
        .replace("/api/customers", "/api/suppliers");
      config.__purchaseSupplierAlias = true;
      return config;
    }

    if (
      originalUrl.includes("/api/employees") ||
      originalUrl.includes("/api/general-ledgers")
    ) {
      config.adapter = emptyAdapter([]);
      return config;
    }

    if (originalUrl.includes("/api/sale-orders")) {
      config.adapter = emptyAdapter({ success: true, data: [], orders: [] });
      return config;
    }

    if (originalUrl.includes("/api/sales-invoices/customer/")) {
      const parts = originalUrl.split("/");
      const partyId = parts[parts.length - 1];
      const filtered = cache.invoices.filter(
        (invoice) => String(invoice.party_id) === String(partyId)
      );
      config.adapter = emptyAdapter({
        success: true,
        data: filtered,
        invoices: filtered,
      });
      return config;
    }

    if (originalUrl.includes("/api/sales-invoices/bulk-print-data")) {
      const body = parseData(config.data);
      const ids = Array.isArray(body?.ids) ? body.ids.map(String) : [];
      const filtered = cache.invoices.filter((invoice) =>
        ids.includes(String(invoice.id))
      );
      config.adapter = emptyAdapter({
        success: true,
        data: filtered,
        invoices: filtered,
      });
      return config;
    }

    if (originalUrl.includes("/api/sales-invoices")) {
      config.url = originalUrl.replace(
        "/api/sales-invoices",
        "/api/purchase-invoices"
      );

      const method = String(config.method || "get").toLowerCase();
      if (method === "post" || method === "put" || method === "patch") {
        config.data = mapSalesPayloadToPurchase(parseData(config.data));
      }
    }

    return config;
  });

  const responseId = axios.interceptors.response.use(
    (response) => {
      const originalUrl = String(
        response?.config?.__purchaseInvoiceOriginalUrl ||
          response?.config?.url ||
          ""
      );

      cacheMasterResponse(originalUrl, response.data);

      if (response?.config?.__purchaseSupplierAlias) {
        cache.suppliers = getList(response.data);
      }

      if (originalUrl.includes("/api/sales-invoices")) {
        response.data = mapInvoiceResponse(response.data);
      }

      return response;
    },
    (error) => Promise.reject(error)
  );

  return () => {
    axios.interceptors.request.eject(requestId);
    axios.interceptors.response.eject(responseId);
  };
};

const TEXT_REPLACEMENTS = [
  ["All Sales Invoices", "All Purchase Invoices"],
  ["All Sales Invoice", "All Purchase Invoice"],
  ["Sales Invoices", "Purchase Invoices"],
  ["Sales Invoice", "Purchase Invoice"],
  ["sales invoices", "purchase invoices"],
  ["sales invoice", "purchase invoice"],
  ["Customer Invoices", "Supplier Invoices"],
  ["customer invoices", "supplier invoices"],
  ["Type customer name", "Type supplier name"],
  ["Customer Type", "Supplier"],
  ["Select Name", "Select Supplier"],
  ["Customer", "Supplier"],
  ["Invoice saved.", "Purchase invoice saved."],
  ["Invoice updated.", "Purchase invoice updated."],
  ["Invoice deleted.", "Purchase invoice deleted."],
  ["سیلز انوائسز", "پرچیز انوائسز"],
  ["سیلز انوائس", "پرچیز انوائس"],
  ["کسٹمر انوائسز", "سپلائر انوائسز"],
  ["کسٹمر کا نام", "سپلائر کا نام"],
  ["کسٹمر ٹائپ", "سپلائر"],
  ["کسٹمر", "سپلائر"],
];

const replacePurchaseText = (value) => {
  let result = String(value || "");
  for (const [from, to] of TEXT_REPLACEMENTS) {
    result = result.split(from).join(to);
  }
  return result;
};

const setNativeValue = (element, value) => {
  const prototype = Object.getPrototypeOf(element);
  const descriptor = Object.getOwnPropertyDescriptor(prototype, "value");

  if (descriptor?.set) descriptor.set.call(element, value);
  else element.value = value;

  element.dispatchEvent(new Event("input", { bubbles: true }));
  element.dispatchEvent(new Event("change", { bubbles: true }));
};

const forceSupplierOnly = (root) => {
  root.querySelectorAll("select").forEach((select) => {
    const options = Array.from(select.options || []);
    const supplierOption = options.find(
      (option) =>
        option.value === "supplier" ||
        /^(supplier|سپلائر)$/i.test(option.textContent.trim())
    );
    const isPartyTypeSelect =
      supplierOption &&
      options.some(
        (option) =>
          option.value === "customer" ||
          option.value === "employee" ||
          option.value === "general_ledger" ||
          /customer|employee|general ledger|کسٹمر|ملازم|جنرل لیجر/i.test(
            option.textContent
          )
      );

    if (!isPartyTypeSelect) return;

    options.forEach((option) => {
      const keep = option === supplierOption;
      option.hidden = !keep;
      option.disabled = !keep;
    });

    if (select.value !== supplierOption.value) {
      setNativeValue(select, supplierOption.value);
    }
  });
};

const hideShipmentFields = (root) => {
  root.querySelectorAll("label, span, p, th, td, div").forEach((element) => {
    const directText = Array.from(element.childNodes)
      .filter((node) => node.nodeType === Node.TEXT_NODE)
      .map((node) => node.nodeValue)
      .join(" ")
      .trim();

    if (!/^(ship\s*to|شپ\s*ٹو)\s*:?\s*$/i.test(directText)) return;

    let container = element;
    for (let depth = 0; depth < 4 && container; depth += 1) {
      if (
        container.matches?.("th,td") ||
        container.querySelector?.("input,textarea,select")
      ) {
        container.style.display = "none";
        break;
      }
      container = container.parentElement;
    }
  });
};

const transformPurchaseDom = (root) => {
  if (!root) return;

  hideShipmentFields(root);
  forceSupplierOnly(root);

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode);

  textNodes.forEach((node) => {
    const next = replacePurchaseText(node.nodeValue);
    if (next !== node.nodeValue) node.nodeValue = next;
  });

  root.querySelectorAll("input, textarea").forEach((input) => {
    if (input.placeholder) {
      const nextPlaceholder = replacePurchaseText(input.placeholder);
      if (nextPlaceholder !== input.placeholder) {
        input.placeholder = nextPlaceholder;
      }
    }

    if (/^sales-invoice/i.test(input.value || "")) {
      setNativeValue(
        input,
        String(input.value).replace(/^sales-invoice/i, "purchase-invoice")
      );
    }
  });
};

const installPrintTransformer = () => {
  const originalOpen = window.open;

  const patchedOpen = function patchedWindowOpen(...args) {
    const popup = originalOpen.apply(window, args);
    if (!popup?.document) return popup;

    const originalClose = popup.document.close.bind(popup.document);
    popup.document.close = (...closeArgs) => {
      const result = originalClose(...closeArgs);
      window.setTimeout(() => {
        try {
          transformPurchaseDom(popup.document.body);
        } catch {
          // Print window may already be closed.
        }
      }, 0);
      return result;
    };

    return popup;
  };

  window.open = patchedOpen;

  return () => {
    if (window.open === patchedOpen) window.open = originalOpen;
  };
};

function PurchaseInvoicePage() {
  const rootRef = useRef(null);
  const [ready, setReady] = useState(false);

  useLayoutEffect(() => {
    const removeApiAdapter = installPurchaseInvoiceApiAdapter();
    const removePrintTransformer = installPrintTransformer();
    setReady(true);

    return () => {
      removeApiAdapter();
      removePrintTransformer();
    };
  }, []);

  useEffect(() => {
    if (!ready || !rootRef.current) return undefined;

    const root = rootRef.current;
    transformPurchaseDom(root);

    const observer = new MutationObserver(() => {
      transformPurchaseDom(root);
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
    <div ref={rootRef} data-page="purchase-invoice-exact-sales-layout">
      <SalesInvoicePage />
    </div>
  );
}

export default PurchaseInvoicePage;
