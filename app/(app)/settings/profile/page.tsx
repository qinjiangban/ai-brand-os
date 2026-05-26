import { PageHeader } from "@/components/page-header";
import { ProfileSettingsForm } from "@/components/profile-settings-form";
import { getJoinedOrganizations } from "@/lib/app/organization-data";
import { requireAppContext } from "@/lib/auth/guards";

export default async function ProfileSettingsPage() {
  const context = await requireAppContext();
  const organizations = await getJoinedOrganizations(context.user.authId);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Profile"
        title="用户资料"
        description="维护真实用户名称和业务用户 ID，页面同时展示电话号码、注册年月日，以及你当前加入的组织列表。"
      />
      <ProfileSettingsForm
        displayName={context.user.displayName}
        email={context.user.email}
        createdAt={context.user.createdAt}
        organizations={organizations}
        phone={context.user.phone}
        userId={context.user.id}
      />
    </div>
  );
}
