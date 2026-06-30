import { useState } from "react";

export function useLoginState() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  return {
    email,
    setEmail,
    password,
    setPassword,
    loading,
    setLoading,
    errorMsg,
    setErrorMsg,
    emailError,
    setEmailError,
    passwordError,
    setPasswordError,
  };
}

export type LoginState = ReturnType<typeof useLoginState>;
