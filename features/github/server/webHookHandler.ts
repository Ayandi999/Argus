//verifying if this update was ment for me or not

import { getGithubApp } from '../utils/github-app';
import { savePullRequest } from '@/features/reviews/server/save-pll-request';
import { inngest } from '@/features/inngest/client';

//Basically we chenck if it's sent using the webhook secret we added or not
async function isSignatureValid({
  payload,
  signature,
}: {
  payload: string;
  signature: string | null;
}) {
  if (!signature) return false;
  const app = getGithubApp();
  return app.webhooks.verify(payload, signature);
}

export type PullReqestWebHookPayload = {
  action: string;
  installation: { id: number };
  repository: { full_name: string };
  pull_request: {
    number: number;
    title: string;
    user: { login: string } | null;
    head: { sha: string };
    base: { ref: string };
  };
};
//These are the only actions we care about and we review
const REVIEWABLE_ACTIONS = ['opened', 'synchronize', 'reopen'];

export async function handleGithubWebHook(request: Request) {
  //Basically when github sends the webhook updates it sends in a pirticular formant
  //To know more either print or read SJ noton notes

  const payload = await request.text();
  const signature = request.headers.get('x-hub-signature-256');
  const eventName = request.headers.get('x-hub-event');

  const isValid = await isSignatureValid({ payload, signature });

  if (!isValid)
    return Response.json(
      { error: { message: 'Invalid signature.' } },
      { status: 401 }
    );

  //We are only handling PRs so we need to check here but we can do this for any other even we are handling as well
  if (eventName !== 'pull_request') return Response.json({ recived: true });

  const event = JSON.parse(payload) as PullReqestWebHookPayload;

  if (!REVIEWABLE_ACTIONS.includes(event.action))
    return Response.json({ recived: true });

  const pullRequest = await savePullRequest(event);

  //This was added by AI need to review this before final draft
  await inngest.send({
    name: 'github/pr.recived',
    data: {
      pullRequestId: pullRequest.id,
    },
  });

  return Response.json({ success: true });
}
