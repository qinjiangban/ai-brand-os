import { describe, expect, it } from "vitest";

import { loginSchema, registerSchema } from "../lib/auth/forms";

describe("auth forms", () => {
  it("accepts valid login payload", () => {
    const result = loginSchema.safeParse({
      email: "admin@coolha.local",
      password: "Password123!",
    });

    expect(result.success).toBe(true);
  });

  it("rejects invalid register payload", () => {
    const result = registerSchema.safeParse({
      organizationName: "A",
      email: "not-an-email",
      password: "123",
    });

    expect(result.success).toBe(false);
  });
});
