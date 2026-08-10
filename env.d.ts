declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string;
      BETTER_AUTH_SECRET: string;
      BETTER_AUTH_URL: string;
      GITHUB_APP_NAME: string;
      GITHUB_APP_ID: string;
      GITHUB_CLIENT_ID: string;
      GITHUB_CLIENT_SECRET: string;
      GITHUB_WEB_HOOK_SECRET: string;
      GITHUB_APP_PRIVATE_KEY: string;
      INNGEST_DEV: string;
      OPENROUTER_AI_KEY: string;
      PINECONE_INDEX: string;
      PINECONE_API_KEY: string;
      RAZORPAY_API_SECRET: string;
      RAZORPAY_PLAN_ID: string;
      NEXT_PUBLIC_RAZORPAY_API_KEY?: string;
      RAZORPAY_WEBHOOK_SECRET?: string;
    }
  }
}

// Convert this file into a module to ensure the global declaration works properly
export {};
