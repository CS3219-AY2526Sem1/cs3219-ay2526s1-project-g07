import { useState } from "react"
import { Button } from "../ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  CardAction
} from "../ui/card"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { signUp } from "../../lib/auth-client"


export default function SignUpCard() {
  
  const [email, setEmail] = useState<string>("username@example.com")
  const [password, setPassword] = useState<string>("password")
  const [name, setName] = useState<string>("default")
  // const [loading, setLoading] = useState<boolean>(true);



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await signUp.email(
      {
        email,
        password,
        name: name
      },
      {
        onRequest: (ctx) => {
          console.log("📤 Signup request started:", ctx);
        },
        onResponse: (ctx) => {
          console.log("📥 Signup response received:", ctx);
          
          // Check if signup was successful
          if (ctx.response.ok) {
            console.log("✅ Signup successful, navigating...");
          } else {
            console.error("❌ Signup failed:", ctx.response.status);
          }
        },
        onError: (ctx) => {
          console.error("❌ Signup error:", ctx.error);
        }
      }
    )
    
    
  }
  

  return (
    <Card 
      className="w-full max-w-sm shadow-md"
    >
      <CardHeader>
        <CardTitle>Sign up for an account</CardTitle>
        <CardDescription>
          Register an account
        </CardDescription>
        <CardAction>
          <Button className="cursor-pointer" variant="link">
            {/* <Link to="/login">Back to Log In</Link> */}
            Back to Log In
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit}
        >
          <div className="flex flex-col gap-2">
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="username"
                placeholder="e.g. max"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
              </div>
              <Input 
                id="password" 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>
          </div>
          <div className="flex flex-col gap-2 my-3">
            <Button 
              type="submit" 
              className="w-full cursor-pointer"
              variant="default"
            >
              Sign Up
            </Button>
            {/* <Button 
              variant="outline" 
              className="w-full cursor-pointer">
              Login with Google
            </Button> */}
          </div>
        </form>
        <CardFooter className="flex-row bg-red-50 justify-center">
          Social Media Sign Up Options
        </CardFooter>  
      </CardContent>
    </Card>
  )


}