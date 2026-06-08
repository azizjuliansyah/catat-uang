import {
  Briefcase,
  TrendingUp,
  Utensils,
  Car,
  ShoppingBag,
  FileText,
  Film,
  HelpCircle,
  Wallet,
  CreditCard,
  Banknote,
  Coins,
  PiggyBank,
  Building,
  Smartphone,
  Plus,
  ArrowRightLeft,
  Settings,
  User,
  LogOut,
  ChevronDown,
  Menu,
  X,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Edit2,
  Archive,
  ArrowUpRight,
  ArrowDownRight,
  TrendingDown,
  Eye,
  EyeOff,
  Star,
  Check
} from "lucide-react";

export const iconMap = {
  // Category Icons
  Briefcase,
  TrendingUp,
  Utensils,
  Car,
  ShoppingBag,
  FileText,
  Film,
  HelpCircle,
  
  // Wallet Icons
  Wallet,
  CreditCard,
  Banknote,
  Coins,
  PiggyBank,
  Building,
  Smartphone,
  
  // Misc/Others
  Plus,
  ArrowRightLeft,
  Settings,
  User,
  LogOut,
  ChevronDown,
  Menu,
  X,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Edit2,
  Archive,
  ArrowUpRight,
  ArrowDownRight,
  TrendingDown,
  Eye,
  EyeOff,
  Star,
  Check
};

export type IconName = keyof typeof iconMap;

export function getIconComponent(name: string) {
  // Fallback to HelpCircle if icon is not found
  return iconMap[name as IconName] || HelpCircle;
}
