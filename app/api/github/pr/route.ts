import { getServerSession } from '@/features/auth/actions/auth';
import { getUserInstallationId } from '@/features/github/server/installation';
import { getAllPullrequests } from '@/features/pull-request/server/fetch-pull-request';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const session = await getServerSession();
  if (!session)
    return NextResponse.json(
      { error: 'No active session.Please login first' },
      { status: 401 }
    );

  const installationId = await getUserInstallationId(session.user.id);
  if (!installationId)
    return NextResponse.json(
      { error: 'GithubApp not connected' },
      { status: 401 }
    );

  const data = await getAllPullrequests(installationId);

  return NextResponse.json({ data });
}
