import { useState } from "react";

interface WidgetProps {
  mercuryoWidgetId?: string;
  coldWalletAddress?: string;
}

export default function Widget({
  mercuryoWidgetId = "xxxxxxxxxxxxx",
  coldWalletAddress = "xxxxxxxxxxxxxxxxx",
}: WidgetProps) {
  const [amount, setAmount] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentInfo, setPaymentInfo] = useState<null | {
    address: string;
    amount: string;
    checkout_url: string;
  }>(null);

  // Handle Mercuryo payment (Visa/Mastercard to USDT)
  const handleMercuryoPayment = () => {
    setError("");

    const parsedAmount = parseFloat(amount);
    if (!email || isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Enter a valid email and amount before paying");
      return;
    }

    const baseAmount = parseFloat(amount);
    const totalWithFee = (baseAmount * 1.02).toFixed(2); // 2% processing fee

    const query = new URLSearchParams({
      amount: totalWithFee, // Use the amount after adding the 2% fee
      currency: "usd",
      to: "usdt",
      wallet: coldWalletAddress, // Send funds to cold wallet
      widget_id: mercuryoWidgetId,
      user_email: email,
    });

    const mercuryoUrl = `https://widget.mercuryo.io/?${query.toString()}`;
    window.open(mercuryoUrl, "_blank");
  };

  // Calculate total with fee (2% for admin commission)
  const baseAmount = parseFloat(amount);
  const totalWithFee = !isNaN(baseAmount)
    ? (baseAmount * 1.02).toFixed(2) // Add 2% fee for admin
    : null;

  return (
    <div className="max-w-sm mx-auto mt-20 p-4 bg-white rounded-md shadow-md">
      <form
        onSubmit={(e) => e.preventDefault()}
        className="flex flex-col gap-4"
      >
        <input
          type="number"
          name="amount"
          placeholder="Amount (USD)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="border p-2 rounded"
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Buyer Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 rounded"
          required
        />

        {totalWithFee && (
          <p className="text-sm text-gray-600">
            You will be charged <strong>${totalWithFee}</strong> (includes 2%
            processing fee)
          </p>
        )}

        <button
          type="button"
          onClick={handleMercuryoPayment}
          disabled={loading}
          className={`py-2 rounded text-white ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {loading ? "Loading widget..." : "Pay with Visa/Mastercard 💳"}
        </button>
      </form>

      {error && <p className="text-red-500 text-sm mt-4">❌ {error}</p>}

      {paymentInfo && (
        <div className="mt-6 space-y-2">
          <p>
            <strong>Payment Address:</strong> {paymentInfo.address}
          </p>
          <p>
            <strong>Amount:</strong> {paymentInfo.amount} USDT
          </p>
          <a
            href={paymentInfo.checkout_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline block mt-2"
          >
            Complete Payment →
          </a>
        </div>
      )}
    </div>
  );
}
