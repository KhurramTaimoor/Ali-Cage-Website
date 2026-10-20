// Printable BOM sheets: no third-party dependency, no data modifications.
const esc=value=>String(value??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
const cash=x=>(Number(x)||0).toLocaleString("en-PK",{minimumFractionDigits:2,maximumFractionDigits:2});
const amount=x=>Number(x)||0;
const sheet=b=>{
 const rows=Array.isArray(b.items)?b.items:[];
 const total=rows.reduce((a,r)=>a+amount(r.material_cost ?? r.total ?? ((amount(r.effective_qty)||amount(r.qty))*amount(r.rate)+amount(r.extra_charges))),0);
 const grand=total+amount(b.labor_cost)+amount(b.expense_cost);
 return '<article class="bom-sheet">'+
 '<header><img src="/images/ali-bird-cage-logo.png" alt="" /><div class="brand"><h1>ALI BIRD CAGE</h1><h2>BILL OF MATERIALS (BOM)</h2></div><div><b>'+esc(b.bom_code||"BOM-"+b.id)+'</b><small>'+esc(new Date().toLocaleDateString("en-PK"))+'</small></div></header>'+
 '<section class="metadata"><div><span>BOM Code</span><b>'+esc(b.bom_code||"BOM-"+b.id)+'</b></div><div><span>Product Head</span><b>'+esc(b.product_name||"—")+'</b></div><div><span>Product Type</span><b>'+esc(b.type_name||"—")+'</b></div><div><span>Category</span><b>'+esc(b.category_name||"—")+'</b></div><div><span>Output Quantity</span><b>'+esc(b.output_qty||1)+'</b></div><div><span>Rate List</span><b>'+esc(b.rate_list_name|| (b.rate_list_id?"List #"+b.rate_list_id:"Manual Rates"))+'</b></div></section>'+
 '<div class="remarks"><b>Remarks:</b> '+esc(b.notes||"—")+'</div>'+
 '<h3>Materials Used</h3><table><thead><tr><th>#</th><th>Product</th><th>Type</th><th>Category</th><th>Unit</th><th>Qty / Effective</th><th>Rate</th><th>Amount</th><th>Extra Charges</th><th>Grand Amount</th></tr></thead><tbody>'+
 rows.map((r,i)=>{const quantity=amount(r.effective_qty)>0?amount(r.effective_qty):amount(r.qty||r.required_qty);const base=quantity*amount(r.rate);const extra=amount(r.extra_charges);return '<tr><td>'+(i+1)+'</td><td>'+esc(r.product_name||r.raw_material||"—")+'</td><td>'+esc(r.type_name||"—")+'</td><td>'+esc(r.category_name||"—")+'</td><td>'+esc(r.unit_name||"—")+'</td><td>'+esc(r.qty||r.required_qty||"0")+(amount(r.wastage_percent)>0?' (Effective '+esc(quantity)+')':'')+'</td><td>'+cash(r.rate)+'</td><td>'+cash(base)+'</td><td>'+cash(extra)+'</td><td>'+cash(base+extra)+'</td></tr>';}).join("")+
 '</tbody></table><div class="totals"><div><span>Total Cost</span><b>Rs '+cash(total)+'</b></div><div><span>Labor Charges</span><b>Rs '+cash(b.labor_cost)+'</b></div><div><span>Expense</span><b>Rs '+cash(b.expense_cost)+'</b></div><div><span>Grand Total Cost</span><b>Rs '+cash(grand)+'</b></div></div>'+
 '<div class="sign"><div>Prepared By</div><div>Authorized Signature</div></div></article>';
};
export function printBOMs(records){
 const data=(Array.isArray(records)?records:[records]).filter(Boolean);
 if(!data.length)throw new Error("No BOM entries to print.");
 const popup=window.open("","_blank","width=1100,height=850");
 if(!popup)throw new Error("Please enable popups to print.");
 const html='<!doctype html><html><head><meta charset="UTF-8"/><title>Ali Bird Cage — BOM Print</title><style>'+
 '@page{size:A4 landscape;margin:9mm}*{box-sizing:border-box}body{margin:0;background:#fff;font:12px Arial,sans-serif;color:#13263A;direction:rtl}.bom-sheet{padding:20px;page-break-after:always;break-after:page}.bom-sheet:last-child{page-break-after:auto;break-after:auto}header{display:flex;align-items:center;justify-content:space-between;gap:20px;border-bottom:3px solid #13263A;padding-bottom:14px}header img{width:85px;height:70px;object-fit:contain}.brand{text-align:center}.brand h1{font-size:26px;margin:0}.brand h2{font-size:15px;margin:5px}header small{display:block;margin-top:5px}.metadata{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:16px}.metadata div,.remarks{border:1px solid #cbd5e1;border-radius:5px;padding:8px}.metadata span{display:block;font-size:10px;color:#64748b}.metadata b{display:block;margin-top:5px}.remarks{margin:12px 0}h3{font-size:15px}table{border-collapse:collapse;width:100%;table-layout:auto}th,td{border:1px solid #94a3b8;padding:7px;text-align:right;overflow-wrap:anywhere}th{background:#eff6ff}tr{break-inside:avoid}.totals{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:15px}.totals div{border:1px solid #94a3b8;padding:10px;border-radius:5px}.totals span{display:block;font-size:10px;color:#475569}.totals b{display:block;font-size:15px;margin-top:5px}.sign{display:flex;justify-content:space-between;margin-top:60px}.sign div{border-top:1px solid #475569;width:33%;padding-top:8px;text-align:center}@media print{.bom-sheet{padding:0}th{print-color-adjust:exact}}'+
 '</style></head><body>'+data.map(sheet).join("")+'<script>window.onload=()=>{setTimeout(()=>window.print(),300)}<\/script></body></html>';
 popup.document.open();popup.document.write(html);popup.document.close();
}
