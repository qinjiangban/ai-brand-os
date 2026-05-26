"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Building2, LoaderCircle, MailCheck } from "lucide-react";
import { toast } from "sonner";

import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerSchema } from "@/lib/auth/forms";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils";

export function RegisterForm() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [organizationName, setOrganizationName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const result = registerSchema.safeParse({ organizationName, email, password });
    if (!result.success) {
      toast.error(result.error.issues[0]?.message ?? "请检查输入内容");
      return;
    }

    if (!supabase) {
      toast.info("当前未配置 Supabase，已跳转到演示工作台。");
      return;
    }

    setLoading(true);

    const signUp = await supabase.auth.signUp({
      email: result.data.email,
      password: result.data.password,
      options: {
        data: {
          organization_name: result.data.organizationName,
        },
      },
    });

    if (signUp.error) {
      setLoading(false);
      toast.error(signUp.error?.message ?? "注册失败");
      return;
    }

    setLoading(false);
    setPendingEmail(result.data.email);
    toast.success("注册成功，请查收邮件并完成邮箱验证。");
  }

  if (pendingEmail) {
    return (
      <Card className="border-white/10 bg-white/[0.02] shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-[28px] tracking-tight text-white">
            <MailCheck className="size-7" />
            查收验证邮件
          </CardTitle>
          <CardDescription>已为你的管理员账号创建注册申请，完成邮箱验证后再登录即可自动初始化组织。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-4 text-sm leading-6 text-zinc-300">
            验证邮件已发送至 <span className="font-medium text-white">{pendingEmail}</span>。请点击邮件中的确认链接，验证完成后回到登录页继续。
          </div>
          <div className="grid gap-3 text-sm text-muted-foreground">
            <p>如果几分钟内没有收到邮件，请检查垃圾邮件箱，或确认 Supabase 已启用邮箱发送配置。</p>
            <p>完成验证后，首次登录会自动创建组织、管理员 membership，并跳转到订阅开通页。</p>
          </div>
          <div className="flex gap-3">
            <Link
              className={cn(buttonVariants({ className: "h-11 flex-1 rounded-lg" }))}
              href="/login"
            >
              前往登录
            </Link>
            <Button
              className="h-11 rounded-lg"
              onClick={() => {
                setPendingEmail(null);
                setPassword("");
              }}
              type="button"
              variant="outline"
            >
              重新填写
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-white/10 bg-white/[0.02] shadow-none">
      <CardHeader>
        <CardTitle className="text-[28px] tracking-tight text-white">创建组织管理员账号</CardTitle>
        <CardDescription>提交后将发送邮箱验证邮件，验证通过后首次登录会自动初始化组织并进入订阅流程。</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-5" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="organizationName">组织名称</Label>
            <Input
              id="organizationName"
              value={organizationName}
              onChange={(event) => setOrganizationName(event.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="registerEmail">邮箱</Label>
            <Input
              id="registerEmail"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="registerPassword">密码</Label>
            <Input
              id="registerPassword"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>
          <Button className="h-11 w-full rounded-lg" disabled={loading} type="submit">
            {loading ? <LoaderCircle className="size-4 animate-spin" /> : <Building2 className="size-4" />}
            创建组织
          </Button>
        </form>
        <div className="mt-5 flex items-center justify-between text-sm text-muted-foreground">
          <span>已有账号？</span>
          <Link className="font-medium text-white hover:text-zinc-300 hover:underline" href="/login">
            返回登录
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
