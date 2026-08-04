import { inngest } from '@/features/inngest/client';
import { prisma } from '@/lib/db';
import { getPullRequestFiles } from './pr-files';
import { chunkPrFiles } from '../utils/chunk-code';

export const reviewPullRequest = inngest.createFunction(
  {
    id: 'review-pull-request',
    triggers: { event: 'github/pr.recived' },
  },
  async ({ event, step }) => {
    const pullRequestId = event.data.pullRequestId;
    const pullRequest = await step.run('mark-processing', async () => {
      return prisma.pullRequest.update({
        where: {
          id: pullRequestId,
        },
        data: {
          status: 'processing',
        },
      });
    });

    const chunks = await step.run('breakdown-code', async () => {
      const files = await getPullRequestFiles(
        pullRequest.installationId,
        pullRequest.repoFullName,
        pullRequest.prNumber
      );
      return chunkPrFiles(pullRequest.prNumber,files)
    });
  }
);
