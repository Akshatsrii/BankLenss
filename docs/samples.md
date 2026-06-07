# Transaction Schema

## Shape

Every parsed transaction has this exact shape:

| Field       | Type   | Description                              | Example              |
|-------------|--------|------------------------------------------|----------------------|
| date        | string | ISO 8601 date (YYYY-MM-DD)               | "2024-01-15"         |
| description | string | Transaction narration / description      | "UPI-ZOMATO-payment" |
| debit       | number | Amount debited (0 if credit transaction) | 450.00               |
| credit      | number | Amount credited (0 if debit transaction) | 0                    |
| balance     | number | Running balance after this transaction   | 12500.75             |
| type        | string | "debit" or "credit"                      | "debit"              |

## Rules

- `debit` and `credit` are never both non-zero in the same row
- `balance` is the closing balance after this transaction
- `date` is always normalized to YYYY-MM-DD regardless of the source format
- `description` is the raw narration string from the PDF — no transformation

## Firestore Document Shape

When stored in Firestore, two extra fields are added:

| Field         | Type      | Added by          |
|---------------|-----------|-------------------|
| transactionId | string    | hash(userId+date+description+amount) |
| statementId   | string    | parent statement doc ID |
| userId        | string    | Firebase Auth UID |
| createdAt     | timestamp | server timestamp  |

## Error Codes

| Code             | Meaning                              |
|------------------|--------------------------------------|
| WRONG_PASSWORD   | PDF password is incorrect            |
| CORRUPT_PDF      | File is not a valid PDF              |
| EMPTY_PDF        | PDF has 0 pages                      |
| UNSUPPORTED_BANK | Bank not in SBI / HDFC / ICICI list  |

## Bank Date Formats

| Bank  | Source Format   | Normalized To |
|-------|-----------------|---------------|
| SBI   | DD/MM/YYYY      | YYYY-MM-DD    |
| HDFC  | DD-MMM-YYYY     | YYYY-MM-DD    |
| HDFC  | DD/MM/YY        | YYYY-MM-DD    |
| ICICI | DD-MMM-YYYY     | YYYY-MM-DD    |
| ICICI | DD/MM/YYYY      | YYYY-MM-DD    |