import { SubscribePlans } from "@/components/auth/subscribe-plans";
import { FIRST_TRIAL_DAYS } from "@/lib/billing";
import { hasStripeEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function SubscribePage() {
  const stripeReady = hasStripeEnv();
  let trialEligible = false;

  if (stripeReady) {
    const supabase = await createSupabaseServerClient();

    if (supabase) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: membership } = await supabase
          .from("memberships")
          .select("organization_id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (membership?.organization_id) {
          const { data: subscription } = await supabase
            .from("subscriptions")
            .select("id")
            .eq("organization_id", membership.organization_id)
            .maybeSingle();

          trialEligible = !subscription;
        }
      }
    }
  }

  return <SubscribePlans demo={!stripeReady} trialDays={FIRST_TRIAL_DAYS} trialEligible={trialEligible} />;
}
