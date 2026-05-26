import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("请输入有效邮箱"),
  password: z.string().min(8, "密码至少 8 位"),
});

export const registerSchema = loginSchema.extend({
  organizationName: z.string().min(2, "组织名称至少 2 个字符"),
});

export const inviteSchema = z.object({
  email: z.string().email("请输入有效邮箱"),
  role: z.enum(["admin", "member", "analyst"]),
});

export const passwordResetSchema = z.object({
  password: z.string().min(8, "密码至少 8 位"),
});
