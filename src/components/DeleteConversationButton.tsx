"use client";

import { useState, useTransition } from "react";
import { Trash2, AlertTriangle } from "lucide-react";
import { requestConversationDeletion, confirmConversationDeletion, cancelConversationDeletion } from "@/actions/conversations";
import { useRouter } from "next/navigation";

interface DeleteConversationButtonProps {
  conversationId: string;
  currentUserId: string;
  deletionStatus: string;
  deletionRequestedBy: string | null;
}

export default function DeleteConversationButton({
  conversationId,
  currentUserId,
  deletionStatus,
  deletionRequestedBy,
}: DeleteConversationButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  const handleRequest = () => {
    if (!confirm("Are you sure you want to request deletion? The other party will have to confirm this.")) return;
    
    startTransition(async () => {
      await requestConversationDeletion(conversationId);
      setShowConfirm(false);
    });
  };

  const handleConfirm = () => {
    startTransition(async () => {
      const result = await confirmConversationDeletion(conversationId);
      if (result.redirect) {
        router.push("/conversations");
      }
    });
  };

  const handleCancel = () => {
    startTransition(async () => {
      await cancelConversationDeletion(conversationId);
    });
  };

  // If Modal
  if (showConfirm && deletionStatus === "none") {
    return (
      <div className="flex flex-col gap-2 p-3 bg-danger/5 border border-danger/20 rounded-xl">
        <p className="text-sm font-medium text-danger">Request Deletion?</p>
        <div className="flex flex-col sm:flex-row gap-2 mt-2">
          <button onClick={handleRequest} disabled={isPending} className="btn py-1.5 px-3 bg-danger text-white hover:bg-danger/90 border-transparent flex-1 text-xs">
            Confirm
          </button>
          <button onClick={() => setShowConfirm(false)} disabled={isPending} className="btn btn-outline py-1.5 px-3 flex-1 text-xs">
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // State 1: No deletion requested. Anyone can initiate.
  if (deletionStatus === "none") {
    return (
      <button
        onClick={() => setShowConfirm(true)}
        className="btn btn-outline border-danger/20 text-danger hover:bg-danger hover:text-white"
      >
        <Trash2 className="w-4 h-4" />
        Delete Conversation
      </button>
    );
  }

  // State 2: Deletion requested BY current user
  if (deletionStatus === "requested" && deletionRequestedBy === currentUserId) {
    return (
      <div className="flex flex-col gap-3 p-4 bg-danger/5 border border-danger/20 rounded-xl">
        <div className="flex items-center gap-2 text-danger text-sm font-medium">
          <AlertTriangle className="w-4 h-4" />
          Pending Deletion
        </div>
        <p className="text-sm text-text-muted">
          You have requested to delete this conversation. Waiting for the other party to confirm.
        </p>
        <button
          onClick={handleCancel}
          disabled={isPending}
          className="btn btn-outline border-danger/20 text-danger hover:bg-danger hover:text-white w-full text-xs"
        >
          {isPending ? "Cancelling..." : "Cancel Deletion Request"}
        </button>
      </div>
    );
  }

  // State 3: Deletion requested BY OTHER user
  if (deletionStatus === "requested" && deletionRequestedBy !== currentUserId) {
    return (
      <div className="flex flex-col gap-3 p-4 bg-danger/5 border border-danger/20 rounded-xl">
        <div className="flex items-center gap-2 text-danger text-sm font-medium">
          <AlertTriangle className="w-4 h-4" />
          Deletion Requested
        </div>
        <p className="text-sm text-text-muted">
          The other party wants to delete this conversation. Do you agree? This action cannot be undone.
        </p>
        <div className="flex flex-col sm:flex-row gap-2 mt-2">
          <button
            onClick={handleConfirm}
            disabled={isPending}
            className="btn btn-primary flex-1 bg-danger hover:bg-danger/90 border-transparent text-white"
          >
            {isPending ? "Deleting..." : "Yes, Delete"}
          </button>
          <button
            onClick={handleCancel}
            disabled={isPending}
            className="btn btn-outline flex-1 text-xs"
          >
            {isPending ? "Declining..." : "Decline"}
          </button>
        </div>
      </div>
    );
  }

  return null;
}
