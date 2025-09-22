import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useSession } from '@/lib/auth-client'
import { useEffect } from 'react'
import Navbar from '../components/Navbar'

export const Route = createFileRoute('/protected')({
  component: RouteComponent,
})

function RouteComponent() {
  const session = useSession()
  const navigate = useNavigate()

  useEffect(() => {
    if (!session.data && !session.isPending) {
      navigate({
        to: '/login',
        search: {
          redirect: '/protected', // optional: redirect back after login
        },
      })
    }
    console.log('Session state:', session)
    console.log('Session data:', session.data)
    console.log('Session error:', session.error)
    console.log('Session isPending:', session.isPending)
  }, [session.data, session.isPending, navigate])


  if (session.isPending) {
    return null
  }

  if (!session.data) {
    return null
  }

  return (
    <div>
      <Navbar />
      <div>Hello "/protected"!</div>
      <div>Welcome, {session.data.user?.email || 'User'}!</div>
    </div>
  )
}