import { Metadata } from 'next'
import React from 'react'
import { GithubSignIn } from './components/github-sign-in'

export const metadata: Metadata = {
    title: "Sign in",
    description: "Sign in to your account"
}

type SigninPageProps = {
    searchParams: Promise<{callbackUrl?: string}>  
}

const SignInPage = async ({searchParams}: SigninPageProps) => {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <GithubSignIn />
    </div>
  )
}

export default SignInPage