export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh bg-background">
      <div className="hidden w-[48%] border-r border-white/10 px-10 py-10 lg:flex lg:flex-col lg:justify-between">
        <div>
          <div className="text-xs tracking-[0.22em] text-muted-foreground uppercase">GEO Platform</div>
          <h1 className="mt-8 max-w-[540px] text-5xl leading-[1.02] font-semibold tracking-tight text-white">
            更像 Vercel 控制台的企业级 GEO 运营后台。
          </h1>
          <p className="mt-6 max-w-[520px] text-base leading-8 text-zinc-400">
            统一管理导入、内容生成、审核、发布与分析，用克制的黑白界面承载高密度业务信息。
          </p>
        </div>
        <div className="grid gap-3">
          {[
            "单邮箱单组织 + 单组织单订阅",
            "敏感词审核必须人工确认后才落版本",
            "AI Token 按模块与任务记录成本",
          ].map((item) => (
            <div key={item} className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-4 text-sm text-zinc-300">
              {item}
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6 lg:px-10">
        <section className="w-full max-w-[440px]">{children}</section>
      </div>
    </div>
  );
}
