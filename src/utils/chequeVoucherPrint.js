// Cheque voucher print - read-only. No edits or accounting writes.
const escapeHtml = value => String(value == null ? "" : value)
  .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
  .replace(/"/g,"&quot;").replace(/'/g,"&#39;");
const money = value => (Number(value)||0).toLocaleString("en-PK",{minimumFractionDigits:2,maximumFractionDigits:2});
const date = value => {
  const match=String(value||"").slice(0,10).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return match ? match[3]+"-"+match[2]+"-"+match[1].slice(2) : String(value||"—");
};
const types={customer:["Customer","کسٹمر"],supplier:["Supplier","سپلائر"],employee:["Employee","ملازم"],general_ledger:["General Account","جنرل اکاؤنٹ"]};
const words={
  en:{title:"CHEQUE VOUCHER",report:"Cheque Voucher Report",date:"Cheque Date",clearance:"Due / Clearance Date",
    account:"Account",type:"Account Type",party:"Payee / Party",direction:"Cheque Direction",note:"Remarks",
    no:"Voucher No",amount:"Cheque Amount",cleared:"Cleared",remaining:"Remaining",status:"Status",
    details:"Clearance / Partial Payment Details",paymentDate:"Cleared Date",cash:"Cash Book Voucher",
    noPayments:"No clearing entries yet.",receivedTotal:"Received Cheques",receivedCleared:"Received Cleared",
    issuedTotal:"Issued Cheques",issuedCleared:"Issued Cleared",summary:"Filtered Totals",
    received:"Received",issued:"Issued / Paid",sign:"Authorized Signature",prepared:"Prepared By",period:"Cheque date range"},
  ur:{title:"چیک واؤچر",report:"چیک واؤچر رپورٹ",date:"چیک کی تاریخ",clearance:"کلیئرنس کی تاریخ",
    account:"اکاؤنٹ",type:"اکاؤنٹ کی قسم",party:"پارٹی",direction:"چیک کی قسم",note:"تفصیل",
    no:"واؤچر نمبر",amount:"چیک کی رقم",cleared:"کلیئر شدہ",remaining:"باقی رقم",status:"حالت",
    details:"جزوی ادائیگی / کلیئرنس کی تفصیل",paymentDate:"ادائیگی کی تاریخ",cash:"کیش بک واؤچر",
    noPayments:"ابھی کوئی کلیئرنس نہیں۔",receivedTotal:"وصول شدہ چیک",receivedCleared:"وصول شدہ کلیئر",
    issuedTotal:"جاری شدہ چیک",issuedCleared:"جاری شدہ کلیئر",summary:"منتخب ریکارڈ کی رقم",
    received:"وصولی",issued:"ادائیگی",sign:"مجاز دستخط",prepared:"تیار کنندہ",period:"چیک کی تاریخوں کی حد"}
};
export const chequeSummary = vouchers => (Array.isArray(vouchers)?vouchers:[]).reduce((acc,v)=>{
  const receive=v.cheque_direction==="receive";
  const value=Number(v.total_amount)||0,cleared=Number(v.paid_amount)||0;
  if(receive){acc.receivedTotal+=value;acc.receivedCleared+=cleared;}
  else {acc.issuedTotal+=value;acc.issuedCleared+=cleared;}
  return acc;
},{receivedTotal:0,receivedCleared:0,issuedTotal:0,issuedCleared:0});
const amountCell = value => '<span class="amt">Rs '+money(value)+'</span>';
const info=(label,value)=>'<div class="info"><small>'+escapeHtml(label)+'</small><strong>'+escapeHtml(value)+'</strong></div>';
const header=(title,subtitle)=>'<header class="branding"><div class="brand"><img src="/images/ali-bird-cage-logo.png" alt="" /><div><h1>ALI BIRD CAGE</h1><h2>'+escapeHtml(title)+'</h2></div></div><aside>'+escapeHtml(subtitle)+'</aside></header>';
const summaryHtml=(totals,t)=>'<section class="summary">'+[
 [t.receivedTotal,totals.receivedTotal],
 [t.receivedCleared,totals.receivedCleared],
 [t.issuedTotal,totals.issuedTotal],
 [t.issuedCleared,totals.issuedCleared]
].map(entry=>'<div class="summary-box"><span>'+escapeHtml(entry[0])+'</span><b>'+amountCell(entry[1])+'</b></div>').join("")+'</section>';
function voucherHtml(v,t,urdu){
  const items=Array.isArray(v.payments)?v.payments:[];
  const lineItems=items.length?items.map((p,i)=>{
    return '<tr><td>'+(i+1)+'</td><td>'+escapeHtml(date(p.payment_date))+'</td><td>'+escapeHtml(p.details||"—")+
      '</td><td>'+escapeHtml(p.cash_book_voucher_no||"—")+'</td><td class="amount">'+amountCell(p.amount)+'</td></tr>';
  }).join(""):'<tr><td colspan="5" class="empty">'+escapeHtml(t.noPayments)+'</td></tr>';
  const type=types[v.account_type]?.[urdu?1:0]||v.account_type||"—";
  const accountName=v.account_title||v.payee_name||"—";
  return '<article class="voucher"><div class="voucher-heading"><h3>'+escapeHtml(v.voucher_no||"Cheque Voucher")+'</h3><b>'+escapeHtml(v.cheque_direction==="receive"?t.received:t.issued)+'</b></div>'+
   '<section class="grid">'+
   info(t.no,v.voucher_no)+info(t.direction,v.cheque_direction==="receive"?t.received:t.issued)+
   info(t.type,type)+info(t.account,accountName)+
   info(t.party,v.payee_name||"—")+info(t.date,date(v.issuance_date))+
   info(t.clearance,date(v.clearance_date))+info(t.status,v.status||"—")+
   '</section>'+
   (v.notes?'<p class="notes"><b>'+escapeHtml(t.note)+':</b> '+escapeHtml(v.notes)+'</p>':"")+
   '<h4>'+escapeHtml(t.details)+'</h4>'+
   '<table><thead><tr><th>#</th><th>'+escapeHtml(t.paymentDate)+'</th><th>'+escapeHtml(t.note)+'</th><th>'+escapeHtml(t.cash)+'</th><th class="amount">'+escapeHtml(t.amount)+'</th></tr></thead><tbody>'+lineItems+'</tbody></table>'+
   '<div class="totals">'+
   '<div><span>'+escapeHtml(t.amount)+'</span><b>'+amountCell(v.total_amount)+'</b></div>'+
   '<div><span>'+escapeHtml(t.cleared)+'</span><b>'+amountCell(v.paid_amount)+'</b></div>'+
   '<div><span>'+escapeHtml(t.remaining)+'</span><b>'+amountCell(v.remaining_amount)+'</b></div>'+
   '</div></article>';
}
export function buildChequeVoucherPrintHtml(vouchers,options={}){
  const rows=Array.isArray(vouchers)?vouchers:[vouchers].filter(Boolean);
  const urdu=options.lang==="ur",t=words[urdu?"ur":"en"];
  const totals=chequeSummary(rows);
  const filters=options.filters||{};
  const selectedType=filters.account_type&&filters.account_type!=="all"?(types[filters.account_type]?.[urdu?1:0]||filters.account_type):"All types";
  const selectedAccount=filters.account_name||"All accounts";
  const interval=(filters.from_date?date(filters.from_date):"All") + " — " + (filters.to_date?date(filters.to_date):"All");
  const subtitle= options.single?String(rows[0]?.voucher_no||""):t.period+": "+interval+" | "+selectedType+" / "+selectedAccount+" | "+rows.length+" voucher(s)";
  const stylesheet=[
    "@page{size:A4 portrait;margin:10mm}",
    "*{box-sizing:border-box}body{margin:0;font-family:Arial,'Noto Nastaliq Urdu',sans-serif;color:#17263c;direction:rtl;text-align:right;background:#fff}",
    ".sheet{max-width:980px;margin:auto;padding:12px}.branding{display:flex;align-items:center;justify-content:space-between;gap:15px;border-bottom:3px solid #192b44;padding:10px 5px 14px}",
    ".brand{display:flex;direction:rtl;align-items:center;gap:14px}.brand img{width:95px;height:65px;object-fit:contain}.brand h1{margin:0;font-size:23px;font-weight:900}.brand h2{margin:3px 0 0;color:#2766a1;font-size:14px}",
    ".branding aside{max-width:38%;font-size:10px;line-height:1.9;color:#42526b}",
    ".summary{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:7px;margin:14px 0 17px}",
    ".summary-box{border:1.5px solid #6c829d;min-height:68px;background:#f8fafc;padding:9px;display:flex;flex-direction:column;justify-content:center;gap:8px}",
    ".summary-box span{font-size:10px;font-weight:800;color:#4b6078}.summary-box b{font-size:14px}",
    ".amt{direction:ltr;display:inline-block;white-space:nowrap;font-family:Arial;unicode-bidi:isolate}",
    ".voucher{margin:0 0 18px;page-break-inside:avoid;break-inside:avoid;border:1.5px solid #7e8a9c;padding:10px}",
    ".voucher-heading{display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #bac4d0;margin-bottom:10px;padding-bottom:7px}",
    ".voucher-heading h3{font-size:14px;margin:0}.voucher-heading>b{color:#1d5d99;font-size:11px}",
    ".grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px}",
    ".info{border:1px solid #c8d2dd;background:#fcfdff;padding:7px;min-height:55px;overflow-wrap:anywhere}",
    ".info small{display:block;font-size:9px;color:#58708a;margin-bottom:5px;font-weight:bold}.info strong{font-size:11px}",
    "h4{font-size:11px;margin:14px 0 6px}.notes{font-size:11px;line-height:1.7}",
    "table{width:100%;border-collapse:collapse;table-layout:fixed}th,td{border:1px solid #aeb9c7;padding:7px;vertical-align:top;font-size:10px;overflow-wrap:anywhere}",
    "th{background:#e9f2fb;font-weight:800}.amount{text-align:left;direction:ltr}.empty{text-align:center;color:#718096}",
    ".totals{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px;margin-top:11px}",
    ".totals>div{background:#f2f7fc;border:1px solid #95aeca;padding:9px;display:flex;flex-direction:column;gap:6px}.totals span{font-weight:bold;font-size:10px}",
    ".sign{display:flex;justify-content:space-between;gap:20px;margin-top:42px}.sign span{border-top:1px solid #526075;width:35%;padding-top:7px;text-align:center;font-size:10px;font-weight:bold}",
    "@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}.sheet{max-width:none;padding:0}.voucher{break-inside:auto;page-break-inside:auto}.voucher-heading{break-after:avoid}table tr{break-inside:avoid}}",
    "@media(max-width:650px){.grid{grid-template-columns:repeat(2,1fr)}.summary{grid-template-columns:repeat(2,1fr)}}"
  ].join("\n");
  return '<!doctype html><html lang="'+(urdu?'ur':'en')+'"><head><meta charset="utf-8"/><title>'+escapeHtml(t.report)+'</title><style>'+stylesheet+'</style></head>'+
   '<body><main class="sheet">'+header(options.single?t.title:t.report,subtitle)+summaryHtml(totals,t)+
   rows.map(row=>voucherHtml(row,t,urdu)).join("")+
   '<footer class="sign"><span>'+escapeHtml(t.sign)+'</span><span>'+escapeHtml(t.prepared)+'</span></footer></main>'+
   '<script>window.addEventListener("load",async function(){try{await document.fonts.ready;}catch(e){}setTimeout(function(){window.print();},350)});<\/script></body></html>';
}
export function openChequeVoucherPrintWindow(vouchers,options={},existingPopup=null){
 const popup=existingPopup||window.open("","_blank","width=1000,height=850");
 if(!popup)throw new Error("Please allow pop-ups for printing.");
 popup.document.open();
 popup.document.write(buildChequeVoucherPrintHtml(vouchers,options));
 popup.document.close();
 return popup;
}
