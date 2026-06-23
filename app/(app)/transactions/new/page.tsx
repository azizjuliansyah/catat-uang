"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NewTransactionPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to transactions page - the modal will be triggered via URL param
    router.push("/transactions?create=true");
  }, [router]);

  return null;
}
