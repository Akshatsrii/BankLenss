export const HDFC_ROWS = [
  ["HDFC BANK", "Account Statement"],
  ["Account Number", "XXXX987654", "Branch", "Mumbai Main"],

  // Header row
  ["Date", "Narration", "Chq/Ref No", "Value Date", "Withdrawal Amt", "Deposit Amt", "Closing Balance"],

  // Transactions — DD-MMM-YYYY format
  ["01-Jan-2024", "Opening Balance",               "",       "01-Jan-2024", "",          "",         "75000.00"],
  ["03-Jan-2024", "UPI-SWIGGY-Food order",         "111111", "03-Jan-2024", "320.00",    "",         "74680.00"],
  ["07-Jan-2024", "NEFT-SALARY-TechCorp",          "222222", "07-Jan-2024", "",          "95000.00", "169680.00"],
  ["09-Jan-2024", "UPI-UBER-Cab booking",          "333333", "09-Jan-2024", "185.00",    "",         "169495.00"],
  ["12-Jan-2024", "ATM WDL-HDFC Branch",           "444444", "12-Jan-2024", "5000.00",   "",         "164495.00"],
  ["14-Jan-2024", "ECS-RENT-Housing",              "555555", "14-Jan-2024", "18000.00",  "",         "146495.00"],
  ["16-Jan-2024", "UPI-AMAZON-Shopping",           "666666", "16-Jan-2024", "1499.00",   "",         "144996.00"],
  ["20-Jan-2024", "IMPS-FREELANCE-Payment",        "777777", "20-Jan-2024", "",          "30000.00", "174996.00"],
  ["23-Jan-2024", "UPI-ELECTRICITY-BESCOM",        "888888", "23-Jan-2024", "1200.00",   "",         "173796.00"],
  ["26-Jan-2024", "UPI-ZOMATO-Lunch",              "999999", "26-Jan-2024", "280.00",    "",         "173516.00"],
  ["31-Jan-2024", "Closing Balance",               "",       "31-Jan-2024", "",          "",         "173516.00"],
];

export const HDFC_EXPECTED = [
  { date: "2024-01-03", description: "UPI-SWIGGY-Food order",    debit: 320,   credit: 0,     type: "debit"  },
  { date: "2024-01-07", description: "NEFT-SALARY-TechCorp",     debit: 0,     credit: 95000, type: "credit" },
  { date: "2024-01-09", description: "UPI-UBER-Cab booking",     debit: 185,   credit: 0,     type: "debit"  },
  { date: "2024-01-12", description: "ATM WDL-HDFC Branch",      debit: 5000,  credit: 0,     type: "debit"  },
  { date: "2024-01-14", description: "ECS-RENT-Housing",         debit: 18000, credit: 0,     type: "debit"  },
  { date: "2024-01-16", description: "UPI-AMAZON-Shopping",      debit: 1499,  credit: 0,     type: "debit"  },
  { date: "2024-01-20", description: "IMPS-FREELANCE-Payment",   debit: 0,     credit: 30000, type: "credit" },
  { date: "2024-01-23", description: "UPI-ELECTRICITY-BESCOM",   debit: 1200,  credit: 0,     type: "debit"  },
  { date: "2024-01-26", description: "UPI-ZOMATO-Lunch",         debit: 280,   credit: 0,     type: "debit"  },
];