/** @typedef {{ page: number, offset?: number, limit?: number, key?: string, items: any[], raw?: any, done?: boolean }} PageResult */

/** @typedef {{ buyLkr: ?number, sellLkr: ?number, asOf: ?string, spreadLkr: ?number, currency: ?string, ttBuy: ?number, ttSell: ?number, ddBuy: ?number, ddSell: ?number, chequeBuy: ?number, chequeSell: ?number }} FxTtQuote */
/** @typedef {{ tenorMonths: ?number, paidIn: ?string, ratePa: ?number, aerPa: ?number, effectiveFrom: ?string, seniorCitizen: ?boolean, productCode: ?string, productName: ?string, currency: ?string }} FdDepositQuote */
/** @typedef {{ bank: ?string, merchant: ?string, title: ?string, discountLabel: ?string, weekdayHint: ?string, validTo: ?string, cardType: ?string, sourceUrl: ?string, asOf: ?string, minSpend: ?number }} CardOffer */

export {};
