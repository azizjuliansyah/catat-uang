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

interface AppContextType {
  user: User | null;
  loadingUser: boolean;
  wallets: WalletItem[];
  loadingWallets: boolean;
  categories: CategoryItem[];
  loadingCategories: boolean;
  refreshUser: () => Promise<void>;
  refreshWallets: () => Promise<void>;
  refreshCategories: () => Promise<void>;
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
        refreshUser,
        refreshWallets,
        refreshCategories,
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
