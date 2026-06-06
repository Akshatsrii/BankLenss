<!-- HEADER -->
<div align="center">

```
██████╗  █████╗ ███╗   ██╗██╗  ██╗    ██████╗ ██╗ ██████╗ ██╗████████╗██╗███████╗███████╗██████╗
██╔══██╗██╔══██╗████╗  ██║██║ ██╔╝    ██╔══██╗██║██╔════╝ ██║╚══██╔══╝██║╚════██╗██╔════╝██╔══██╗
██████╔╝███████║██╔██╗ ██║█████╔╝     ██║  ██║██║██║  ███╗██║   ██║   ██║    ██╔╝█████╗  ██████╔╝
██╔══██╗██╔══██║██║╚██╗██║██╔═██╗     ██║  ██║██║██║   ██║██║   ██║   ██║   ██╔╝ ██╔══╝  ██╔══██╗
██████╔╝██║  ██║██║ ╚████║██║  ██╗    ██████╔╝██║╚██████╔╝██║   ██║   ██║   ██║  ███████╗██║  ██║
╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝   ╚═════╝ ╚═╝ ╚═════╝ ╚═╝   ╚═╝   ╚═╝   ╚═╝  ╚══════╝╚═╝  ╚═╝
```

### *Turn encrypted bank PDFs into structured, searchable data — automatically.*

<br/>

