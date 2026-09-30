"use client";

import { useState, useTransition } from "react";
import { Trash2, AlertTriangle } from "lucide-react";
import { requestConversationDeletion, confirmConversationDeletion, cancelConversationDeletion } from "@/actions/conversations";

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
  const [, startTransition] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);
  const [activeAction, setActiveAction] = useState<"delete" | "decline" | "request" | "cancel" | null>(null);

  const handleRequest = () => {
    if (!confirm("Are you sure you want to request deletion? The other party will have to confirm this.")) return;
    
    setActiveAction("request");
    startTransition(async () => {
      try {
        const result = await requestConversationDeletion(conversationId);
        if (result?.error) {
          alert(result.error);
        } else {
          setShowConfirm(false);
        }
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err);
        alert("Failed to request deletion: " + errMsg);
      } finally {
        setActiveAction(null);
      }
    });
  };

  const handleConfirm = () => {
    setActiveAction("delete");
    startTransition(async () => {
      try {
        const result = await confirmConversationDeletion(conversationId);
        if (result?.error) {
          alert(result.error);
        } else if (result?.redirect) {
          window.location.href = "/conversations";
        }
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err);
        alert("Failed to confirm deletion: " + errMsg);
      } finally {
        setActiveAction(null);
      }
    });
  };

  const handleCancel = (action: "cancel" | "decline") => {
    setActiveAction(action);
    startTransition(async () => {
      try {
        const result = await cancelConversationDeletion(conversationId);
        if (result?.error) {
          alert(result.error);
        }
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err);
        alert(`Failed to ${action} deletion request: ` + errMsg);
      } finally {
        setActiveAction(null);
      }
    });
  };

  // If Modal
  if (showConfirm && deletionStatus === "none") {
    return (
      <div className="pt-2">
        <div className="flex flex-col gap-3 p-4 bg-surface-container-low/70 border border-outline-variant/25 rounded-2xl animate-scale-in shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold font-headline uppercase tracking-wider text-error">
            <AlertTriangle className="w-4 h-4 shrink-0 text-error" />
            <span>Request Deletion?</span>
          </div>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            The other party must confirm before this conversation is permanently deleted.
          </p>
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleRequest}
              disabled={activeAction !== null}
              className="flex-1 py-2 px-3 bg-error text-white hover:bg-error/90 rounded-xl text-xs font-headline font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
            >
              {activeAction === "request" ? "Requesting..." : "Confirm"}
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              disabled={activeAction !== null}
              className="flex-1 py-2 px-3 bg-surface-container hover:bg-surface-container-high text-on-surface-variant border border-outline-variant/20 rounded-xl text-xs font-headline font-bold transition-all cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // State 1: No deletion requested. Anyone can initiate.
  if (deletionStatus === "none") {
    return (
      <div className="pt-2">
        <button
          onClick={() => setShowConfirm(true)}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold font-headline uppercase tracking-wider text-outline hover:text-error bg-surface-container-low/60 hover:bg-error/10 border border-outline-variant/20 hover:border-error/20 transition-all duration-200 cursor-pointer group"
        >
          <Trash2 className="w-3.5 h-3.5 text-outline/70 group-hover:text-error transition-colors" />
          <span>Delete Conversation</span>
        </button>
      </div>
    );
  }

  // State 2: Deletion requested BY current user
  if (deletionStatus === "requested" && deletionRequestedBy === currentUserId) {
    return (
      <div className="pt-2">
        <div className="flex flex-col gap-3 p-4 bg-surface-container-low/70 border border-outline-variant/25 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold font-headline uppercase tracking-wider text-outline">
            <AlertTriangle className="w-4 h-4 text-tertiary shrink-0" />
            <span>Pending Deletion</span>
          </div>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            You requested to delete this conversation. Waiting for the other party to confirm.
          </p>
          <button
            onClick={() => handleCancel("cancel")}
            disabled={activeAction !== null}
            className="w-full py-2 px-3 bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-error border border-outline-variant/25 hover:border-error/20 rounded-xl text-xs font-headline font-bold transition-all cursor-pointer disabled:opacity-50"
          >
            {activeAction === "cancel" ? "Cancelling..." : "Cancel Deletion Request"}
          </button>
        </div>
      </div>
    );
  }

  // State 3: Deletion requested BY OTHER user
  if (deletionStatus === "requested" && deletionRequestedBy !== currentUserId) {
    return (
      <div className="pt-2">
        <div className="flex flex-col gap-3 p-4 bg-surface-container-low/70 border border-error/20 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold font-headline uppercase tracking-wider text-error">
            <AlertTriangle className="w-4 h-4 text-error shrink-0" />
            <span>Deletion Requested</span>
          </div>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            The other party has requested to delete this conversation permanently.
          </p>
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleConfirm}
              disabled={activeAction !== null}
              className="flex-1 py-2 px-3 bg-error text-white hover:bg-error/90 rounded-xl text-xs font-headline font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
            >
              {activeAction === "delete" ? "Deleting..." : "Yes, Delete"}
            </button>
            <button
              onClick={() => handleCancel("decline")}
              disabled={activeAction !== null}
              className="flex-1 py-2 px-3 bg-surface-container hover:bg-surface-container-high text-on-surface-variant border border-outline-variant/20 rounded-xl text-xs font-headline font-bold transition-all cursor-pointer disabled:opacity-50"
            >
              {activeAction === "decline" ? "Declining..." : "Decline"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
