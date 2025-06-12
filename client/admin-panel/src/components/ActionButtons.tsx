import { useState } from "react";
import { CheckCircle, Lock, Unlock, RotateCw } from "lucide-react";
import { toast } from "react-hot-toast";

interface ActionButtonsProps {
  txId: string;
  status:
    | "pending"
    | "confirmed"
    | "refunded"
    | "released"
    | "withdrawn"
    | "failed";
  isFrozen: boolean;
  onActionComplete: () => void;
}

export const ActionButtons = ({
  txId,
  status,
  isFrozen,
  onActionComplete,
}: ActionButtonsProps) => {
  const [loading, setLoading] = useState<string | null>(null);

  const handleAction = async (action: string) => {
    setLoading(action);
    try {
      const res = await fetch(`/api/tx/${txId}/${action}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!res.ok) throw new Error(`Failed to ${action}`);

      toast.success(
        `${action.charAt(0).toUpperCase() + action.slice(1)} successful`
      );
      onActionComplete(); // Trigger table refresh or SWR revalidation
    } catch (err) {
      toast.error(`Error: ${(err as Error).message}`);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex flex-wrap gap-2 text-xs">
      {/* Approve Button (only for pending status) */}
      {status === "pending" && !isFrozen && (
        <button
          onClick={() => handleAction("approve")}
          className="px-3 py-1 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition duration-200"
          disabled={loading !== null}
        >
          <CheckCircle size={16} />
          {loading === "approve" ? "Approving..." : "Approve"}
        </button>
      )}

      {/* Freeze Button (only for confirmed, failed, or withdrawn status, not frozen) */}
      {!isFrozen && status !== "released" && (
        <button
          onClick={() => handleAction("freeze")}
          className="px-3 py-1 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 transition duration-200"
          disabled={loading !== null}
        >
          <Lock size={16} />
          {loading === "freeze" ? "Freezing..." : "Freeze"}
        </button>
      )}

      {/* Unfreeze Button (only for frozen status) */}
      {isFrozen && (
        <button
          onClick={() => handleAction("unfreeze")}
          className="px-3 py-1 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition duration-200"
          disabled={loading !== null}
        >
          <Unlock size={16} />
          {loading === "unfreeze" ? "Unfreezing..." : "Unfreeze"}
        </button>
      )}

      {/* Refund Button (only for pending, confirmed status) */}
      {["pending", "confirmed"].includes(status) && !isFrozen && (
        <button
          onClick={() => handleAction("refund")}
          className="px-3 py-1 bg-red-600 text-white rounded-xl hover:bg-red-700 transition duration-200"
          disabled={loading !== null}
        >
          <RotateCw size={16} />
          {loading === "refund" ? "Refunding..." : "Refund"}
        </button>
      )}
    </div>
  );
};
