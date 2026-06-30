import { createClient } from "@/lib/supabase/client";
import { RegisterState } from "./useRegisterState";

export function useRegisterHandlers(state: RegisterState) {
  const {
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    setLoading,
    setErrorMsg,
    setSuccessMsg,
    setNameError,
    setEmailError,
    setPasswordError,
    setConfirmPasswordError,
  } = state;

  const supabase = createClient();

  const validate = () => {
    let isValid = true;

    if (!name) {
      setNameError("Nama tidak boleh kosong");
      isValid = false;
    } else {
      setNameError("");
    }

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

  const handleRegister = async (e: React.FormEvent, router: any) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!validate()) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });

      if (error) {
        setErrorMsg(error.message);
        setLoading(false);
        return;
      }

      if (data?.user) {
        setName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");

        if (!data.session) {
          setSuccessMsg("Pendaftaran berhasil! Silakan cek email Anda untuk konfirmasi.");
          setLoading(false);
          return;
        }

        router.refresh();
        router.push("/dashboard");
      }
    } catch {
      setErrorMsg("Terjadi kesalahan sistem. Silakan coba lagi.");
      setLoading(false);
    }
  };

  return {
    handleRegister,
    validate,
  };
}
