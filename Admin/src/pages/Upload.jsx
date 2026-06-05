import { useState } from "react";
import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase";

export default function Upload() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const callHelloWorld = async () => {
    setLoading(true);
    try {
      const helloWorld = httpsCallable(functions, "helloWorld");
      const response = await helloWorld();
      setResult(response.data);
      console.log("Firebase response:", response.data);
    } catch (err) {
      console.error("Error:", err);
      setResult({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-slate-800 mb-2">
        Upload Statement
      </h1>
      <p className="text-slate-500 mb-6">
        Upload your bank PDF here. (UI coming Day 2)
      </p>

      <button
        onClick={callHelloWorld}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg disabled:opacity-50"
      >
        {loading ? "Calling..." : "Test Firebase Connection"}
      </button>

      {result && (
        <pre className="mt-4 bg-slate-100 p-4 rounded-lg text-sm text-green-700">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}