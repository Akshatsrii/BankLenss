/**
 * SBI statement fixture
 *
 * Simulates the row output of groupItemsIntoRows() for a real SBI statement.
 * Each array is one row from the PDF table.
 */

// Rows that represent the header + data of an SBI statement
export const SBI_ROWS = [
  // Page header (should be skipped)
  ["State Bank of India", "Account Statement"],
  ["Account No:", "XXXX12345678", "Period:", "01/01/2024", "to", "31/01/2024"],

  // Column header row (parser detects this)
  ["Date", "Description", "Ref No", "Debit", "Credit", "Balance"],

  // Transaction rows
  ["01/01/2024", "Opening Balance",                      "",        "",          "",        "50000.00 Cr"],
  ["05/01/2024", "UPI-ZOMATO-Food delivery",             "123456",  "450.00",    "",        "49550.00 Cr"],
  ["08/01/2024", "NEFT-SALARY-Employer",                 "789012",  "",          "85000.00","134550.00 Cr"],
  ["10/01/2024", "ATM-WITHDRAWAL-SBI Branch",            "345678",  "10000.00",  "",        "124550.00 Cr"],
  ["15/01/2024", "UPI-AMAZON-Online shopping",           "901234",  "2999.00",   "",        "121551.00 Cr"],
  ["18/01/2024", "NEFT-FREELANCE-Client payment",        "567890",  "",          "25000.00","146551.00 Cr"],
  ["20/01/2024", "ECS-INSURANCE-Premium",                "234567",  "5000.00",   "",        "141551.00 Cr"],
  ["22/01/2024", "UPI-SWIGGY-Dinner order",              "890123",  "350.00",    "",        "141201.00 Cr"],
  ["25/01/2024", "IMPS-RENT-Monthly rent",               "456789",  "20000.00",  "",        "121201.00 Cr"],
  ["28/01/2024", "UPI-NETFLIX-Subscription",             "012345",  "649.00",    "",        "120552.00 Cr"],
  ["31/01/2024", "Closing Balance",                      "",        "",          "",        "120552.00 Cr"],

  // Summary row (should be skipped)
  ["Total",      "",                                     "",        "39448.00",  "110000.00",""],
];

// Expected parsed output for the above rows
export const SBI_EXPECTED = [
  { date: "2024-01-05", description: "UPI-ZOMATO-Food delivery",   debit: 450,   credit: 0,     type: "debit"  },
  { date: "2024-01-08", description: "NEFT-SALARY-Employer",        debit: 0,     credit: 85000, type: "credit" },
  { date: "2024-01-10", description: "ATM-WITHDRAWAL-SBI Branch",   debit: 10000, credit: 0,     type: "debit"  },
  { date: "2024-01-15", description: "UPI-AMAZON-Online shopping",  debit: 2999,  credit: 0,     type: "debit"  },
  { date: "2024-01-18", description: "NEFT-FREELANCE-Client payment",debit: 0,    credit: 25000, type: "credit" },
  { date: "2024-01-20", description: "ECS-INSURANCE-Premium",        debit: 5000,  credit: 0,     type: "debit"  },
  { date: "2024-01-22", description: "UPI-SWIGGY-Dinner order",     debit: 350,   credit: 0,     type: "debit"  },
  { date: "2024-01-25", description: "IMPS-RENT-Monthly rent",      debit: 20000, credit: 0,     type: "debit"  },
  { date: "2024-01-28", description: "UPI-NETFLIX-Subscription",    debit: 649,   credit: 0,     type: "debit"  },
];