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

//Checks if user is alredy connected to github by looking at our DB table
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

//This is the most important one
//This is go to DB and make a new installation instance
export async function saveInstallation(userId: string, installationId: number) {
  const app = getGithubApp();

  //This is just using octokit to ask github for app data using the installation id we got from redirect
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
  //I need access to github app as well to delete from github
  // app.octokit.rest.apps.deleteInstallation({intallationId})
  const appData = await prisma.githubInstallation.findFirst({
    where: { userId },
    select: { installationId: true },
  });
  if (appData?.installationId) {
    try {
      const app = getGithubApp();

      await app.octokit.rest.apps.deleteInstallation({
        installation_id: appData.installationId,
      });
      console.log('gituhub app was successfully removed.');
    } catch (e) {
      console.log('Failed to remove the github app.');
    }
  }
  await prisma.githubInstallation.delete({ where: { userId } });
}

//This one is important for webhooks because if my app is installed then github sends all webhook request to my server directly
//I need to know who the user assossiated with the app is to reditrect the user over there
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

//This one needed when i need to do some changes to github that's all
//returns the installation id assossiated with the user.
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
