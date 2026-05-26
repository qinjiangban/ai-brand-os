import { z } from "zod";

const serverSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID: z.string().min(1).optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  STRIPE_SECRET_KEY: z.string().min(1).optional(),
  STRIPE_WEBHOOK_SECRET: z.string().min(1).optional(),
  STRIPE_PRICE_ID_MONTH: z.string().min(1).optional(),
  STRIPE_PRICE_ID_YEAR: z.string().min(1).optional(),
  APP_ENCRYPTION_KEY: z.string().min(32).optional(),
});

const runtimeEnv = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID:
    process.env.NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID,
  SUPABASE_SERVICE_ROLE_KEY:
    typeof window === "undefined"
      ? process.env.SUPABASE_SERVICE_ROLE_KEY
      : undefined,
  STRIPE_SECRET_KEY:
    typeof window === "undefined" ? process.env.STRIPE_SECRET_KEY : undefined,
  STRIPE_WEBHOOK_SECRET:
    typeof window === "undefined"
      ? process.env.STRIPE_WEBHOOK_SECRET
      : undefined,
  STRIPE_PRICE_ID_MONTH:
    typeof window === "undefined"
      ? process.env.STRIPE_PRICE_ID_MONTH
      : undefined,
  STRIPE_PRICE_ID_YEAR:
    typeof window === "undefined"
      ? process.env.STRIPE_PRICE_ID_YEAR
      : undefined,
  APP_ENCRYPTION_KEY:
    typeof window === "undefined" ? process.env.APP_ENCRYPTION_KEY : undefined,
};

const parsed = serverSchema.safeParse(runtimeEnv);

if (!parsed.success) {
  console.warn("环境变量格式校验未通过，开发环境将继续运行。");
}

export const env = (parsed.success ? parsed.data : runtimeEnv) as z.infer<
  typeof serverSchema
>;

export function hasSupabaseEnv() {
  return Boolean(
    env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export function hasStripeEnv() {
  return Boolean(
    env.STRIPE_SECRET_KEY &&
    env.STRIPE_PRICE_ID_MONTH &&
    env.STRIPE_PRICE_ID_YEAR,
  );
}

export function hasStripePricingTableEnv() {
  return Boolean(
    env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY &&
    env.NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID,
  );
}
