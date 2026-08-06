'use server';

import { redirect } from 'next/navigation';
import { getServerSession } from '../../auth/actions/auth';
import { getUserInstallationId } from '../../github/server/installation';
import { DASHBOARD_ROUTES } from '../../dashboard/lib/routes';
import { triggerRepoSync } from '../server/rerpo-sync';

export async function syncRepoCodeBase(repoFullName: string, branch: string) {
  const session = await getServerSession();
  if (!session) redirect('/sign-in');

  const installationId = await getUserInstallationId(session.user.id);

  if (!installationId) redirect(DASHBOARD_ROUTES.github);

  await triggerRepoSync(installationId, repoFullName, branch);
}
