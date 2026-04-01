"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function DynamicBackButton({
  fallback = "/search",
  label = "Return",
}: {
  fallback?: string;
  label?: string;
}) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="hover:text-primary transition-colors cursor-pointer flex items-center gap-1 font-bold uppercase tracking-widest text-sm"
    >
      <ArrowLeft className="w-4 h-4" /> {label}
    </button>
  );
}
