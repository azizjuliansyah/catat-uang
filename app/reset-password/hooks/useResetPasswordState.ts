import { useState } from "react";

export function useResetPasswordState() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  return {
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    loading,
    setLoading,
    errorMsg,
    setErrorMsg,
    successMsg,
    setSuccessMsg,
    passwordError,
    setPasswordError,
    confirmPasswordError,
    setConfirmPasswordError,
  };
}

export type ResetPasswordState = ReturnType<typeof useResetPasswordState>;
