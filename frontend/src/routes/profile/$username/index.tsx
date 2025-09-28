import Navbar from '@/src/components/Navbar'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getSession } from '@/lib/auth-client'

export const Route = createFileRoute('/profile/$username/')({
  component: RouteComponent, 
  loader: async () => {
    // console.log("test")
    const userInfo = await getSession()
    const userId = userInfo?.data?.user.id
    
    await fetch('http://localhost:5000/user/getUserData/' + userId)
      .then(response => response.json())
      .then(data => {
        console.log('Profile data:', data)
      })
      .catch(error => {
        console.error('Error fetching profile data:', error)
      })
    // console.log(userInfo?.data?.user)
    return userInfo?.data?.user
  }
})

function RouteComponent() {
  const { username } = Route.useParams()

  const session = Route.useLoaderData()
  console.log(session)
  
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
              <p className="text-lg">{username}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-700">Description:</p>
              <p className="text-gray-600">This is a sample description for the user profile.</p>
            </div>
            <div className="pt-4">
              <Link to="/profile/$username/edit" params={{ username }}>
                <Button variant="outline" className="w-full">
                  Edit Profile
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
