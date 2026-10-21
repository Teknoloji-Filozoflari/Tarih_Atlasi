/** Only internal symbolic codes may reach developer diagnostics; no raw URLs or payloads. */
export function dataErrorCode(error: unknown): string {
  return error instanceof Error && /^[A-Z][A-Z0-9_]{1,79}$/u.test(error.message)
    ? error.message
    : 'DATA_LOAD_FAILED';
}
