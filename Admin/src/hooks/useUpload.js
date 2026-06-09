/**
 * useUpload.js
 *
 * Encapsulates the entire upload flow:
 * 1. Validate file (type + size)
 * 2. Upload to Firebase Storage with progress
 * 3. Call processStatement Cloud Function
 * 4. Return result / error
 *
 * Keeps Upload.jsx clean — no business logic there.
 */

import { useState, useCallback } from "react";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { httpsCallable } from "firebase/functions";
import { getAuth } from "firebase/auth";
import { storage, functions } from "../firebase";

const MAX_FILE_SIZE_MB = 20;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

// Friendly messages for each error code from the backend
const ERROR_MESSAGES = {
  WRONG_PASSWORD:   "Incorrect password. Please check and try again.",
  CORRUPT_PDF:      "This file appears to be corrupted or is not a valid PDF.",
  UNSUPPORTED_BANK: "This bank format is not supported yet. Supported: SBI, HDFC, ICICI, Axis.",
  PARSE_FAILED:     "Could not extract transactions from this statement. Please try again.",
  unauthenticated:  "You must be logged in to upload statements.",
  "invalid-argument": null, // use backend message directly
  internal:         "Something went wrong on our end. Please try again.",
};

export function useUpload() {
  const [phase, setPhase]                   = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError]                   = useState(null);
  const [result, setResult]                 = useState(null);

  const reset = useCallback(() => {
    setPhase(null);
    setUploadProgress(0);
    setError(null);
    setResult(null);
  }, []);

  /**
   * Validates the selected file
   * Returns error string or null if valid
   */
  const validateFile = useCallback((file) => {
    if (!file) return "Please select a file.";

    if (file.type !== "application/pdf") {
      return "Only PDF files are accepted.";
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return `File size must be under ${MAX_FILE_SIZE_MB}MB. ` +
             `Your file is ${(file.size / 1024 / 1024).toFixed(1)}MB.`;
    }

    return null;
  }, []);

  /**
   * Main upload handler
   * @param {File}   file
   * @param {string} password
   */
  const upload = useCallback(async (file, password) => {
    setError(null);
    setResult(null);

    // Validate
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    // Get current user (for storage path)
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      setError("You must be logged in to upload statements.");
      return;
    }

    const uploadId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const storagePath = `statements/${user.uid}/${uploadId}.pdf`;

    // ── Step 1: Upload to Firebase Storage ──────────────────
    setPhase("uploading");
    setUploadProgress(0);

    try {
      await new Promise((resolve, reject) => {
        const storageRef = ref(storage, storagePath);
        const uploadTask = uploadBytesResumable(storageRef, file, {
          contentType: "application/pdf",
        });

        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const pct = Math.round(
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            );
            setUploadProgress(pct);
          },
          (err) => {
            console.error("[useUpload] Storage upload error:", err);
            reject(err);
          },
          () => resolve()
        );
      });
    } catch (err) {
      setPhase(null);
      setError("Upload failed. Please check your connection and try again.");
      return;
    }

    // ── Step 2: Call processStatement Cloud Function ─────────
    setPhase("processing");

    try {
      const processStatement = httpsCallable(functions, "processStatement");

      const response = await processStatement({
        storagePath,
        password: password || "",
        fileName: file.name,
      });

      const { bank, transactionCount, statementId } = response.data;

      setPhase("done");
      setResult({ bank, transactionCount, statementId });

    } catch (err) {
      setPhase(null);
      console.error("[useUpload] processStatement error:", err);

      // Firebase callable errors have err.code and err.message
      const code = err?.details?.code || err?.code || "internal";
      const friendly = ERROR_MESSAGES[code];

      // null means use backend message directly
      setError(
        friendly === null
          ? err.message
          : friendly || ERROR_MESSAGES.internal
      );
    }
  }, [validateFile]);

  const isLoading = phase === "uploading" || phase === "processing";

  return {
    upload,
    reset,
    phase,
    uploadProgress,
    error,
    result,
    isLoading,
  };
}