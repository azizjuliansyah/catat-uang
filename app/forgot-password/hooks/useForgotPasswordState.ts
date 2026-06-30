import { useState } from "react";

export function useForgotPasswordState() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [emailError, setEmailError] = useState("");

  return {
    email,
    setEmail,
    loading,
    setLoading,
    errorMsg,
    setErrorMsg,
    successMsg,
    setSuccessMsg,
    emailError,
    setEmailError,
  };
}

export type ForgotPasswordState = ReturnType<typeof useForgotPasswordState>;
