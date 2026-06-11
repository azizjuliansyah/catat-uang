/**
 * Safely extracts a readable error message from an unknown error object,
 * handling standard JS Error instances as well as Supabase/PostgREST error payloads.
 */
export function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "object" && err !== null && "message" in err) {
    return (err as any).message;
  }
  return "Unknown error";
}
