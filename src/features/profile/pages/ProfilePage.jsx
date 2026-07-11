import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProfileQuery } from '@/features/profile/queries/useProfileQuery';
import { useLoginHistoryQuery } from '@/features/profile/queries/useLoginHistoryQuery';
import { useDepartmentsQuery } from '@/features/departments/queries/useDepartmentsQuery';
import { useDesignationsQuery } from '@/features/designations/queries/useDesignationsQuery';
import { useUpdateProfile } from '@/features/profile/mutations/useUpdateProfile';
import { useChangePassword } from '@/features/profile/mutations/useChangePassword';
import { ProfileForm } from '@/features/profile/components/ProfileForm';
import { ChangePasswordForm } from '@/features/profile/components/ChangePasswordForm';
import { LoginHistoryTable } from '@/features/profile/components/LoginHistoryTable';
import { BaseCard, CardBody } from '@/components/ui/BaseCard';
import { Tabs } from '@/layouts/components/Tabs';
import { DEFAULT_PAGE_SIZE } from '@/config/constants';

const TABS = [
  { key: 'profile', label: 'Profile' },
  { key: 'password', label: 'Password' },
  { key: 'login-history', label: 'Login History' },
];

export function ProfilePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loginHistoryPage, setLoginHistoryPage] = useState(1);
  const [loginHistoryPageSize, setLoginHistoryPageSize] = useState(DEFAULT_PAGE_SIZE);

  const { data: profile } = useProfileQuery(user?.id);
  const { data: departmentsData } = useDepartmentsQuery({ pageSize: 100 });
  const { data: designationsData } = useDesignationsQuery({ pageSize: 100 });
  const { data: loginHistory, isLoading: loginHistoryLoading } = useLoginHistoryQuery(user?.id, {
    page: loginHistoryPage,
    pageSize: loginHistoryPageSize,
  });
  const updateProfile = useUpdateProfile(user?.id);
  const changePassword = useChangePassword();

  const departmentName = departmentsData?.data.find((d) => d.id === profile?.departmentId)?.name;
  const designationTitle = designationsData?.data.find((d) => d.id === profile?.designationId)?.title;

  return (
    <div className="flex flex-col gap-3">
      <div>
        <h1 className="text-xl font-semibold text-text">My Profile</h1>
        <p className="text-sm text-text-muted">Manage your personal details, password and login activity.</p>
      </div>

      <Tabs tabs={TABS} activeKey={activeTab} onChange={setActiveTab} />

      <BaseCard>
        <CardBody>
          {activeTab === 'profile' && (
            <ProfileForm
              user={profile}
              departmentName={departmentName}
              designationTitle={designationTitle}
              onSubmit={(values) => updateProfile.mutate(values)}
              isSubmitting={updateProfile.isPending}
            />
          )}

          {activeTab === 'password' && (
            <ChangePasswordForm onSubmit={(values) => changePassword.mutate(values)} isSubmitting={changePassword.isPending} />
          )}

          {activeTab === 'login-history' && (
            <LoginHistoryTable
              entries={loginHistory?.data ?? []}
              total={loginHistory?.total ?? 0}
              page={loginHistoryPage}
              pageSize={loginHistoryPageSize}
              isLoading={loginHistoryLoading}
              onPageChange={setLoginHistoryPage}
              onPageSizeChange={(size) => {
                setLoginHistoryPageSize(size);
                setLoginHistoryPage(1);
              }}
            />
          )}
        </CardBody>
      </BaseCard>
    </div>
  );
}
