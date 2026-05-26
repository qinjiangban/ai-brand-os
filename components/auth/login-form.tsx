"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Building2, LoaderCircle, LogIn } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema } from "@/lib/auth/forms";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function LoginForm() {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [loading, setLoading] = useState(false);
  const [needsOrganizationName, setNeedsOrganizationName] = useState(false);

  async function bootstrapOrganization(name?: string) {
    const bootstrapResponse = await fetch("/api/auth/bootstrap", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        organizationName: name?.trim() || undefined,
      }),
    });

    const payload = (await bootstrapResponse.json().catch(() => null)) as
      | {
          error?: string;
          code?: string;
        }
      | null;

    return {
      ok: bootstrapResponse.ok,
      error: payload?.error,
      code: payload?.code,
    };
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      toast.error(result.error.issues[0]?.message ?? "请输入正确的登录信息");
      return;
    }

    if (!supabase) {
      toast.info("当前未配置 Supabase 环境变量，先进入演示模式。");
      router.replace("/dashboard");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: result.data.email,
      password: result.data.password,
    });

    if (error) {
      setLoading(false);
      toast.error(error.message);
      return;
    }

    const bootstrapResult = await bootstrapOrganization();

    if (!bootstrapResult.ok) {
      setLoading(false);

      if (bootstrapResult.code === "organization_name_required") {
        setNeedsOrganizationName(true);
        toast.info("邮箱已验证，但还缺少组织名称，请补充一次。");
        return;
      }

      toast.error(bootstrapResult.error ?? "登录成功，但初始化组织信息失败。");
      return;
    }

    setLoading(false);
    toast.success("登录成功");
    router.replace("/dashboard");
    router.refresh();
  }

  async function onCompleteOrganization(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = organizationName.trim();
    if (!name) {
      toast.error("请输入组织名称");
      return;
    }

    setLoading(true);
    const bootstrapResult = await bootstrapOrganization(name);
    setLoading(false);

    if (!bootstrapResult.ok) {
      toast.error(bootstrapResult.error ?? "初始化组织信息失败，请稍后重试。");
      return;
    }

    toast.success("组织初始化完成");
    router.replace("/billing/subscribe");
    router.refresh();
  }

  if (needsOrganizationName) {
    return (
      <Card className="border-white/10 bg-white/[0.02] shadow-none">
        <CardHeader>
          <CardTitle className="text-[28px] tracking-tight text-white">补充组织名称</CardTitle>
          <CardDescription>你的账号已验证成功，还差最后一步：填写组织名称后即可完成初始化。</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={onCompleteOrganization}>
            <div className="space-y-2">
              <Label htmlFor="organizationName">组织名称</Label>
              <Input
                id="organizationName"
                value={organizationName}
                onChange={(event) => setOrganizationName(event.target.value)}
                placeholder="例如：Coolha"
                required
              />
            </div>
            <Button className="h-11 w-full rounded-lg" disabled={loading} type="submit">
              {loading ? <LoaderCircle className="size-4 animate-spin" /> : <Building2 className="size-4" />}
              完成初始化
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-white/10 bg-white/[0.02] shadow-none">
      <CardHeader>
        <CardTitle className="text-[28px] tracking-tight text-white">登录组织工作台</CardTitle>
        <CardDescription>使用邮箱密码登录；未订阅组织会自动跳转到订阅开通页。</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-5" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email">邮箱</Label>
            <Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">密码</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>
          <Button className="h-11 w-full rounded-lg" disabled={loading} type="submit">
            {loading ? <LoaderCircle className="size-4 animate-spin" /> : <LogIn className="size-4" />}
            登录
          </Button>
        </form>
        <div className="mt-5 flex items-center justify-between text-sm text-muted-foreground">
          <span>还没有组织？</span>
          <Link className="font-medium text-white hover:text-zinc-300 hover:underline" href="/register">
            创建管理员账号
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
