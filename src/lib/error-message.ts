/** Preserve messages from Error and plain API/database errors without unsafe casts. */
export function getErrorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null && "message" in error && typeof error.message === "string") {
    return error.message;
  }
  return typeof error === "string" ? error : "Unknown error";
}
