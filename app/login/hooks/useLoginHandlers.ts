import { createClient } from "@/lib/supabase/client";
import { LoginState } from "./useLoginState";

export function useLoginHandlers(state: LoginState) {
  const {
    email,
    password,
    setLoading,
    setErrorMsg,
    setEmailError,
    setPasswordError,
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

    if (!password) {
      setPasswordError("Password tidak boleh kosong");
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError("Password minimal 6 karakter");
      isValid = false;
    } else {
      setPasswordError("");
    }

    return isValid;
  };

  const handleLogin = async (e: React.FormEvent, router: any) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!validate()) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMsg(error.message === "Invalid login credentials"
          ? "Email atau password salah."
          : error.message
        );
        setLoading(false);
        return;
      }

      if (data?.user) {
        router.refresh();
        const role = data.user.app_metadata?.role || "user";
        const status = data.user.app_metadata?.status || "active";

        if (status === "suspended") {
          router.push("/suspended");
        } else {
          router.push(role === "admin" ? "/admin/dashboard" : "/dashboard");
        }
      }
    } catch {
      setErrorMsg("Terjadi kesalahan sistem. Silakan coba lagi.");
      setLoading(false);
    }
  };

  return {
    handleLogin,
    validate,
  };
}
