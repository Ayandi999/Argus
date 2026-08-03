import { App } from 'octokit';

let githubApp: App | null = null;

//Making  github app initialising and all
export function getGithubApp(){
    if(!githubApp){
        githubApp = new App({
            appId : process.env.GITHUB_APP_ID!,
            privateKey : process.env.GITHUB_APP_PRIVATE_KEY!.replace(/\\n/g,"\n"),
            webhooks : {
                secret : process.env.GITHUB_WEB_HOOK_SECRET!
            }
        })
    }
    return githubApp;
}

// Installaiton og github app?
export function getGithubInstallUrl(userId: string) {
    const APP_NAME = process.env.GITHUB_APP_NAME
    const url = new URL(`https://github.com/apps/${APP_NAME}/installations/new`);
    // `state` round-trips through GitHub so we can link the installation to this user.
    url.searchParams.set("state", userId);
    return url.toString();
  }
  