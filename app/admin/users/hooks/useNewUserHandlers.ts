import { createUser } from "@/app/admin/users/actions";
import { NewUserState } from "./useNewUserState";

export function useNewUserHandlers(state: NewUserState) {
  const {
    formName,
    formEmail,
    formPassword,
    formRole,
    setSubmitting,
    setErrorMsg,
    setSuccessMsg,
  } = state;

  const validate = () => {
    if (!formName.trim()) {
      setErrorMsg("Nama lengkap harus diisi");
      return false;
    }
    if (!formEmail.trim()) {
      setErrorMsg("Email harus diisi");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formEmail)) {
      setErrorMsg("Format email tidak valid");
      return false;
    }
    if (!formPassword || formPassword.length < 8) {
      setErrorMsg("Password minimal 8 karakter");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent, router: any) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!validate()) return;

    try {
      setSubmitting(true);

      // Create user via Server Action
      await createUser(formName, formEmail, formPassword, formRole);

      // Save success email in sessionStorage to display toast on user list page
      sessionStorage.setItem("userCreatedSuccess", formEmail);

      // Redirect to user list page immediately
      router.push("/admin/users");
    } catch (err: unknown) {
      console.error("Error creating user:", err);
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(msg || "Gagal membuat pengguna. Silakan coba lagi.");
      setSubmitting(false);
    }
  };

  return {
    handleSubmit,
    validate,
  };
}
