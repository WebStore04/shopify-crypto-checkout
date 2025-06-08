import { useState } from "react";

interface WidgetProps {
  token: string;
  mercuryoWidgetId?: string;
  merchantUsdtAddress?: string;
}

export default function Widget({
  token,
  mercuryoWidgetId = "xxxxxxxxxxxxx",
  merchantUsdtAddress = "xxxxxxxxxxxxxxxxx",
}: WidgetProps) {
  const [amount, setAmount] = useState("");
  const [email, setEmail] = useState("");
  const [coin, setCoin] = useState("LTCT");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentInfo, setPaymentInfo] = useState<null | {
    address: string;
    amount: string;
    qrcode_url?: string;
    checkout_url: string;
  }>(null);

  const authHeader =
    token ||
    "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoidXNlciIsImlhdCI6MTc0OTIzNTM4MywiZXhwIjoxNzQ5ODQwMTgzfQ.qT8L07MpMg54-5_0-5nOO_ER5VEto_u062AjUsfOWCE";

  const getMercuryoUrl = () => {
    if (!amount || !email) return "#";

    const query = new URLSearchParams({
      amount,
      currency: "usd",
      to: "usdt",
      wallet: merchantUsdtAddress,
      widget_id: mercuryoWidgetId,
      user_email: email,
    });

    return `https://widget.mercuryo.io/?${query.toString()}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setPaymentInfo(null);

    try {
      const response = await fetch("http://localhost:3000/api/pay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
        body: JSON.stringify({ amount, coin, email }),
      });

      const data = await response.json();
      console.log(data);

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
        <input
          type="email"
          placeholder="Buyer Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 rounded"
          required
        />

        <select
          value={coin}
          onChange={(e) => setCoin(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="LTCT">Litecoin Testnet (LTCT)</option>
          <option value="USDT.TRC20">USDT (TRC20)</option>
          {/* <option value="BTC">Bitcoin (BTC)</option>
          <option value="ETH">Ethereum (ETH)</option>
          <option value="LTC">Litecoin (LTC)</option> */}
        </select>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          {loading ? "Processing..." : "Pay with Crypto"}
        </button>

        {coin === "USDT.TRC20" && (
          <>
            <hr className="my-2" />
            <p className="text-sm text-center text-gray-600">or</p>
            <a
              href={getMercuryoUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-600 text-white py-2 rounded hover:bg-green-700 text-center block"
            >
              Pay with Visa/Mastercard 💳
            </a>
          </>
        )}
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
            Pay with Crypto →
          </a>
        </div>
      )}
    </div>
  );
}
