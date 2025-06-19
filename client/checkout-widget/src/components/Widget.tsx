import { useState } from "react";

// interface WidgetProps {
//   token?: string;
// }

export default function BushaWidget() {
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState("");
  // const [loading, setLoading] = useState(false);
  // const [error, setError] = useState("");
  // const [checkoutUrl, setCheckoutUrl] = useState("");

  const publicKey = "pub_7RymeIhr8pg8B1V4UL6wA";
  const recipientAddr = "0xa206f668542B4A9A94637c1C5164881dFE6Df8e6";

  const osUrl =
    `https://sandbox.buy.busha.co/` +
    `?publicKey=${publicKey}` +
    `&side=buy` +
    `&address=${recipientAddr}` +
    `&cryptoAsset=USDT&network=ETH` +
    `&fiatCurrency=KES&fiatAmount=15000` +
    `&redirectUrl=${encodeURIComponent("https://your-shop.com/success")}`;

  // const token =
  //   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoidXNlciIsImlhdCI6MTc1MDM1NzQ4MywiZXhwIjoxNzUwOTYyMjgzfQ.pvzlhsF7JtACG6fybB653Gp58TvsRoUW671AwyoS9gc";

  // const handlePay = async () => {
  //   setError("");
  //   const parsedAmount = parseFloat(amount);

  //   if (!email || isNaN(parsedAmount) || parsedAmount <= 0) {
  //     setError("Please enter a valid email and amount.");
  //     return;
  //   }

  //   setLoading(true);

  //   try {
  //     const res = await fetch("/api/pay", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${token}`,
  //       },
  //       body: JSON.stringify({ email, amount }),
  //     });

  //     const data = await res.json();
  //     if (res.ok && data.checkout_url) {
  //       setCheckoutUrl(data.checkout_url);
  //       window.open(data.checkout_url, "_blank");
  //     } else {
  //       throw new Error(data?.error || "Failed to initiate payment.");
  //     }
  //   } catch (err: any) {
  //     setError(err.message || "Unexpected error.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  return (
    <div className="p-4 rounded-xl border bg-white shadow max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-2">Pay with Card (Busha)</h2>
      <input
        type="email"
        placeholder="Email"
        className="w-full p-2 border rounded mb-2"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="number"
        placeholder="Amount in USD"
        className="w-full p-2 border rounded mb-2"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      {/* <button
        onClick={handlePay}
        disabled={loading}
        className="w-full bg-blue-600 text-white p-2 rounded disabled:opacity-50"
      >
        {loading ? "Processing..." : "Pay Now"}
      </button> */}

      <button
        className="w-full bg-blue-600 text-white p-2 rounded disabled:opacity-50"
        type="button"
        onClick={() => window.open(osUrl, "_blank")}
      >
        Buy with Busha
      </button>

      {/* {error && <p className="text-red-500 mt-2">{error}</p>} */}
    </div>
  );
}
