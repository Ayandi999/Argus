<div align="center">
  <img src="public/logo.png" alt="Project Argus Logo" width="200" />

  <h1>Project Argus</h1>
  
  <p>An advanced automated PR review and analysis agent.</p>

  <img src="https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens" alt="Better Auth" />
  <img src="https://img.shields.io/badge/Razorpay-02042B?style=for-the-badge&logo=razorpay&logoColor=white" alt="Razorpay" />
  <img src="https://img.shields.io/badge/github-%23121011.svg?style=for-the-badge&logo=github&logoColor=white" alt="Octokit" />
  <img src="https://img.shields.io/badge/pinecone-%23000000.svg?style=for-the-badge&logo=pinecone&logoColor=white" alt="Pinecone" />
  <img src="https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="TailwindCSS" />
  <img src="https://img.shields.io/badge/Framer-black?style=for-the-badge&logo=framer&logoColor=blue" alt="Framer Motion" />
  <img src="https://img.shields.io/badge/vercel-%23000000.svg?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel" />
  <img src="https://img.shields.io/badge/Inngest-black?style=for-the-badge&logo=inngest&logoColor=white" alt="Inngest" />
  <img src="https://img.shields.io/badge/OpenRouter-412991?style=for-the-badge&logo=openrouter&logoColor=white" alt="OpenRouter" />
</div>

## About

Project Argus is a full-fledged, AI-enabled Pull Request review agent designed to elevate your team's code quality and review speed. Unlike standard automated reviewers, Argus achieves deep, repository-wide understanding by syncing your entire project context into a Pinecone vector database using advanced embeddings. This allows the agent to provide highly contextual, accurate, and insightful feedback on every PR, ensuring that reviews are not just syntactically correct, but also aligned with your broader codebase architecture.

<p align="center">
  <img src="public/Screenshot%202026-08-19%20191941.png" alt="Argus Dashboard Screenshot 1" width="48%" />
  &nbsp;
  <img src="public/Screenshot%202026-08-19%20192420.png" alt="Argus Dashboard Screenshot 3" width="48%" />
</p>

![Argus Dashboard Screenshot 2](public/Screenshot%202026-08-19%20191953.png)

## Prerequisites

Before getting started, ensure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [pnpm](https://pnpm.io/installation) (The package manager used for this project)

## Getting Started

To get the project running locally, follow these steps:

```bash
# Clone the repository
git clone https://github.com/Ayandi999/Argus.git

# Navigate to the project directory
cd Argus

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
```

Next, open the newly created `.env` file and configure your credentials:

### 1. Database Setup
Go to any PostgreSQL database provider (like Neon or Supabase), create a new database, copy the connection URL, and set it as `DATABASE_URL`.

### 2. Better Auth Setup
Generate a random secret by running:
```bash
openssl rand -base64 32
```
Set the output as `BETTER_AUTH_SECRET`. Then, set `BETTER_AUTH_URL` to your app's base URL (e.g., `http://localhost:3000` for local development).

### 3. Local Webhooks (Ngrok)
To run locally, you need to expose your server to the internet for webhooks. Install and configure [ngrok](https://ngrok.com/), then run the following in a separate terminal:
```bash
ngrok http 3000
```
Keep this running and copy the generated forwarding URL—you will need this URL for the next step!

### 4. GitHub App Setup
1. Go to your **GitHub Account Settings** -> **Developer Settings** -> **GitHub Apps**.
2. Click **New GitHub App** and fill in the required information.
3. For the **Webhook URL**, paste the Ngrok forwarding URL you copied in the previous step.
4. Once created, gather the following details from your app settings and add them to your `.env` file:
   - `GITHUB_APP_NAME`
   - `GITHUB_APP_ID`
   - `GITHUB_CLIENT_ID`
   - `GITHUB_CLIENT_SECRET`
   - `GITHUB_WEB_HOOK_SECRET` (the secret you set when creating the webhook)
   - `GITHUB_APP_PRIVATE_KEY` (generate a new private key and paste the contents)

### 5. AI Integration (OpenRouter)
To power the AI-driven PR reviews, head over to [OpenRouter](https://openrouter.ai/), create an account, and generate a new API key. Drop that key into your `.env` file under `OPENROUTER_AI_KEY`.

### 6. Vector Database (Pinecone)
Create an account on [Pinecone](https://www.pinecone.io/) and create a new Index.

> [!WARNING]  
> When creating the index, **only** provide a name and click create. Do not change any of the default settings (like dimensions or metric type). Modifying these defaults can cause issues when generating and fetching vectors later!

Once created, grab your API key and the exact index name, and add them to your `.env` file:
- `PINECONE_API_KEY`
- `PINECONE_INDEX`

### 7. Payments Setup (Razorpay)
Finally, create an account on [Razorpay](https://razorpay.com/) and ensure your dashboard is set to **Test Mode**. Generate your test API keys and set up a test plan, then add these details to your `.env` file:
- `RAZORPAY_API_KEY`
- `RAZORPAY_API_SECRET`
- `RAZORPAY_PLAN_ID`

## 🚀 Ready to Go!

Once everything is configured in your `.env` file, you are all set! Open up three separate terminal windows in your project directory and run the following:

**Terminal 1 (Next.js Application):**
```bash
pnpm approve-builds
pnpm dev
```

**Terminal 2 (Ngrok for Webhooks):**
```bash
ngrok http 3000
```

**Terminal 3 (Inngest Background Jobs):**
```bash
npx inngest-cli@latest dev
```

### 🕵️‍♂️ Monitoring Your App

With all three terminals running, you're officially ready to go!
- **The Application**: You can view and interact with your app locally at [http://localhost:3000](http://localhost:3000). *(The Ngrok URL simply exists to route GitHub webhooks to your local machine).*
- **Background Jobs**: You can monitor all PR processing and background tasks by opening the Inngest Dev Dashboard at [http://localhost:8288](http://localhost:8288).

### 🎉 Enjoy the Project!

That's it, the project is live! A few final things to keep in mind to ensure everything runs smoothly:
- **Crucial Step**: Making an account on your local instance and installing the GitHub Agent you created earlier is an absolute **MUST**. The app will not function without it!
- Once all the services are up and running, and the app is connected, you can start reviewing PRs seamlessly.
- You can watch the output of the reviews happening in real-time inside the **Inngest** dashboard (`http://localhost:8288`).
- If you are syncing any repositories to Pinecone, the syncing progress and UI can also be monitored directly from the Inngest local server.

Have fun building and reviewing! 

---

## 💬 Contact & Support

If you run into any issues, have feature requests, or just want to connect, feel free to reach out! You can find all my contact information on my [GitHub Profile](https://github.com/Ayandi999). 

If you enjoyed the project, consider giving it a star on GitHub and giving me a shoutout on LinkedIn!

---
<p align="center">01010100 01101000 01100101 00100000 01000101 01101110 01100100</p>

---
