import Rate from '../models/Rate.js';

/** 1 tola = 11.6638 grams. Rates are quoted per tola; products are weighed in grams. */
export const TOLA_IN_GRAMS = 11.6638;

/**
 * Latest published rate for each purity category, as a lookup map.
 * One aggregate call serves a whole product page, rather than a query per item.
 */
export const getRateMap = async () => {
  const rates = await Rate.aggregate([
    { $sort: { effectiveDate: -1, createdAt: -1 } },
    { $group: { _id: '$category', doc: { $first: '$$ROOT' } } },
    { $replaceRoot: { newRoot: '$doc' } },
  ]);

  return rates.reduce((map, rate) => {
    map[rate.category] = rate;
    return map;
  }, {});
};

/**
 * Price a single product against the current metal rate.
 *
 *   metalValue = (ratePerTola / 11.6638) * netWeight
 *   total      = metalValue + makingCharge + stoneValue
 *
 * Prices are never stored on the product — the metal rate moves daily, so a
 * stored price would be stale the next morning. Returns nulls when no rate has
 * been published for the purity, letting the UI show "price on request".
 */
export const priceProduct = (product, rateMap) => {
  const rate = rateMap[product.purity];

  if (!rate?.ratePerTola) {
    return {
      ratePerTola: null,
      ratePerGram: null,
      metalValue: null,
      makingCharge: product.makingCharge ?? 0,
      stoneValue: product.stoneValue ?? 0,
      totalPrice: null,
      pricedAt: null,
    };
  }

  const ratePerGram = rate.ratePerTola / TOLA_IN_GRAMS;
  const metalValue = ratePerGram * (product.netWeight ?? 0);
  const makingCharge = product.makingCharge ?? 0;
  const stoneValue = product.stoneValue ?? 0;

  return {
    ratePerTola: rate.ratePerTola,
    ratePerGram: Math.round(ratePerGram),
    metalValue: Math.round(metalValue),
    makingCharge,
    stoneValue,
    totalPrice: Math.round(metalValue + makingCharge + stoneValue),
    pricedAt: rate.effectiveDate,
  };
};

/** Attaches a `pricing` block to a product (or array of products). */
export const withPricing = (products, rateMap) => {
  if (Array.isArray(products)) {
    return products.map((p) => ({ ...p, pricing: priceProduct(p, rateMap) }));
  }
  return { ...products, pricing: priceProduct(products, rateMap) };
};

export default { getRateMap, priceProduct, withPricing, TOLA_IN_GRAMS };
