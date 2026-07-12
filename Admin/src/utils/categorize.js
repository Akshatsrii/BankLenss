/**
 * categorize.js
 *
 * Keyword-based auto-categorization for transaction descriptions.
 */

const CATEGORY_RULES = [
  {
    category: "Salary",
    keywords: ["salary", "payroll", "stipend", "pay credit", "income tax refund", "ctc"],
  },
  {
    category: "Food",
    keywords: [
      "zomato",
      "swiggy",
      "food",
      "restaurant",
      "cafe",
      "hotel",
      "dominos",
      "domino",
      "mcdonald",
      "kfc",
      "starbucks",
      "pizza",
      "burger",
      "dining",
      "barbeque",
      "bbq",
    ],
  },
  {
    category: "Rent",
    keywords: [
      "rent",
      "rental",
      "housing",
      "landlord",
      "house",
      "flat",
      "pg",
      "paying guest",
      "accommodation",
    ],
  },
  {
    category: "Utility",
    keywords: [
      "electricity",
      "bescom",
      "tsspdcl",
      "msedcl",
      "wbsedcl",
      "water",
      "gas",
      "broadband",
      "internet",
      "wifi",
      "recharge",
      "dth",
      "tata sky",
      "dish tv",
      "airtel",
      "jio",
      "vodafone",
      "vi ",
      "bsnl",
      "mobile bill",
      "postpaid",
    ],
  },
  {
    category: "Shopping",
    keywords: [
      "amazon",
      "flipkart",
      "myntra",
      "nykaa",
      "meesho",
      "ajio",
      "snapdeal",
      "shopping",
      "mall",
      "store",
      "market",
      "retail",
      "bigbasket",
      "grofer",
      "blinkit",
      "zepto",
      "instamart",
    ],
  },
  {
    category: "Transport",
    keywords: [
      "uber",
      "ola",
      "rapido",
      "auto",
      "cab",
      "taxi",
      "petrol",
      "fuel",
      "diesel",
      "hp ",
      "indian oil",
      "bharat petroleum",
      "parking",
      "irctc",
      "railway",
      "metro",
      "bus",
      "flight",
      "airline",
      "makemytrip",
      "goibibo",
      "cleartrip",
    ],
  },
  {
    category: "ATM",
    keywords: ["atm", "cash withdrawal", "cash advance", "atw"],
  },
  {
    category: "Investment",
    keywords: [
      "mutual fund",
      "sip",
      "zerodha",
      "groww",
      "upstox",
      "demat",
      "stock",
      "ipo",
      "nps",
      "ppf",
      "fd ",
      "fixed deposit",
      "lumpsum",
      "equity",
      "smallcase",
    ],
  },
  {
    category: "Health",
    keywords: [
      "hospital",
      "pharmacy",
      "medicine",
      "doctor",
      "clinic",
      "lab",
      "diagnostic",
      "health",
      "apollo",
      "fortis",
      "max hospital",
      "medplus",
      "netmeds",
      "practo",
    ],
  },
  {
    category: "Transfer",
    keywords: [
      "neft",
      "rtgs",
      "imps",
      "upi",
      "transfer",
      "fund transfer",
      "self transfer",
      "trf",
      "p2p",
    ],
  },
];

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

function categorizeAll(transactions) {
  return transactions.map((t) => ({
    ...t,
    category: categorize(t.description),
  }));
}

export { categorize, categorizeAll };
