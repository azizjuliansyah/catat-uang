import { SavingGoal, ETAInfo } from "./types";

import { formatIDR } from "@/lib/utils/format";
export { formatIDR };

export const calculateETAInfo = (goal: SavingGoal): ETAInfo => {
  const remaining = goal.target_amount - goal.current_amount;
  if (remaining <= 0) {
    return { status: "achieved", msg: "Target Tercapai!" };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(goal.target_date);
  target.setHours(0, 0, 0, 0);

  const msDiff = target.getTime() - today.getTime();
  const daysDiff = Math.ceil(msDiff / (1000 * 60 * 60 * 24));

  if (daysDiff <= 0) {
    return {
      status: "late",
      msg: "Lewat batas target tanggal",
      needed: `Butuh Rp ${formatIDR(remaining)} untuk lunas`
    };
  }

  // Weekly contribution required
  const weeksRemaining = Math.max(1, daysDiff / 7);
  const requiredWeekly = Math.round(remaining / weeksRemaining);

  // Monthly contribution required
  const monthsRemaining = Math.max(1, daysDiff / 30);
  const requiredMonthly = Math.round(remaining / monthsRemaining);

  return {
    status: "ongoing",
    daysLeft: daysDiff,
    msg: `${daysDiff} hari lagi`,
    requiredWeekly,
    requiredMonthly
  };
};

import { getNowDateTimeString } from "@/lib/utils/date";

export const getDefaultTargetDate = () => {
  const d = new Date();
  d.setMonth(d.getMonth() + 6);
  return getNowDateTimeString(d);
};

export const getTodayDate = () => {
  return getNowDateTimeString();
};
