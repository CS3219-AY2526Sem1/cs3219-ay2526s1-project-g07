import { useSession } from '@/lib/auth-client'
import { useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

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

export async function checkIsAdmin(userId: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/user/checkAdmin/${userId}`)
    
    if (!response.ok) {
      console.error('Failed to check admin status')
      return false
    }

    const data = await response.json()
    return data.isAdmin === true
  } catch (error) {
    console.error('Error checking admin status:', error)
    return false
  }
}

export function useIsAdmin() {
  const { user, isPending } = useCurrentUser()
  const [isAdmin, setIsAdmin] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    async function checkAdmin() {
      // Still loading if auth is pending
      if (isPending) {
        setIsLoading(true)
        return
      }

      if (!user?.id) {
        setIsAdmin(false)
        setIsLoading(false)
        return
      }

      const adminStatus = await checkIsAdmin(user.id)
      setIsAdmin(adminStatus)
      setIsLoading(false)
    }

    checkAdmin()
  }, [user?.id, isPending])

  return { isAdmin, isLoading }
}

export function useProfileImage(userId: string | undefined) {
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProfileImage() {
      if (!userId) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        const response = await fetch(`/api/user/getUserData/${userId}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch user data')
        }

        const data = await response.json()
        setProfileImage(data.profileImage || null)
        setError(null)
      } catch (err) {
        console.error('Error fetching profile image:', err)
        setError('Failed to load profile image')
        setProfileImage(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfileImage()
  }, [userId])

  return { profileImage, isLoading, error, refetch: () => {
    if (userId) {
      setIsLoading(true)
      fetch(`/api/user/getUserData/${userId}`)
        .then(res => res.json())
        .then(data => {
          setProfileImage(data.profileImage || null)
          setIsLoading(false)
        })
        .catch(err => {
          console.error(err)
          setError('Failed to load profile image')
          setIsLoading(false)
        })
    }
  }}
}
