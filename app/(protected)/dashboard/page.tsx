import React from 'react'
import { requireAuth } from '@/features/auth/actions/auth'
import { UserMenu } from '@/features/auth/components/user-menue'

const Dashboard = async () => {
  const session = await requireAuth();

  return (
    <div className="p-4 md:p-8">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <UserMenu 
          user={{ 
            name: session.user.name, 
            email: session.user.email, 
            image: session.user.image 
          }} 
          variant="profile" 
        />
      </header>
      <div className="border rounded-lg p-8 text-center text-muted-foreground">
        Welcome to your dashboard!
      </div>
    </div>
  )
}

export default Dashboard