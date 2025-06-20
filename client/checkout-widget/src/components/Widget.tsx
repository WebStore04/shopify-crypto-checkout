import { useState } from "react";

export default function BushaWidget() {
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState("");

  const publicKey = "pub_7RymeIhr8pg8B1V4UL6wA";
  const merchantWallet = "0xa206f668542B4A9A94637c1C5164881dFE6Df8e6";

  const isEmailValid = email.includes("@") && email.length > 4;
  const isAmountValid = !isNaN(parseFloat(amount)) && parseFloat(amount) > 0;
  const isFormValid = isEmailValid && isAmountValid;

  const osUrl =
    `https://sandbox.buy.busha.co/?publicKey=${publicKey}` +
    `&side=buy&cryptoAsset=USDT` +
    `&fiatCurrency=KES&fiatAmount=${encodeURIComponent(amount)}` +
    `&address=${merchantWallet}` +
    `&redirectUrl=${encodeURIComponent("https://your-shop.com/success")}`;

  const handleBuyClick = () => {
    if (isFormValid) {
      window.open(osUrl, "_blank");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow-md border mt-6">
      <h2 className="text-2xl font-semibold mb-4 text-center">
        Buy USDT with Card
      </h2>

      <label className="block mb-2 text-sm font-medium">Email</label>
      <input
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full p-2 border rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <label className="block mb-2 text-sm font-medium">Amount (KES)</label>
      <input
        type="number"
        placeholder="15000"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-full p-2 border rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <button
        type="button"
        onClick={handleBuyClick}
        disabled={!isFormValid}
        className={`w-full p-3 text-white font-semibold rounded transition 
          ${
            isFormValid
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-gray-400 cursor-not-allowed"
          }`}
      >
        Buy with Busha
      </button>

      {!isFormValid && (
        <p className="text-sm text-red-500 mt-2 text-center">
          Please enter a valid email and amount to continue.
        </p>
      )}
    </div>
  );
}
