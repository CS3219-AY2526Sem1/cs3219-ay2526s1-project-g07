import { useState } from "react"
import { Button } from "../ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { signIn } from "../../lib/auth-client"
import { Link, useNavigate } from "@tanstack/react-router"


export default function LogInCard() {
  
  const [email, setEmail] = useState<string>("username@example.com")
  const [password, setPassword] = useState<string>("password")
  const navigate = useNavigate()
  // const [loading, setLoading] = useState<boolean>(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await signIn.email(
      {
        email,
        password
      },
      {
        onRequest: (ctx) => {
          console.log("Signin request started:", ctx)
        },
        onResponse: (ctx) => {
          console.log("Signin response received:", ctx)
        
          if (ctx.response.ok) {
            console.log("Signin successful")
            navigate({ to: "/home" });
          } else {
            console.log("Signin failed", ctx.response.status)
            // setError(`Signup failed: ${ctx.response.status}`);
          }
        },
        onError: (ctx) => {
          console.log("Signin Error", ctx.error);
        }
      }
    )
    
    
  }
  

  return (
    <Card 
      className="w-full max-w-sm shadow-md"
    >
      <CardHeader>
        <CardTitle>Login to your account</CardTitle>
        <CardDescription>
          Enter your email below to login to your account
        </CardDescription>
        <CardAction>
          <Button className="cursor-pointer" variant="link">
            <Link to="/signup">Sign Up</Link>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit}
        >
          <div className="flex flex-col gap-6">
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
                <a
                  href="#"
                  className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                >
                  Forgot your password?
                </a>
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
              Login
            </Button>
            {/* <Button 
              variant="outline" 
              className="w-full cursor-pointer">
              Login with Google
            </Button> */}
          </div>
        </form>
      </CardContent>
    </Card>
  )


}