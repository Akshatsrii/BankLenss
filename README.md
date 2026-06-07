<div align="center">

<img src="https://raw.githubusercontent.com/Akshatsrii/BankLens/main/OIP.jpg" alt="Bank Statement Digitizer" width="80"/>

# Bank Statement Digitizer

**Turn encrypted Indian bank PDFs into structured, searchable data — automatically.**

[![Firebase](https://img.shields.io/badge/Firebase-Functions_%26_Firestore-FF6F00?style=flat-square&logo=firebase&logoColor=white)](https://firebase.google.com)
[![React](https://img.shields.io/badge/React_18-Vite_%2B_Tailwind-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-18_LTS-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![Status](https://img.shields.io/badge/Status-Active_Development-22C55E?style=flat-square&logo=git&logoColor=white)](#roadmap)
[![License](https://img.shields.io/badge/License-Private-64748B?style=flat-square&logo=opensourceinitiative&logoColor=white)](#)

<br/>

<img src="https://raw.githubusercontent.com/Akshatsrii/BankLens/main/OIP.jpg" width="40" title="SBI" style="border-radius:8px"/>
&nbsp;&nbsp;
<img src="https://raw.githubusercontent.com/Akshatsrii/BankLens/main/OIP%20(1).jpg" width="40" title="HDFC" style="border-radius:8px"/>
&nbsp;&nbsp;
<img src="https://raw.githubusercontent.com/Akshatsrii/BankLens/main/OIP%20(2).jpg" width="40" title="ICICI" style="border-radius:8px"/>

**Supports SBI · HDFC · ICICI **

> Upload a password-protected PDF → get clean JSON transactions in seconds.

</div>

---

## 📖 What Is This?

Most Indian banks deliver your account statement as a **password-protected PDF** — a format that's impossible to query, filter, or import into budgeting tools.

**Bank Statement Digitizer** solves that completely:

1. 📤 Accepts a password-protected bank PDF
2. 🔓 Unlocks it server-side (password never stored)
3. 🧩 Extracts all transaction rows using a layout-aware PDF parser
4. 🔄 Normalizes dates, amounts, and descriptions across bank formats
5. 🗄️ Stores clean, structured data in Firestore — scoped to the authenticated user
6. 📊 Presents a filterable, exportable transaction table in the browser

> No third-party OCR. No external APIs. The entire pipeline runs inside your Firebase project.

---

## ✨ Features

| | Feature | Detail |
|---|---|---|
| 🔐 | **Password-protected PDF support** | pdfjs-dist unlocks encrypted PDFs in-memory — password is never logged or stored |
| 🏦 | **Multi-bank parsing** | Dedicated parsers for SBI, HDFC, ICICI, and Axis |
| 🧠 | **Auto bank detection** | Fingerprints PDF text to dispatch to the correct parser automatically |
| 📊 | **Structured transactions** | Every row normalised to `{ date, description, debit, credit, balance, type }` |
| 🔒 | **Per-user data isolation** | Firestore security rules — users only ever see their own data |
| ☁️ | **Serverless architecture** | Firebase Functions scales to zero when idle — zero servers to manage |
| 📤 | **Excel / CSV export** | Download transactions as `.xlsx` via SheetJS (Day 5) |

---

## 🗺️ Architecture

```
CLIENT BROWSER
├── /upload         →  PDF drop zone + password input
└── /transactions   →  Filter bar + paginated table + export

        │ Firebase SDK (httpsCallable)
        ▼

FIREBASE CLOUD FUNCTIONS  ─  processStatement()
  ① Auth check
  ② Download PDF bytes from Storage
  ③ pdfjs-dist: unlock with password (in-memory only)
  ④ detectBank() → dispatch to sbi / hdfc / icici parser
  ⑤ Deduplicate via SHA-256 hash
  ⑥ Batch-write to Firestore

        │                          │
        ▼                          ▼
Firebase Storage            Cloud Firestore
statements/{uid}/*.pdf      /statements/{id}
                            /transactions/{hash}
```

---

## 🏦 Supported Banks

<table>
<tr>
<td align="center" width="25%">
<img src="https://raw.githubusercontent.com/Akshatsrii/BankLens/main/OIP.jpg" width="60"/><br/>
<b>State Bank of India</b><br/>
<code>sbi.js</code><br/>
<sub>Date: DD/MM/YYYY<br/>Cols: Debit / Credit</sub>
</td>
<td align="center" width="25%">
<img src="https://raw.githubusercontent.com/Akshatsrii/BankLens/main/OIP%20(1).jpg" width="60"/><br/>
<b>HDFC Bank</b><br/>
<code>hdfc.js</code><br/>
<sub>Date: DD-MMM-YYYY<br/>Cols: Withdrawal / Deposit</sub>
</td>
<td align="center" width="25%">
<img src="https://raw.githubusercontent.com/Akshatsrii/BankLens/main/OIP%20(2).jpg" width="60"/><br/>
<b>ICICI Bank</b><br/>
<code>icici.js</code><br/>
<sub>Date: DD-MMM-YYYY<br/>S.No prefix detection</sub>
</td>
<td align="center" width="25%">
<img src="https://img.shields.io/badge/AXIS-Coming_Day_6-14532D?style=flat-square" width="80"/><br/><br/>
<b>Axis Bank</b><br/>
<code>axis.js</code><br/>
<sub>⏳ Coming Day 6</sub>
</td>
</tr>
</table>

---

## 📐 Unified Transaction Schema

Every bank's raw rows get normalised to this shape:

```json
{
  "transactionId": "sha256(userId + date + description + amount)",
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
├── users/{uid}
│     uid, email, createdAt
│
├── statements/{statementId}
│     userId, bankName, fileName, storagePath,
│     uploadedAt, status, errorMessage?
│
└── transactions/{hash}           ← SHA-256 for dedup
      transactionId, statementId, userId,
      date, description, debit, credit, balance, type, createdAt
```

> **Hash-based deduplication:** Re-uploading the same statement produces the same document IDs, making writes silently idempotent.

---

## 🔒 Security Model

### Firestore Rules

```
✅  Read / write own  /users/{uid}
✅  Read / create     /statements  where .userId == auth.uid
✅  Read / create     /transactions  where .userId == auth.uid

❌  Read another user's documents
❌  List collections without uid filter
```

### Password Handling

```
Client → HTTPS → Cloud Function → pdfjs-dist (RAM only) → discarded

❌ Never logged       ❌ Never stored in Firestore
❌ Never in Storage   ❌ Never written anywhere persistent
```

---

## ⚙️ Tech Stack

| Layer | Technology | Why |
|---|---|---|
| **Frontend** | React 18 + Vite | Fast HMR, small bundle, JSX without CRA overhead |
| **Styling** | Tailwind CSS v3 | Utility-first — no context switching to CSS files |
| **Routing** | react-router-dom v7 | `<Navigate>` redirects, clean route declarations |
| **Backend** | Firebase Cloud Functions v2 | Serverless, auto-scales, co-located with Firestore |
| **Database** | Cloud Firestore | Real-time listeners, offline support, per-user rules |
| **Storage** | Firebase Storage | GCS-backed, per-user path isolation |
| **Auth** | Firebase Auth | Email/password + Google OAuth, JWT verification |
| **PDF parsing** | pdfjs-dist (legacy) | In-memory PDF unlock + layout-aware text extraction |
| **Export** | SheetJS (xlsx) | Client-side `.xlsx` generation, no server needed |
| **Deduplication** | SHA-256 (crypto) | Idempotent writes — re-uploading same statement is safe |

---

## 🚀 Local Development

### Prerequisites

- Node.js 18+
- Firebase CLI — `npm install -g firebase-tools`
- A Firebase project with Firestore, Functions, and Storage enabled

### Setup

```bash
git clone https://github.com/Akshatsrii/bank-statement-digitizer.git
cd bank-statement-digitizer

# Install dependencies
cd functions && npm install && cd ..
cd Admin    && npm install && cd ..

# Connect Firebase
firebase login
firebase use --add
```

Copy your web app config from **Firebase Console → Project Settings → Your Apps → Web** into `Admin/src/firebase.js`.

### Run

```bash
# Start frontend
cd Admin && npm run dev
# → http://localhost:5173

# Deploy backend
firebase deploy --only functions,firestore,storage
```

### Test parsers locally (no Firebase needed)

```bash
cd functions

node testPdf.js    ../samples/SBI.pdf
node testParser.js ../samples/SBI.pdf   YOUR_PASSWORD
node testParser.js ../samples/HDFC.pdf  YOUR_PASSWORD
node testParser.js ../samples/ICICI.pdf YOUR_PASSWORD
```

---

## 📁 Project Structure

```
bank-statement-digitizer/
├── Admin/                    # React + Vite frontend
│   └── src/
│       ├── components/Navbar.jsx
│       ├── pages/Upload.jsx
│       ├── pages/Transactions.jsx
│       ├── routes/AppRoutes.jsx
│       └── firebase.js
│
├── functions/                # Firebase Cloud Functions
│   ├── parsers/
│   │   ├── index.js          # parseStatement() + bank dispatcher
│   │   ├── sbi.js
│   │   ├── hdfc.js
│   │   └── icici.js
│   ├── index.js              # onCall: helloWorld, processStatement
│   ├── testPdf.js
│   └── testParser.js
│
├── samples/                  # Test PDFs (gitignored — local only)
├── firestore.rules
├── storage.rules
└── firebase.json
```

---

## 🧪 Error Handling

| Error Code | Cause | User Message |
|---|---|---|
| `WRONG_PASSWORD` | pdfjs `PasswordException` | "Incorrect password. Please check your bank's statement password." |
| `UNSUPPORTED_BANK` | No parser matched | "This bank format isn't supported yet. Supported: SBI, HDFC, ICICI, Axis." |
| `CORRUPT_PDF` | File is damaged | "Could not open this file. Please try downloading the statement again." |
| `EMPTY_PDF` | PDF has zero pages | "The uploaded file appears to be empty." |

---

## 📅 Roadmap

| Day | Tasks | Status |
|---|---|---|
| **Day 1** | Repo setup · React + Vite + Tailwind · Firebase init · Firestore schema + rules · pdfjs-dist prototype | ✅ Done |
| **Day 2** | Multi-bank parser layer (SBI, HDFC, ICICI) · `parseStatement()` · Bank auto-detection | ✅ Done |
| **Day 3** | `processStatement` Cloud Function · Storage → decrypt → parse → Firestore pipeline | 🔄 In Progress |
| **Day 4** | Transaction table UI · Filters · Real-time Firestore listener | ⏳ Planned |
| **Day 5** | Excel/CSV export · Firebase Auth · Route guards | ⏳ Planned |
| **Day 6** | Axis Bank parser · Edge case handling · Error UI | ⏳ Planned |
| **Day 7** | Polish · Production deploy · README finalisation | ⏳ Planned |

---

## ⚠️ Important Notes

- **Sample PDFs are never committed.** The `samples/` folder has a `*.pdf` gitignore — test files stay local only.
- **Passwords are never persisted.** They travel over TLS, are used in-memory inside Cloud Functions, and are immediately discarded.
- **This is a private project.** Do not share Firebase config, service account keys, or sample statements.

---

<div align="center">

Built during a 7-day sprint &nbsp;·&nbsp; Firebase + React + pdfjs-dist

**[Akshat Srivastava](https://github.com/Akshatsrii)**

<img src="https://img.shields.io/badge/Made_with-❤️_in_India-FF9933?style=flat-square"/>

</div>
