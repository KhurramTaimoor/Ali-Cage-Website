import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { zipSync } from "fflate";

// Cash Book voucher print / PDF helpers.
// We deliberately fetch each saved voucher from the existing detail API;
// printing never changes any accounting records.
const logoUrl = "/images/ali-bird-cage-logo.png";

const htmlEscape = (value) => String(value ?? "")
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#39;");

export const safeCashBookFileName = (value) => {
  // Keep Urdu names readable on the downloaded filenames.
  const name = String(value ?? "").normalize("NFC")
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, "_")
    .replace(/\s+/g, " ")
    .replace(/[. ]+$/g, "")
    .trim();
  return (name || "Account").slice(0, 90);
};

const amount = (value) => {
  const number = Number(value);
  return (Number.isFinite(number) ? number : 0)
    .toLocaleString("en-PK", { maximumFractionDigits: 2, minimumFractionDigits: 0 });
};

const displayDate = (value) => {
  const raw = String(value || "").slice(0, 10);
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return match ? `${match[3]}/${match[2]}/${match[1]}` : raw || "—";
};

const accountTypeLabel = (type, urdu = false) => {
  const types = {
    customer: ["Customer", "کسٹمر"],
    supplier: ["Supplier", "سپلائر"],
    employee: ["Employee", "ملازم"],
    general_ledger: ["General Account", "جنرل اکاؤنٹ"],
  };
  return (types[type] || [type || "Account", type || "اکاؤنٹ"])[urdu ? 1 : 0];
};

export function groupCashBookVoucherItems(voucher) {
  const groups = new Map();
  (Array.isArray(voucher?.items) ? voucher.items : []).forEach((item, idx) => {
    const type = String(item.account_type || "general_ledger");
    const id = String(item.account_id ?? "");
    const key = id ? `${type}:${id}` : `${type}:missing:${idx}`;
    const existing = groups.get(key);
    if (existing) {
      existing.items.push(item);
    } else {
      groups.set(key, {
        key,
        accountType: type,
        accountId: id,
        name: String(item.account_name || "").trim() || "Account",
        items: [item],
      });
    }
  });
  return [...groups.values()];
}

const labelsFor = (urdu) => (urdu ? {
  sheet: "کیش بک واؤچر",
  voucher: "واؤچر نمبر",
  date: "تاریخ",
  account: "اکاؤنٹ نام",
  accountType: "اکاؤنٹ ٹائپ",
  notes: "واؤچر نوٹس",
  details: "تفصیلات",
  received: "وصولی",
  paid: "ادائیگی",
  totalReceived: "کل وصولی",
  totalPaid: "کل ادائیگی",
  net: "نیٹ رقم",
  authorized: "دستخط (مجاز)",
  recipient: "دستخط (وصول کنندہ)",
  copy: "اکاؤنٹ کاپی",
  fullCopy: "واؤچر کاپی",
  line: "#",
  brand: "ALI BIRD CAGE",
} : {
  sheet: "Cash Book Voucher",
  voucher: "Voucher No",
  date: "Date",
  account: "Account Name",
  accountType: "Account Type",
  notes: "Voucher Notes",
  details: "Description",
  received: "Receive",
  paid: "Paid",
  totalReceived: "Total Receive",
  totalPaid: "Total Paid",
  net: "Net Amount",
  authorized: "Authorized Signature",
  recipient: "Received By",
  copy: "Account Copy",
  fullCopy: "Voucher Copy",
  line: "#",
  brand: "ALI BIRD CAGE",
});

