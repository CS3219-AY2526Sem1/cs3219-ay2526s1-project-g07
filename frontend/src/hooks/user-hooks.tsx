import { useSession } from '@/lib/auth-client'
import { useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'

export function useCurrentUser() {
  const { data, isPending, error, refetch } = useSession()

  return {
    user: data?.user,
    isPending,
    error,
    refetch,
    data
  }
}

export function redirectIfNotAuthenticated() {
  const { user, isPending } = useCurrentUser()
  const navigate = useNavigate()
  useEffect(() => {
    // console.log('Protected route session:', session)   
    if (isPending) return // Wait until we know the auth status

    if (!user) {
      navigate({ to: '/login' })
    } 
  }, [user])
}

export function redirectIfAuthenticated() {
  const { user, isPending } = useCurrentUser()
  const navigate = useNavigate()
  useEffect(() => {
    // console.log('Protected route session:', session)   
    if (isPending) return // Wait until we know the auth status

    if (user) {
      navigate({ to: '/home' })
    } 
  }, [user])
}