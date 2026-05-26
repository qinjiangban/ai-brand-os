import { ReactNode } from "react";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: ReactNode;
};

export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-3xl">
        {eyebrow ? <div className="text-[11px] tracking-[0.2em] text-muted-foreground uppercase">{eyebrow}</div> : null}
        <h1 className="mt-2 text-[28px] leading-none font-semibold tracking-tight text-white">{title}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      {actions ? <div className="flex items-center gap-3">{actions}</div> : null}
    </div>
  );
}
