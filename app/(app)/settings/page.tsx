"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { getIconComponent } from "@/lib/utils/icons";
import {
  User,
  Plus,
  Edit2,
  Trash2,
  Check,
  AlertCircle,
  X,
  Camera,
  FolderMinus,
  Settings as SettingsIcon,
  HelpCircle
} from "lucide-react";

interface Category {
  id: string;
  user_id: string;
  name: string;
  type: "income" | "expense";
  icon: string;
  color: string;
  created_at: string;
}

interface UserProfile {
  id: string;
  name: string;
  avatar_url: string;
  role: string;
  status: string;
}

const PRESET_COLORS = [
  { name: "Emerald", hex: "#10B981" },
  { name: "Blue", hex: "#3B82F6" },
  { name: "Indigo", hex: "#6366F1" },
  { name: "Purple", hex: "#8B5CF6" },
  { name: "Pink", hex: "#EC4899" },
  { name: "Red", hex: "#EF4444" },
  { name: "Orange", hex: "#F59E0B" },
  { name: "Gray", hex: "#6B7280" }
];

const PRESET_ICONS = [
  "Briefcase",
  "TrendingUp",
  "Utensils",
  "Car",
  "ShoppingBag",
  "FileText",
  "Film",
  "HelpCircle"
];

export default function SettingsPage() {
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState<"profile" | "categories">("profile");
  const [categoryType, setCategoryType] = useState<"expense" | "income">("expense");

  // User Profile States
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileName, setProfileName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);

  // Categories States
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Category Modal States
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [catName, setCatName] = useState("");
  const [catIcon, setCatIcon] = useState("HelpCircle");
  const [catColor, setCatColor] = useState("#10B981");
  const [catSubmitting, setCatSubmitting] = useState(false);

  // Delete Category Modal States
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [deletingCat, setDeletingCat] = useState(false);

  // Feedback Messages
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Clear messages after 3 seconds
  useEffect(() => {
    if (errorMsg || successMsg) {
      const timer = setTimeout(() => {
        setErrorMsg(null);
        setSuccessMsg(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [errorMsg, successMsg]);

  useEffect(() => {
    async function loadData() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        setUser(authUser);
        
        // Fetch user profile from public.users table
        const { data: prof, error: profError } = await supabase
          .from("users")
          .select("*")
          .eq("id", authUser.id)
          .single();
        
        if (prof) {
          setProfile(prof);
          setProfileName(prof.name || "");
          setAvatarUrl(prof.avatar_url || "");
        } else {
          setProfileName(authUser.user_metadata?.name || authUser.email || "");
        }

        // Fetch categories
        await fetchCategories();
      }
    }
    loadData();
  }, [supabase]);

  async function fetchCategories() {
    setCategoriesLoading(true);
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name", { ascending: true });

    if (!error && data) {
      setCategories(data);
    }
    setCategoriesLoading(false);
  }

  // Handle Profile Update (Name & Avatar url already uploaded)
  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    setProfileSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const { error } = await supabase
        .from("users")
        .update({
          name: profileName,
          updated_at: new Date().toISOString()
        })
        .eq("id", user.id);

      if (error) throw error;

      // Also update auth user metadata name so it updates globally
      await supabase.auth.updateUser({
        data: { name: profileName }
      });

      setSuccessMsg("Profil berhasil diperbarui!");
      // Reload layout profile metadata
      window.location.reload();
    } catch (err: any) {
      console.error("Error updating profile:", err);
      setErrorMsg("Gagal memperbarui profil: " + err.message);
    } finally {
      setProfileSaving(false);
    }
  }

  // Handle Avatar Upload
  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg("Ukuran file maksimal adalah 2MB");
      return;
    }

    setUploading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/avatar-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      // Update in users table immediately
      const { error: updateError } = await supabase
        .from("users")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);

      if (updateError) throw updateError;

      // Also update auth user metadata
      await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      });

      setAvatarUrl(publicUrl);
      setSuccessMsg("Foto profil berhasil diperbarui!");
    } catch (err: any) {
      console.error("Error uploading avatar:", err);
      setErrorMsg("Gagal mengupload avatar: " + err.message);
    } finally {
      setUploading(false);
    }
  }

  // Handle Category Add/Update Form
  async function handleCategorySubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    if (!catName.trim()) {
      setErrorMsg("Nama kategori wajib diisi");
      return;
    }

    setCatSubmitting(true);
    setErrorMsg(null);

    try {
      if (editingCategory) {
        // Edit category
        const { error } = await supabase
          .from("categories")
          .update({
            name: catName.trim(),
            icon: catIcon,
            color: catColor
          })
          .eq("id", editingCategory.id);

        if (error) throw error;
        setSuccessMsg(`Kategori "${catName}" berhasil diperbarui!`);
      } else {
        // Add new category
        const { error } = await supabase
          .from("categories")
          .insert({
            user_id: user.id,
            name: catName.trim(),
            type: categoryType,
            icon: catIcon,
            color: catColor
          });

        if (error) throw error;
        setSuccessMsg(`Kategori "${catName}" berhasil ditambahkan!`);
      }

      setIsCategoryModalOpen(false);
      setCatName("");
      setEditingCategory(null);
      await fetchCategories();
    } catch (err: any) {
      console.error("Error saving category:", err);
      setErrorMsg("Gagal menyimpan kategori: " + err.message);
    } finally {
      setCatSubmitting(false);
    }
  }

  // Handle Delete Category
  async function handleCategoryDelete() {
    if (!categoryToDelete) return;

    setDeletingCat(true);
    setErrorMsg(null);

    try {
      const { error } = await supabase
        .from("categories")
        .delete()
        .eq("id", categoryToDelete.id);

      if (error) throw error;

      setSuccessMsg(`Kategori "${categoryToDelete.name}" berhasil dihapus.`);
      setCategoryToDelete(null);
      await fetchCategories();
    } catch (err: any) {
      console.error("Error deleting category:", err);
      setErrorMsg("Gagal menghapus kategori: " + err.message);
    } finally {
      setDeletingCat(false);
    }
  }

  const filteredCategories = categories.filter((c) => c.type === categoryType);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-primary animate-spin-slow" />
          Pengaturan Keuangan
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Kelola profil pengguna Anda dan buat kategori transaksi pemasukan atau pengeluaran.
        </p>
      </div>

      {/* Alert Banner */}
      {errorMsg && (
        <div className="bg-danger/10 border border-danger/20 text-danger px-4 py-3 rounded-lg flex items-start gap-3 animate-fade-in">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span className="text-xs font-medium">{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="bg-success/10 border border-success/20 text-success px-4 py-3 rounded-lg flex items-start gap-3 animate-fade-in">
          <Check className="w-5 h-5 shrink-0 mt-0.5" />
          <span className="text-xs font-medium">{successMsg}</span>
        </div>
      )}

      {/* Tabs Selector */}
      <div className="border-b border-border flex gap-4">
        <button
          onClick={() => setActiveTab("profile")}
          className={`pb-3 text-sm font-semibold border-b-2 px-1 transition-all cursor-pointer ${
            activeTab === "profile"
              ? "border-primary text-primary"
              : "border-transparent text-text-secondary hover:text-text-primary"
          }`}
        >
          Profil Pengguna
        </button>
        <button
          onClick={() => setActiveTab("categories")}
          className={`pb-3 text-sm font-semibold border-b-2 px-1 transition-all cursor-pointer ${
            activeTab === "categories"
              ? "border-primary text-primary"
              : "border-transparent text-text-secondary hover:text-text-primary"
          }`}
        >
          Kategori Transaksi
        </button>
      </div>

      {/* Content Area */}
      {activeTab === "profile" ? (
        <div className="bg-surface-card border border-border rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-text-primary mb-6">Sunting Profil</h2>
          
          <form onSubmit={handleProfileSave} className="space-y-6">
            {/* Avatar Upload */}
            <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-border/50">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full overflow-hidden border border-border bg-surface-input flex items-center justify-center text-text-secondary text-2xl font-bold font-mono">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    profileName ? profileName[0].toUpperCase() : <User className="w-8 h-8" />
                  )}
                </div>
                <label className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Camera className="w-6 h-6 text-white" />
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleAvatarUpload}
                    disabled={uploading}
                  />
                </label>
              </div>
              <div className="text-center sm:text-left space-y-1">
                <p className="text-sm font-semibold text-text-primary">Foto Profil</p>
                <p className="text-xs text-text-secondary">
                  Format JPEG, PNG, atau WEBP. Maksimum 2MB.
                </p>
                {uploading && (
                  <span className="text-xxs text-primary font-medium animate-pulse">
                    Sedang mengunggah...
                  </span>
                )}
              </div>
            </div>

            {/* Email (Readonly) */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-text-secondary block">Email (Tidak dapat diubah)</label>
              <input
                type="email"
                readOnly
                value={user?.email || ""}
                className="w-full px-3.5 py-2.5 bg-surface-disabled border border-border rounded-lg text-text-secondary text-sm outline-none cursor-not-allowed"
              />
            </div>

            {/* Full Name */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-text-secondary block">Nama Lengkap</label>
              <input
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                placeholder="Masukkan nama lengkap"
                className="w-full px-3.5 py-2.5 bg-surface-input border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-lg text-text-primary text-sm outline-none transition-all"
                required
              />
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={profileSaving || uploading}
                className="px-6 py-2.5 bg-primary hover:bg-primary-hover disabled:bg-primary/50 text-white font-semibold text-sm rounded-lg transition-colors cursor-pointer flex items-center gap-2"
              >
                {profileSaving ? "Menyimpan..." : "Simpan Profil"}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Subtabs Expense/Income Selector */}
          <div className="flex justify-between items-center bg-surface-card border border-border rounded-xl p-4 shadow-sm">
            <div className="flex gap-2">
              <button
                onClick={() => setCategoryType("expense")}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  categoryType === "expense"
                    ? "bg-expense/15 text-expense border border-expense/30"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
                }`}
              >
                Pengeluaran
              </button>
              <button
                onClick={() => setCategoryType("income")}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  categoryType === "income"
                    ? "bg-income/15 text-income border border-income/30"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
                }`}
              >
                Pemasukan
              </button>
            </div>

            <button
              onClick={() => {
                setEditingCategory(null);
                setCatName("");
                setCatIcon("HelpCircle");
                setCatColor(categoryType === "expense" ? "#EF4444" : "#10B981");
                setIsCategoryModalOpen(true);
              }}
              className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Kategori Baru
            </button>
          </div>

          {/* Categories List */}
          {categoriesLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 animate-pulse">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 bg-surface-card rounded-xl border border-border" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filteredCategories.map((cat) => {
                const IconComponent = getIconComponent(cat.icon);
                return (
                  <div
                    key={cat.id}
                    className="bg-surface-card border border-border hover:border-border-strong rounded-xl p-4 flex items-center justify-between shadow-sm hover:shadow transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                        style={{ backgroundColor: cat.color }}
                      >
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-text-primary truncate max-w-[130px]">
                          {cat.name}
                        </p>
                        <p className="text-xxs text-text-secondary capitalize">
                          {cat.type === "expense" ? "Pengeluaran" : "Pemasukan"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setEditingCategory(cat);
                          setCatName(cat.name);
                          setCatIcon(cat.icon);
                          setCatColor(cat.color);
                          setIsCategoryModalOpen(true);
                        }}
                        className="p-1.5 text-text-secondary hover:text-primary hover:bg-surface-hover rounded-md transition-colors cursor-pointer"
                        title="Edit Kategori"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setCategoryToDelete(cat)}
                        className="p-1.5 text-text-secondary hover:text-danger hover:bg-danger/10 rounded-md transition-colors cursor-pointer"
                        title="Hapus Kategori"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {filteredCategories.length === 0 && (
                <div className="col-span-full bg-surface-card border border-border border-dashed rounded-xl p-8 text-center space-y-2">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-surface-input text-text-secondary">
                    <FolderMinus className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-semibold text-text-primary">
                    Belum ada kategori
                  </h3>
                  <p className="text-xs text-text-secondary max-w-xs mx-auto">
                    Tambahkan kategori baru untuk memisahkan pengeluaran atau pemasukan Anda secara detail.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-surface-card border border-border rounded-xl max-w-md w-full p-6 shadow-2xl space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-text-primary">
                {editingCategory ? "Sunting Kategori" : "Kategori Baru"}
              </h3>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="text-text-secondary hover:text-text-primary p-1 rounded-md hover:bg-surface-hover transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCategorySubmit} className="space-y-5">
              {/* Name */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-text-secondary block">Nama Kategori</label>
                <input
                  type="text"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="Contoh: Belanja Bulanan"
                  className="w-full px-3.5 py-2.5 bg-surface-input border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-lg text-text-primary text-sm outline-none transition-all"
                  required
                />
              </div>

              {/* Icon Selector */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-text-secondary block">Pilih Ikon</label>
                <div className="grid grid-cols-4 gap-3 bg-surface-input border border-border p-3 rounded-lg max-h-40 overflow-y-auto">
                  {PRESET_ICONS.map((iconName) => {
                    const IconComp = getIconComponent(iconName);
                    return (
                      <button
                        key={iconName}
                        type="button"
                        onClick={() => setCatIcon(iconName)}
                        className={`p-2.5 rounded-lg flex items-center justify-center hover:bg-surface-hover transition-colors cursor-pointer border ${
                          catIcon === iconName
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-transparent text-text-secondary"
                        }`}
                      >
                        <IconComp className="w-5 h-5" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Color Selector */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-text-secondary block">Pilih Warna</label>
                <div className="flex flex-wrap gap-2.5 bg-surface-input border border-border p-3 rounded-lg">
                  {PRESET_COLORS.map((col) => (
                    <button
                      key={col.hex}
                      type="button"
                      onClick={() => setCatColor(col.hex)}
                      className={`w-7 h-7 rounded-full transition-all cursor-pointer flex items-center justify-center border-2 ${
                        catColor.toLowerCase() === col.hex.toLowerCase()
                          ? "border-text-primary scale-110 shadow-sm"
                          : "border-transparent hover:scale-105"
                      }`}
                      style={{ backgroundColor: col.hex }}
                      title={col.name}
                    >
                      {catColor.toLowerCase() === col.hex.toLowerCase() && (
                        <Check className="w-3.5 h-3.5 text-white stroke-[3px]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2.5 bg-surface-hover border border-border hover:border-border-strong text-text-secondary text-sm font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={catSubmitting}
                  className="px-5 py-2.5 bg-primary hover:bg-primary-hover disabled:bg-primary/50 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  {catSubmitting ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {categoryToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-surface-card border border-border rounded-xl max-w-sm w-full p-6 shadow-2xl space-y-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-danger/10 text-danger mb-2">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-text-primary">
                Hapus Kategori?
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Apakah Anda yakin ingin menghapus kategori <strong>{categoryToDelete.name}</strong>? Semua transaksi yang berhubungan akan disetel tanpa kategori ("Lainnya").
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCategoryToDelete(null)}
                className="flex-1 px-4 py-2.5 bg-surface-hover border border-border hover:border-border-strong text-text-secondary text-sm font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleCategoryDelete}
                disabled={deletingCat}
                className="flex-1 px-4 py-2.5 bg-danger hover:bg-danger-hover disabled:bg-danger/50 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
              >
                {deletingCat ? "Menghapus..." : "Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
