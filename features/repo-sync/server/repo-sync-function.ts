import { inngest } from '@/features/inngest/client';
import { prisma } from '@/lib/db';
import {
  buildRepoNamespace,
  chunkRepoFiles,
  deleteRepoNamespace,
  getRepoFiles,
  saveRepoChunks,
} from './rerpo-sync';

export const syncRepoCodebaseFunction = inngest.createFunction(
  {
    id: 'sync-repo-codebas',
    triggers: { event: 'repo/sync.requested' },
    onFailure: async ({ event }) => {
      await prisma.repoSync.update({
        where: { id: event.data.event.data.repoSyncId },
        data: { status: 'failed' },
      });
    },
  },
  async ({ event, step }) => {
    const repoSyncId = event.data.repoSyncId;

    //update files status to synginc in db
    const repoSync = await step.run('mark-syncing', async () => {
      return prisma.repoSync.update({
        where: { id: repoSyncId },
        data: { status: 'fetching' },
      });
    });

    const chunks = await step.run('fetch-and-chunk-codebase', async () => {
      const files = await getRepoFiles(
        repoSync.installationId,
        repoSync.repoFullName,
        repoSync.branch
      );

      return chunkRepoFiles(files);
    });

    await step.run('mark-saving', async () => {
      return prisma.repoSync.update({
        where: { id: repoSyncId },
        data: { status: 'memorizing' },
      });
    });

    const namespace = buildRepoNamespace(repoSync.repoFullName);

    if (repoSync.syncedAt) {
      await step.run('delete-old-vectors', async () => {
        await deleteRepoNamespace(namespace);
      });
    }

    await step.run('save-vectors-to-pinecone', async () => {
      await saveRepoChunks(namespace, chunks);
    });

    await step.run('mark-synced', async () => {
      await prisma.repoSync.update({
        where: { id: repoSyncId },
        data: {
          status: 'synced',
          syncedAt: new Date(),
          chunkCount: chunks.length,
        },
      });
    });

    return {
      repoSyncId,
      status: 'synced',
      chunkCount: chunks.length,
    };
  }
);

export { buildRepoNamespace };
