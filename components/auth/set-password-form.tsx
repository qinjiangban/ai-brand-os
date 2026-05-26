"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, LoaderCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { passwordResetSchema } from "@/lib/auth/forms";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

function extractHashParams(hash: string) {
  const raw = hash.startsWith("#") ? hash.slice(1) : hash;
  const params = new URLSearchParams(raw);

  return {
    accessToken: params.get("access_token"),
    refreshToken: params.get("refresh_token"),
  };
}

export function SetPasswordForm() {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const result = passwordResetSchema.safeParse({ password });
    if (!result.success) {
      toast.error(result.error.issues[0]?.message ?? "请输入有效密码");
      return;
    }

    if (!supabase) {
      toast.info("当前未配置 Supabase，直接进入演示工作台。");
      router.replace("/dashboard");
      return;
    }

    const { accessToken, refreshToken } = extractHashParams(window.location.hash);
    if (accessToken && refreshToken) {
      await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: result.data.password });
    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("密码设置成功");
    router.replace("/dashboard");
    router.refresh();
  }

  return (
    <Card className="border-white/10 bg-white/[0.02] shadow-none">
      <CardHeader>
        <CardTitle className="text-[28px] tracking-tight text-white">首次设置密码</CardTitle>
        <CardDescription>成员受邀后需先设置密码，之后才能进入组织工作台。</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-5" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="newPassword">新密码</Label>
            <Input
              id="newPassword"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>
          <Button className="h-11 w-full rounded-lg" disabled={loading} type="submit">
            {loading ? <LoaderCircle className="size-4 animate-spin" /> : <KeyRound className="size-4" />}
            保存并进入系统
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
