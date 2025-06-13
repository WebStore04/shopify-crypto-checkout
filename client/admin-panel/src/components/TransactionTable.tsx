import useSWR from "swr";
import { useState, useEffect } from "react";
import { Skeleton } from "./Skeleton";
import { ActionButtons } from "./ActionButtons";
import TransactionModal from "./TransactionModal";

interface Transaction {
  txId: string;
  coin: string;
  merchantReceived: number;
  adminFee: number;
  address: string;
  buyerEmail: string;
  amount: number;
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
  isFrozen: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const itemsPerPageDefault = 5;

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Something went wrong");
  }
  return res.json();
};

export const TransactionTable = () => {
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [fraudFilter, setFraudFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"amount" | "createdAt" | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [itemsPerPage, setItemsPerPage] = useState(itemsPerPageDefault);

  // Fetch data from the backend, including pagination info
  const { data, isLoading, mutate } = useSWR<{
    transactions: Transaction[];
    pagination: {
      totalTransactions: number;
      totalPages: number;
      currentPage: number;
      itemsPerPage: number;
    };
  }>(`/api/transactions?page=${currentPage}&limit=${itemsPerPage}`, fetcher);

  const { transactions = [], pagination } = data || {};
  const {
    totalPages = 1,
    currentPage: page,
    itemsPerPage: limit,
  } = pagination || {};

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  // Filter and sort transactions
  const filtered = transactions
    .filter((txn) => {
      const matchSearch =
        txn.txId.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        txn.buyerEmail
          .toLowerCase()
          .includes(debouncedSearchTerm.toLowerCase());
      const matchStatus = statusFilter === "all" || txn.status === statusFilter;
      const matchFraud = fraudFilter === "all" || txn.fraudFlag === fraudFilter;
      return matchSearch && matchStatus && matchFraud;
    })
    .sort((a, b) => {
      if (!sortBy) return 0;
      const valA =
        sortBy === "amount" ? a.amount : new Date(a.createdAt).getTime();
      const valB =
        sortBy === "amount" ? b.amount : new Date(b.createdAt).getTime();
      return sortOrder === "asc" ? valA - valB : valB - valA;
    });

  // Pagination control logic
  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handleItemsPerPageChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const toggleSort = (field: "amount" | "createdAt") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const toggleManualFlag = async (txnId: string) => {
    await fetch(`/api/tx/${txnId}/toggle-flag`, { method: "POST" });
    mutate();
  };

  return (
    <div className="overflow-x-auto bg-white shadow rounded-lg p-4 transition-all">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-4 justify-between items-center">
        <input
          type="text"
          placeholder="Search by email or txnId"
          value={searchTerm}
          onChange={(e) => {
            setCurrentPage(1);
            setSearchTerm(e.target.value);
          }}
          className="border p-2 rounded-md text-sm w-full md:w-1/3"
        />
        <div className="flex gap-3 items-center">
          <select
            className="border p-2 rounded-md text-sm"
            value={statusFilter}
            onChange={(e) => {
              setCurrentPage(1);
              setStatusFilter(e.target.value);
            }}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="frozen">Frozen</option>
            <option value="refunded">Refunded</option>
            <option value="released">Released</option>
          </select>
          <select
            className="border p-2 rounded-md text-sm"
            value={fraudFilter}
            onChange={(e) => {
              setCurrentPage(1);
              setFraudFilter(e.target.value);
            }}
          >
            <option value="all">All Risks</option>
            <option value="high risk">High Risk</option>
            <option value="low risk">Low Risk</option>
          </select>
          <div className="flex items-center gap-2">
            <label htmlFor="perPage" className="text-sm text-gray-600">
              Rows per page:
            </label>
            <select
              id="perPage"
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              className="border p-1 rounded-md text-sm"
            >
              {[5, 10, 25, 50].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <Skeleton />
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full hidden md:table">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-4 text-left text-sm font-semibold text-gray-600">
                  No.
                </th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600">
                  Txn ID
                </th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600">
                  Email
                </th>
                <th
                  className="p-4 text-left text-sm font-semibold text-gray-600 cursor-pointer"
                  onClick={() => toggleSort("amount")}
                >
                  Amount{" "}
                  {sortBy === "amount" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
                </th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600">
                  Status
                </th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600">
                  Fraud
                </th>
                {/* <th className="p-4 text-left text-sm font-semibold text-gray-600">
                  Flagged?
                </th> */}
                <th
                  className="p-4 text-left text-sm font-semibold text-gray-600 cursor-pointer"
                  onClick={() => toggleSort("createdAt")}
                >
                  Date{" "}
                  {sortBy === "createdAt"
                    ? sortOrder === "asc"
                      ? "↑"
                      : "↓"
                    : ""}
                </th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600">
                  Actions
                </th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600">
                  Details
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((txn, index) => (
                <tr
                  key={txn.txId}
                  className={`border-t hover:bg-gray-50 ${
                    txn.isFrozen === true ? "bg-blue-100" : ""
                  } ${
                    txn.fraudFlag === "high risk" && txn.isFrozen === false
                      ? "bg-red-50 border-red-400"
                      : ""
                  }`}
                >
                  <td className="p-4 text-sm text-gray-500">
                    {(page! - 1) * limit! + index + 1}
                  </td>
                  <td className="p-4 text-sm">{txn.txId}</td>
                  <td className="p-4 text-sm">{txn.buyerEmail}</td>
                  <td className="p-4 text-sm">${txn.amount}</td>
                  <td className="p-4 text-sm">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${
                        txn.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : txn.isFrozen === true
                          ? "bg-blue-100 text-blue-800"
                          : txn.status === "refunded"
                          ? "bg-red-100 text-red-800"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {txn.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm">
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        txn.fraudFlag === "high risk"
                          ? "bg-red-500 text-white"
                          : "bg-yellow-400 text-white"
                      }`}
                    >
                      {txn.fraudFlag}
                    </span>
                  </td>
                  {/* <td className="p-4 text-sm">
                    <button
                      onClick={() => toggleManualFlag(txn.txId)}
                      className={`text-xs font-medium px-2 py-1 rounded-full transition ${
                        txn.isFlagged
                          ? "bg-red-100 text-red-700 hover:bg-red-200"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                    >
                      {txn.isFlagged ? "🚫 Unflag" : "✅ Flag"}
                    </button>
                  </td> */}
                  <td className="p-4 text-sm text-gray-500">
                    {new Date(txn.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-sm">
                    <ActionButtons
                      txId={txn.txId}
                      buyerEmail={txn.buyerEmail}
                      status={txn.status}
                      isFrozen={txn.isFrozen}
                      onActionComplete={mutate}
                    />
                  </td>
                  <td className="p-4 text-sm text-center">
                    <button
                      onClick={() => setSelectedTransaction(txn)} // Open modal on row click
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Show Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-center items-center gap-4 mt-4">
        <button
          disabled={currentPage === 1}
          onClick={handlePrevPage}
          className="px-3 py-1 bg-gray-200 text-sm rounded disabled:opacity-50"
        >
          Prev
        </button>
        <span className="text-sm font-medium">
          Page {currentPage} of {totalPages}
        </span>
        <button
          disabled={currentPage === totalPages}
          onClick={handleNextPage}
          className="px-3 py-1 bg-gray-200 text-sm rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {/* Transaction Modal */}
      {selectedTransaction && (
        <TransactionModal
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
          onFlagChange={toggleManualFlag}
          onApprove={() => {}}
          onFreeze={() => {}}
          onRefund={() => {}}
        />
      )}
    </div>
  );
};
