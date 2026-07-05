export const AXIS_ROWS = [
  ["Axis Bank Limited", "Account Statement"],

  // Header
  ["Tran Date", "Chq No", "Particulars", "Debit", "Credit", "Balance"],

  // Transactions — DD-MM-YYYY
  ["01-01-2024", "", "Opening Balance", "", "", "45000.00"],
  ["02-01-2024", "CHQ001", "UPI-AMAZON-Shopping", "1299.00", "", "43701.00"],
  ["05-01-2024", "", "SALARY CREDIT-Startup Inc", "", "70000.00", "113701.00"],
  ["08-01-2024", "CHQ002", "ATM-AXIS-Cash", "6000.00", "", "107701.00"],
  ["11-01-2024", "", "UPI-ZOMATO-Lunch", "350.00", "", "107351.00"],
  ["15-01-2024", "CHQ003", "NEFT-RENT-Apartment", "12000.00", "", "95351.00"],
  ["17-01-2024", "", "UPI-AIRTEL-Bill", "499.00", "", "94852.00"],
  ["20-01-2024", "", "UPI-UBER-Ride", "220.00", "", "94632.00"],
  ["22-01-2024", "", "IMPS-FREELANCE-Gig work", "", "15000.00", "109632.00"],
  ["25-01-2024", "", "UPI-NETFLIX-Sub", "649.00", "", "108983.00"],
  ["31-01-2024", "", "Closing Balance", "", "", "108983.00"],
];

export const AXIS_EXPECTED = [
  { date: "2024-01-02", description: "UPI-AMAZON-Shopping", debit: 1299, credit: 0, type: "debit" },
  {
    date: "2024-01-05",
    description: "SALARY CREDIT-Startup Inc",
    debit: 0,
    credit: 70000,
    type: "credit",
  },
  { date: "2024-01-08", description: "ATM-AXIS-Cash", debit: 6000, credit: 0, type: "debit" },
  { date: "2024-01-11", description: "UPI-ZOMATO-Lunch", debit: 350, credit: 0, type: "debit" },
  {
    date: "2024-01-15",
    description: "NEFT-RENT-Apartment",
    debit: 12000,
    credit: 0,
    type: "debit",
  },
  { date: "2024-01-17", description: "UPI-AIRTEL-Bill", debit: 499, credit: 0, type: "debit" },
  { date: "2024-01-20", description: "UPI-UBER-Ride", debit: 220, credit: 0, type: "debit" },
  {
    date: "2024-01-22",
    description: "IMPS-FREELANCE-Gig work",
    debit: 0,
    credit: 15000,
    type: "credit",
  },
  { date: "2024-01-25", description: "UPI-NETFLIX-Sub", debit: 649, credit: 0, type: "debit" },
];
