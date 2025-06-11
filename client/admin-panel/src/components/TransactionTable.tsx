import { useState, useEffect } from "react";
import { Skeleton } from "./Skeleton";
import { ActionButtons } from "./ActionButtons";

interface Transaction {
  txnId: string;
  email: string;
  amount: number;
  status: "pending" | "confirmed" | "frozen" | "refunded" | "released";
  fraudFlag: "high risk" | "low risk";
  createdAt: Date;
  flags?: string[];
  manualFlag?: boolean;
}

const itemsPerPageDefault = 5;

export const TransactionTable = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [fraudFilter, setFraudFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"amount" | "createdAt" | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [itemsPerPage, setItemsPerPage] = useState(itemsPerPageDefault);

  const fetchTransactions = async () => {
    setTimeout(() => {
      setTransactions([
        {
          txnId: "TX1001",
          email: "alice@example.com",
          amount: 150,
          status: "pending",
          fraudFlag: "low risk",
          createdAt: new Date("2025-06-09T08:00:00Z"),
          manualFlag: true,
        },
        {
          txnId: "TX1002",
          email: "bob@example.com",
          amount: 620,
          status: "frozen",
          fraudFlag: "high risk",
          createdAt: new Date("2025-06-09T09:10:00Z"),
          flags: ["IP mismatch", "> $500"],
        },
        {
          txnId: "TX1003",
          email: "charlie@example.com",
          amount: 85,
          status: "confirmed",
          fraudFlag: "low risk",
          createdAt: new Date("2025-06-08T14:22:00Z"),
        },
        {
          txnId: "TX1004",
          email: "diana@example.com",
          amount: 999,
          status: "frozen",
          fraudFlag: "high risk",
          createdAt: new Date("2025-06-08T17:45:00Z"),
          flags: ["High amount"],
        },
        {
          txnId: "TX1005",
          email: "edward@example.com",
          amount: 1000,
          status: "refunded",
          fraudFlag: "high risk",
          createdAt: new Date("2025-06-07T11:33:00Z"),
        },
        {
          txnId: "TX1006",
          email: "frida@example.com",
          amount: 430,
          status: "confirmed",
          fraudFlag: "low risk",
          createdAt: new Date("2025-06-07T20:15:00Z"),
        },
        {
          txnId: "TX1007",
          email: "george@example.com",
          amount: 70,
          status: "released",
          fraudFlag: "low risk",
          createdAt: new Date("2025-06-06T10:12:00Z"),
        },
        {
          txnId: "TX1008",
          email: "hannah@example.com",
          amount: 505,
          status: "pending",
          fraudFlag: "high risk",
          createdAt: new Date("2025-06-06T21:55:00Z"),
          flags: ["Suspicious IP"],
        },
        {
          txnId: "TX1009",
          email: "ivan@example.com",
          amount: 300,
          status: "confirmed",
          fraudFlag: "low risk",
          createdAt: new Date("2025-06-05T07:43:00Z"),
        },
        {
          txnId: "TX1010",
          email: "julie@example.com",
          amount: 850,
          status: "frozen",
          fraudFlag: "high risk",
          createdAt: new Date("2025-06-05T18:05:00Z"),
          flags: ["IP mismatch", "> $500"],
        },
      ]);
      setLoading(false);
    }, 300);
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  const refreshData = () => {
    setLoading(true);
    fetchTransactions();
  };

  let filtered = transactions.filter((txn) => {
    const matchSearch =
      txn.txnId.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      txn.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
    const matchStatus = statusFilter === "all" || txn.status === statusFilter;
    const matchFraud = fraudFilter === "all" || txn.fraudFlag === fraudFilter;
    return matchSearch && matchStatus && matchFraud;
  });

  if (sortBy) {
    filtered = [...filtered].sort((a, b) => {
      const valA = sortBy === "amount" ? a.amount : a.createdAt.getTime();
      const valB = sortBy === "amount" ? b.amount : b.createdAt.getTime();
      return sortOrder === "asc" ? valA - valB : valB - valA;
    });
  }

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleSort = (field: "amount" | "createdAt") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const toggleManualFlag = (txnId: string) => {
    setTransactions((prev) =>
      prev.map((txn) =>
        txn.txnId === txnId ? { ...txn, manualFlag: !txn.manualFlag } : txn
      )
    );
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
              onChange={(e) => {
                setCurrentPage(1);
                setItemsPerPage(Number(e.target.value));
              }}
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
      {loading ? (
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
                <th className="p-4 text-left text-sm font-semibold text-gray-600">
                  Flagged?
                </th>
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
              </tr>
            </thead>
            <tbody>
              {paginated.map((txn, index) => (
                <tr
                  key={txn.txnId}
                  className={`border-t hover:bg-gray-50 ${
                    txn.fraudFlag === "high risk" ? "bg-red-50" : ""
                  }`}
                >
                  <td className="p-4 text-sm text-gray-500">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </td>
                  <td className="p-4 text-sm">{txn.txnId}</td>
                  <td className="p-4 text-sm">{txn.email}</td>
                  <td className="p-4 text-sm">${txn.amount}</td>
                  <td className="p-4 text-sm">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${
                        txn.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : txn.status === "frozen"
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
                    {txn.flags && txn.flags.length > 0 && (
                      <ul className="text-xs mt-1 text-red-600 list-disc list-inside space-y-1">
                        {txn.flags.map((flag, i) => (
                          <li key={i}>{flag}</li>
                        ))}
                      </ul>
                    )}
                  </td>
                  <td className="p-4 text-sm">
                    <button
                      onClick={() => toggleManualFlag(txn.txnId)}
                      className={`text-xs font-medium px-2 py-1 rounded-full transition ${
                        txn.manualFlag
                          ? "bg-red-100 text-red-700 hover:bg-red-200"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                    >
                      {txn.manualFlag ? "🚫 Unflag" : "✅ Flag"}
                    </button>
                  </td>

                  <td className="p-4 text-sm text-gray-500">
                    {txn.createdAt.toLocaleDateString()}
                  </td>
                  <td className="p-4 text-sm">
                    <ActionButtons
                      txnId={txn.txnId}
                      status={txn.status}
                      onActionComplete={refreshData}
                    />
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
          onClick={() => setCurrentPage((p) => p - 1)}
          className="px-3 py-1 bg-gray-200 text-sm rounded disabled:opacity-50"
        >
          Prev
        </button>
        <span className="text-sm font-medium">
          Page {currentPage} of {totalPages}
        </span>
        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((p) => p + 1)}
          className="px-3 py-1 bg-gray-200 text-sm rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};
