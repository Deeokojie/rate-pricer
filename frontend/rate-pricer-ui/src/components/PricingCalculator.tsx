import React, {useMemo, useState} from "react";

export const COUNTRIES = [
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
  "Japan"
] as const;
export type Country = (typeof COUNTRIES)[number];


const CURRENCY_BY_COUNTRY: Record<Country, string> = {
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

interface PriceResponse {
  notional: number;
  rate: number;
  years: number;
  present_value: number;
  detail?: string;
}


const PricingCalculator: React.FC = () => {
  const [country, setCountry] = useState<Country>("United Kingdom");
  const [notional, setNotional] = useState<number>(1000);
  const [years, setYears] = useState<number>(5);
  const [result, setResult] = useState<PriceResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const numFmt = useMemo(
    () => new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }),
    []
  );
  const moneyFmt = useMemo(
    () =>
      new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: CURRENCY_BY_COUNTRY[country] || "USD",
        maximumFractionDigits: 2,
      }),
    [country]
  );

  const calculate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(
        `/pricing/external?notional=${encodeURIComponent(String(notional))}&years=${encodeURIComponent(String(years))}&country=${encodeURIComponent(
          country
        )}`
      );
      const data: PriceResponse = await res.json();
      if (!res.ok) throw new Error(data.detail || "API request failed");
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section style={{ marginTop: 16 }}>
      <h2 style={{ fontSize: 28, marginBottom: 16 }}>Pricing Calculator</h2>

      <div
        style={{
          display: "grid",
          gap: 12,
          gridTemplateColumns: "1fr 1fr 1fr auto",
          alignItems: "end",
          maxWidth: 960,
        }}
      >
        <label style={{ display: "grid", gap: 6 }}>
          <span>Country</span>
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value as Country)}
            style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
          >
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>Notional</span>
          <input
            type="number"
            min={1}
            value={notional}
            onChange={(e) => setNotional(Number(e.target.value))}
            style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>Years</span>
          <input
            type="number"
            min={1}
            value={years}
            onChange={(e) => setYears(Number(e.target.value))}
            style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
          />
        </label>

        <button
          onClick={calculate}
          disabled={loading}
          style={{
            padding: "10px 16px",
            borderRadius: 10,
            border: "1px solid #111",
            background: loading ? "#ddd" : "#111",
            color: loading ? "#333" : "#fff",
            cursor: loading ? "not-allowed" : "pointer",
            height: 44,
          }}
        >
          {loading ? "Calculating…" : "Calculate"}
        </button>
      </div>

      {error && (
        <div style={{ color: "#b00020", marginTop: 16 }}>Error: {error}</div>
      )}

      {result && !error && (
        <div
          style={{
            marginTop: 16,
            border: "1px solid #e5e7eb",
            borderRadius: 12,
            padding: 16,
            maxWidth: 520,
          }}
        >
          <div style={{ display: "grid", gap: 6 }}>
            <div>
              <strong>Country:</strong> {country}
            </div>
            <div>
              <strong>Rate:</strong> {numFmt.format(result.rate)}%
            </div>
            <div>
              <strong>Present Value:</strong> {moneyFmt.format(result.present_value)}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default PricingCalculator;
