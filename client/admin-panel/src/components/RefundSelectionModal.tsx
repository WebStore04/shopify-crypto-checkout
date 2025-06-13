interface RefundSelectionModalProps {
  txId: string; // Transaction ID
  email: string; // Email of the user
  onRefundToOriginal: () => void;
  onRefundToOther: () => void;
  onCancel: () => void;
}

const RefundSelectionModal: React.FC<RefundSelectionModalProps> = ({
  txId,
  email,
  onRefundToOriginal,
  onRefundToOther,
  onCancel,
}) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96 max-w-full">
        <h2 className="text-lg font-semibold text-center text-gray-800 mb-4">
          Refund Options
        </h2>

        <div className="space-y-4 text-center">
          <p>
            <strong>Transaction ID:</strong> {txId}
          </p>
          <p>
            <strong>Buyer Email:</strong> {email}
          </p>

          <p className="mt-4 text-sm text-gray-700">
            Please select how you would like to process the refund.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <button
            onClick={onRefundToOriginal}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
          >
            Refund to Original Card
          </button>
          <button
            onClick={onRefundToOther}
            className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700"
          >
            Refund to Other Card
          </button>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={onCancel}
            className="px-6 py-2 bg-gray-400 text-white rounded-xl hover:bg-gray-500"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default RefundSelectionModal;
