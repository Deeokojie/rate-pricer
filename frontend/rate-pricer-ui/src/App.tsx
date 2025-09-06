import React, { useState } from "react";
import PricingCalculator from "./components/PricingCalculator";

export default function App() {
  const [tab, setTab] = useState<"calc" | "compare">("calc");

  return (
    <main style={{ maxWidth: 960, margin: "2rem auto", padding: 16 }}>
      <h1 style={{ fontSize: 32, marginBottom: 8 }}>Rate Pricer</h1>

      {/* Tab buttons */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button
          onClick={() => setTab("calc")}
          style={{
            padding: "8px 12px",
            borderRadius: 10,
            border: "1px solid #111",
            background: tab === "calc" ? "#111" : "#fff",
            color: tab === "calc" ? "#fff" : "#111",
            cursor: "pointer",
          }}
        >
          Calculator
        </button>
        <button
          onClick={() => setTab("compare")}
          style={{
            padding: "8px 12px",
            borderRadius: 10,
            border: "1px solid #111",
            background: tab === "compare" ? "#111" : "#fff",
            color: tab === "compare" ? "#fff" : "#111",
            cursor: "pointer",
          }}
        >
          Compare
        </button>
      </div>

      {/* Tabs */}
      {tab === "calc" ? (
        <PricingCalculator />
      ) : (
        <div>
          <h2 style={{ fontSize: 24, marginBottom: 12 }}>Compare Countries</h2>
          <ComparePage />
        </div>
      )}
    </main>
  );
}

/** 
 ComparePage Component
 **/
function ComparePage() {
  type Row = {
    country: string;
    currency: string;
    rate?: number;
    present_value?: number;
    error?: string;
  };


  const ALL = [
      "Australia",
  "China",
  "Czech Republic",
  "Denmark",
  "Mexico",
  "New Zealand",
  "Norway",
  "Poland",
  "Russia",
  "Sweden",
  "Switzerland",
  "Türkiye",
  "United Kingdom",
  "Japan",
  ] as const;
  type Country = (typeof ALL)[number];

  // Country → currency code (extend as needed)
  const COUNTRY_CURRENCY: Record<string, string> = {
      "United Kingdom": "GBP",
      Japan: "JPY",
      Australia: "AUD",
      Mexico: "MXN",
      China: "CNY",
      "Czech Republic": "CZK",
      Denmark: "DKK",
      "New Zealand": "NZD",
      Norway: "NOK",
      Poland: "PLN",
      Russia: "RUB",
      Sweden: "SEK",
      Switzerland: "CHF",
      Türkiye: "TRY"
  };

  const [countries, setCountries] = useState<string[]>([...ALL]);
  const [notional, setNotional] = useState<number>(1000);
  const [years, setYears] = useState<number>(5);
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const toggle = (c: string) => {
    setCountries((cur) =>
      cur.includes(c) ? cur.filter((x) => x !== c) : [...cur, c]
    );
  };

  const compare = async () => {
    setLoading(true);
    try {
      const promises = countries.map(async (c) => {
        const cur = COUNTRY_CURRENCY[c] || "USD";
        try {
          const res = await fetch(
            `/pricing/external?notional=${notional}&years=${years}&country=${encodeURIComponent(
              c
            )}`
          );
          const data = await res.json();
          if (!res.ok) throw new Error(data.detail || "API failed");
          return {
            country: c,
            currency: cur,
            rate: data.rate,
            present_value: data.present_value,
          } as Row;
        } catch (err: any) {
          return { country: c, currency: cur, error: err.message } as Row;
        }
      });

      const results = await Promise.all(promises);
      setRows(results);
    } finally {
      setLoading(false);
    }
  };

  // Formatter per currency for the PV column
  const formatMoney = (amount: number, currency: string) =>
    new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);

  return (
    <section>
      <div style={{ display: "grid", gap: 12, marginBottom: 12 }}>
        {/* Country selection */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {ALL.map((c) => (
            <label key={c} style={{ display: "inline-flex", gap: 6 }}>
              <input
                type="checkbox"
                checked={countries.includes(c)}
                onChange={() => toggle(c)}
              />
              {c}
            </label>
          ))}
        </div>

        {/* Inputs */}
        <div style={{ display: "flex", gap: 8 }}>
          <label>
            Notional
            <input
              type="number"
              value={notional}
              onChange={(e) => setNotional(Number(e.target.value))}
              style={{ marginLeft: 8 }}
            />
          </label>
          <label>
            Years
            <input
              type="number"
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              style={{ marginLeft: 8 }}
            />
          </label>
          <button onClick={compare} disabled={loading}>
            {loading ? "Comparing…" : "Compare"}
          </button>
        </div>
      </div>

      {/* Results table */}
      {rows.length > 0 && (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Country</th>
              <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Currency</th>
              <th style={{ textAlign: "right", borderBottom: "1px solid #ddd", padding: 8 }}>Rate (%)</th>
              <th style={{ textAlign: "right", borderBottom: "1px solid #ddd", padding: 8 }}>Present Value</th>
              <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.country}>
                <td style={{ padding: 8 }}>{r.country}</td>
                <td style={{ padding: 8 }}>{r.currency}</td>
                <td style={{ padding: 8, textAlign: "right" }}>
                  {typeof r.rate === "number" ? r.rate.toFixed(2) : "—"}
                </td>
                <td style={{ padding: 8, textAlign: "right" }}>
                  {typeof r.present_value === "number"
                    ? formatMoney(r.present_value, r.currency)
                    : "—"}
                </td>
<td style={{ padding: 8, color: r.error ? "#b00020" : "#0a7" }}>
{r.error ? r.error : "OK"}
</td>
</tr>
))}
</tbody>
</table>
)}
</section>
);
}
