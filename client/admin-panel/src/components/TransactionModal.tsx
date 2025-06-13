import React from "react";

interface History {
  status: "pending" | "confirmed" | "withdrawn" | "failed";
  updatedAt: Date;
  updatedBy?: string;
  reason?: string;
}

interface Transaction {
  txId: string;
  coin: string;
  amount: number;
  merchantReceived: number;
  adminFee: number;
  address: string;
  buyerEmail: string;
  status:
    | "pending"
    | "confirmed"
    | "refunded"
    | "released"
    | "withdrawn"
    | "failed";
  fraudFlag: "high risk" | "low risk";
  rawIPN: object;
  history: History[];
  expiresAt?: Date;
  metadata?: Record<string, any>;
  currency: "USD" | "EUR" | "USDT";
  isFlagged: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface ModalProps {
  transaction: Transaction | null;
  onClose: () => void;
  onFlagChange: (txId: string, flag: boolean) => void;
  onApprove: (txId: string) => void;
  onFreeze: (txId: string) => void;
  onRefund: (txId: string) => void;
}

const TransactionModal: React.FC<ModalProps> = ({
  transaction,
  onClose,
  onFlagChange,
  onApprove,
  onFreeze,
  onRefund,
}) => {
  if (!transaction) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-60 z-50">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-3xl transform transition-all duration-300 scale-95 hover:scale-100">
        <h2 className="text-3xl font-semibold mb-6 text-center text-gray-900">
          Transaction Details
        </h2>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-gray-800">
            <p>
              <strong>Txn ID:</strong> {transaction.txId}
            </p>
            <p>
              <strong>Coin:</strong> {transaction.coin}
            </p>
            <p>
              <strong>Amount:</strong> ${transaction.amount}
            </p>
            <p>
              <strong>Merchant Received:</strong> $
              {transaction.merchantReceived}
            </p>
            <p>
              <strong>Admin Fee:</strong> ${transaction.adminFee}
            </p>
            <p>
              <strong>Address:</strong> {transaction.address}
            </p>
            <p>
              <strong>Buyer Email:</strong> {transaction.buyerEmail}
            </p>
            <p>
              <strong>Status:</strong> {transaction.status}
            </p>
            <p>
              <strong>Fraud Risk:</strong> {transaction.fraudFlag}
            </p>
            <p>
              <strong>Currency:</strong> {transaction.currency}
            </p>
            <p>
              <strong>Created At:</strong>{" "}
              {new Date(transaction.createdAt).toLocaleString()}
            </p>
            <p>
              <strong>Updated At:</strong>{" "}
              {new Date(transaction.updatedAt).toLocaleString()}
            </p>
          </div>

          {transaction.expiresAt && (
            <p>
              <strong>Expires At:</strong>{" "}
              {new Date(transaction.expiresAt).toLocaleString()}
            </p>
          )}

          {/* {transaction.metadata && (
            <div>
              <strong>Metadata:</strong>
              <pre className="bg-gray-100 p-4 rounded-xl overflow-auto">
                {JSON.stringify(transaction.metadata, null, 2)}
              </pre>
            </div>
          )} */}

          {transaction.rawIPN && (
            <div>
              <strong>Raw IPN:</strong>
              <pre className="bg-gray-100 p-4 rounded-xl overflow-auto">
                {JSON.stringify(transaction.rawIPN, null, 2)}
              </pre>
            </div>
          )}

          {transaction.history.length > 0 && (
            <div>
              <strong>History:</strong>
              <ul className="list-disc pl-5 text-gray-700">
                {transaction.history.map((entry, index) => (
                  <li key={index} className="py-2">
                    <strong>Status:</strong> {entry.status} <br />
                    <strong>Updated At:</strong>{" "}
                    {new Date(entry.updatedAt).toLocaleString()} <br />
                    {entry.updatedBy && (
                      <>
                        <strong>Updated By:</strong> {entry.updatedBy} <br />
                      </>
                    )}
                    {entry.reason && (
                      <>
                        <strong>Reason:</strong> {entry.reason} <br />
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p>
            <strong>Flagged:</strong> {transaction.isFlagged ? "Yes" : "No"}
          </p>
        </div>

        {/* <div className="mt-6 flex justify-center gap-6">
          <button
            onClick={() => onApprove(transaction.txId)}
            className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition duration-200 ease-in-out transform hover:scale-105"
          >
            Approve
          </button>
          <button
            onClick={() => onFreeze(transaction.txId)}
            className="px-6 py-3 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 transition duration-200 ease-in-out transform hover:scale-105"
          >
            Freeze
          </button>
          <button
            onClick={() => onRefund(transaction.txId)}
            className="px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition duration-200 ease-in-out transform hover:scale-105"
          >
            Refund
          </button>
        </div> */}

        <div className="mt-4 text-center">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-400 text-white rounded-xl hover:bg-gray-500 transition duration-200 ease-in-out transform hover:scale-105"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionModal;
