import type { ApiErrorBody } from "./types";

const FALLBACK_MESSAGE = "Something went wrong. Please try again.";

/** An error response from the API, in its standard `{ error }` shape. */
export class ApiError extends Error {
  override readonly name = "ApiError";

  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details: { field?: string; messages: string[] }[] = [],
    readonly requestId?: string,
  ) {
    super(message);
  }

  /** Messages for one form field, for `<TextField errors>`. */
  fieldErrors(field: string): string[] | undefined {
    const messages = this.details
      .filter((detail) => detail.field === field)
      .flatMap((detail) => detail.messages);
    return messages.length > 0 ? messages : undefined;
  }

  static async fromResponse(response: Response): Promise<ApiError> {
    const body = (await response
      .json()
      .catch(() => null)) as ApiErrorBody | null;
    if (body?.error && typeof body.error.code === "string") {
      return new ApiError(
        response.status,
        body.error.code,
        body.error.message || FALLBACK_MESSAGE,
        body.error.details ?? [],
        body.error.requestId,
      );
    }
    if (response.status === 429) {
      return new ApiError(
        429,
        "RATE_LIMITED",
        "Too many attempts. Please wait a moment and try again.",
      );
    }
    return new ApiError(response.status, "UNKNOWN", FALLBACK_MESSAGE);
  }

  static network(): ApiError {
    return new ApiError(
      0,
      "NETWORK_ERROR",
      "Can’t reach the server. Check your connection and try again.",
    );
  }
}

/** A user-facing message for any thrown value. */
export function messageOf(error: unknown): string {
  return error instanceof ApiError ? error.message : FALLBACK_MESSAGE;
}
