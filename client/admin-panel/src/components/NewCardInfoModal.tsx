import React, { useState } from "react";

interface NewCardInfoModalProps {
  onSubmit: (cardInfo: { cardNumber: string; expiryDate: string }) => void;
  onCancel: () => void;
  onBack: () => void;
}

const NewCardInfoModal: React.FC<NewCardInfoModalProps> = ({
  onSubmit,
  onCancel,
  onBack,
}) => {
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");

  const handleSubmit = () => {
    if (cardNumber && expiryDate) {
      onSubmit({ cardNumber, expiryDate });
    } else {
      alert("Please provide valid card details");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96 max-w-full">
        <h2 className="text-lg font-semibold text-center text-gray-800 mb-4">
          Enter New Card Information
        </h2>

        <div className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Card Number"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            className="border p-2 rounded"
            maxLength={16}
          />
          <input
            type="text"
            placeholder="MM/YY Expiry Date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            className="border p-2 rounded"
            maxLength={5}
          />
        </div>

        <div className="mt-6 flex justify-center gap-4">
          <button
            onClick={onBack}
            className="px-4 py-2 bg-gray-400 text-white rounded-xl hover:bg-gray-500"
          >
            Back
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
          >
            Refund
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-400 text-white rounded-xl hover:bg-gray-500"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewCardInfoModal;