export const cashBookSlipCss = `
  @page { size: A4 portrait; margin: 10mm; }
  .cb-print-root, .cb-print-root * { box-sizing: border-box; }
  .cb-print-root { width: 100%; max-width: 794px; margin: 0 auto; padding: 12px; background: white; color: #17233a;
    font-family: "Segoe UI", Arial, "Noto Nastaliq Urdu", sans-serif; direction: rtl; text-align: right; }
  .cb-paper { border: 2px solid #1e293b; border-radius: 3px; min-height: 650px; padding: 20px 22px 25px; position: relative; overflow: hidden; background: white; }
  .cb-ribbon { position: absolute; right: -47px; top: 29px; width: 190px; background: #2888ec; color: white;
    transform: rotate(42deg); text-align: center; padding: 6px 0; font-weight: 850; letter-spacing: 1px; font-size: 11px; }
  .cb-brand { display: flex; direction: rtl; gap: 20px; align-items: center; justify-content: space-between; padding-left: 45px; border-bottom: 2px solid #e2e8f0; padding-bottom: 14px; }
  .cb-brand img { width: 125px; height: 70px; object-fit: contain; flex-shrink: 0; }
  .cb-brand h1 { flex: 1; text-align: center; font-family: Arial,sans-serif; font-size: 31px; letter-spacing: .5px; font-weight: 900; margin: 0; }
  .cb-brand h1 span { color: #2888ec; }
  .cb-brand-sub { text-align: center; margin: 10px 0 20px; font-weight: 900; font-size: 19px; }
  .cb-brand-sub .cb-sub-tag { margin-left: 10px; padding: 4px 9px; background: #eaf3ff; color: #1e62ad; border-radius: 4px; font-size: 11px; }
  .cb-meta { display:grid; direction: rtl; text-align: right; grid-template-columns: repeat(3, 1fr); gap: 9px; margin-bottom: 17px; }
  .cb-cell { padding: 9px 10px; min-height: 59px; border: 1px solid #cbd5e1; border-radius: 4px; background: #f8fafc; min-width: 0; }
  .cb-cell span { display:block; font-size: 10px; color: #52627c; font-weight: 750; margin-bottom: 5px; }
  .cb-cell strong { display:block; font-size: 13px; overflow-wrap: anywhere; line-height: 1.5; }
  .cb-table { width: 100%; border-collapse: collapse; table-layout: fixed; }
  .cb-table th { background: #eff6ff; text-align: right; font-size: 11px; color: #182f51; padding: 10px 8px; border: 1px solid #71819a; }
  .cb-table td { font-size: 12px; padding: 9px 8px; vertical-align: top; border: 1px solid #94a3b8; overflow-wrap: anywhere; }
  .cb-table th:first-child, .cb-table td:first-child { width: 40px; text-align: center; }
  .cb-table .cb-money { width: 110px; text-align: right; direction: ltr; white-space: nowrap; }
  .cb-table td.cb-note { min-width: 180px; }
  .cb-totals { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 15px; }
  .cb-total { border: 1px solid #94a3b8; padding: 12px; border-radius: 4px; background: #f8fafc; }
  .cb-total span { display:block; color: #57687f; font-size: 10px; font-weight: 800; margin-bottom: 7px; }
  .cb-total strong { font-size: 18px; font-family: Arial,sans-serif; }
  .cb-total.received strong { color: #06734c; }
  .cb-total.paid strong { color: #b42332; }
  .cb-total.net { background: #eaf3ff; border-color: #80b4e5; }
  .cb-total.net strong { color: #1c4e86; }
  .cb-signatures { display: flex; direction: rtl; justify-content: space-between; align-items: end; gap: 35px; padding-top: 66px; }
  .cb-signatures div { width: 42%; border-top: 1px solid #475569; padding-top: 9px; text-align: center; font-size: 11px; font-weight: 750; }
  .cb-urdu { direction: rtl; text-align: right; }
  @media print { body {margin: 0 !important; background: white !important;} .cb-print-root {padding: 0;max-width: none;}
    .cb-paper { min-height: auto; page-break-inside: avoid; } .cb-ribbon, .cb-total, .cb-table th { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
`;

export function buildCashBookSlipHtml(voucher, selectedGroup = null, urdu = false) {
  const labels = labelsFor(urdu);
  const items = selectedGroup?.items || (Array.isArray(voucher?.items) ? voucher.items : []);
  const receive = items.reduce((sum, item) => sum + (Number(item.receive) || 0), 0);
  const paid = items.reduce((sum, item) => sum + (Number(item.paid) || 0), 0);
  const rows = items.map((item, index) => `
    <tr>
      <td>${index + 1}</td>
      <td>${htmlEscape(accountTypeLabel(item.account_type, urdu))}</td>
      <td>${htmlEscape(item.account_name || selectedGroup?.name || "—")}</td>
      <td class="cb-note ${urdu ? "cb-urdu" : ""}">${htmlEscape(item.description || "—")}</td>
      <td class="cb-money">${Number(item.receive) ? amount(item.receive) : "—"}</td>
      <td class="cb-money">${Number(item.paid) ? amount(item.paid) : "—"}</td>
    </tr>`).join("");

  const cell = (label, value, urduValue = false) => `
    <div class="cb-cell"><span>${htmlEscape(label)}</span>
      <strong${urduValue ? ' class="cb-urdu"' : ''}>${htmlEscape(value || "—")}</strong></div>`;
  const groupName = selectedGroup?.name || "All Accounts";
  return `<div class="cb-print-root"><div class="cb-paper">
    <div class="cb-ribbon">CASH BOOK</div>
    <header class="cb-brand">
      <img src="${logoUrl}" alt="Ali Bird Cage" />
      <h1>ALI <span>BIRD</span> CAGE</h1>
    </header>
    <div class="cb-brand-sub">${htmlEscape(labels.sheet)}<span class="cb-sub-tag">${selectedGroup ? htmlEscape(labels.copy) : htmlEscape(labels.fullCopy)}</span></div>
    <div class="cb-meta">
      ${cell(labels.voucher, voucher.voucher_no)}
      ${cell(labels.date, displayDate(voucher.voucher_date))}
      ${cell(labels.account, groupName, urdu)}
      ${cell(labels.accountType, selectedGroup ? accountTypeLabel(selectedGroup.accountType, urdu) : "Multiple Accounts")}
      ${cell(labels.notes, voucher.notes || "—", urdu)}
      ${cell(labels.details, selectedGroup ? `${items.length} ${urdu ? "اندراج" : "line(s)"}` : `${items.length} ${urdu ? "اندراج" : "line(s)"}`)}
    </div>
    <table class="cb-table"><thead><tr>
      <th>${labels.line}</th><th>${htmlEscape(labels.accountType)}</th><th>${htmlEscape(labels.account)}</th>
      <th>${htmlEscape(labels.details)}</th><th class="cb-money">${htmlEscape(labels.received)}</th><th class="cb-money">${htmlEscape(labels.paid)}</th>
    </tr></thead><tbody>${rows}</tbody></table>
    <div class="cb-totals">
      <div class="cb-total received"><span>${htmlEscape(labels.totalReceived)}</span><strong>Rs ${amount(receive)}</strong></div>
      <div class="cb-total paid"><span>${htmlEscape(labels.totalPaid)}</span><strong>Rs ${amount(paid)}</strong></div>
      <div class="cb-total net"><span>${htmlEscape(labels.net)}</span><strong>Rs ${amount(receive - paid)}</strong></div>
    </div>
    <footer class="cb-signatures"><div>${htmlEscape(labels.authorized)}</div><div>${htmlEscape(labels.recipient)}</div></footer>
  </div></div>`;
}

