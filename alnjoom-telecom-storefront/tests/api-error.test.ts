import { describe, expect, it } from "vitest";
import { ApiError, userSafeError } from "@/lib/api/error";

describe("API error normalization", () => {
  it("preserves checkout domain codes and safe backend messages", async () => {
    const error = await ApiError.fromResponse(new Response(JSON.stringify({ code: "CART_EMPTY", message: "Cart is empty" }), { status: 400, headers: { "Content-Type": "application/json" } }));
    expect(error.status).toBe(400);
    expect(error.code).toBe("CART_EMPTY");
    expect(error.message).toBe("Cart is empty");
  });
  it("maps validation and session errors", async () => {
    const validation = await ApiError.fromResponse(new Response(JSON.stringify({ message: ["phone must be shorter"] }), { status: 400 }));
    expect(validation.kind).toBe("validation");
    const unauthorized = await ApiError.fromResponse(new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 }));
    expect(userSafeError(unauthorized, "ar")).toContain("الجلسة");
  });
});
