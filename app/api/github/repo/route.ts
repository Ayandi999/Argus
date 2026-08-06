import { getServerSession } from '@/features/auth/actions/auth';
import { getUserInstallationId } from '@/features/github/server/installation';
import { getInstallationReposPage } from '@/features/github/server/repos';
import { getRepoSyncStatuses } from '@/features/repo-sync/server/rerpo-sync';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const session = await getServerSession();
  if (!session)
    return NextResponse.json({ error: 'unauthorized access' }, { status: 401 });

  const installationId = await getUserInstallationId(session.user.id);

  if (!installationId)
    return NextResponse.json(
      { error: 'GithubApp not connected' },
      { status: 401 }
    );

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get('page')));

  const data = await getInstallationReposPage(Number(installationId), page);
  const repoFullNames = data.repos.map((i) => i.fullName);
  const syncStatus = await getRepoSyncStatuses(repoFullNames);

  const repos = data.repos.map((repo) => ({
    ...repo,
    syncStatus: syncStatus[repo.fullName],
  }));

  return NextResponse.json({ ...data, repos });
}
