/**
 * useAuth.js
 *
 * Wraps Firebase Auth state.
 * Returns { user, loading } — components wait for loading
 * before deciding to redirect.
 */

import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

export function useAuth() {
  const [user, setUser]       = useState(undefined); // undefined = not yet known
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return { user, loading };
}