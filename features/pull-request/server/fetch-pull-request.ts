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
