import { getNowDateTimeString } from "@/lib/utils/date";

import { formatIDR } from "@/lib/utils/format";
export { formatIDR };

export const getTodayDate = () => {
  return getNowDateTimeString();
};

export const getDefaultDueDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return getNowDateTimeString(d);
};

export const isOverdue = (dateStr: string | null) => {
  if (!dateStr) return false;
  const now = new Date();
  const dueDate = new Date(dateStr);
  return dueDate < now;
};
