import { createClient } from "@/lib/supabase/client";
import { ResetPasswordState } from "./useResetPasswordState";

export function useResetPasswordHandlers(state: ResetPasswordState) {
  const {
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    setLoading,
    setErrorMsg,
    setSuccessMsg,
    setPasswordError,
    setConfirmPasswordError,
  } = state;

  const supabase = createClient();

  const validate = () => {
    let isValid = true;

    if (!password) {
      setPasswordError("Password baru tidak boleh kosong");
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError("Password minimal 6 karakter");
      isValid = false;
    } else {
      setPasswordError("");
    }

    if (!confirmPassword) {
      setConfirmPasswordError("Konfirmasi password tidak boleh kosong");
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError("Password dan konfirmasi password tidak cocok");
      isValid = false;
    } else {
      setConfirmPasswordError("");
    }

    return isValid;
  };

  const handleUpdatePassword = async (e: React.FormEvent, router: any) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!validate()) return;

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        setErrorMsg(error.message);
        setLoading(false);
        return;
      }

      setSuccessMsg("Password berhasil diperbarui! Mengalihkan ke dashboard...");
      setPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        router.refresh();
        router.push("/dashboard");
      }, 2000);
    } catch {
      setErrorMsg("Terjadi kesalahan sistem. Silakan coba lagi.");
      setLoading(false);
    }
  };

  return {
    handleUpdatePassword,
    validate,
  };
}
