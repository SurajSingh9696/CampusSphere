"use client";

import { useState } from "react";

import { LoaderCircle, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogout() {
    setIsLoading(true);

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
    } finally {
      router.replace("/login");
      router.refresh();
      setIsLoading(false);
    }
  }

  return (
    <button
      type="button"
      disabled={isLoading}
      onClick={handleLogout}
      className="inline-flex items-center gap-2 rounded-xl px-2 py-2 hover:bg-white disabled:cursor-not-allowed disabled:opacity-70"
    >
      {isLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
      <span>{isLoading ? "Signing out..." : "Logout"}</span>
    </button>
  );
}