"use client";

import { useState } from "react";
import { LoaderCircle, RotateCcw, WalletCards } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

type BillingActionsProps = {
  canManage: boolean;
  canCancel: boolean;
  canRefund: boolean;
};

export function BillingActions({ canManage, canCancel, canRefund }: BillingActionsProps) {
  const [portalLoading, setPortalLoading] = useState(false);
  const [refundLoading, setRefundLoading] = useState(false);

  async function openPortal() {
    if (!canCancel || portalLoading) return;
    setPortalLoading(true);

    const response = await fetch("/api/billing/portal", {
      method: "POST",
    });

    const payload = (await response.json().catch(() => null)) as { error?: string; url?: string } | null;
    setPortalLoading(false);

    if (!response.ok || !payload?.url) {
      toast.error(payload?.error ?? "暂时无法打开订阅管理入口");
      return;
    }

    window.location.href = payload.url;
  }

  async function requestRefund() {
    if (!canRefund || refundLoading) return;
    setRefundLoading(true);

    const response = await fetch("/api/billing/refund-request", {
      method: "POST",
    });

    const payload = (await response.json().catch(() => null)) as { error?: string; message?: string } | null;
    setRefundLoading(false);

    if (!response.ok) {
      toast.error(payload?.error ?? "提交退款申请失败");
      return;
    }

    toast.success(payload?.message ?? "退款申请已提交");
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        size="sm"
        className="border-white/10 bg-transparent hover:bg-white/[0.04]"
        disabled={!canManage || !canCancel || portalLoading}
        onClick={openPortal}
        type="button"
      >
        {portalLoading ? <LoaderCircle className="size-3.5 animate-spin" /> : <WalletCards className="size-3.5" />}
        退订
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="border-white/10 bg-transparent hover:bg-white/[0.04]"
        disabled={!canManage || !canRefund || refundLoading}
        onClick={requestRefund}
        type="button"
      >
        {refundLoading ? <LoaderCircle className="size-3.5 animate-spin" /> : <RotateCcw className="size-3.5" />}
        申请退款
      </Button>
    </div>
  );
}
