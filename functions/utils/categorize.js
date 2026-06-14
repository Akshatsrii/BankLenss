/**
 * categorize.js
 *
 * Keyword-based auto-categorization for transaction descriptions.
 *
 * Categories:
 *   Salary    — salary, payroll, stipend, income, ctc
 *   Food      — zomato, swiggy, food, restaurant, cafe, dominos, mcdonald, kfc, starbucks, pizza
 *   Rent      — rent, rental, housing, landlord, pg, paying guest
 *   Utility   — electricity, water, gas, broadband, internet, wifi, recharge, dth, mobile, airtel, jio, vodafone, bsnl
 *   Shopping  — amazon, flipkart, myntra, nykaa, meesho, ajio, shopping, mall, store
 *   Transport — uber, ola, rapido, auto, cab, petrol, fuel, diesel, parking, irctc, railway, metro, bus
 *   ATM       — atm, cash withdrawal, cash advance
 *   Transfer  — neft, rtgs, imps, upi, transfer, fund transfer, self transfer
 *   Investment— mutual fund, sip, zerodha, groww, upstox, demat, stock, ipo, nps, ppf, fd, fixed deposit
 *   Health    — hospital, pharmacy, medicine, doctor, clinic, lab, diagnostic, health
 *   Other     — everything else
 */

const CATEGORY_RULES = [
  {
    category: "Salary",
    keywords: ["salary", "payroll", "stipend", "pay credit", "income tax refund", "ctc"],
  },
  {
    category: "Food",
    keywords: ["zomato", "swiggy", "food", "restaurant", "cafe", "hotel", "dominos", "domino", "mcdonald", "kfc", "starbucks", "pizza", "burger", "dining", "barbeque", "bbq"],
  },
  {
    category: "Rent",
    keywords: ["rent", "rental", "housing", "landlord", "house", "flat", "pg", "paying guest", "accommodation"],
  },
  {
    category: "Utility",
    keywords: ["electricity", "bescom", "tsspdcl", "msedcl", "wbsedcl", "water", "gas", "broadband", "internet", "wifi", "recharge", "dth", "tata sky", "dish tv", "airtel", "jio", "vodafone", "vi ", "bsnl", "mobile bill", "postpaid"],
  },
  {
    category: "Shopping",
    keywords: ["amazon", "flipkart", "myntra", "nykaa", "meesho", "ajio", "snapdeal", "shopping", "mall", "store", "market", "retail", "bigbasket", "grofer", "blinkit", "zepto", "instamart"],
  },
  {
    category: "Transport",
    keywords: ["uber", "ola", "rapido", "auto", "cab", "taxi", "petrol", "fuel", "diesel", "hp ", "indian oil", "bharat petroleum", "parking", "irctc", "railway", "metro", "bus", "flight", "airline", "makemytrip", "goibibo", "cleartrip"],
  },
  {
    category: "ATM",
    keywords: ["atm", "cash withdrawal", "cash advance", "atw"],
  },
  {
    category: "Investment",
    keywords: ["mutual fund", "sip", "zerodha", "groww", "upstox", "demat", "stock", "ipo", "nps", "ppf", "fd ", "fixed deposit", "lumpsum", "equity", "smallcase"],
  },
  {
    category: "Health",
    keywords: ["hospital", "pharmacy", "medicine", "doctor", "clinic", "lab", "diagnostic", "health", "apollo", "fortis", "max hospital", "medplus", "netmeds", "practo"],
  },
  {
    category: "Transfer",
    keywords: ["neft", "rtgs", "imps", "upi", "transfer", "fund transfer", "self transfer", "trf", "p2p"],
  },
];

/**
 * Categorizes a transaction based on its description
 *
 * @param {string} description
 * @return {string} category name
 */
function categorize(description) {
  if (!description) return "Other";

  const lower = description.toLowerCase();

  for (const rule of CATEGORY_RULES) {
    if (rule.keywords.some((kw) => lower.includes(kw))) {
      return rule.category;
    }
  }

  return "Other";
}

/**
 * Adds a 'category' field to every transaction in the array
 *
 * @param {object[]} transactions
 * @return {object[]} transactions with category field added
 */
function categorizeAll(transactions) {
  return transactions.map((t) => ({
    ...t,
    category: categorize(t.description),
  }));
}

module.exports = {categorize, categorizeAll};
