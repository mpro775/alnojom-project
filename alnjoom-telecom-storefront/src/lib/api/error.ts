import type { ApiValidationIssue } from "./contracts";

export type ApiErrorKind = "http" | "validation" | "network" | "unauthorized" | "rate_limit";

export class ApiError extends Error {
  readonly status: number | null;
  readonly code: string | null;
  readonly kind: ApiErrorKind;
  readonly validation: ApiValidationIssue[];

  constructor(input: {
    message: string;
    status?: number | null;
    code?: string | null;
    kind?: ApiErrorKind;
    validation?: ApiValidationIssue[];
  }) {
    super(input.message);
    this.name = "ApiError";
    this.status = input.status ?? null;
    this.code = input.code ?? null;
    this.kind = input.kind ?? "http";
    this.validation = input.validation ?? [];
  }

  static async fromResponse(response: Response): Promise<ApiError> {
    const payload = await readErrorPayload(response);
    const message = pickMessage(payload) ?? response.statusText ?? "Request failed";
    const code = pickString(payload, "code") ?? pickString(payload, "errorCode");
    const validation = pickValidation(payload);
    const kind: ApiErrorKind =
      response.status === 401
        ? "unauthorized"
        : response.status === 429
          ? "rate_limit"
          : validation.length > 0
            ? "validation"
            : "http";

    return new ApiError({ message, status: response.status, code, kind, validation });
  }

  static network(error: unknown): ApiError {
    return new ApiError({
      message: error instanceof Error ? error.message : "Network request failed",
      kind: "network",
    });
  }
}

async function readErrorPayload(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return { message: text };
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function pickString(value: unknown, key: string): string | null {
  if (!isObject(value)) return null;
  const candidate = value[key];
  return typeof candidate === "string" && candidate.trim() ? candidate.trim() : null;
}

function pickMessage(value: unknown): string | null {
  if (!isObject(value)) return null;
  const message = value.message;
  if (typeof message === "string") return message;
  if (Array.isArray(message)) {
    const messages = message.filter((item): item is string => typeof item === "string");
    return messages.length > 0 ? messages.join("، ") : null;
  }
  const error = value.error;
  return typeof error === "string" ? error : null;
}

function pickValidation(value: unknown): ApiValidationIssue[] {
  if (!isObject(value)) return [];
  const candidates = value.validationErrors ?? value.errors ?? value.message;
  if (!Array.isArray(candidates)) return [];
  return candidates.flatMap((item) => {
    if (typeof item === "string") return [{ message: item }];
    if (!isObject(item)) return [];
    const message = pickString(item, "message");
    if (!message) return [];
    const field = pickString(item, "field") ?? pickString(item, "property");
    return [{ ...(field ? { field } : {}), message }];
  });
}

export function userSafeError(error: unknown, locale: "ar" | "en"): string {
  if (error instanceof ApiError) {
    if (error.kind === "network") {
      return locale === "ar" ? "تعذّر الاتصال بالخدمة. حاول مرة أخرى." : "Could not reach the service. Try again.";
    }
    if (error.kind === "unauthorized") {
      return locale === "ar" ? "انتهت الجلسة. سجّل الدخول من جديد." : "Your session expired. Sign in again.";
    }
    if (error.kind === "rate_limit") {
      return locale === "ar" ? "محاولات كثيرة. انتظر قليلًا ثم أعد المحاولة." : "Too many attempts. Please wait and retry.";
    }
    return error.message;
  }
  return locale === "ar" ? "حدث خطأ غير متوقع." : "An unexpected error occurred.";
}
