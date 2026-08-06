import type { CodeChunk } from '@/features/reviews/types/review';
import { getPineconeIndex } from '@/features/pinecone/client';

//How many chuks to put inside the prompt
const CONTEXT_RESULTS = 10;

export function buildPrNamespace(repoFullName: string, prNumber: number) {
  return `${repoFullName.replace('/', '--')}--pr-${prNumber}`;
}

export async function saveChunksToPinecone(
  namespace: string,
  chunks: CodeChunk[]
) {
  const index = getPineconeIndex();

  const records = chunks.map((chunk) => ({
    id: chunk.id,
    text: chunk.text,
    filePath: chunk.filePath,
  }));

  // namespace() scopes vectors so this PR never mixes with repo-wide sync data
  await index.namespace(namespace).upsertRecords({ records });
}

//This is the one that serches the PR context
//namespace is pinecone based namespace and qwery is a natural alnguage search
export async function searchPrContext(namespace: string, query: string) {
  const index = getPineconeIndex();

  const response = await index.namespace(namespace).searchRecords({
    query: { topK: CONTEXT_RESULTS, inputs: { text: query } },
  });

  //somehow we are filtering the best outputs but i dont know about that
  const snippets: string[] = [];

  for (const hit of response.result.hits) {
    const fields = hit.fields as { text?: string; filePath?: string };
    if (!fields.text) {
      continue;
    }

    snippets.push(`File: ${fields.filePath}\n${fields.text}`);
  }

  return snippets;
}