[![Firebase](https://img.shields.io/badge/Firebase-Functions_%26_Firestore-FF6F00?style=for-the-badge&logo=firebase&logoColor=white)](https://firebase.google.com)
[![React](https://img.shields.io/badge/React_18-Vite_%2B_Tailwind_v3-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-18_LTS-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![Status](https://img.shields.io/badge/Status-Active_Development-22C55E?style=for-the-badge)](#roadmap)
[![License](https://img.shields.io/badge/License-Private-64748B?style=for-the-badge)](#)

<br/>

> **Supports SBI · HDFC · ICICI · Axis Bank**
> Upload a password-protected PDF → get clean JSON transactions in seconds.

</div>

---

## 📖 What Is This?

Most Indian banks deliver your account statement as a **password-protected PDF** — a format that's impossible to query, filter, or import into budgeting tools. This project solves that completely.

**Bank Statement Digitizer** is a full-stack web application that:

1. Accepts a password-protected bank PDF from the user
2. Unlocks it server-side using the user's password (never stored)
3. Extracts all transaction rows using a layout-aware PDF parser
4. Normalizes dates, amounts, and descriptions across bank formats
5. Stores clean, structured data in Firestore — scoped to the authenticated user
6. Presents a filterable, exportable transaction table in the browser

No third-party OCR services. No external APIs. The entire pipeline runs inside your Firebase project.

---

## ✨ Feature Overview

|
 Feature 
|
 Detail 
|
|
---
|
---
|
|
 🔐 
**
Password-protected PDF support
**
|
 pdfjs-dist unlocks encrypted PDFs in-memory inside Cloud Functions — the password is never logged or stored 
|
|
 🏦 
**
Multi-bank parsing
**
|
 Dedicated parsers for SBI, HDFC, ICICI, and Axis — each bank has its own column layout and date format 
|
|
 🧠 
**
Auto bank detection
**
|
 Reads the full PDF text and fingerprints which bank issued the statement before dispatching to the correct parser 
|
|
 📊 
**
Structured transactions
**
|
 Every row normalised to 
`{ date, description, debit, credit, balance, type }`
 — consistent across all banks 
|
|
 🔒 
**
Per-user data isolation
**
|
 Firestore security rules ensure users can only read their own statements and transactions 
|
|
 ☁️ 
**
Serverless architecture
**
|
 Zero servers to manage — Firebase Functions scales to zero when idle 
|
|
 📤 
**
Excel / CSV export
**
|
 Download your transactions as 
`.xlsx`
 using SheetJS (Day 5) 
|

---

## 🗺️ Full System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                   CLIENT BROWSER                                    │
│                                                                                     │
│   ┌──────────────┐          ┌──────────────────────────────┐                       │
│   │   /upload    │          │       /transactions           │                       │
│   │              │          │                               │                       │
│   │ ┌──────────┐ │          │  ┌─────────────────────────┐ │                       │
│   │ │ PDF Drop │ │          │  │  Filter Bar             │ │                       │
│   │ │   Zone   │ │          │  │  (date / bank / type)   │ │                       │
│   │ └────┬─────┘ │          │  └─────────────────────────┘ │                       │
│   │      │       │          │  ┌─────────────────────────┐ │                       │
│   │ ┌────▼─────┐ │          │  │  Transaction Table      │ │                       │
│   │ │ Password │ │          │  │  (paginated, sortable)  │ │                       │
│   │ │  Input   │ │          │  └─────────────────────────┘ │                       │
│   │ └────┬─────┘ │          │  ┌─────────────────────────┐ │                       │
│   │      │       │          │  │  Export Button (xlsx)   │ │                       │
│   │ ┌────▼─────┐ │          │  └─────────────────────────┘ │                       │
│   │ │  Upload  │ │          └──────────────────────────────┘                       │
│   │ │  Button  │ │                                                                  │
│   │ └────┬─────┘ │                                                                  │
│   └──────┼───────┘                                                                  │
│          │                                                                          │
│          │  Firebase SDK (httpsCallable)                                            │
└──────────┼──────────────────────────────────────────────────────────────────────────┘
           │
           │  HTTPS (TLS encrypted)
           ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              FIREBASE CLOUD FUNCTIONS                               │
│                                                                                     │
│   ┌─────────────────────────────────────────────────────────────────────────────┐  │
│   │                         processStatement()  [onCall]                        │  │
│   │                                                                             │  │
│   │  1. Verify Firebase Auth token ──────────────────────────────────────────┐  │  │
│   │                                                                          │  │  │
│   │  2. Download PDF bytes from Firebase Storage                             │  │  │
│   │         gs://bucket/statements/{uid}/{filename}                          │  │  │
│   │                                                                          │  │  │
│   │  3. Call parseStatement(buffer, password)                                │  │  │
│   │         │                                                                │  │  │
│   │         ├── pdfjs-dist: unlock PDF with password                         │  │  │
│   │         │       └─► PasswordException → throw WRONG_PASSWORD             │  │  │
│   │         │                                                                │  │  │
│   │         ├── Extract text per page (flat string + row arrays)             │  │  │
│   │         │                                                                │  │  │
│   │         ├── detectBank(fullText)                                         │  │  │
│   │         │       ├── SBI?   → sbi.detect()   → sbi.parse()               │  │  │
│   │         │       ├── HDFC?  → hdfc.detect()  → hdfc.parse()              │  │  │
│   │         │       ├── ICICI? → icici.detect() → icici.parse()             │  │  │
│   │         │       └── none   → throw UNSUPPORTED_BANK                     │  │  │
│   │         │                                                                │  │  │
│   │         └── Return { bank, transactions[] }                              │  │  │
│   │                                                                          │  │  │
│   │  4. Deduplicate transactions (hash: uid+date+desc+amount)                │  │  │
│   │                                                                          │  │  │
│   │  5. Batch-write to Firestore ────────────────────────────────────────────┘  │  │
│   │         /statements/{statementId}  ← status: done                          │  │
│   │         /transactions/{hash}       ← one doc per row                       │  │
│   └─────────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────────┘
           │                                    │
           │                                    │
           ▼                                    ▼
┌──────────────────┐               ┌────────────────────────┐
│  Firebase Storage │               │  Cloud Firestore        │
│                  │               │                         │
│  statements/     │               │  /users/{uid}           │
│    {uid}/        │               │  /statements/{id}       │
│      file.pdf    │               │  /transactions/{hash}   │
│                  │               │                         │
│  (raw PDFs only) │               │  (structured data only) │
└──────────────────┘               └────────────────────────┘
```

---

## 🔄 End-to-End Upload Flow

```
User selects PDF + enters password
            │
            ▼
┌─────────────────────┐
│  Client: upload PDF  │──────────────────────────────────────────►  Firebase Storage
│  to Storage first   │                                              gs://bucket/statements/{uid}/{timestamp}_filename.pdf
└──────────┬──────────┘
           │  Get storage path
           ▼
┌─────────────────────────┐
│  Client: call           │
│  processStatement({     │
│    storagePath,         │
│    password,            │
│    statementId          │
│  })                     │
└──────────┬──────────────┘
           │  Firebase SDK → HTTPS → Cloud Function
           ▼
┌────────────────────────────────────────────────────────────────────────┐
│  Function: processStatement                                            │
│                                                                        │
│  ① Auth check — reject if no valid token                              │
│  ② Firestore: set statements/{id}.status = "processing"               │
│  ③ Storage: download PDF bytes                                         │
│  ④ parseStatement(bytes, password)                                     │
│       ├── Unlock PDF                                                   │
│       ├── Extract page rows                                            │
│       ├── Detect bank                                                  │
│       └── Parse transactions                                           │
│  ⑤ Deduplicate via SHA-256 hash                                       │
│  ⑥ Firestore batch write:                                             │
│       ├── transactions/{hash} × N rows                                │
│       └── statements/{id}.status = "done"                             │
│  ⑦ Return { bank, count }                                            │
└───────────────────────────────┬────────────────────────────────────────┘
                                │
                                ▼
                    Client receives { bank, count }
                    → Redirect to /transactions
                    → Firestore onSnapshot fires
                    → Table populates in real-time
```

---

## 🏦 Per-Bank Parser Details

### Why each bank needs its own parser

Every bank exports PDFs differently — different column orders, date formats, amount markers, and page layouts. A single regex won't cut it.

```
SBI Statement Layout
────────────────────────────────────────────────────────────────────
Date        │ Description          │ Ref No      │ Debit │ Credit │ Balance
────────────────────────────────────────────────────────────────────
03/01/2024  │ UPI-PAYMENT-123456   │ 000123      │ 500   │        │ 12,400.00
04/01/2024  │ SALARY CREDIT        │ 000456      │       │ 50,000 │ 62,400.00

Date format : DD/MM/YYYY
Amount marks: plain numbers, commas as thousand separators
Balance     : always present, right-most column


HDFC Statement Layout
────────────────────────────────────────────────────────────────────
Date        │ Narration            │ Chq/Ref No  │ Value Date │ Withdrawal │ Deposit │ Closing Balance
────────────────────────────────────────────────────────────────────
01-Jan-2024 │ NEFT-HDFC000123      │ 00000123    │ 01-Jan-24  │ 1,200.00   │         │ 45,300.00
03-Jan-2024 │ IMPS CREDIT          │ 00000456    │ 03-Jan-24  │            │ 5,000   │ 50,300.00

Date format : DD-MMM-YYYY (long) or DD/MM/YY (short)
Amount marks: Withdrawal = debit, Deposit = credit
Extra col   : Value Date (skipped by parser)


ICICI Statement Layout
────────────────────────────────────────────────────────────────────
S.No │ Transaction Date │ Value Date │ Description    │ Ref No │ Withdrawal │ Deposit │ Balance
────────────────────────────────────────────────────────────────────
1    │ 15-Jan-2024      │ 15-Jan-24  │ UPI/CR/...     │ 123456 │            │ 2,500   │ 38,500.00
2    │ 16-Jan-2024      │ 16-Jan-24  │ POS PURCHASE   │ 789012 │ 800        │         │ 37,700.00

Date format : DD-MMM-YYYY
Special     : First column is serial number (parser detects + skips it)
```

### Unified Transaction Shape

Every bank's raw rows get normalised to this:

```json
{
  "transactionId": "sha256(userId+date+description+amount)",
  "statementId":   "auto-generated Firestore doc ID",
  "userId":        "firebase-auth-uid",
  "date":          "2024-01-15",
  "description":   "UPI-PAYMENT-SWIGGY-123456",
  "debit":         450.00,
  "credit":        0,
  "balance":       38050.00,
  "type":          "debit",
  "createdAt":     "Firestore Timestamp"
}
```

---

## 🗄️ Firestore Data Model

```
firestore-root/
│
├── users/
│   └── {uid}/                          ← Document ID = Firebase Auth UID
│         uid:        string            ← Redundant copy for queries
│         email:      string
│         createdAt:  Timestamp
│
├── statements/
│   └── {statementId}/                  ← Auto-generated ID
│         statementId:  string          ← Same as doc ID (self-referential)
│         userId:       string          ← Owner UID (used in security rules)
│         bankName:     string          ← "SBI" | "HDFC" | "ICICI" | "AXIS"
│         fileName:     string          ← Original uploaded filename
│         storagePath:  string          ← Full GCS path to raw PDF
│         uploadedAt:   Timestamp
│         status:       string          ← "pending" | "processing" | "done" | "error"
│         errorMessage: string?         ← Set only on "error" status
│
└── transactions/
    └── {hash}/                         ← SHA-256 hash for deduplication
          transactionId:  string
          statementId:    string        ← Back-reference to parent statement
          userId:         string        ← For security rules + queries
          date:           string        ← ISO 8601: "YYYY-MM-DD"
          description:    string
          debit:          number        ← 0 if credit transaction
          credit:         number        ← 0 if debit transaction
          balance:        number        ← Running balance after transaction
          type:           string        ← "debit" | "credit"
          createdAt:      Timestamp
```

### Why hash-based deduplication?

If a user uploads the same statement twice, the `transactions` collection will not create duplicate rows. The document ID is derived from `SHA-256(userId + date + description + amount)` — identical transactions produce identical hashes and the write is silently idempotent.

---

## 🔒 Security Model

### Firestore Rules

```
Every user can ONLY:
  ✅ Read their own /users/{their-uid}
  ✅ Write to their own /users/{their-uid}
  ✅ Read /statements where statement.userId == their uid
  ✅ Create /statements where new doc.userId == their uid
  ✅ Read /transactions where transaction.userId == their uid
  ✅ Create /transactions where new doc.userId == their uid

  ❌ Read ANY other user's documents
  ❌ Write to another user's documents
  ❌ Read the full collection (no list without uid filter)
```

### Storage Rules

```
Firebase Storage path: /statements/{userId}/{filename}

  ✅ Authenticated user can read/write their own {userId} prefix only
  ❌ Cannot access any other user's storage bucket path
```

### Password Handling

```
PDF Password flow:
  Client → HTTPS → Cloud Function → pdfjs-dist in-memory unlock → discarded

  The password is:
  ❌ Never logged to Cloud Function logs
  ❌ Never stored in Firestore
  ❌ Never stored in Firebase Storage
  ❌ Never written to any persistent store

  It exists only in the Cloud Function's RAM for the duration of the call.
```

---

## 📁 Repository Structure

```
bank-statement-digitizer/
│
├── 📂 Admin/                          # React + Vite frontend
│   ├── 📂 src/
│   │   ├── 📂 components/
│   │   │   └── Navbar.jsx             # Top navigation bar with active-link highlighting
│   │   ├── 📂 pages/
│   │   │   ├── Upload.jsx             # PDF upload UI + Firebase connection test
│   │   │   └── Transactions.jsx       # Transaction table with filters + export
│   │   ├── 📂 routes/
│   │   │   └── AppRoutes.jsx          # react-router-dom v7 route declarations
│   │   ├── firebase.js                # Firebase SDK init → exports functions, db, storage
│   │   ├── App.jsx                    # Root: mounts Navbar + Routes
│   │   ├── main.jsx                   # Entry point: wraps in BrowserRouter
│   │   └── index.css                  # Tailwind v3 directives only
│   ├── tailwind.config.js             # Content paths for JIT purging
│   ├── postcss.config.js              # Tailwind + autoprefixer
│   ├── vite.config.js                 # Vite + @vitejs/plugin-react
│   └── package.json
│
├── 📂 functions/                      # Firebase Cloud Functions (Node.js 18)
│   ├── 📂 parsers/
│   │   ├── index.js                   # parseStatement() entry point + bank dispatcher
│   │   ├── sbi.js                     # SBI: DD/MM/YYYY, Debit/Credit columns
│   │   ├── hdfc.js                    # HDFC: DD-MMM-YYYY, Withdrawal/Deposit columns
│   │   └── icici.js                   # ICICI: DD-MMM-YYYY, S.No prefix detection
│   ├── index.js                       # onCall exports: helloWorld, processStatement
│   ├── testPdf.js                     # CLI: dump raw text from any PDF
│   ├── testParser.js                  # CLI: run full parser against a sample PDF
│   └── package.json
│
├── 📂 samples/                        # Password-protected test PDFs (not committed)
│   ├── .gitignore                     # *.pdf — keeps folder, ignores files
│   ├── SBI.pdf
│   ├── HDFC.pdf
│   ├── ICICI.pdf
│   └── AXIS.pdf
│
├── 📂 docs/
│   ├── samples.md                     # Bank name → filename → password reference table
│   └── firestore-schema.md            # Full schema documentation with field types
│
├── firestore.rules                    # Per-user data isolation rules
├── storage.rules                      # Per-user storage path rules
├── firebase.json                      # Firebase project config (functions, firestore, storage)
├── .firebaserc                        # Active Firebase project alias
├── .gitignore                         # node_modules, .env, *.pdf, service accounts
└── README.md                          # This file
```

---

## ⚙️ Tech Stack

|
 Layer 
|
 Technology 
|
 Why 
|
|
---
|
---
|
---
|
|
**
Frontend framework
**
|
 React 18 + Vite 
|
 Fast HMR, small bundle, JSX without CRA overhead 
|
|
**
Styling
**
|
 Tailwind CSS v3 
|
 Utility-first — no context switching to CSS files 
|
|
**
Routing
**
|
 react-router-dom v7 
|
 File-based-style routing with 
`<Navigate>`
 redirects 
|
|
**
Backend
**
|
 Firebase Cloud Functions v2 
|
 Serverless, auto-scales, co-located with Firestore 
|
|
**
Database
**
|
 Cloud Firestore 
|
 Real-time listeners, offline support, per-user rules 
|
|
**
File storage
**
|
 Firebase Storage 
|
 GCS-backed, signed URLs, per-user path isolation 
|
|
**
Auth
**
|
 Firebase Auth 
|
 Email/password + Google OAuth, JWT token verification 
|
|
**
PDF parsing
**
|
 pdfjs-dist (legacy build) 
|
 In-memory PDF unlock + layout-aware text extraction 
|
|
**
Excel export
**
|
 SheetJS (xlsx) 
|
 Client-side 
`.xlsx`
 generation, no server needed 
|
|
**
Deduplication
**
|
 SHA-256 hash (crypto) 
|
 Idempotent writes — re-uploading same statement is safe 
|

---

## 🚀 Local Development Setup

### Prerequisites

- Node.js 18+
- Firebase CLI (`npm install -g firebase-tools`)
- A Firebase project with Firestore, Functions, and Storage enabled

### 1 — Clone and install

```bash
git clone https://github.com/Akshatsrii/bank-statement-digitizer.git
cd bank-statement-digitizer

# Install function dependencies
cd functions && npm install && cd ..

# Install frontend dependencies
cd Admin && npm install && cd ..
```

### 2 — Configure Firebase

```bash
firebase login
firebase use --add   # select your project
```

Copy your web app config from **Firebase Console → Project Settings → Your Apps → Web** into `Admin/src/firebase.js`.

### 3 — Start the frontend

```bash
cd Admin
npm run dev
# → http://localhost:5173
```

### 4 — Deploy functions and rules

```bash
firebase deploy --only functions
firebase deploy --only firestore
firebase deploy --only storage
```

### 5 — Test the PDF parser locally (no Firebase needed)

```bash
cd functions

# Dump raw text from any PDF
node testPdf.js ../samples/SBI.pdf

# Run full parser (unlock → detect → parse → print table)
node testParser.js ../samples/SBI.pdf YOUR_PASSWORD
node testParser.js ../samples/HDFC.pdf YOUR_PASSWORD
node testParser.js ../samples/ICICI.pdf YOUR_PASSWORD
```

---

## 📅 Build Roadmap

|
 Day 
|
 Tasks 
|
 Status 
|
|
---
|
---
|
---
|
|
**
Day 1
**
|
 Repo setup · React + Vite + Tailwind · Firebase init · Firestore schema + rules · pdfjs-dist prototype 
|
 ✅ Done 
|
|
**
Day 2
**
|
 Multi-bank parser layer (SBI, HDFC, ICICI) · parseStatement() entry point · Bank auto-detection · UNSUPPORTED\_BANK error 
|
 ✅ Done 
|
|
**
Day 3
**
|
`processStatement`
 Cloud Function · Storage → decrypt → parse → Firestore write pipeline · Status tracking 
|
 🔄 In Progress 
|
|
**
Day 4
**
|
 Transaction table UI · Filters (date range, bank, type) · Real-time Firestore listener 
|
 ⏳ Planned 
|
|
**
Day 5
**
|
 Excel/CSV export · Firebase Auth (login/signup) · Route guards 
|
 ⏳ Planned 
|
|
**
Day 6
**
|
 Axis Bank parser · Edge case handling · Error UI (wrong password, unsupported bank) 
|
 ⏳ Planned 
|
|
**
Day 7
**
|
 Polish · Production deploy · README finalisation 
|
 ⏳ Planned 
|

---

## 🧪 Error Handling

The parser layer throws typed errors so the frontend and function can handle each case differently:

|
 Error Code 
|
 Cause 
|
 User-facing message 
|
|
---
|
---
|
---
|
|
`WRONG_PASSWORD`
|
 pdfjs 
`PasswordException`
|
 "Incorrect password. Please check your bank's statement password." 
|
|
`UNSUPPORTED_BANK`
|
 No parser matched the PDF text 
|
 "This bank format isn't supported yet. Supported: SBI, HDFC, ICICI, Axis." 
|
|
`CORRUPT_PDF`
|
 File is damaged or not a PDF 
|
 "Could not open this file. Please try downloading the statement again." 
|
|
`EMPTY_PDF`
|
 PDF has zero pages 
|
 "The uploaded file appears to be empty." 
|

---

## ⚠️ Important Notes

- **Sample PDFs are never committed.** The `samples/` folder contains a `*.pdf` gitignore. Test files stay local only.
- **Passwords are never persisted.** They travel over TLS, are used in-memory inside Cloud Functions, and are immediately discarded.
- **This is a private project.** The repo is private. Do not share Firebase config, service account keys, or sample statements.

---

<div align="center">

Built during a 7-day sprint · Firebase + React + pdfjs-dist

**[Akshat Srivastava](https://github.com/Akshatsrii)**

</div>
Done
