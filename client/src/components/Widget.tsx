import { useState } from "react";

export default function Widget() {
  const [amount, setAmount] = useState("");
  const [coin, setCoin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentInfo, setPaymentInfo] = useState<null | {
    address: string;
    amount: string;
    qrcode_url?: string;
    checkout_url: string;
  }>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setPaymentInfo(null);

    try {
      const response = await fetch("http://localhost:3000/api/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, coin }),
      });

      const data = await response.json();

      if (response.ok) {
        setPaymentInfo(data);
      } else {
        setError(data.error || "Unknown error");
      }
    } catch (err) {
      setError("Network error");
    }

    setLoading(false);
  };

  return (
    <div className="max-w-sm mx-auto mt-20 p-4 bg-white rounded-md shadow-md">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="number"
          placeholder="Amount (USD)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="border p-2 rounded"
          required
        />
        <select
          value={coin}
          onChange={(e) => setCoin(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="BTC">Bitcoin (BTC)</option>
          <option value="ETH">Ethereum (ETH)</option>
          <option value="LTC">Litecoin (LTC)</option>
        </select>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          {loading ? "Processing..." : "Pay Now"}
        </button>
      </form>

      {error && <p className="text-red-500 text-sm mt-4">❌ {error}</p>}

      {paymentInfo && (
        <div className="mt-6 space-y-2">
          <p>
            <strong>Payment Address:</strong> {paymentInfo.address}
          </p>
          <p>
            <strong>Amount:</strong> {paymentInfo.amount} {coin}
          </p>
          {paymentInfo.qrcode_url && (
            <img
              src={paymentInfo.qrcode_url}
              alt="QR Code"
              className="w-32 h-32"
            />
          )}
          <a
            href={paymentInfo.checkout_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline block mt-2"
          >
            Go to Checkout →
          </a>
        </div>
      )}
    </div>
  );
}