export function openCashBookPrintWindow(voucher, group = null, urdu = false, existingPopup = null) {
  const popup = existingPopup || window.open("", "_blank", "width=1100,height=900");
  if (!popup) throw new Error("Please allow pop-ups for printing.");
  // No user-entered content is inserted without HTML escaping.
  const html = `<!doctype html><html lang="${urdu ? "ur" : "en"}"><head><meta charset="utf-8" />
    <title>${htmlEscape(group?.name || "Cash Book")} — ${htmlEscape(voucher.voucher_no)}</title>
    <style>${cashBookSlipCss}</style></head><body>${buildCashBookSlipHtml(voucher, group, urdu)}
    <script>window.onload = async function () { try { await document.fonts.ready; } catch(e) {} setTimeout(function() { window.print(); }, 300); };<\/script>
    </body></html>`;
  popup.document.open(); popup.document.write(html); popup.document.close();
}

async function canvasToAccountPdf(voucher, group, urdu = false) {
  const host = document.createElement("div");
  host.style.cssText = "position:fixed;top:0;left:0;width:794px;background:white;z-index:-100;pointer-events:none;";
  host.innerHTML = `<style>${cashBookSlipCss}</style>${buildCashBookSlipHtml(voucher, group, urdu)}`;
  document.body.appendChild(host);
  try {
    await Promise.all(Array.from(host.querySelectorAll("img")).map((img) =>
      img.complete ? Promise.resolve() : new Promise((resolve) => {
        img.onload = resolve; img.onerror = resolve;
      })
    ));
    if (document.fonts?.ready) await document.fonts.ready;
    const target = host.querySelector(".cb-print-root");
    const canvas = await html2canvas(target, {
      scale: 1.5,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
      windowWidth: 900,
    });
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
    const contentWidth = 190;
    const availableHeight = 277;
    const canvasSliceHeight = Math.max(1, Math.floor(canvas.width * availableHeight / contentWidth));
    let top = 0;
    while (top < canvas.height) {
      const height = Math.min(canvasSliceHeight, canvas.height - top);
      const slice = document.createElement("canvas");
      slice.width = canvas.width;
      slice.height = height;
      slice.getContext("2d").drawImage(canvas, 0, top, canvas.width, height, 0, 0, canvas.width, height);
      if (top > 0) pdf.addPage();
      pdf.addImage(slice.toDataURL("image/jpeg", 0.87), "JPEG", 10, 10, contentWidth, height / canvas.width * contentWidth);
      top += height;
    }
    return new Uint8Array(pdf.output("arraybuffer"));
  } finally {
    host.remove();
  }
}

function triggerFileDownload(data, fileName, mime) {
  const file = new Blob([data], { type: mime });
  const url = URL.createObjectURL(file);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 30000);
}

export async function downloadCashBookSinglePdf(voucher, group, urdu = false) {
  if (!group) throw new Error("Select an account to download.");
  const pdf = await canvasToAccountPdf(voucher, group, urdu);
  const filename = `${safeCashBookFileName(group.name)}_${safeCashBookFileName(voucher.voucher_no)}.pdf`;
  triggerFileDownload(pdf, filename, "application/pdf");
}

export async function downloadCashBookAccountZip(voucher, urdu = false) {
  const groups = groupCashBookVoucherItems(voucher);
  if (!groups.length) throw new Error("This voucher has no account entries.");
  const files = {};
  const usedNames = new Set();
  for (const group of groups) {
    const pdf = await canvasToAccountPdf(voucher, group, urdu);
    let base = safeCashBookFileName(group.name);
    if (usedNames.has(base.toLowerCase())) {
      base = `${base}_${safeCashBookFileName(group.accountType)}_${safeCashBookFileName(group.accountId)}`;
    }
    usedNames.add(base.toLowerCase());
    files[`${base}_${safeCashBookFileName(voucher.voucher_no)}.pdf`] = pdf;
  }
  const zip = zipSync(files, { level: 0 });
  triggerFileDownload(zip, `CashBook_${safeCashBookFileName(voucher.voucher_no)}_Account_Slips.zip`, "application/zip");
  return groups.length;
}
