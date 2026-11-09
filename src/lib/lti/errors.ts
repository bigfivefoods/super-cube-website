/** A protocol or configuration failure with a status the browser can show. */
export class LtiProtocolError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "LtiProtocolError";
  }
}

export function asProtocolError(error: unknown): LtiProtocolError {
  if (error instanceof LtiProtocolError) return error;
  return new LtiProtocolError(500, "error", "Super-Cube® could not open this launch. Ask your LMS administrator to check the platform registration.");
}
