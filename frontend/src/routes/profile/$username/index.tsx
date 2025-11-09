import { useState } from 'react'
import Navbar from '@/src/components/Navbar'
import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog'
import { getSession } from '@/lib/auth-client'
import { redirectIfNotAuthenticated } from '@/src/hooks/user-hooks'

export const Route = createFileRoute('/profile/$username/')({
  component: RouteComponent,
  loader: async () => {
    const userInfo = await getSession()
    const userId = userInfo?.data?.user.id

    try {
      const response = await fetch(`/api/user/getUserData/${userId}`)
      const data = await response.json()
      console.log('Profile data:', data)
      return data
    } catch (error) {
      console.error('Error fetching profile data:', error)
      return null
    }
  }
})

function RouteComponent() {
  redirectIfNotAuthenticated();

  const { username } = Route.useParams()
  const data = Route.useLoaderData()

  const [formData, setFormData] = useState({
    username: data?.name || username,
    description: data?.description || 'No description available'
  })

  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSave = async () => {
    console.log("hello")
    setIsLoading(true)

    try {
      const userInfo = await getSession()
      const userId = userInfo?.data?.user.id

      // TODO: Replace with actual API call to save data
      const response = await fetch(`/api/user/updateUserData/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.username,
          description: formData.description
        })
      })

      if (response.ok) {
        console.log('Profile updated successfully')
        setIsOpen(false)
        // Optionally refresh the page or update local state
        window.location.reload()
      } else {
        console.error('Error updating profile')
        alert('Error updating profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Error updating profile')
    } finally {
      setIsLoading(false)
    }
  }

  // Use data from backend or fallback values
  const displayName = data?.name || username
  const displayDescription = data?.description || 'No description available'

  return (
    <>
      <Navbar />
      <div className="container mx-auto p-6">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>User Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="font-semibold text-gray-700">Username:</p>
              <p className="text-lg">{displayName}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-700">Description:</p>
              <p className="text-gray-600">{displayDescription}</p>
            </div>
            <div className="pt-4">
              <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    Edit Profile
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Enter your description here..."
                        rows={4}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={handleSave}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
