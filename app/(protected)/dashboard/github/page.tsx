import { requireAuth } from '@/features/auth/actions/auth';
import { getInstallationStatus } from '@/features/github/server/installation';
import React from 'react';
import { DashboardHeader } from '@/features/dashboard/components/dashboard-header';
import { GithubConnectCard } from '@/features/github/components/github-connect-card';

const DashboardGithubPage = async () => {
  const seassion = await requireAuth();
  const installation = await getInstallationStatus(seassion.user.id);

  return (
    <>
      <DashboardHeader
        title="GitHub App"
        description="Install or disconnect the reviewer app on your GitHub account."
      />
      <GithubConnectCard
        userId={seassion.user.id}
        installation={installation}
      />
    </>
  );
};

export default DashboardGithubPage;
