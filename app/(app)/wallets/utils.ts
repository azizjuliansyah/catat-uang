export { formatIDR } from "@/lib/utils/format";

export const getTodayDate = () => {
  return new Date().toISOString().split("T")[0];
};
