import { createFileRoute, redirect } from '@tanstack/react-router'
import { getSession } from '@/lib/auth-client'
import Navbar from '../components/Navbar'

export const Route = createFileRoute('/protected')({
  loader: async () => {
    const session = await getSession()
    
    if (!session.data?.user) {
      throw redirect({
        to: '/login',
        search: {
          redirect: '/protected',
        },
      })
    }
    
    return { session: session.data }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { session } = Route.useLoaderData()

  return (
    <div>
      <Navbar />
      <div>Hello "/protected"!</div>
      <div>Welcome, {session.user?.email || 'User'}!</div>
    </div>
  )
}