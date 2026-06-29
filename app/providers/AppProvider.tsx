"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";

export interface WalletItem {
  id: string;
  user_id: string;
  name: string;
  balance: number;
  initial_balance: number;
  icon: string;
  color: string;
  is_default: boolean;
  is_archived: boolean;
  created_at: string;
}

export interface CategoryItem {
  id: string;
  user_id: string;
  name: string;
  type: "income" | "expense";
  icon: string;
  color: string;
  created_at: string;
}

export interface PaylaterPlatformItem {
  id: string;
  user_id: string;
  name: string;
  limit_amount: number;
  balance: number;
  billing_cycle_date: number;
  due_date_offset: number;
  icon: string;
  color: string;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface TransactionTemplateItem {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  type: "income" | "expense";
  category_id: string | null;
  wallet_id: string | null;
  paylater_id: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface AppContextType {
  user: User | null;
  loadingUser: boolean;
  wallets: WalletItem[];
  loadingWallets: boolean;
  categories: CategoryItem[];
  loadingCategories: boolean;
  paylaterPlatforms: PaylaterPlatformItem[];
  loadingPaylaterPlatforms: boolean;
  templates: TransactionTemplateItem[];
  loadingTemplates: boolean;
  refreshUser: () => Promise<void>;
  refreshWallets: () => Promise<void>;
  refreshCategories: () => Promise<void>;
  refreshPaylaterPlatforms: () => Promise<void>;
  refreshTemplates: () => Promise<void>;
  isInstallable: boolean;
  isInstalled: boolean;
  triggerInstallPrompt: () => Promise<boolean>;
  isCreateTransactionModalOpen: boolean;
  setIsCreateTransactionModalOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [wallets, setWallets] = useState<WalletItem[]>([]);
  const [loadingWallets, setLoadingWallets] = useState(false);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [paylaterPlatforms, setPaylaterPlatforms] = useState<PaylaterPlatformItem[]>([]);
  const [loadingPaylaterPlatforms, setLoadingPaylaterPlatforms] = useState(false);
  const [templates, setTemplates] = useState<TransactionTemplateItem[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [isCreateTransactionModalOpen, setIsCreateTransactionModalOpen] = useState(false);

  // PWA Installation state
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if running in standalone mode (already installed)
    const checkStandalone = () => {
      if (typeof window !== "undefined") {
        const isStandaloneMode =
          window.matchMedia("(display-mode: standalone)").matches ||
          (window.navigator as any).standalone ||
          document.referrer.includes("android-app://");
        setIsInstalled(isStandaloneMode);
      }
    };

    checkStandalone();

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent default prompt behavior
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsInstallable(false);
      setIsInstalled(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const triggerInstallPrompt = async () => {
    if (!deferredPrompt) {
      console.warn("PWA install prompt is not available yet.");
      return false;
    }
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      setDeferredPrompt(null);
      setIsInstallable(false);
      
      return outcome === "accepted";
    } catch (err) {
      console.error("Error triggering PWA install prompt:", err);
      return false;
    }
  };

  const refreshUser = async () => {
    try {
      setLoadingUser(true);
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        setUser(null);
      } else {
        setUser(user);
      }
    } catch (err) {
      console.error("Error in refreshUser:", err);
      setUser(null);
    } finally {
      setLoadingUser(false);
    }
  };

  const refreshWallets = async () => {
    try {
      setLoadingWallets(true);
      const { data, error } = await supabase
        .from("wallets")
        .select("*")
        .order("name", { ascending: true });

      if (!error && data) {
        setWallets(data as WalletItem[]);
      }
    } catch (err) {
      console.error("Error in refreshWallets:", err);
    } finally {
      setLoadingWallets(false);
    }
  };

  const refreshCategories = async () => {
    try {
      setLoadingCategories(true);
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name", { ascending: true });

      if (!error && data) {
        setCategories(data as CategoryItem[]);
      }
    } catch (err) {
      console.error("Error in refreshCategories:", err);
    } finally {
      setLoadingCategories(false);
    }
  };

  const refreshPaylaterPlatforms = async () => {
    try {
      setLoadingPaylaterPlatforms(true);
      const { data, error } = await supabase
        .from("paylater_platforms")
        .select("*")
        .order("name", { ascending: true });

      if (!error && data) {
        setPaylaterPlatforms(data as PaylaterPlatformItem[]);
      }
    } catch (err) {
      console.error("Error in refreshPaylaterPlatforms:", err);
    } finally {
      setLoadingPaylaterPlatforms(false);
    }
  };

  const refreshTemplates = async () => {
    try {
      setLoadingTemplates(true);
      const { data, error } = await supabase
        .from("transaction_templates")
        .select("*")
        .order("name", { ascending: true });

      if (!error && data) {
        setTemplates(data as TransactionTemplateItem[]);
      }
    } catch (err) {
      console.error("Error in refreshTemplates:", err);
    } finally {
      setLoadingTemplates(false);
    }
  };

  // On mount: fetch user and set up auth listener
  useEffect(() => {
    refreshUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        setUser(null);
        setWallets([]);
        setCategories([]);
        setPaylaterPlatforms([]);
        setTemplates([]);
      }
      setLoadingUser(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch wallets and categories when user changes
  useEffect(() => {
    if (user) {
      refreshWallets();
      refreshCategories();
      refreshPaylaterPlatforms();
      refreshTemplates();
    }
  }, [user]);

  return (
    <AppContext.Provider
      value={{
        user,
        loadingUser,
        wallets,
        loadingWallets,
        categories,
        loadingCategories,
        paylaterPlatforms,
        loadingPaylaterPlatforms,
        templates,
        loadingTemplates,
        refreshUser,
        refreshWallets,
        refreshCategories,
        refreshPaylaterPlatforms,
        refreshTemplates,
        isInstallable,
        isInstalled,
        triggerInstallPrompt,
        isCreateTransactionModalOpen,
        setIsCreateTransactionModalOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
