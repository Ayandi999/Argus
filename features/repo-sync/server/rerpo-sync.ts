import { CodeChunk } from '@/features/reviews/types/review';
import { RepoFile } from '../types';
import { getGithubApp } from '@/features/github/utils/github-app';
import { getPineconeIndex } from '@/features/pinecone/client';
import { prisma } from '@/lib/db';
import { inngest } from '@/features/inngest/client';

//Size constraints on file
const MAX_FILE_SIZE_BYTES = 100_000;
const MAX_FILES = 200;
const MAX_CHUNK_LINES = 80;
const UPSERT_BATCH_SIZE = 90;

//just ensuringwhich files we should  consider to review
const CODE_EXTENSIONS = [
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.mjs',
  '.py',
  '.go',
  '.rb',
  '.rs',
  '.java',
  '.kt',
  '.swift',
  '.c',
  '.h',
  '.cpp',
  '.cs',
  '.php',
  '.sql',
  '.prisma',
  '.css',
  '.md',
  '.yml',
  '.yaml',
];

//Skip these files no need to make embeddings for these
const SKIPPED_FOLDERS = [
  'node_modules/',
  'dist/',
  'build/',
  '.next/',
  'generated/',
  'vendor/',
];

type TreeEntry = {
  path?: string;
  type?: string;
  sha?: string;
  size?: number;
};

//making name space question is IDK what this one does
export function buildRepoNamespace(repoFullName: string) {
  // facebook/react -> facebook--react--codebase [To index it for retrival]
  return `${repoFullName.replace('/', '--')}--codebase`;
}

//Is it a file i should be reviewing
function hasCodeExtension(path: string) {
  return CODE_EXTENSIONS.some((extension) => path.endsWith(extension));
}

//should i skip this or not
function isSkippedPath(path: string) {
  return SKIPPED_FOLDERS.some((folder) => path.includes(folder));
}

//is this file indexable should i make vector embeddings based on size
function isIndexableFile(entry: TreeEntry) {
  //blob mean file and tree mean folder we just want files
  if (entry.type !== 'blob' || !entry.path || !entry.sha) {
    return false;
  }

  //Is this too big to index
  if (entry.size && entry.size > MAX_FILE_SIZE_BYTES) {
    return false;
  }

  if (isSkippedPath(entry.path)) {
    return false;
  }

  return hasCodeExtension(entry.path);
}

//Generated a chunk id[helper function]
function buildChunkId(filePath: string, part: number) {
  return `repo--${filePath}--part-${part}`;
}

export function chunkRepoFiles(files: RepoFile[]): CodeChunk[] {
  const chunks: CodeChunk[] = [];

  for (const file of files) {
    const lines = file.content.split('\n');

    for (let start = 0; start < lines.length; start += MAX_CHUNK_LINES) {
      const part = start / MAX_CHUNK_LINES; //calculating part number
      const text = lines.slice(start, start + MAX_CHUNK_LINES).join('\n'); //Select the 80 lines then put them together with \n

      if (text.trim().length === 0) continue;

      chunks.push({
        id: buildChunkId(file.filePath, part),
        filePath: file.filePath,
        text,
      });
    }
  }

  return chunks;
}

export async function getRepoFiles(
  installationId: number,
  repoFullName: string,
  branch: string
): Promise<RepoFile[]> {
  const app = getGithubApp();
  const octokit = await app.getInstallationOctokit(installationId);
  const [owner, repo] = repoFullName.split('/');

  //Getting file name from github and revurssive 1 mean go inside every folder and give me evry file name
  const { data: tree } = await octokit.request(
    'GET /repos/{owner}/{repo}/git/trees/{tree_sha}',
    { owner, repo, tree_sha: branch, recursive: '1' }
  );

  //Is this a files i want to index also we ensure we are not overloaidn our pinecoe so we did the slice thing only read the first 200 files no matter how many files there are
  const entries = tree.tree.filter(isIndexableFile).slice(0, MAX_FILES);

  const files: RepoFile[] = [];

  //Loop through the files and download there content by making a request to the hub
  for (const entry of entries) {
    const { data: blob } = await octokit.request(
      'GET /repos/{owner}/{repo}/git/blobs/{file_sha}',
      { owner, repo, file_sha: entry.sha! }
    );

    const content = Buffer.from(blob.content, 'base64').toString('utf-8');
    files.push({ filePath: entry.path!, content });
  }

  return files;
}

export async function deleteRepoNamespace(namespace: string) {
  const index = getPineconeIndex();
  await index.deleteNamespace(namespace);
}

export async function saveRepoChunks(namespace: string, chunks: CodeChunk[]) {
  const index = getPineconeIndex(); //this is just the variable to access pinecone

  for (let start = 0; start < chunks.length; start += UPSERT_BATCH_SIZE) {
    const batch = chunks.slice(start, start + UPSERT_BATCH_SIZE);

    const records = batch.map((chunk) => ({
      id: chunk.id,
      text: chunk.text,
      filePath: chunk.filePath,
    }));

    //We don't need to send the records to open ai anymore to get embeddings pinecone on upserting generates the vector embeddings on it own
    await index.namespace(namespace).upsertRecords({ records });
  }
}

//frontend rendering function
export async function getRepoSyncStatuses(repoFullNames: string[]) {
  const syncs = await prisma.repoSync.findMany({
    where: { repoFullName: { in: repoFullNames } },
    select: { repoFullName: true, status: true },
  });

  const statusByRepo: Record<string, string> = {};

  for (const sync of syncs) {
    statusByRepo[sync.repoFullName] = sync.status;
  }

  return statusByRepo;
}

export async function triggerRepoSync(
  installationId: number,
  repoFullName: string,
  branch: string
) {
  const repoSync = await prisma.repoSync.upsert({
    where: { repoFullName },
    create: { installationId, repoFullName, branch, status: 'pending' },
    update: { installationId, branch, status: 'pending' },
  });

  await inngest.send({
    name: 'repo/sync.requested',
    data: { repoSyncId: repoSync.id },
  });
}
