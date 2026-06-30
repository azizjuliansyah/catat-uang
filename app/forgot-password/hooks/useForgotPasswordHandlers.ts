import { createClient } from "@/lib/supabase/client";
import { ForgotPasswordState } from "./useForgotPasswordState";

export function useForgotPasswordHandlers(state: ForgotPasswordState) {
  const {
    email,
    setEmail,
    setLoading,
    setErrorMsg,
    setSuccessMsg,
    setEmailError,
  } = state;

  const supabase = createClient();

  const validate = () => {
    let isValid = true;
    if (!email) {
      setEmailError("Email tidak boleh kosong");
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Format email tidak valid");
      isValid = false;
    } else {
      setEmailError("");
    }
    return isValid;
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!validate()) return;

    setLoading(true);
    try {
      const redirectToUrl = `${window.location.origin}/auth/callback?next=/settings`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectToUrl,
      });

      if (error) {
        setErrorMsg(error.message);
        setLoading(false);
        return;
      }

      setSuccessMsg("Tautan atur ulang password telah dikirim ke email Anda.");
      setEmail("");
      setLoading(false);
    } catch {
      setErrorMsg("Terjadi kesalahan sistem. Silakan coba lagi.");
      setLoading(false);
    }
  };

  return {
    handleResetPassword,
    validate,
  };
}
