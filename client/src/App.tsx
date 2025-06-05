import React from 'react';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-blue-600 mb-4">shopify-crypto-checkout</h1>
        <p className="text-gray-600 mb-6">
          Custom Shopify widget for Visa/Mastercard-to-USDT payments using CoinPayments. Includes admin panel, email alerts, and webhook handling.
        </p>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
          Pay
        </button>
      </div>
    </div>
  );
};

export default App;
