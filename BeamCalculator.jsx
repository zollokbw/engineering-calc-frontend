
import React, { useState, useEffect } from "react";

function LandingPage({ onStart }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-gray-900 dark:to-gray-800 text-center p-6">
      <h1 className="text-5xl font-bold mb-6">Engineering Calculator</h1>
      <p className="text-lg mb-8 max-w-xl">Quickly analyze beam structures with moments, shear, stress, and deflection. Generate reports and visualize calculations in one click.</p>
      <button onClick={onStart} className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-3 rounded-xl shadow-lg">Start Calculating</button>
    </div>
  );
}

export default function BeamCalculator() {
  const [length, setLength] = useState(5);
  const [load, setLoad] = useState(10);
  const [supportType, setSupportType] = useState("simply_supported");
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const apiBase = "https://engineering-calc-backend.onrender.com"; // updated backend URL

  const calculate = async () => {
    try {
      const response = await fetch(`${apiBase}/beam/calculate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ length, load, support_type: supportType })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail);

      setResults(data);
      setError("");
    } catch (err) {
      setError(err.message);
      setResults(null);
    }
  };

  const downloadReport = async () => {
    try {
      const response = await fetch(`${apiBase}/beam/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ length, load, support_type: supportType })
      });

      if (!response.ok) throw new Error("Failed to download report.");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "beam_report.pdf";
      link.click();
    } catch (err) {
      setError(err.message);
    }
  };

  if (!started) return <LandingPage onStart={() => setStarted(true)} />;

  return (
    <div className="min-h-screen p-6 max-w-2xl mx-auto bg-white dark:bg-gray-900 text-black dark:text-white shadow-xl rounded-2xl mt-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-center w-full">Beam Calculator</h1>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="absolute top-4 right-4 px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded"
        >
          {darkMode ? "Light" : "Dark"} Mode
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block font-medium mb-1">Length (m):</label>
          <input type="number" value={length} onChange={(e) => setLength(parseFloat(e.target.value))} className="p-3 border rounded w-full bg-white dark:bg-gray-800" />
        </div>

        <div>
          <label className="block font-medium mb-1">Load (N/m):</label>
          <input type="number" value={load} onChange={(e) => setLoad(parseFloat(e.target.value))} className="p-3 border rounded w-full bg-white dark:bg-gray-800" />
        </div>

        <div>
          <label className="block font-medium mb-1">Support Type:</label>
          <select value={supportType} onChange={(e) => setSupportType(e.target.value)} className="p-3 border rounded w-full bg-white dark:bg-gray-800">
            <option value="simply_supported">Simply Supported</option>
            <option value="cantilever">Cantilever</option>
          </select>
        </div>

        <div className="flex gap-4 justify-center pt-4">
          <button onClick={calculate} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl shadow">Calculate</button>
          <button onClick={downloadReport} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-xl shadow">Download Report</button>
        </div>

        {error && <p className="text-red-600 mt-4 text-center">{error}</p>}

        {results && (
          <div className="mt-6 bg-gray-50 dark:bg-gray-800 p-6 rounded-xl border dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-center">Results</h2>
            <div className="space-y-2">
              <p><strong>Reactions:</strong> {JSON.stringify(results.reactions)}</p>
              <p><strong>Max Moment:</strong> {results.max_moment.toFixed(2)} Nm</p>
              <p><strong>Stress:</strong> {results.stress.toFixed(2)} Pa</p>
              <p><strong>Deflection:</strong> {results.deflection.toFixed(6)} m</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
