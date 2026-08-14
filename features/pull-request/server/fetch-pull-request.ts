'use server';
import { inngest } from '@/features/inngest/client';
import { prisma } from '@/lib/db';

//list all the PRs that the user has
export async function getAllPullrequests(installationId: number) {
  const data = await prisma.pullRequest.findMany({
    where: {
      installationId: installationId,
    },
    select: {
      id: true,
      repoFullName: true,
      prNumber: true,
      title: true,
      authorLogin: true,
      baseBranch: true,
      status: true,
      reviewComment: true,
      reviewedAt: true,
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });

  return data;
}

//this is a function which helps to revaluate PR if for some reason agent falied to do so.
export async function reevaluatePr(pullrequestid: string) {
  await inngest.send({
    name: 'github/pr.received',
    data: {
      pullRequestId: pullrequestid,
    },
  });
}
