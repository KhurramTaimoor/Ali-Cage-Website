const n = (v) => { const x = Number(v || 0); return Number.isFinite(x) ? x : 0; };
const same = (a,b) => String(a ?? '') === String(b ?? '');

export function resolveSalesRate(rates, { customerId, productId, categoryId, productTypeId, unitId, rateMode = 'retail' } = {}) {
  const candidates = (Array.isArray(rates) ? rates : [])
    .filter((r) => same(r.product_id, productId))
    .filter((r) => !r.customer_id || same(r.customer_id, customerId))
    .sort((a,b) => {
      const ac = a.customer_id && same(a.customer_id, customerId) ? 1 : 0;
      const bc = b.customer_id && same(b.customer_id, customerId) ? 1 : 0;
      return bc - ac;
    });

  let best = null;
  let bestScore = -1;
  for (const record of candidates) {
    const options = Array.isArray(record.price_options) ? record.price_options : [];
    for (const opt of options) {
      let score = 0;
      if (categoryId && same(opt.category_id, categoryId)) score += 4;
      else if (opt.category_id) continue;
      if (productTypeId && same(opt.product_type_id, productTypeId)) score += 4;
      else if (opt.product_type_id) continue;
      if (unitId && same(opt.unit_id, unitId)) score += 2;
      else if (opt.unit_id) continue;
      if (record.customer_id && same(record.customer_id, customerId)) score += 8;
      if (score > bestScore) { bestScore = score; best = { record, opt }; }
    }
  }
  if (!best) return null;
  const modeKey = `${rateMode}_rate`;
  const singleRate = n(best.opt.single_rate);
  const rate = (rateMode === 'single' ? singleRate : n(best.opt[modeKey])) || n(best.opt.retail_rate) || n(best.opt.wholesale_rate) || n(best.opt.distributor_rate) || singleRate;
  if (!rate && !singleRate) return null;
  return { rate: rate || singleRate, single_rate: singleRate, list_name: best.record.list_name || 'Rate List', customer_id: best.record.customer_id || null, option: best.opt };
}
