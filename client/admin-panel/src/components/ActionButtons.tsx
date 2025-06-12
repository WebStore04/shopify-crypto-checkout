// src/components/ActionButtons.tsx
import { useState } from "react";
import { CheckCircle, Lock, Unlock, RotateCw } from "lucide-react";
import { toast } from "react-hot-toast";

interface ActionButtonsProps {
  txId: string;
  status: string;
  onActionComplete: () => void;
}

export const ActionButtons = ({
  txId,
  status,
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
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Adjust as needed
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
    <div className="flex flex-wrap gap-2 text-sm">
      {status === "pending" && (
        <button
          className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded flex items-center gap-1"
          onClick={() => handleAction("approve")}
          disabled={loading !== null}
        >
          <CheckCircle size={16} />
          {loading === "approve" ? "..." : "Approve"}
        </button>
      )}

      {status !== "frozen" && (
        <button
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded flex items-center gap-1"
          onClick={() => handleAction("freeze")}
          disabled={loading !== null}
        >
          <Lock size={16} />
          {loading === "freeze" ? "..." : "Freeze"}
        </button>
      )}

      {status === "frozen" && (
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded flex items-center gap-1"
          onClick={() => handleAction("release")}
          disabled={loading !== null}
        >
          <Unlock size={16} />
          {loading === "release" ? "..." : "Release"}
        </button>
      )}

      {["frozen", "pending", "confirmed"].includes(status) && (
        <button
          className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded flex items-center gap-1"
          onClick={() => handleAction("refund")}
          disabled={loading !== null}
        >
          <RotateCw size={16} />
          {loading === "refund" ? "..." : "Refund"}
        </button>
      )}
    </div>
  );
};
