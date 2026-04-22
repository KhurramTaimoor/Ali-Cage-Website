import React, { useState, useEffect, useMemo, useCallback } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Request failed");
  }
  if (res.status === 204) return null;
  return res.json();
}

const fetchAllOrders = () => apiFetch("/api/sale-orders");
const fetchCategories = () => apiFetch("/api/categories");
const fetchUnits = () => apiFetch("/api/units");
const fetchProducts = () => apiFetch("/api/products");
const fetchTypes = () => apiFetch("/api/product-types");

const createOrder = (data) =>
  apiFetch("/api/sale-orders", { method: "POST", body: JSON.stringify(data) });

const updateOrder = (id, data) =>
  apiFetch(`/api/sale-orders/${id}`, { method: "PUT", body: JSON.stringify(data) });

const deleteOrder = (id) =>
  apiFetch(`/api/sale-orders/${id}`, { method: "DELETE" });

async function translateText(text) {
  if (!text || !text.trim()) return text;
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
      text.trim()
    )}&langpair=en|ur`;
    const res = await fetch(url);
    if (!res.ok) return text;
    const data = await res.json();
    const translated = data?.responseData?.translatedText;
    if (!translated || translated.toLowerCase() === text.trim().toLowerCase()) {
      return text;
    }
    return translated;
  } catch {
    return text;
  }
}

const LANG = {
  en: {
    title: "Sale Order",
    subtitle: "Manage and track sale orders",
    addBtn: "New Order",
    summaryBtn: "View Summary",
    searchPlaceholder: "Search by order no, customer, product, category, unit or status…",
    orderNo: "Order No",
    customer: "Customer Name",
    customerLabel: "Customer Name",
    productType: "Product Type",
    category: "Category",
    categoryLabel: "Category",
    product: "Product Name",
    productLabel: "Product Name",
    unit: "Unit",
    unitLabel: "Unit",
    selectType: "-- Select Product Type --",
    selectCategory: "-- Select Category --",
    selectProduct: "-- Select Product --",
    selectUnit: "-- Select Unit --",
    orderDate: "Order Date",
    deliveryDate: "Delivery Date",
    orderQty: "Order Qty",
    rate: "Rate",
    totalAmount: "Total Amount",
    lineTotal: "Line Total",
    debit: "Debit",
    credit: "Credit",
    status: "Status",
    save: "Save",
    saving: "Saving...",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    printSlip: "Print / Save PDF",
    noRecords: "No orders found.",
    toggleLang: "اردو",
    translating: "Translating to Urdu…",
    actions: "Actions",
    autoCalcNote: "Auto-calculated",
    pending: "Pending",
    completed: "Completed",
    cancelled: "Cancelled",
    loadingOrders: "Loading orders...",
    fetchError: "Failed to load orders.",
    saveError: "Error saving record!",
    deleteError: "Error deleting record!",
    errorMsg: "Order No, Customer Name, and at least one Product are required.",
    successSave: "Order saved successfully!",
    successDelete: "Order deleted successfully!",
    deleteConfirm: "Are you sure you want to delete this order?",
    totalOrders: "Total Orders",
    totalPending: "Pending",
    totalCompleted: "Completed",
    totalCancelled: "Cancelled",
    totalValue: "Total Value",
    slipTitle: "Sale Order Receipt",
    slipOrderNo: "Order No",
    slipCustomer: "Customer",
    slipProduct: "Product",
    slipUnit: "Unit",
    slipOrderDate: "Order Date",
    slipDeliveryDate: "Delivery Date",
    slipQty: "Order Qty",
    slipRate: "Rate",
    slipTotal: "Total Amount",
    slipLineTotal: "Line Total",
    slipDebit: "Debit",
    slipCredit: "Credit",
    slipStatus: "Status",
    slipDate: "Generated",
    slipThank: "Thank you for your order!",
    addProductRow: "Add Product Row",
    removeProductRow: "Remove",
    itemGroup: "Product Row",
    orderNoPlaceholder: "e.g. SO-001",
    customerPlaceholder: "e.g. Ali Traders",
    itemsLabel: "items",
    filterAll: "All",
    filter24h: "Last 24 Hours",
    filter7d: "Last 7 Days",
    filterMonth: "This Month",
    filterLabel: "Filter:",
    companyName: "Ali Cages",
    totalLabel: "Total",
    savePdfHint: 'Choose "Save as PDF" in print dialog',
  },
  ur: {
    title: "سیل آرڈر",
    subtitle: "سیل آرڈرز کا انتظام اور ٹریکنگ",
    addBtn: "نیا آرڈر",
    summaryBtn: "سمری دیکھیں",
    searchPlaceholder: "آرڈر نمبر، گاہک، پروڈکٹ، کیٹیگری، یونٹ یا حالت سے تلاش کریں…",
    orderNo: "آرڈر نمبر",
    customer: "گاہک کا نام",
    customerLabel: "گاہک کا نام",
    productType: "پروڈکٹ ٹائپ",
    category: "کیٹیگری",
    categoryLabel: "کیٹیگری",
    product: "پروڈکٹ",
    productLabel: "پروڈکٹ",
    unit: "یونٹ",
    unitLabel: "یونٹ",
    selectType: "-- پروڈکٹ ٹائپ منتخب کریں --",
    selectCategory: "-- کیٹیگری منتخب کریں --",
    selectProduct: "-- پروڈکٹ منتخب کریں --",
    selectUnit: "-- یونٹ منتخب کریں --",
    orderDate: "آرڈر کی تاریخ",
    deliveryDate: "ڈیلیوری کی تاریخ",
    orderQty: "آرڈر مقدار",
    rate: "ریٹ",
    totalAmount: "کل رقم",
    lineTotal: "آئٹم کل رقم",
    debit: "ڈیبٹ",
    credit: "کریڈٹ",
    status: "حالت",
    save: "محفوظ کریں",
    saving: "محفوظ ہو رہا ہے...",
    cancel: "منسوخ",
    edit: "ترمیم",
    delete: "حذف",
    printSlip: "پرنٹ / پی ڈی ایف",
    noRecords: "کوئی آرڈر نہیں ملا۔",
    toggleLang: "English",
    translating: "اردو میں ترجمہ ہو رہا ہے…",
    actions: "اقدامات",
    autoCalcNote: "خودکار حساب",
    pending: "زیر التواء",
    completed: "مکمل",
    cancelled: "منسوخ شدہ",
    loadingOrders: "آرڈرز لوڈ ہو رہے ہیں...",
    fetchError: "آرڈرز لوڈ نہیں ہو سکے۔",
    saveError: "ریکارڈ محفوظ کرنے میں خرابی!",
    deleteError: "ریکارڈ حذف کرنے میں خرابی!",
    errorMsg: "آرڈر نمبر، گاہک کا نام، اور کم از کم ایک پروڈکٹ درکار ہے۔",
    successSave: "آرڈر کامیابی سے محفوظ ہو گیا!",
    successDelete: "آرڈر حذف ہو گیا!",
    deleteConfirm: "کیا آپ واقعی اس آرڈر کو حذف کرنا چاہتے ہیں؟",
    totalOrders: "کل آرڈرز",
    totalPending: "زیر التواء",
    totalCompleted: "مکمل",
    totalCancelled: "منسوخ",
    totalValue: "کل رقم",
    slipTitle: "سیل آرڈر رسید",
    slipOrderNo: "آرڈر نمبر",
    slipCustomer: "گاہک",
    slipProduct: "پروڈکٹ",
    slipUnit: "یونٹ",
    slipOrderDate: "آرڈر کی تاریخ",
    slipDeliveryDate: "ڈیلیوری کی تاریخ",
    slipQty: "مقدار",
    slipRate: "ریٹ",
    slipTotal: "کل رقم",
    slipLineTotal: "آئٹم کل رقم",
    slipDebit: "ڈیبٹ",
    slipCredit: "کریڈٹ",
    slipStatus: "حالت",
    slipDate: "تیار کردہ",
    slipThank: "آپ کے آرڈر کا شکریہ!",
    addProductRow: "نئی پروڈکٹ لائن",
    removeProductRow: "ہٹائیں",
    itemGroup: "پروڈکٹ لائن",
    orderNoPlaceholder: "مثلاً SO-001",
    customerPlaceholder: "مثلاً Ali Traders",
    itemsLabel: "آئٹمز",
    filterAll: "سب",
    filter24h: "آخری 24 گھنٹے",
    filter7d: "آخری 7 دن",
    filterMonth: "یہ مہینہ",
    filterLabel: "فلٹر:",
    companyName: "علی کیجز",
    totalLabel: "کل",
    savePdfHint: 'پرنٹ ڈائیلاگ میں "Save as PDF" منتخب کریں',
  },
};

const emptyOrderItem = () => ({
  product_type_id: "",
  category_id: "",
  product_id: "",
  unit_id: "",
  order_qty: "",
  rate: "",
  debit: "",
  credit: "",
});

const getList = (data) => (Array.isArray(data) ? data : data?.data || []);

const normalizeOrderItems = (record) => {
  let items = record?.order_items;
  if (typeof items === "string") {
    try {
      items = JSON.parse(items);
    } catch {
      items = null;
    }
  }
  if (Array.isArray(items) && items.length) {
    return items.map((item) => ({
      product_type_id: item?.product_type_id || "",
      category_id: item?.category_id || "",
      product_id: item?.product_id || "",
      unit_id: item?.unit_id || "",
      order_qty: item?.order_qty ?? "",
      rate: item?.rate ?? "",
      debit: item?.debit ?? "",
      credit: item?.credit ?? "",
    }));
  }
  return [emptyOrderItem()];
};

const calcLineTotal = (item) => Number(item?.order_qty || 0) * Number(item?.rate || 0);
const calcOrderTotal = (items = []) => items.reduce((s, i) => s + calcLineTotal(i), 0);
const fmt = (v) =>
  Number(v || 0).toLocaleString("en-PK", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

function getStatusLabel(status, t) {
  if (status === "Pending") return t.pending;
  if (status === "Completed") return t.completed;
  if (status === "Cancelled") return t.cancelled;
  return status || "-";
}

function generateSlipPrint(order, lang, maps, urduCache) {
  const t = LANG[lang];
  const isUrdu = lang === "ur";
  const dir = isUrdu ? "rtl" : "ltr";
  const items = normalizeOrderItems(order);

  const grandTotal =
    Number(order.total_amount || 0) || calcOrderTotal(items);
  const grandDebit = items.reduce((s, i) => s + Number(i.debit || 0), 0);
  const grandCredit = items.reduce((s, i) => s + Number(i.credit || 0), 0);

  const getVal = (prefix, id, fallback) =>
    isUrdu ? urduCache[`${prefix}:${id}`] || fallback || "-" : fallback || "-";

  const customerName = isUrdu
    ? urduCache[`customer:${order.id}`] || order.customer_name_en || "-"
    : order.customer_name_en || "-";

  const statusLabel = getStatusLabel(order.status, t);

  const rowsHtml = items
    .map((item, idx) => {
      const lineTotal = calcLineTotal(item);
      return `
        <tr>
          <td class="center">${idx + 1}</td>
          <td>${getVal("product", item.product_id, maps.productMap[item.product_id])}</td>
          <td>${getVal("category", item.category_id, maps.categoryMap[item.category_id])}</td>
          <td>${getVal("product_type", item.product_type_id, maps.typeMap[item.product_type_id])}</td>
          <td class="center">${getVal("unit", item.unit_id, maps.unitMap[item.unit_id])}</td>
          <td class="num">${fmt(item.order_qty || 0)}</td>
          <td class="num">PKR ${fmt(item.rate)}</td>
          <td class="num strong violet">PKR ${fmt(lineTotal)}</td>
          <td class="num">PKR ${fmt(item.debit)}</td>
          <td class="num">PKR ${fmt(item.credit)}</td>
        </tr>
      `;
    })
    .join("");

  const html = `
    <!DOCTYPE html>
    <html lang="${lang}" dir="${dir}">
      <head>
        <meta charset="UTF-8" />
        <title>${order.order_no || "sale-order"}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;500;600;700&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
        <style>
          * { box-sizing: border-box; }
          body {
            margin: 0;
            background: #f8fafc;
            color: #0f172a;
            font-family: ${isUrdu ? "'Noto Nastaliq Urdu', serif" : "'Inter', Arial, sans-serif"};
          }
          .page {
            width: 100%;
            min-height: 100vh;
            background:
              linear-gradient(135deg, #eff6ff 0%, #ffffff 45%, #f8fafc 100%);
            padding: 20px;
          }
          .sheet {
            max-width: 1400px;
            margin: 0 auto;
            background: white;
            border: 1px solid #dbeafe;
            box-shadow: 0 12px 40px rgba(15, 23, 42, 0.08);
            border-radius: 24px;
            overflow: hidden;
          }
          .header {
            position: relative;
            background: linear-gradient(135deg, #0f4c97 0%, #155eaf 65%, #3b82f6 100%);
            color: white;
            padding: 26px 28px 22px;
            overflow: hidden;
          }
          .header:before {
            content: "";
            position: absolute;
            top: 0;
            ${isUrdu ? "left" : "right"}: 0;
            width: 240px;
            height: 100%;
            background: linear-gradient(135deg, rgba(255,255,255,0.18), rgba(255,255,255,0.04));
            clip-path: polygon(35% 0, 100% 0, 100% 100%, 0 100%);
          }
          .header-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 20px;
            position: relative;
            z-index: 2;
          }
          .brand-wrap {
            display: flex;
            align-items: center;
            gap: 14px;
          }
          .logo {
            width: 58px;
            height: 58px;
            min-width: 58px;
            border-radius: 999px;
            border: 4px solid rgba(255,255,255,0.85);
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 800;
            letter-spacing: 0.5px;
            background: rgba(255,255,255,0.08);
            color: white;
            font-size: 13px;
          }
          .brand h1 {
            margin: 0;
            font-size: 30px;
            line-height: 1.15;
            font-weight: 800;
            letter-spacing: 0.2px;
          }
          .brand p {
            margin: 6px 0 0;
            font-size: 13px;
            color: rgba(255,255,255,0.82);
          }
          .meta {
            text-align: ${isUrdu ? "left" : "right"};
            font-size: 12px;
            color: rgba(255,255,255,0.88);
            line-height: 1.8;
            white-space: nowrap;
          }
          .content {
            padding: 18px;
          }
          .hint {
            background: #eff6ff;
            color: #1d4ed8;
            border: 1px solid #bfdbfe;
            border-radius: 14px;
            padding: 12px 14px;
            font-size: 13px;
            margin-bottom: 14px;
          }
          .cards {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 14px;
            margin-bottom: 16px;
          }
          .card {
            border-radius: 18px;
            border: 2px solid;
            padding: 14px 16px;
            min-height: 100px;
            position: relative;
            overflow: hidden;
          }
          .card:before {
            content: "";
            position: absolute;
            top: 0;
            ${isUrdu ? "right" : "left"}: 0;
            width: 6px;
            height: 100%;
            background: currentColor;
            opacity: 0.9;
          }
          .card small {
            display: block;
            font-size: 12px;
            opacity: 0.9;
            margin-bottom: 12px;
          }
          .pill {
            position: absolute;
            top: 12px;
            ${isUrdu ? "left" : "right"}: 12px;
            font-size: 10px;
            font-weight: 800;
            color: white;
            padding: 5px 12px;
            border-radius: 999px;
            letter-spacing: 0.4px;
          }
          .card .value {
            font-size: 24px;
            font-weight: 800;
            line-height: 1.2;
            word-break: break-word;
          }
          .card.blue { background: #eff6ff; color: #0f4c97; border-color: #60a5fa; }
          .card.blue .pill { background: #0f4c97; }
          .card.green { background: #ecfdf5; color: #059669; border-color: #34d399; }
          .card.green .pill { background: #059669; }
          .card.orange { background: #fff7ed; color: #c2410c; border-color: #fb923c; }
          .card.orange .pill { background: #c2410c; }
          .card.purple { background: #f5f3ff; color: #7c3aed; border-color: #a78bfa; }
          .card.purple .pill { background: #7c3aed; }

          .dates-box {
            border: 1px solid #dbeafe;
            background: #f8fafc;
            border-radius: 16px;
            padding: 14px 16px;
            margin-bottom: 14px;
          }
          .dates-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 18px;
          }
          .dates-item .label {
            font-size: 12px;
            color: #64748b;
            margin-bottom: 6px;
          }
          .dates-item .value {
            font-size: 16px;
            font-weight: 700;
            color: #0f172a;
          }

          .section-bar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: #f1f5f9;
            border-radius: 10px;
            padding: 8px 12px;
            margin-bottom: 8px;
            color: #475569;
            font-size: 12px;
            font-weight: 700;
          }

          .watermark-wrap {
            position: relative;
          }
          .watermark {
            position: absolute;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            pointer-events: none;
            font-size: 82px;
            font-weight: 800;
            color: rgba(15, 76, 151, 0.06);
            transform: rotate(-28deg);
            user-select: none;
            z-index: 0;
            letter-spacing: 2px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            position: relative;
            z-index: 1;
          }
          thead th {
            background: #0f4c97;
            color: white;
            font-size: 12px;
            padding: 12px 10px;
            border: 1px solid #1d4ed8;
            text-align: ${isUrdu ? "right" : "left"};
            white-space: nowrap;
          }
          tbody td, tfoot td {
            border: 1px solid #dbeafe;
            padding: 10px 10px;
            font-size: 12px;
            vertical-align: top;
          }
          tbody tr:nth-child(even) td {
            background: #f8fbff;
          }
          .center { text-align: center !important; }
          .num {
            text-align: ${isUrdu ? "left" : "right"} !important;
            white-space: nowrap;
            font-weight: 700;
            font-family: ${isUrdu ? "'Inter', Arial, sans-serif" : "'Inter', Arial, sans-serif"};
          }
          .strong { font-weight: 800; }
          .violet { color: #7c3aed; }
          tfoot td {
            background: #eaf3ff;
            font-weight: 800;
            color: #0f172a;
          }

          .footer {
            background: #0f4c97;
            color: rgba(255,255,255,0.9);
            padding: 10px 16px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 11px;
          }

          @media print {
            @page { size: A4 landscape; margin: 10mm; }
            body {
              background: white;
            }
            .page {
              padding: 0;
              background: white;
            }
            .sheet {
              box-shadow: none;
              border: none;
              border-radius: 0;
              max-width: none;
            }
            .hint {
              display: none;
            }
          }

          @media (max-width: 900px) {
            .cards {
              grid-template-columns: 1fr 1fr;
            }
            .dates-grid {
              grid-template-columns: 1fr;
            }
            .header-row {
              flex-direction: column;
              align-items: flex-start;
            }
            .meta {
              text-align: ${isUrdu ? "right" : "left"};
              white-space: normal;
            }
          }
        </style>
      </head>
      <body>
        <div class="page">
          <div class="sheet">
            <div class="header">
              <div class="header-row">
                <div class="brand-wrap">
                  <div class="logo">SO</div>
                  <div class="brand">
                    <h1>${t.companyName}</h1>
                    <p>${t.slipTitle}</p>
                  </div>
                </div>
                <div class="meta">
                  <div>${t.slipDate}: ${new Date().toLocaleString(isUrdu ? "ur-PK" : "en-PK")}</div>
                  <div>${t.slipStatus}: ${statusLabel}</div>
                </div>
              </div>
            </div>

            <div class="content">
              <div class="hint">${t.savePdfHint}</div>

              <div class="cards">
                <div class="card blue">
                  <small>${t.slipOrderNo}</small>
                  <div class="pill">ORD</div>
                  <div class="value">${order.order_no || "-"}</div>
                </div>

                <div class="card green">
                  <small>${t.slipCustomer}</small>
                  <div class="pill">CUS</div>
                  <div class="value">${customerName || "-"}</div>
                </div>

                <div class="card orange">
                  <small>${t.slipStatus}</small>
                  <div class="pill">STS</div>
                  <div class="value">${statusLabel}</div>
                </div>

                <div class="card purple">
                  <small>${t.slipTotal}</small>
                  <div class="pill">PKR</div>
                  <div class="value">PKR ${fmt(grandTotal)}</div>
                </div>
              </div>

              <div class="dates-box">
                <div class="dates-grid">
                  <div class="dates-item">
                    <div class="label">${t.slipOrderDate}</div>
                    <div class="value">${order.order_date || "-"}</div>
                  </div>
                  <div class="dates-item">
                    <div class="label">${t.slipDeliveryDate}</div>
                    <div class="value">${order.delivery_date || "-"}</div>
                  </div>
                </div>
              </div>

              <div class="section-bar">
                <span>ORDER ITEMS</span>
                <span>${items.length} ${t.itemsLabel}</span>
              </div>

              <div class="watermark-wrap">
                <div class="watermark">${t.companyName}</div>
                <table>
                  <thead>
                    <tr>
                      <th class="center">#</th>
                      <th>${t.slipProduct}</th>
                      <th>${t.category}</th>
                      <th>${t.productType}</th>
                      <th class="center">${t.slipUnit}</th>
                      <th class="num">${t.slipQty}</th>
                      <th class="num">${t.slipRate}</th>
                      <th class="num">${t.slipLineTotal}</th>
                      <th class="num">${t.slipDebit}</th>
                      <th class="num">${t.slipCredit}</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${rowsHtml}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colspan="4"></td>
                      <td class="center">${t.totalLabel}</td>
                      <td></td>
                      <td></td>
                      <td class="num">PKR ${fmt(grandTotal)}</td>
                      <td class="num">PKR ${fmt(grandDebit)}</td>
                      <td class="num">PKR ${fmt(grandCredit)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div class="footer">
              <span>${t.companyName} — ${t.slipThank}</span>
              <span>Page 1 / 1</span>
            </div>
          </div>
        </div>

        <script>
          window.onload = () => {
            setTimeout(() => {
              window.print();
            }, 400);
          };
        </script>
      </body>
    </html>
  `;

  const w = window.open("", "_blank", "width=1400,height=900");
  if (!w) return;
  w.document.open();
  w.document.write(html);
  w.document.close();
}

const SaleOrderPage = () => {
  const [lang, setLang] = useState("en");
  const t = LANG[lang];
  const isUrdu = lang === "ur";
  const dir = isUrdu ? "rtl" : "ltr";

  const baseFont = isUrdu
    ? "'Noto Nastaliq Urdu', serif"
    : "Helvetica, 'Helvetica Neue', Arial, sans-serif";

  const labelClass = "block text-xs font-semibold text-slate-500 mb-1.5";
  const inputClass =
    "w-full border border-sky-100 rounded-2xl py-3 px-4 text-sm text-slate-700 bg-sky-50/50 focus:outline-none focus:ring-4 focus:ring-sky-100";
  const readonlyClass =
    "w-full border border-sky-200 rounded-2xl py-3 px-4 text-sm font-bold text-slate-950 bg-sky-50 cursor-not-allowed";
  const valueClass = "text-slate-950 font-semibold";
  const monoBlack = "font-mono text-slate-950";

  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [units, setUnits] = useState([]);
  const [products, setProducts] = useState([]);
  const [types, setTypes] = useState([]);

  const [urduCache, setUrduCache] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [form, setForm] = useState({
    order_no: "",
    customer_name_en: "",
    order_date: "",
    delivery_date: "",
    status: "Pending",
    order_items: [emptyOrderItem()],
  });

  const showToast = useCallback((type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  }, []);

  const loadAll = useCallback(async () => {
    try {
      setLoading(true);
      const [ordersData, catsData, unitsData, productsData, typesData] = await Promise.all([
        fetchAllOrders(),
        fetchCategories(),
        fetchUnits(),
        fetchProducts(),
        fetchTypes(),
      ]);

      setOrders(getList(ordersData));
      setCategories(getList(catsData));
      setUnits(getList(unitsData));
      setProducts(getList(productsData));
      setTypes(getList(typesData));
    } catch (err) {
      showToast("error", err.message || t.fetchError);
    } finally {
      setLoading(false);
    }
  }, [showToast, t.fetchError]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const productMap = useMemo(() => {
    const map = {};
    products.forEach((p) => {
      map[p.id] = p.name || p.name_en || p.product_name || p.product_item_en || `#${p.id}`;
    });
    return map;
  }, [products]);

  const categoryMap = useMemo(() => {
    const map = {};
    categories.forEach((c) => {
      map[c.id] = c.name || c.name_en || c.category_name || `#${c.id}`;
    });
    return map;
  }, [categories]);

  const typeMap = useMemo(() => {
    const map = {};
    types.forEach((x) => {
      map[x.id] = x.product_type_en || x.name || x.name_en || x.type_name || `#${x.id}`;
    });
    return map;
  }, [types]);

  const unitMap = useMemo(() => {
    const map = {};
    units.forEach((u) => {
      map[u.id] = u.name || u.name_en || u.unit_name || `#${u.id}`;
    });
    return map;
  }, [units]);

  const getCustomerName = (order) =>
    isUrdu ? urduCache[`customer:${order.id}`] || order.customer_name_en || "-" : order.customer_name_en || "-";

  const getTranslatedMapValue = (prefix, id, fallback) =>
    isUrdu ? urduCache[`${prefix}:${id}`] || fallback || "-" : fallback || "-";

  const handleLangToggle = async () => {
    const newLang = lang === "en" ? "ur" : "en";
    setLang(newLang);

    if (newLang !== "ur") return;
    setTranslating(true);

    try {
      const nextCache = { ...urduCache };

      await Promise.all(
        orders.map(async (o) => {
          if (!nextCache[`customer:${o.id}`] && o.customer_name_en) {
            nextCache[`customer:${o.id}`] = await translateText(o.customer_name_en);
          }
        })
      );

      await Promise.all(
        products.map(async (p) => {
          const base = p.name || p.name_en || p.product_name || p.product_item_en;
          if (base && !nextCache[`product:${p.id}`]) {
            nextCache[`product:${p.id}`] = await translateText(base);
          }
        })
      );

      await Promise.all(
        categories.map(async (c) => {
          const base = c.name || c.name_en || c.category_name;
          if (base && !nextCache[`category:${c.id}`]) {
            nextCache[`category:${c.id}`] = await translateText(base);
          }
        })
      );

      await Promise.all(
        types.map(async (x) => {
          const base = x.product_type_en || x.name || x.name_en || x.type_name;
          if (base && !nextCache[`product_type:${x.id}`]) {
            nextCache[`product_type:${x.id}`] = await translateText(base);
          }
        })
      );

      await Promise.all(
        units.map(async (u) => {
          const base = u.name || u.name_en || u.unit_name;
          if (base && !nextCache[`unit:${u.id}`]) {
            nextCache[`unit:${u.id}`] = await translateText(base);
          }
        })
      );

      setUrduCache(nextCache);
    } catch (err) {
      console.error(err);
    } finally {
      setTranslating(false);
    }
  };

  const ensureOrderPrintTranslations = async (order) => {
    if (lang !== "ur") return urduCache;

    const nextCache = { ...urduCache };
    const items = normalizeOrderItems(order);

    if (!nextCache[`customer:${order.id}`] && order.customer_name_en) {
      nextCache[`customer:${order.id}`] = await translateText(order.customer_name_en);
    }

    for (const item of items) {
      const productBase = productMap[item.product_id];
      const categoryBase = categoryMap[item.category_id];
      const typeBase = typeMap[item.product_type_id];
      const unitBase = unitMap[item.unit_id];

      if (item.product_id && productBase && !nextCache[`product:${item.product_id}`]) {
        nextCache[`product:${item.product_id}`] = await translateText(productBase);
      }

      if (item.category_id && categoryBase && !nextCache[`category:${item.category_id}`]) {
        nextCache[`category:${item.category_id}`] = await translateText(categoryBase);
      }

      if (
        item.product_type_id &&
        typeBase &&
        !nextCache[`product_type:${item.product_type_id}`]
      ) {
        nextCache[`product_type:${item.product_type_id}`] = await translateText(typeBase);
      }

      if (item.unit_id && unitBase && !nextCache[`unit:${item.unit_id}`]) {
        nextCache[`unit:${item.unit_id}`] = await translateText(unitBase);
      }
    }

    setUrduCache(nextCache);
    return nextCache;
  };

  const openAdd = () => {
    setForm({
      order_no: "",
      customer_name_en: "",
      order_date: "",
      delivery_date: "",
      status: "Pending",
      order_items: [emptyOrderItem()],
    });
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (o) => {
    setForm({
      order_no: o.order_no || "",
      customer_name_en: o.customer_name_en || "",
      order_date: o.order_date || "",
      delivery_date: o.delivery_date || "",
      status: o.status || "Pending",
      order_items: normalizeOrderItems(o),
    });
    setEditingId(o.id);
    setShowForm(true);
  };

  const updateItemRow = (index, key, value) => {
    setForm((prev) => ({
      ...prev,
      order_items: prev.order_items.map((item, i) =>
        i === index ? { ...item, [key]: value } : item
      ),
    }));
  };

  const addItemRow = () =>
    setForm((prev) => ({
      ...prev,
      order_items: [...prev.order_items, emptyOrderItem()],
    }));

  const removeItemRow = (index) => {
    setForm((prev) => {
      if (prev.order_items.length === 1) return prev;
      return {
        ...prev,
        order_items: prev.order_items.filter((_, i) => i !== index),
      };
    });
  };

  const formTotal = useMemo(() => calcOrderTotal(form.order_items), [form.order_items]);

  const handleSave = async () => {
    const cleanedItems = form.order_items
      .map((item) => ({
        product_type_id: Number(item.product_type_id) || 0,
        category_id: Number(item.category_id) || 0,
        product_id: Number(item.product_id) || 0,
        unit_id: Number(item.unit_id) || 0,
        order_qty: Number(item.order_qty) || 0,
        rate: Number(item.rate) || 0,
        debit: Number(item.debit) || 0,
        credit: Number(item.credit) || 0,
      }))
      .filter((item) => item.product_id > 0);

    if (!form.order_no.trim() || !form.customer_name_en.trim() || !cleanedItems.length) {
      showToast("error", t.errorMsg);
      return;
    }

    const payload = {
      order_no: form.order_no.trim(),
      customer_name_en: form.customer_name_en.trim(),
      order_date: form.order_date || null,
      delivery_date: form.delivery_date || null,
      status: form.status || "Pending",
      total_amount: calcOrderTotal(cleanedItems),
      order_items: cleanedItems,
    };

    try {
      setSubmitting(true);

      if (editingId) {
        const res = await updateOrder(editingId, payload);
        const updated = res?.data || res;
        setOrders((prev) => prev.map((o) => (o.id === editingId ? updated : o)));
        setUrduCache((prev) => {
          const next = { ...prev };
          delete next[`customer:${editingId}`];
          return next;
        });
      } else {
        const res = await createOrder(payload);
        const created = res?.data || res;
        setOrders((prev) => [created, ...prev]);
      }

      showToast("success", t.successSave);
      setShowForm(false);
      setEditingId(null);
    } catch (err) {
      showToast("error", err.message || t.saveError);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t.deleteConfirm)) return;
    try {
      await deleteOrder(id);
      setOrders((prev) => prev.filter((o) => o.id !== id));
      showToast("success", t.successDelete);
    } catch (err) {
      showToast("error", err.message || t.deleteError);
    }
  };

  const filtered = useMemo(() => {
    const now = new Date();
    let list = orders.filter((o) => {
      if (!o.order_date) return dateFilter === "all";
      const d = new Date(o.order_date);
      if (dateFilter === "24h") return now - d <= 24 * 60 * 60 * 1000;
      if (dateFilter === "7d") return now - d <= 7 * 24 * 60 * 60 * 1000;
      if (dateFilter === "month") {
        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
      }
      return true;
    });

    const q = search.toLowerCase().trim();
    if (!q) return list;

    return list.filter((o) => {
      const items = normalizeOrderItems(o);
      return (
        [o.order_no, o.customer_name_en, urduCache[`customer:${o.id}`], o.status].some((v) =>
          String(v || "").toLowerCase().includes(q)
        ) ||
        items.some((item) =>
          [
            productMap[item.product_id],
            categoryMap[item.category_id],
            typeMap[item.product_type_id],
            unitMap[item.unit_id],
            urduCache[`product:${item.product_id}`],
            urduCache[`category:${item.category_id}`],
            urduCache[`product_type:${item.product_type_id}`],
            urduCache[`unit:${item.unit_id}`],
          ].some((v) => String(v || "").toLowerCase().includes(q))
        )
      );
    });
  }, [orders, search, dateFilter, productMap, categoryMap, typeMap, unitMap, urduCache]);

  const summary = useMemo(
    () => ({
      total: orders.length,
      pending: orders.filter((o) => o.status === "Pending").length,
      completed: orders.filter((o) => o.status === "Completed").length,
      cancelled: orders.filter((o) => o.status === "Cancelled").length,
      value: orders.reduce(
        (s, o) => s + (Number(o.total_amount || 0) || calcOrderTotal(normalizeOrderItems(o))),
        0
      ),
    }),
    [orders]
  );

  return (
    <div
      dir={dir}
      style={{ fontFamily: baseFont }}
      className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 p-6 pb-20"
    >
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.11.3/font/bootstrap-icons.min.css"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      {message.text && (
        <div
          className={`fixed bottom-6 ${
            isUrdu ? "left-6" : "right-6"
          } z-50 px-5 py-3 rounded-2xl shadow-2xl text-white text-sm font-semibold flex items-center gap-2 ${
            message.type === "error" ? "bg-rose-600" : "bg-emerald-600"
          }`}
        >
          <i
            className={`bi ${
              message.type === "error" ? "bi-exclamation-triangle-fill" : "bi-check-circle-fill"
            }`}
          ></i>
          {message.text}
        </div>
      )}

      {translating && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl shadow-2xl bg-slate-800 text-white text-sm font-semibold flex items-center gap-2">
          <i className="bi bi-arrow-repeat animate-spin"></i>
          {t.translating}
        </div>
      )}

      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-white/90 backdrop-blur rounded-3xl border border-sky-100 shadow-sm px-6 py-5">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800">{t.title}</h1>
              <p className="text-sm text-slate-500 mt-1">{t.subtitle}</p>
            </div>

            <div className={`flex gap-2 flex-wrap ${isUrdu ? "flex-row-reverse" : ""}`}>
              <button
                onClick={handleLangToggle}
                disabled={translating}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-sky-200 text-sky-700 text-sm font-semibold hover:bg-sky-50 transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <i
                  className={`bi ${translating ? "bi-arrow-repeat animate-spin" : "bi-translate"}`}
                ></i>
                {t.toggleLang}
              </button>

              <button
                onClick={() => setShowSummary((v) => !v)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition shadow-sm ${
                  showSummary
                    ? "bg-sky-600 text-white hover:bg-sky-700"
                    : "bg-sky-100 text-sky-700 hover:bg-sky-200"
                }`}
              >
                <i className="bi bi-bar-chart-line-fill"></i>
                {t.summaryBtn}
                <i className={`bi bi-chevron-${showSummary ? "up" : "down"} text-xs`}></i>
              </button>

              <button
                onClick={openAdd}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 text-white text-sm font-semibold hover:bg-sky-700 transition shadow-lg shadow-sky-200"
              >
                <i className="bi bi-plus-circle-fill"></i>
                {t.addBtn}
              </button>
            </div>
          </div>

          {showSummary && (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mt-5 pt-5 border-t border-sky-100">
              {[
                {
                  label: t.totalOrders,
                  val: summary.total,
                  icon: "bi-receipt",
                  color: "text-sky-600",
                  money: false,
                },
                {
                  label: t.totalPending,
                  val: summary.pending,
                  icon: "bi-clock-fill",
                  color: "text-orange-500",
                  money: false,
                },
                {
                  label: t.totalCompleted,
                  val: summary.completed,
                  icon: "bi-check-circle-fill",
                  color: "text-emerald-600",
                  money: false,
                },
                {
                  label: t.totalCancelled,
                  val: summary.cancelled,
                  icon: "bi-x-circle-fill",
                  color: "text-rose-500",
                  money: false,
                },
                { label: t.totalValue, val: summary.value, icon: "", color: "", money: true },
              ].map((card, idx) => (
                <div key={idx} className="bg-sky-50 rounded-2xl border border-sky-100 p-4">
                  {card.icon && (
                    <div
                      className={`w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm mb-3 ${card.color}`}
                    >
                      <i className={`bi ${card.icon}`}></i>
                    </div>
                  )}
                  <p className="text-xs text-slate-500 mb-1">{card.label}</p>
                  <p className={`font-extrabold text-slate-950 ${card.money ? "text-2xl" : "text-3xl"}`}>
                    {card.money ? fmt(card.val) : card.val}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <i
              className={`bi bi-search absolute top-1/2 -translate-y-1/2 text-slate-400 ${
                isUrdu ? "right-4" : "left-4"
              }`}
            ></i>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.searchPlaceholder}
              className={`w-full border border-sky-100 rounded-2xl py-3 bg-white text-sm text-slate-700 focus:outline-none focus:ring-4 focus:ring-sky-100 shadow-sm ${
                isUrdu ? "pr-11 pl-4 text-right" : "pl-11 pr-4"
              }`}
            />
          </div>

          <div className={`flex items-center gap-2 flex-wrap ${isUrdu ? "flex-row-reverse" : ""}`}>
            <span className="text-xs font-semibold text-slate-500">{t.filterLabel}</span>
            {[
              { key: "24h", label: t.filter24h, icon: "bi-clock" },
              { key: "7d", label: t.filter7d, icon: "bi-calendar-week" },
              { key: "month", label: t.filterMonth, icon: "bi-calendar-month" },
              { key: "all", label: t.filterAll, icon: "bi-list-ul" },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setDateFilter(f.key)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition shadow-sm ${
                  dateFilter === f.key
                    ? "bg-sky-600 text-white shadow-sky-200"
                    : "bg-white border border-sky-100 text-sky-700 hover:bg-sky-50"
                }`}
              >
                <i className={`bi ${f.icon}`}></i>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div
              className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl p-6 max-h-[90vh] overflow-y-auto"
              dir={dir}
            >
              <div className="flex items-center gap-3 mb-5 border-b border-sky-100 pb-4">
                <div className="w-11 h-11 rounded-2xl bg-sky-100 flex items-center justify-center">
                  <i className="bi bi-receipt text-sky-700 text-lg"></i>
                </div>
                <h2 className="text-xl font-extrabold text-slate-800">
                  {editingId ? t.edit : t.addBtn}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                <div>
                  <label className={labelClass}>{t.orderNo} *</label>
                  <input
                    type="text"
                    value={form.order_no}
                    onChange={(e) => setForm((f) => ({ ...f, order_no: e.target.value }))}
                    placeholder={t.orderNoPlaceholder}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>{t.customerLabel} *</label>
                  <input
                    type="text"
                    value={form.customer_name_en}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, customer_name_en: e.target.value }))
                    }
                    placeholder={t.customerPlaceholder}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>{t.orderDate}</label>
                  <input
                    type="date"
                    value={form.order_date}
                    onChange={(e) => setForm((f) => ({ ...f, order_date: e.target.value }))}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>{t.deliveryDate}</label>
                  <input
                    type="date"
                    value={form.delivery_date}
                    onChange={(e) => setForm((f) => ({ ...f, delivery_date: e.target.value }))}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="space-y-4">
                {form.order_items.map((item, index) => {
                  const lineTotal = calcLineTotal(item);

                  return (
                    <div
                      key={index}
                      className="border border-sky-100 rounded-2xl p-4 bg-sky-50/40 space-y-4"
                    >
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <h3 className="text-sm font-bold text-slate-800">
                          {t.itemGroup} {index + 1}
                        </h3>
                        {form.order_items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItemRow(index)}
                            className="text-xs px-3 py-2 rounded-xl bg-rose-100 text-rose-600 hover:bg-rose-200 font-semibold"
                          >
                            {t.removeProductRow}
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className={labelClass}>{t.productType}</label>
                          <select
                            value={item.product_type_id}
                            onChange={(e) =>
                              updateItemRow(index, "product_type_id", e.target.value)
                            }
                            className={inputClass}
                          >
                            <option value="">{t.selectType}</option>
                            {types.map((x) => (
                              <option key={x.id} value={x.id}>
                                {x.product_type_en || x.name || x.name_en || x.type_name || `#${x.id}`}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className={labelClass}>{t.categoryLabel}</label>
                          <select
                            value={item.category_id}
                            onChange={(e) => updateItemRow(index, "category_id", e.target.value)}
                            className={inputClass}
                          >
                            <option value="">{t.selectCategory}</option>
                            {categories.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name || c.name_en || c.category_name || `#${c.id}`}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className={labelClass}>{t.productLabel} *</label>
                          <select
                            value={item.product_id}
                            onChange={(e) => updateItemRow(index, "product_id", e.target.value)}
                            className={inputClass}
                          >
                            <option value="">{t.selectProduct}</option>
                            {products.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name || p.name_en || p.product_name || p.product_item_en || `#${p.id}`}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className={labelClass}>{t.unitLabel}</label>
                          <select
                            value={item.unit_id}
                            onChange={(e) => updateItemRow(index, "unit_id", e.target.value)}
                            className={inputClass}
                          >
                            <option value="">{t.selectUnit}</option>
                            {units.map((u) => (
                              <option key={u.id} value={u.id}>
                                {u.name || u.name_en || u.unit_name || `#${u.id}`}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className={labelClass}>{t.orderQty}</label>
                          <input
                            type="number"
                            value={item.order_qty}
                            onChange={(e) => updateItemRow(index, "order_qty", e.target.value)}
                            className={`${inputClass} font-mono`}
                          />
                        </div>

                        <div>
                          <label className={labelClass}>{t.rate}</label>
                          <input
                            type="number"
                            value={item.rate}
                            onChange={(e) => updateItemRow(index, "rate", e.target.value)}
                            className={`${inputClass} font-mono`}
                          />
                        </div>

                        <div>
                          <label className={labelClass}>{t.debit}</label>
                          <input
                            type="number"
                            value={item.debit}
                            onChange={(e) => updateItemRow(index, "debit", e.target.value)}
                            className={`${inputClass} font-mono`}
                          />
                        </div>

                        <div>
                          <label className={labelClass}>{t.credit}</label>
                          <input
                            type="number"
                            value={item.credit}
                            onChange={(e) => updateItemRow(index, "credit", e.target.value)}
                            className={`${inputClass} font-mono`}
                          />
                        </div>

                        <div className="md:col-span-2 bg-white p-4 rounded-2xl border border-sky-100">
                          <label className="block text-xs font-bold text-sky-700 mb-1.5">
                            {t.lineTotal}
                            <span className={`${isUrdu ? "mr-2" : "ml-2"} text-sky-500 font-normal text-xs`}>
                              ⚡ {t.autoCalcNote}
                            </span>
                          </label>
                          <input
                            type="text"
                            value={fmt(lineTotal)}
                            readOnly
                            className={`${readonlyClass} font-mono`}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}

                <button
                  type="button"
                  onClick={addItemRow}
                  className="w-full border border-dashed border-sky-300 text-sky-700 py-3 rounded-2xl text-sm font-semibold hover:bg-sky-50 transition"
                >
                  <i className="bi bi-plus-circle me-2"></i>
                  {t.addProductRow}
                </button>
              </div>

              <div className="mt-5 bg-sky-50/70 p-4 rounded-2xl border border-sky-100">
                <label className="block text-xs font-bold text-sky-700 mb-1.5">
                  {t.totalAmount}
                  <span className={`${isUrdu ? "mr-2" : "ml-2"} text-sky-500 font-normal text-xs`}>
                    ⚡ {t.autoCalcNote}
                  </span>
                </label>
                <input
                  type="text"
                  value={fmt(formTotal)}
                  readOnly
                  className={`${readonlyClass} font-mono`}
                />
              </div>

              <div className="mt-4">
                <label className={labelClass}>{t.status}</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                  className={inputClass}
                >
                  <option value="Pending">{t.pending}</option>
                  <option value="Completed">{t.completed}</option>
                  <option value="Cancelled">{t.cancelled}</option>
                </select>
              </div>

              <div
                className={`flex gap-3 mt-6 pt-4 border-t border-sky-100 ${
                  isUrdu ? "flex-row-reverse" : ""
                }`}
              >
                <button
                  onClick={handleSave}
                  disabled={submitting}
                  className="flex-1 bg-sky-600 text-white py-3 rounded-2xl font-semibold text-sm hover:bg-sky-700 transition shadow-lg shadow-sky-200 flex justify-center items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <i className={`bi ${submitting ? "bi-arrow-repeat animate-spin" : "bi-save"}`}></i>
                  {submitting ? t.saving : t.save}
                </button>

                <button
                  onClick={() => setShowForm(false)}
                  disabled={submitting}
                  className="flex-1 bg-white border border-sky-200 text-sky-700 py-3 rounded-2xl font-semibold text-sm hover:bg-sky-50 transition disabled:opacity-60"
                >
                  {t.cancel}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-sm border border-sky-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-slate-600">
              <thead>
                <tr className="bg-sky-50 text-slate-600 text-xs font-bold border-b border-sky-100 whitespace-nowrap">
                  <th className={`px-3 py-3 ${isUrdu ? "text-right" : "text-left"} w-10`}>#</th>
                  <th className={`px-3 py-3 ${isUrdu ? "text-right" : "text-left"}`}>{t.orderNo}</th>
                  <th className={`px-3 py-3 ${isUrdu ? "text-right" : "text-left"}`}>{t.customer}</th>
                  <th className="px-3 py-3 text-center">{t.orderDate}</th>
                  <th className="px-3 py-3 text-center">{t.deliveryDate}</th>
                  <th className={`px-3 py-3 ${isUrdu ? "text-right" : "text-left"}`}>{t.productType}</th>
                  <th className={`px-3 py-3 ${isUrdu ? "text-right" : "text-left"}`}>{t.category}</th>
                  <th className={`px-3 py-3 ${isUrdu ? "text-right" : "text-left"}`}>{t.product}</th>
                  <th className="px-3 py-3 text-center">{t.unit}</th>
                  <th className="px-3 py-3 text-right">{t.orderQty}</th>
                  <th className="px-3 py-3 text-right">{t.rate}</th>
                  <th className="px-3 py-3 text-right">{t.debit}</th>
                  <th className="px-3 py-3 text-right">{t.credit}</th>
                  <th className="px-3 py-3 text-right">{t.totalAmount}</th>
                  <th className="px-3 py-3 text-center">{t.status}</th>
                  <th className="px-3 py-3 text-center">{t.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sky-50">
                {loading ? (
                  <tr>
                    <td colSpan={16} className="px-6 py-12 text-center text-slate-400">
                      <i className="bi bi-arrow-repeat animate-spin text-2xl"></i>
                      <p className="mt-2 text-sm">{t.loadingOrders}</p>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={16} className="px-6 py-12 text-center text-slate-400 text-sm">
                      {t.noRecords}
                    </td>
                  </tr>
                ) : (
                  filtered.map((o, i) => {
                    const items = normalizeOrderItems(o);

                    return (
                      <tr key={o.id} className="hover:bg-sky-50/70 transition align-top">
                        <td className="px-3 py-3 text-slate-400 font-mono text-xs">{i + 1}</td>
                        <td className="px-3 py-3">
                          <span className="font-bold text-slate-950 font-mono block text-sm">
                            {o.order_no}
                          </span>
                          <span className="text-xs text-slate-400">
                            {items.length} {t.itemsLabel}
                          </span>
                        </td>
                        <td className={`px-3 py-3 text-sm ${valueClass}`}>{getCustomerName(o)}</td>
                        <td className="px-3 py-3 text-center font-mono text-slate-950 whitespace-nowrap text-xs">
                          {o.order_date || "—"}
                        </td>
                        <td className="px-3 py-3 text-center font-mono text-slate-950 whitespace-nowrap text-xs">
                          {o.delivery_date || "—"}
                        </td>

                        <td className="px-3 py-3">
                          <div className="space-y-1.5">
                            {items.map((item, idx) => (
                              <div key={idx}>
                                <span className="bg-sky-50 text-slate-950 px-2.5 py-1 rounded-lg text-xs font-medium inline-block border border-sky-100">
                                  {getTranslatedMapValue(
                                    "product_type",
                                    item.product_type_id,
                                    typeMap[item.product_type_id] || `#${item.product_type_id}`
                                  )}
                                </span>
                              </div>
                            ))}
                          </div>
                        </td>

                        <td className="px-3 py-3">
                          <div className="space-y-1.5">
                            {items.map((item, idx) => (
                              <div key={idx} className={`text-sm ${valueClass}`}>
                                {getTranslatedMapValue(
                                  "category",
                                  item.category_id,
                                  categoryMap[item.category_id] || `#${item.category_id}`
                                )}
                              </div>
                            ))}
                          </div>
                        </td>

                        <td className="px-3 py-3">
                          <div className="space-y-1.5">
                            {items.map((item, idx) => (
                              <div key={idx} className="text-slate-950 font-medium text-sm">
                                {getTranslatedMapValue(
                                  "product",
                                  item.product_id,
                                  productMap[item.product_id] || `#${item.product_id}`
                                )}
                              </div>
                            ))}
                          </div>
                        </td>

                        <td className="px-3 py-3 text-center">
                          <div className="space-y-1.5">
                            {items.map((item, idx) => (
                              <div key={idx} className={`text-sm ${valueClass}`}>
                                {getTranslatedMapValue(
                                  "unit",
                                  item.unit_id,
                                  unitMap[item.unit_id] || `#${item.unit_id}`
                                )}
                              </div>
                            ))}
                          </div>
                        </td>

                        <td className="px-3 py-3 text-right">
                          <div className="space-y-1.5">
                            {items.map((item, idx) => (
                              <div key={idx} className={`${monoBlack} font-semibold text-sm`}>
                                {item.order_qty || 0}
                              </div>
                            ))}
                          </div>
                        </td>

                        <td className="px-3 py-3 text-right">
                          <div className="space-y-1.5">
                            {items.map((item, idx) => (
                              <div key={idx} className={`${monoBlack} text-sm`}>
                                {fmt(item.rate)}
                              </div>
                            ))}
                          </div>
                        </td>

                        <td className="px-3 py-3 text-right">
                          <div className="space-y-1.5">
                            {items.map((item, idx) => (
                              <div key={idx} className={`${monoBlack} font-semibold text-sm`}>
                                {fmt(item.debit)}
                              </div>
                            ))}
                          </div>
                        </td>

                        <td className="px-3 py-3 text-right">
                          <div className="space-y-1.5">
                            {items.map((item, idx) => (
                              <div key={idx} className={`${monoBlack} font-semibold text-sm`}>
                                {fmt(item.credit)}
                              </div>
                            ))}
                          </div>
                        </td>

                        <td className="px-3 py-3 text-right">
                          <div className="space-y-1.5">
                            {items.map((item, idx) => (
                              <div key={idx} className={`${monoBlack} text-sm`}>
                                {fmt(calcLineTotal(item))}
                              </div>
                            ))}
                          </div>
                        </td>

                        <td className="px-3 py-3 text-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-bold bg-sky-50 text-slate-950 border border-sky-100">
                            {getStatusLabel(o.status, t)}
                          </span>
                        </td>

                        <td className="px-3 py-3">
                          <div
                            className={`flex items-center justify-center gap-1.5 ${
                              isUrdu ? "flex-row-reverse" : ""
                            }`}
                          >
                            <button
                              onClick={() => openEdit(o)}
                              className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 hover:bg-sky-200 transition flex items-center justify-center"
                              title={t.edit}
                            >
                              <i className="bi bi-pencil-square text-sm"></i>
                            </button>
                            <button
                              onClick={() => handleDelete(o.id)}
                              className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 hover:bg-rose-200 transition flex items-center justify-center"
                              title={t.delete}
                            >
                              <i className="bi bi-trash3-fill text-sm"></i>
                            </button>
                            <button
                              onClick={async () => {
                                let cacheToUse = urduCache;

                                if (lang === "ur") {
                                  setTranslating(true);
                                  try {
                                    const updatedCache = await ensureOrderPrintTranslations(o);
                                    if (updatedCache) cacheToUse = updatedCache;
                                  } finally {
                                    setTranslating(false);
                                  }
                                }

                                generateSlipPrint(
                                  o,
                                  lang,
                                  { productMap, categoryMap, typeMap, unitMap },
                                  cacheToUse
                                );
                              }}
                              className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 hover:bg-amber-200 transition flex items-center justify-center"
                              title={t.printSlip}
                            >
                              <i className="bi bi-printer-fill text-sm"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaleOrderPage;