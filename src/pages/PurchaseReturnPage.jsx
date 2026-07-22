import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import axios from "axios";
import SalesReturnPage from "./SalesReturnPage";

const API_ROOT = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"
).replace(/\/$/, "");

// Supports both:
// VITE_API_BASE_URL=https://example.com
// VITE_API_BASE_URL=https://example.com/api
const API_ORIGIN = API_ROOT.replace(/\/api$/i, "");

const apiUrl = (path) =>
  `${API_ORIGIN}${String(path || "").startsWith("/") ? path : `/${path}`}`;

const rawAxios = axios.create();

const getList = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.rows)) return value.rows;
  if (Array.isArray(value?.result)) return value.result;
  if (Array.isArray(value?.returns)) return value.returns;
  if (Array.isArray(value?.invoices)) return value.invoices;
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
  purchaseReturns: [],
  syntheticRows: new Map(),
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

const findIdByName = (list, name, getter) => {
  const target = String(name || "").trim().toLowerCase();
  if (!target) return "";

  const found = list.find(
    (row) => String(getter(row) || "").trim().toLowerCase() === target
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

const responseFromRawAxios = async (config, requestConfig) => {
  const response = await rawAxios(requestConfig);
  return makeAxiosResponse(
    config,
    response.data,
    response.status
  );
};

const resolveProduct = (item) => findById(cache.products, item?.product_id);
const resolveCategory = (item) =>
  findById(cache.categories, item?.category_id);
const resolveUnit = (item) => findById(cache.units, item?.unit_id);
const resolveType = (item) =>
  findById(cache.productTypes, item?.product_type_id);

const mapSalesReturnItemToPurchase = (item) => {
  const product = resolveProduct(item);
  const category = resolveCategory(item);
  const unit = resolveUnit(item);
  const productType = resolveType(item);

  const quantity = toNumber(
    item?.return_qty ?? item?.qty ?? item?.quantity
  );
  const rate = toNumber(item?.rate);
  const amount =
    toNumber(item?.return_amount ?? item?.amount) || quantity * rate;

  return {
    // Automatic Purchase Return ke liye exact invoice line identity preserve
    // karna zaroori hai. In fields ko remove karne par backend ko sirf
    // "Product #" milta tha aur valid item filter empty ho jata tha.
    invoice_item_id:
      item?.invoice_item_id ||
      item?.purchase_invoice_item_id ||
      item?.item_id ||
      null,

    product_id:
      item?.product_id ||
      product?.id ||
      product?.product_id ||
      null,

    category_id:
      item?.category_id ||
      category?.id ||
      category?.category_id ||
      null,

    unit_id:
      item?.unit_id ||
      unit?.id ||
      unit?.unit_id ||
      null,

    product_type_id:
      item?.product_type_id ||
      productType?.id ||
      productType?.product_type_id ||
      null,

    product_name:
      item?.product_name ||
      item?.manual_product_name ||
      productName(product) ||
      String(item?.product_description || "").trim() ||
      "",

    product_description:
      item?.product_description ||
      item?.description ||
      "",

    unit_name:
      item?.unit_name ||
      unitName(unit),

    category_name:
      item?.category_name ||
      categoryName(category),

    type_name:
      item?.type_name ||
      item?.product_type ||
      typeName(productType) ||
      typeName(product),

    quantity,
    return_qty: quantity,
    rate,
    amount: Number(amount.toFixed(2)),
    return_amount: Number(amount.toFixed(2)),
  };
};

const getReturnBodyItems = (body) => {
  if (Array.isArray(body)) return body;
  if (Array.isArray(body?.items)) return body.items;
  if (Array.isArray(body?.returns)) return body.returns;
  if (Array.isArray(body?.return_items)) return body.return_items;
  return [body];
};

const mapSalesReturnPayload = (body) => {
  const sourceItems = getReturnBodyItems(body);
  const items = sourceItems
    .map(mapSalesReturnItemToPurchase)
    .filter(
      (item) =>
        item.quantity > 0 &&
        (
          item.invoice_item_id ||
          item.product_id ||
          String(item.product_name || "").trim()
        )
    );

  if (!items.length) {
    throw new Error(
      "Return product identity missing hai. Invoice dobara select karke product tick karein."
    );
  }

  const total = items.reduce(
    (sum, item) => sum + toNumber(item.amount),
    0
  );

  return {
    invoice_id: Number(
      body?.invoice_id || sourceItems.find((item) => item?.invoice_id)?.invoice_id
    ) || 0,
    return_date:
      body?.return_date ||
      sourceItems.find((item) => item?.return_date)?.return_date ||
      new Date().toISOString().slice(0, 10),
    reason:
      String(
        body?.reason ||
          sourceItems.find((item) => item?.reason)?.reason ||
          ""
      ).trim(),
    total_amount: Number(total.toFixed(2)),
    debit: toNumber(
      body?.debit ??
        sourceItems.reduce(
          (sum, item) => sum + toNumber(item?.debit),
          0
        )
    ),
    credit:
      toNumber(
        body?.credit ??
          sourceItems.reduce(
            (sum, item) => sum + toNumber(item?.credit),
            0
          )
      ) || Number(total.toFixed(2)),
    items,
    party_name:
      body?.party_name ||
      sourceItems.find((item) => item?.party_name)?.party_name ||
      "",
    return_no:
      body?.return_no ||
      sourceItems.find((item) => item?.return_no)?.return_no ||
      "",
  };
};

const mapPurchaseInvoiceItemToSales = (item, index) => {
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
    id: item?.id || `${index + 1}`,
    invoice_item_id: item?.id || "",
    sr: index + 1,
    product_id: productId || "",
    category_id: categoryId || "",
    unit_id: unitId || "",
    product_type_id: productTypeId || "",
    product_name: item?.product_name || "",
    product_description: item?.product_description || "",
    description: item?.product_description || "",
    product_type: item?.type_name || "FMS",
    sale_type: "single",
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
    ? invoice.items.map(mapPurchaseInvoiceItemToSales)
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
    invoice_total: total,
    grand_total: total,
    items_count: items.length,
    total_qty: items.reduce((sum, item) => sum + toNumber(item.qty), 0),
    items,
  };
};

const invoiceDataForReturn = (invoiceId, purchaseItem) => {
  const invoice = cache.invoices.find(
    (row) => String(row.id) === String(invoiceId)
  );

  const item = invoice?.items?.find(
    (invoiceItem) => {
      if (
        purchaseItem?.product_id &&
        invoiceItem?.product_id &&
        String(invoiceItem.product_id) === String(purchaseItem.product_id)
      ) {
        return true;
      }

      return (
        String(invoiceItem.product_name || "").trim().toLowerCase() ===
          String(purchaseItem.product_name || "").trim().toLowerCase() &&
        String(invoiceItem.unit_name || "").trim().toLowerCase() ===
          String(purchaseItem.unit_name || "").trim().toLowerCase()
      );
    }
  );

  return {
    invoice,
    item,
  };
};

const flattenPurchaseReturns = (records) => {
  cache.syntheticRows.clear();
  const rows = [];

  records.forEach((record) => {
    const sourceItems =
      Array.isArray(record?.items) && record.items.length
        ? record.items
        : [{}];

    sourceItems.forEach((item, itemIndex) => {
      const { invoice: sourceInvoice, item: invoiceItem } =
        invoiceDataForReturn(record.invoice_id, item);
      const syntheticId = `pr-${record.id}-${itemIndex}`;
      const supplierId = findIdByName(
        cache.suppliers,
        record.supplier_name,
        supplierName
      );

      const row = {
        id: syntheticId,
        _purchase_return_id: record.id,
        _purchase_item_index: itemIndex,
        return_no:
          record.return_no ||
          `purchase-return${String(record.id).padStart(2, "0")}`,
        return_mode: record.invoice_id ? "auto" : "manual",
        invoice_id: record.invoice_id || "",
        invoice_ref: record.invoice_no || "",
        invoice_no: record.invoice_no || "",
        invoice_item_id: item?.id || "",
        party_type: "supplier",
        party_id: supplierId || "",
        party_name: record.supplier_name || "",
        customer_name: record.supplier_name || "",
        supplier_name: record.supplier_name || "",
        product_id:
          item?.product_id ||
          findIdByName(cache.products, item?.product_name, productName),
        product_name: item?.product_name || "",
        manual_product_name: item?.product_name || "",
        product_description: item?.product_description || "",
        product_type_id:
          item?.product_type_id ||
          findIdByName(cache.productTypes, item?.type_name, typeName),
        product_type: item?.type_name || "FMS",
        category_id:
          item?.category_id ||
          findIdByName(cache.categories, item?.category_name, categoryName),
        category_name: item?.category_name || "",
        unit_id:
          item?.unit_id ||
          findIdByName(cache.units, item?.unit_name, unitName),
        unit_name: item?.unit_name || "",
        return_date: record.return_date || "",
        sale_order_date:
          sourceInvoice?.invoice_date ||
          sourceInvoice?.sale_order_date ||
          "",
        invoice_date:
          sourceInvoice?.invoice_date ||
          sourceInvoice?.sale_order_date ||
          "",
        sold_qty: toNumber(invoiceItem?.quantity ?? item?.quantity),
        already_returned_qty: 0,
        available_qty: Math.max(
          toNumber(invoiceItem?.quantity ?? item?.quantity) -
            toNumber(item?.quantity),
          0
        ),
        return_qty: toNumber(item?.quantity),
        rate: toNumber(item?.rate),
        return_amount: toNumber(item?.amount),
        debit:
          itemIndex === 0 ? toNumber(record?.debit) : 0,
        credit:
          itemIndex === 0 ? toNumber(record?.credit) : toNumber(item?.amount),
        reason: record?.reason || "",
        status: "Saved",
      };

      cache.syntheticRows.set(syntheticId, row);
      rows.push(row);
    });
  });

  return rows;
};

const parseSyntheticId = (value) => {
  const match = String(value || "").match(/^pr-(\d+)-(\d+)$/);
  if (!match) {
    return {
      parentId: Number(value) || 0,
      itemIndex: 0,
    };
  }

  return {
    parentId: Number(match[1]),
    itemIndex: Number(match[2]),
  };
};

const normalizeSupplierRecord = (supplier = {}) => {
  const id =
    supplier.id ??
    supplier.supplier_id ??
    supplier.value ??
    supplier.ID ??
    supplier.Id ??
    "";

  const name = String(
    supplier.supplier_name ??
      supplier.supplier_name_en ??
      supplier.vendor_name ??
      supplier.company_name ??
      supplier.name ??
      supplier.name_en ??
      supplier.title ??
      ""
  ).trim();

  return {
    ...supplier,
    id,
    supplier_id: supplier.supplier_id ?? id,
    supplier_name: name,
    supplier_name_en: name,
    customer_id: supplier.customer_id ?? id,
    customer_name: name,
    customer_name_en: name,
    name,
    name_en: name,
    title: name,
  };
};

const normalizeSupplierPayload = (payload) => {
  if (Array.isArray(payload)) {
    return payload.map(normalizeSupplierRecord);
  }

  if (!payload || typeof payload !== "object") {
    return payload;
  }

  const normalized = { ...payload };

  if (Array.isArray(normalized.data)) {
    normalized.data = normalized.data.map(normalizeSupplierRecord);
  } else if (normalized.data && typeof normalized.data === "object") {
    normalized.data = normalizeSupplierRecord(normalized.data);
  }

  if (Array.isArray(normalized.suppliers)) {
    normalized.suppliers = normalized.suppliers.map(normalizeSupplierRecord);
  }

  if (
    normalized.id &&
    !Array.isArray(normalized.data) &&
    !Array.isArray(normalized.suppliers)
  ) {
    return normalizeSupplierRecord(normalized);
  }

  return normalized;
};

const cacheMasterResponse = (url, responseData) => {
  const list = getList(responseData);

  if (url.includes("/api/suppliers")) cache.suppliers = list;
  if (url.includes("/api/products")) cache.products = list;
  if (url.includes("/api/categories")) cache.categories = list;
  if (url.includes("/api/units")) cache.units = list;
  if (url.includes("/api/product-types")) cache.productTypes = list;
};

const makeManualInvoice = async (payload) => {
  const now = Date.now();
  const total = payload.items.reduce(
    (sum, item) => sum + toNumber(item.amount),
    0
  );

  const response = await rawAxios.post(
    `${API_ORIGIN}/api/purchase-invoices`,
    {
      invoice_no: `PR-MANUAL-${now}`,
      supplier_name: payload.party_name || "Manual Supplier Return",
      invoice_date: payload.return_date,
      total_amount: Number(total.toFixed(2)),
      debit: Number(total.toFixed(2)),
      credit: 0,
      status: "returned",
      items: payload.items,
    }
  );

  return response.data?.data || response.data;
};

const installPurchaseReturnApiAdapter = () => {
  const requestId = axios.interceptors.request.use((config) => {
    const rawUrl = String(config.url || "");
    const originalUrl = rawUrl.replace("/api/api/", "/api/");
    config.url = originalUrl;
    const method = String(config.method || "get").toLowerCase();
    config.__purchaseReturnOriginalUrl = originalUrl;

    // SalesReturnPage also starts from its customer lookup. Feed the supplier
    // records into that lookup, otherwise the Supplier dropdown only contains
    // its placeholder even though /api/suppliers has records.
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
      config.adapter = async (adapterConfig) =>
        makeAxiosResponse(adapterConfig, []);
      return config;
    }

    if (originalUrl.includes("/api/sales-invoices")) {
      config.url = originalUrl.replace(
        "/api/sales-invoices",
        "/api/purchase-invoices"
      );
      return config;
    }

    if (!originalUrl.includes("/api/sales-returns")) {
      return config;
    }

    const suffix = originalUrl.split("/api/sales-returns")[1] || "";

    if (method === "get" && (!suffix || suffix === "/")) {
      config.adapter = async (adapterConfig) =>
        responseFromRawAxios(adapterConfig, {
          method: "get",
          url: `${API_ORIGIN}/api/purchase-returns`,
        });
      return config;
    }

    if (method === "get" && suffix && suffix !== "/") {
      const requestedId = suffix.replace(/^\//, "").split("?")[0];
      const { parentId, itemIndex } = parseSyntheticId(requestedId);
      config.__purchaseReturnItemIndex = itemIndex;
      config.adapter = async (adapterConfig) =>
        responseFromRawAxios(adapterConfig, {
          method: "get",
          url: `${API_ORIGIN}/api/purchase-returns/${parentId}`,
        });
      return config;
    }

    if (method === "delete") {
      const requestedId = suffix.replace(/^\//, "").split("?")[0];
      const { parentId } = parseSyntheticId(requestedId);
      config.adapter = async (adapterConfig) =>
        responseFromRawAxios(adapterConfig, {
          method: "delete",
          url: `${API_ORIGIN}/api/purchase-returns/${parentId}`,
        });
      return config;
    }

    if (method === "post") {
      const salesBody = parseData(config.data);
      config.adapter = async (adapterConfig) => {
        const payload = mapSalesReturnPayload(salesBody);

        if (!payload.invoice_id) {
          const createdInvoice = await makeManualInvoice(payload);
          payload.invoice_id = Number(createdInvoice?.id) || 0;
        }

        return responseFromRawAxios(adapterConfig, {
          method: "post",
          url: `${API_ORIGIN}/api/purchase-returns`,
          data: {
            invoice_id: payload.invoice_id,
            return_date: payload.return_date,
            reason: payload.reason,
            total_amount: payload.total_amount,
            debit: payload.debit,
            credit: payload.credit,
            items: payload.items,
          },
        });
      };
      return config;
    }

    if (method === "put" || method === "patch") {
      const requestedId = suffix.replace(/^\//, "").split("?")[0];
      const { parentId, itemIndex } = parseSyntheticId(requestedId);
      const salesBody = parseData(config.data);

      config.adapter = async (adapterConfig) => {
        const payload = mapSalesReturnPayload(salesBody);
        const current =
          cache.purchaseReturns.find(
            (record) => String(record.id) === String(parentId)
          ) ||
          (
            await rawAxios.get(
              `${API_ORIGIN}/api/purchase-returns/${parentId}`
            )
          ).data;

        const currentItems = Array.isArray(current?.items)
          ? current.items.map((item) => ({
              product_name: item.product_name || "",
              unit_name: item.unit_name || "",
              category_name: item.category_name || "",
              type_name: item.type_name || "",
              quantity: toNumber(item.quantity),
              rate: toNumber(item.rate),
              amount: toNumber(item.amount),
            }))
          : [];

        const replacementItem = payload.items[0];
        if (replacementItem) {
          currentItems[itemIndex] = replacementItem;
        }

        const safeItems = currentItems.filter(Boolean);
        const total = safeItems.reduce(
          (sum, item) => sum + toNumber(item.amount),
          0
        );

        return responseFromRawAxios(adapterConfig, {
          method: "put",
          url: `${API_ORIGIN}/api/purchase-returns/${parentId}`,
          data: {
            invoice_id:
              payload.invoice_id || Number(current?.invoice_id) || 0,
            return_date:
              payload.return_date || current?.return_date || "",
            reason: payload.reason || current?.reason || "",
            total_amount: Number(total.toFixed(2)),
            debit: payload.debit || toNumber(current?.debit),
            credit:
              payload.credit ||
              toNumber(current?.credit) ||
              Number(total.toFixed(2)),
            items: safeItems,
          },
        });
      };
      return config;
    }

    return config;
  });

  const responseId = axios.interceptors.response.use(
    (response) => {
      const originalUrl = String(
        response?.config?.__purchaseReturnOriginalUrl ||
          response?.config?.url ||
          ""
      );

      cacheMasterResponse(originalUrl, response.data);

      if (response?.config?.__purchaseSupplierAlias) {
        response.data = normalizeSupplierPayload(response.data);
        cache.suppliers = getList(response.data);
      }

      if (originalUrl.includes("/api/sales-invoices")) {
        const rawList = getList(response.data);
        const mapped = rawList.map(mapPurchaseInvoiceToSales);
        cache.invoices = mapped;

        if (Array.isArray(response.data)) {
          response.data = mapped;
        } else if (response.data?.data && Array.isArray(response.data.data)) {
          response.data = {
            ...response.data,
            data: mapped,
            invoices: mapped,
          };
        } else if (response.data?.id) {
          response.data = mapPurchaseInvoiceToSales(response.data);
        }
      }

      if (originalUrl.includes("/api/sales-returns")) {
        const method = String(response?.config?.method || "get").toLowerCase();
        const data = response.data;

        if (method === "get") {
          const list = getList(data);

          if (list.length) {
            cache.purchaseReturns = list;
            const rows = flattenPurchaseReturns(list);
            response.data = {
              success: true,
              data: rows,
              returns: rows,
            };
          } else {
            const purchaseRecord = data?.data || data;
            if (purchaseRecord?.id) {
              const rows = flattenPurchaseReturns([purchaseRecord]);
              const itemIndex =
                response?.config?.__purchaseReturnItemIndex || 0;
              const selected = rows[itemIndex] || rows[0] || null;
              response.data = {
                success: true,
                data: selected,
                return: selected,
              };
            }
          }
        } else {
          const purchaseRecord = data?.data || data;
          if (purchaseRecord?.id) {
            const rows = flattenPurchaseReturns([purchaseRecord]);
            response.data = {
              success: true,
              message:
                data?.message ||
                (method === "post"
                  ? "Purchase return saved."
                  : "Purchase return updated."),
              data: rows.length === 1 ? rows[0] : rows,
              returns: rows,
            };
          } else if (method === "delete") {
            response.data = {
              success: true,
              message: data?.message || "Purchase return deleted.",
            };
          }
        }
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
  ["Manual Sales Return", "Manual Purchase Return"],
  ["Automatic Sales Return", "Automatic Purchase Return"],
  ["Sales Returns", "Purchase Returns"],
  ["Sales Return", "Purchase Return"],
  ["sales returns", "purchase returns"],
  ["sales return", "purchase return"],
  ["Sales Invoices", "Purchase Invoices"],
  ["Sales Invoice", "Purchase Invoice"],
  ["sales invoice", "purchase invoice"],
  ["Sale Date", "Purchase Date"],
  ["Sold Qty", "Purchased Qty"],
  ["Customer Type", "Supplier"],
  ["Select Name", "Select Supplier"],
  ["Customer", "Supplier"],
  ["سیلز ریٹرنز", "پرچیز ریٹرنز"],
  ["سیلز ریٹرن", "پرچیز ریٹرن"],
  ["سیلز انوائسز", "پرچیز انوائسز"],
  ["سیلز انوائس", "پرچیز انوائس"],
  ["سیل تاریخ", "پرچیز تاریخ"],
  ["فروخت مقدار", "خریدی گئی مقدار"],
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

const supplierOptionsSignature = () =>
  cache.suppliers
    .map((supplier) => {
      const id = getRecordId(supplier);
      const name = supplierName(supplier);
      return `${id}:${name}`;
    })
    .join("|");

const isPartyTypeSelect = (select) => {
  const options = Array.from(select.options || []);

  return options.some(
    (option) =>
      option.value === "supplier" ||
      /^(supplier|سپلائر)$/i.test(String(option.textContent || "").trim())
  ) &&
    options.some(
      (option) =>
        option.value === "customer" ||
        option.value === "employee" ||
        option.value === "general_ledger" ||
        /customer|employee|general ledger|کسٹمر|ملازم|جنرل لیجر/i.test(
          String(option.textContent || "")
        )
    );
};

const populateSupplierDropdowns = (root) => {
  if (!root || !cache.suppliers.length) return;

  const signature = supplierOptionsSignature();

  root.querySelectorAll("select").forEach((select) => {
    if (isPartyTypeSelect(select)) return;

    const options = Array.from(select.options || []);
    const placeholder = options.find((option) =>
      /select supplier|select name|supplier select|سپلائر/i.test(
        String(option.textContent || "")
      )
    );

    if (!placeholder) return;

    const currentValue = String(select.value || "");

    const expectedValues = new Set(
      cache.suppliers
        .map((supplier) => String(getRecordId(supplier)))
        .filter(Boolean)
    );

    const currentSupplierOptions = options.filter((option) =>
      expectedValues.has(String(option.value))
    );

    const alreadyCorrect =
      select.dataset.purchaseSupplierSignature === signature &&
      currentSupplierOptions.length === cache.suppliers.length;

    if (alreadyCorrect) return;

    const fragment = document.createDocumentFragment();

    const placeholderOption = document.createElement("option");
    placeholderOption.value = "";
    placeholderOption.textContent = "Select Supplier";
    fragment.appendChild(placeholderOption);

    cache.suppliers.forEach((supplier) => {
      const id = getRecordId(supplier);
      const name = supplierName(supplier);

      if (!id || !name) return;

      const option = document.createElement("option");
      option.value = String(id);
      option.textContent = name;
      fragment.appendChild(option);
    });

    select.replaceChildren(fragment);
    select.dataset.purchaseSupplierSignature = signature;

    if (currentValue && expectedValues.has(currentValue)) {
      select.value = currentValue;
    }
  });
};

const markPurchaseReturnListTable = (root) => {
  if (!root) return;

  root.querySelectorAll("table").forEach((table) => {
    const headerText = String(
      table.querySelector("thead")?.textContent || ""
    ).toLowerCase();

    if (
      headerText.includes("return no") &&
      headerText.includes("invoice ref")
    ) {
      table.classList.add("purchase-return-list-table");

      const scrollContainer =
        table.parentElement?.parentElement || table.parentElement;

      scrollContainer?.classList.add(
        "purchase-return-table-container"
      );
    }
  });
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

const transformPurchaseDom = (root) => {
  if (!root) return;

  forceSupplierOnly(root);
  populateSupplierDropdowns(root);
  markPurchaseReturnListTable(root);

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

    if (/^sales-return/i.test(input.value || "")) {
      setNativeValue(
        input,
        String(input.value).replace(/^sales-return/i, "purchase-return")
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

function PurchaseReturnPage() {
  const rootRef = useRef(null);
  const [ready, setReady] = useState(false);

  useLayoutEffect(() => {
    const removeApiAdapter = installPurchaseReturnApiAdapter();
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
    let cancelled = false;

    const loadSuppliers = async () => {
      try {
        const response = await rawAxios.get(
          apiUrl("/api/suppliers")
        );

        if (cancelled) return;

        const normalized = normalizeSupplierPayload(response.data);
        cache.suppliers = getList(normalized);
        transformPurchaseDom(root);
      } catch (error) {
        console.error(
          "Purchase Return suppliers load error:",
          error
        );
      }
    };

    loadSuppliers();
    transformPurchaseDom(root);

    const observer = new MutationObserver(() => {
      transformPurchaseDom(root);
    });

    observer.observe(root, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [ready]);

  if (!ready) return null;

  return (
    <div ref={rootRef} data-page="purchase-return-exact-sales-layout">
      <style>{`
        [data-page="purchase-return-exact-sales-layout"] {
          width: 100%;
          min-width: 0;
        }

        [data-page="purchase-return-exact-sales-layout"] select {
          min-width: 0;
        }

        [data-page="purchase-return-exact-sales-layout"]
          .purchase-return-table-container {
          width: 100%;
          overflow: visible !important;
        }

        [data-page="purchase-return-exact-sales-layout"]
          .purchase-return-list-table {
          width: 100% !important;
          min-width: 0 !important;
          table-layout: fixed !important;
          border-collapse: collapse !important;
        }

        [data-page="purchase-return-exact-sales-layout"]
          .purchase-return-list-table th,
        [data-page="purchase-return-exact-sales-layout"]
          .purchase-return-list-table td {
          box-sizing: border-box !important;
          padding: 12px 8px !important;
          vertical-align: middle !important;
          line-height: 1.3 !important;
        }

        [data-page="purchase-return-exact-sales-layout"]
          .purchase-return-list-table th {
          white-space: normal !important;
          font-size: 11px !important;
          letter-spacing: 0.02em;
        }

        [data-page="purchase-return-exact-sales-layout"]
          .purchase-return-list-table td {
          white-space: normal !important;
          overflow-wrap: anywhere !important;
          word-break: normal !important;
          font-size: 13px !important;
        }

        [data-page="purchase-return-exact-sales-layout"]
          .purchase-return-list-table th:nth-child(1),
        [data-page="purchase-return-exact-sales-layout"]
          .purchase-return-list-table td:nth-child(1) {
          width: 4%;
          text-align: center;
        }

        [data-page="purchase-return-exact-sales-layout"]
          .purchase-return-list-table th:nth-child(2),
        [data-page="purchase-return-exact-sales-layout"]
          .purchase-return-list-table td:nth-child(2) {
          width: 14%;
        }

        [data-page="purchase-return-exact-sales-layout"]
          .purchase-return-list-table th:nth-child(3),
        [data-page="purchase-return-exact-sales-layout"]
          .purchase-return-list-table td:nth-child(3) {
          width: 14%;
        }

        [data-page="purchase-return-exact-sales-layout"]
          .purchase-return-list-table th:nth-child(4),
        [data-page="purchase-return-exact-sales-layout"]
          .purchase-return-list-table td:nth-child(4) {
          width: 12%;
        }

        [data-page="purchase-return-exact-sales-layout"]
          .purchase-return-list-table th:nth-child(5),
        [data-page="purchase-return-exact-sales-layout"]
          .purchase-return-list-table td:nth-child(5) {
          width: 11%;
          text-align: center;
        }

        [data-page="purchase-return-exact-sales-layout"]
          .purchase-return-list-table th:nth-child(6),
        [data-page="purchase-return-exact-sales-layout"]
          .purchase-return-list-table td:nth-child(6) {
          width: 11%;
          text-align: center;
        }

        [data-page="purchase-return-exact-sales-layout"]
          .purchase-return-list-table th:nth-child(7),
        [data-page="purchase-return-exact-sales-layout"]
          .purchase-return-list-table td:nth-child(7) {
          width: 9%;
          text-align: center;
        }

        [data-page="purchase-return-exact-sales-layout"]
          .purchase-return-list-table th:nth-child(8),
        [data-page="purchase-return-exact-sales-layout"]
          .purchase-return-list-table td:nth-child(8) {
          width: 11%;
          text-align: center;
        }

        [data-page="purchase-return-exact-sales-layout"]
          .purchase-return-list-table th:nth-child(9),
        [data-page="purchase-return-exact-sales-layout"]
          .purchase-return-list-table td:nth-child(9) {
          width: 14%;
          text-align: center;
        }

        [data-page="purchase-return-exact-sales-layout"]
          .purchase-return-list-table td:last-child button {
          margin: 3px !important;
          padding: 8px 11px !important;
          white-space: nowrap !important;
        }

        @media (max-width: 900px) {
          [data-page="purchase-return-exact-sales-layout"]
            .purchase-return-table-container {
            overflow-x: auto !important;
          }

          [data-page="purchase-return-exact-sales-layout"]
            .purchase-return-list-table {
            min-width: 920px !important;
          }
        }
      `}</style>

      <SalesReturnPage />
    </div>
  );
}

export default PurchaseReturnPage;
