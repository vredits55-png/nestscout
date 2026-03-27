"use client";

import { Trash2 } from "lucide-react";
import { deleteProperty } from "@/actions/properties";
import { useState } from "react";

export default function DeletePropertyButton({ id }: { id: string }) {
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <div className="flex items-center gap-1 animate-scale-in">
        <button
          onClick={async () => {
            await deleteProperty(id);
            setConfirming(false);
          }}
          className="btn btn-danger btn-sm cursor-pointer"
        >
          Confirm
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="btn btn-ghost btn-sm cursor-pointer"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="btn btn-ghost btn-sm text-danger cursor-pointer"
      aria-label="Delete property"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
