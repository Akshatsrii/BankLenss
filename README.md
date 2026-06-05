# Bank Statement Digitizer

A web application that takes a password-protected PDF bank statement,
unlocks it, extracts transactions, and displays them with filters and export.

## Tech Stack
- React 18 + Vite + Tailwind CSS v3
- Firebase Functions + Firestore + Storage
- pdfjs-dist (PDF parsing)
- xlsx / SheetJS (Excel export)

## Setup

### 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/bank-statement-digitizer.git
cd bank-statement-digitizer

### 2. Frontend
cd Admin
npm install
npm run dev

### 3. Firebase
cd ..
npm install -g firebase-tools
firebase login
firebase use --add
firebase emulators:start

### 4. Add Firebase config
Copy your config from Firebase Console into Admin/src/firebase.js

## Project Structure
- /Admin       → React frontend
- /functions   → Firebase Cloud Functions
- /samples     → Test PDFs (not committed)
- /docs        → Documentation