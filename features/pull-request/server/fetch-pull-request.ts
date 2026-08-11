import { prisma } from '@/lib/db';

export async function getAllPullRequests() {
  const prs = await prisma.pullRequest.findMany({
    select: {
      repoFullName: true,
      title: true,
      authorLogin: true,
      baseBranch: true,
      status: true,
      reviewComment: true,
    },
  });
  return prs;
}
