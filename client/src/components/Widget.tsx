import { useState } from "react";

export default function Widget() {
  const [amount, setAmount] = useState("");
  const [coin, setCoin] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    alert(`Submit: amount = ${amount}, coin = ${coin}`);
    console.log("Submit: ", { amount, coin });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 p-4 bg-white rounded-md shadow-md max-w-sm mx-auto mt-20"
    >
      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="border p-2 rounded"
      />
      <select
        value={coin}
        onChange={(e) => setCoin(e.target.value)}
        className="border p-2 rounded"
      >
        <option value="BTC">Bitcoin (BTC)</option>
        <option value="ETC">Bitcoin (ETH)</option>
        <option value="LTC">Bitcoin (LTC)</option>
      </select>
      <button
        type="submit"
        className="bg-blue-600 text-shite py-2 rounded hover:bg-blue-700"
      >
        Pay Now
      </button>
    </form>
  );
}
