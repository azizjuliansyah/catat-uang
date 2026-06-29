/**
 * Date and Time utilities for CatatUang
 */

/**
 * Returns current date and time formatted for `<input type="datetime-local">` (YYYY-MM-DDTHH:MM) in local timezone
 */
export const getNowDateTimeString = (date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

/**
 * Formats a timestamp/date string for `<input type="datetime-local">` (YYYY-MM-DDTHH:MM)
 */
export const formatForDateTimeInput = (dateStr: string | null | undefined): string => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  return getNowDateTimeString(d);
};

/**
 * Returns current date in YYYY-MM-DD format in local timezone
 */
export const getTodayDateString = (date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Formats a date string to display short date and time (e.g., "10 Jun • 15:04")
 */
export const formatDateTimeShort = (dateStr: string | null | undefined): string => {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "-";
  
  const datePart = d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short"
  });
  
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  
  return `${datePart} • ${hours}:${minutes}`;
};

/**
 * Formats a date string to display long date and time (e.g., "Rabu, 10 Juni 2026 • 15:04")
 */
export const formatDateTimeLong = (dateStr: string | null | undefined): string => {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "-";

  const datePart = d.toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");

  return `${datePart} • ${hours}:${minutes}`;
};

/**
 * Formats a date string to display long date only (e.g., "Rabu, 10 Juni 2026")
 */
export const formatDateLong = (dateStr: string | null | undefined): string => {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "-";

  return d.toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });
};

/**
 * Formats a date to Indonesian locale with custom options
 */
export const formatDateIndo = (
  date: Date,
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  }
): string => {
  return date.toLocaleDateString("id-ID", options);
};
