import type { GithubInstallationStatus } from '@/features/dashboard/lib/types';
import { getGithubApp } from '@/features/github/utils/github-app';
import { prisma } from '@/lib/db';

//If logged in then do this
function getAccountLogin(
  account: { login?: string; slug?: string } | null | undefined
): string | null {
  if (!account) {
    return null;
  }

  if ('login' in account && account.login) {
    return account.login;
  }

  if (account.slug) {
    return account.slug;
  }

  return null;
}
function buildDisconnectedStatus(): GithubInstallationStatus {
  return { connected: false, accountLogin: null, installedAt: null };
}

//Checks if we alredy have any installation at all
export async function getInstallationStatus(userId: string) {
  const installation = await prisma.githubInstallation.findUnique({
    where: {
      userId,
    },
  });

  //This is if app is not installed what to return
  if (!installation) {
    return buildDisconnectedStatus();
  }

  //If app is installed what to  do
  return {
    connected: true,
    accountLogin: installation.accountLogin,
    installedAt: installation.createdAt.toISOString(),
  };
}

//This is go to DB and make a new installation instance
export async function saveInstallation(userId: string, installationId: number) {
  const app = getGithubApp();

  //This is just asking octokit for app data.
  const { data } = await app.octokit.request(
    'GET /app/installations/{installation_id}',
    { installation_id: installationId }
  );

  const accountLogin = getAccountLogin(data.account);

  //if data exist then update otherwise create thit is upsert query
  await prisma.githubInstallation.upsert({
    where: { userId },
    create: {
      userId,
      installationId,
      accountLogin,
      accountType: data.target_type ?? null,
    },
    update: {
      installationId,
      accountLogin,
      accountType: data.target_type ?? null,
    },
  });
}

// Disconnecting app
export async function deleteInstallation(userId: string) {
  await prisma.githubInstallation.delete({ where: { userId } });
}


export async function getUserIdByInstallationId(installationId: number) {
  const installation = await prisma.githubInstallation.findFirst({
    where: { installationId },
    select: { userId: true },
  });

  if (!installation) {
    return null;
  }

  return installation.userId;
}

export async function getUserInstallationId(userId: string) {
  const installation = await prisma.githubInstallation.findUnique({
    where: { userId },
    select: { installationId: true },
  });

  if (!installation) {
    return null;
  }

  return installation.installationId;
}
