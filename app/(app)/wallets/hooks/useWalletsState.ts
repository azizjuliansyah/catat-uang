import { useState, useEffect, useMemo } from "react";
import { WalletItem } from "../types";
import { getNowDateTimeString } from "@/lib/utils/date";

export function useWalletsState(wallets: WalletItem[], user: any) {
  const [activeTab, setActiveTab] = useState<"active" | "archived">("active");
  const [orderedWallets, setOrderedWallets] = useState<WalletItem[]>([]);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [walletToDelete, setWalletToDelete] = useState<WalletItem | null>(null);

  // Form State - Add
  const [addName, setAddName] = useState("");
  const [addInitialBalance, setAddInitialBalance] = useState("0");
  const [addIcon, setAddIcon] = useState("Wallet");
  const [addColor, setAddColor] = useState("#0C5CAB");
  const [addIsDefault, setAddIsDefault] = useState(false);
  const [addSubmitting, setAddSubmitting] = useState(false);

  // Form State - Edit
  const [editingWallet, setEditingWallet] = useState<WalletItem | null>(null);
  const [editName, setEditName] = useState("");
  const [editIcon, setEditIcon] = useState("Wallet");
  const [editColor, setEditColor] = useState("#0C5CAB");
  const [editIsDefault, setEditIsDefault] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Form State - Transfer
  const [tfSourceId, setTfSourceId] = useState("");
  const [tfDestId, setTfDestId] = useState("");
  const [tfAmount, setTfAmount] = useState("");
  const [tfDescription, setTfDescription] = useState("");
  const [tfDate, setTfDate] = useState(getNowDateTimeString());
  const [tfSubmitting, setTfSubmitting] = useState(false);
  const [isDeleteSubmitting, setIsDeleteSubmitting] = useState(false);

  // Sync and Sort wallets based on user localStorage preference
  useEffect(() => {
    if (!wallets.length) {
      setOrderedWallets([]);
      return;
    }

    let savedOrder: string[] = [];
    if (typeof window !== "undefined" && user) {
      const saved = localStorage.getItem(`wallet-order-${user.id}`);
      if (saved) {
        try {
          savedOrder = JSON.parse(saved);
        } catch (e) {
          console.error(e);
        }
      }
    }

    // Sort wallets
    const sorted = [...wallets].sort((a, b) => {
      const indexA = savedOrder.indexOf(a.id);
      const indexB = savedOrder.indexOf(b.id);
      if (indexA === -1 && indexB === -1) return 0;
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });

    setOrderedWallets(sorted as WalletItem[]);
  }, [wallets, user]);

  // Filter wallets based on tab
  const filteredWallets = useMemo(() => {
    return orderedWallets.filter(w =>
      activeTab === "active" ? !w.is_archived : w.is_archived
    );
  }, [orderedWallets, activeTab]);

  const activeWalletsTotal = useMemo(() => {
    return wallets
      .filter(w => !w.is_archived)
      .reduce((sum, w) => sum + Number(w.balance), 0);
  }, [wallets]);

  const openEditModal = (wallet: WalletItem) => {
    setEditingWallet(wallet);
    setEditName(wallet.name);
    setEditIcon(wallet.icon);
    setEditColor(wallet.color);
    setEditIsDefault(wallet.is_default);
    setIsEditModalOpen(true);
  };

  const resetAddForm = () => {
    setAddName("");
    setAddInitialBalance("0");
    setAddIcon("Wallet");
    setAddColor("#0C5CAB");
    setAddIsDefault(false);
  };

  const openTransferModal = () => {
    const activeList = wallets.filter(w => !w.is_archived);
    if (activeList.length > 0) {
      const defaultWallet = activeList.find(w => w.is_default) || activeList[0];
      setTfSourceId(defaultWallet.id);
      setTfDestId(activeList.find(w => w.id !== defaultWallet.id)?.id || "");
    }
    setIsTransferModalOpen(true);
  };

  return {
    activeTab,
    setActiveTab,
    orderedWallets,
    setOrderedWallets,
    filteredWallets,
    activeWalletsTotal,

    isAddModalOpen,
    setIsAddModalOpen,
    isEditModalOpen,
    setIsEditModalOpen,
    isTransferModalOpen,
    setIsTransferModalOpen,
    walletToDelete,
    setWalletToDelete,

    addName,
    setAddName,
    addInitialBalance,
    setAddInitialBalance,
    addIcon,
    setAddIcon,
    addColor,
    setAddColor,
    addIsDefault,
    setAddIsDefault,
    addSubmitting,
    setAddSubmitting,

    editingWallet,
    setEditingWallet,
    editName,
    setEditName,
    editIcon,
    setEditIcon,
    editColor,
    setEditColor,
    editIsDefault,
    setEditIsDefault,
    editSubmitting,
    setEditSubmitting,

    tfSourceId,
    setTfSourceId,
    tfDestId,
    setTfDestId,
    tfAmount,
    setTfAmount,
    tfDescription,
    setTfDescription,
    tfDate,
    setTfDate,
    tfSubmitting,
    setTfSubmitting,

    isDeleteSubmitting,
    setIsDeleteSubmitting,

    openEditModal,
    resetAddForm,
    openTransferModal
  };
}
