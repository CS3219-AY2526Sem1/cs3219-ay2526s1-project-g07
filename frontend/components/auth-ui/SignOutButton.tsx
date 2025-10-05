
import { useEffect, useState } from "react";
import { signOut, useSession, getSession } from "../../lib/auth-client";
import { Button } from "../ui/button";
import { useNavigate } from "@tanstack/react-router";

export default function SignOutButton() {

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const session = useSession()
  const navigate = useNavigate()

  useEffect(() => {
    // console.log(session)
    if (session.data?.user) {
      setIsAuthenticated(true)
    } else {
      setIsAuthenticated(false)
    }
  }, [session]);

  const handleClick = async () => {
    try {
      console.log("Starting sign out process...")
      
      // Perform sign out
      const result = await signOut({
        fetchOptions: {
          onSuccess: () => {
            console.log("Sign out API call successful")
          },
          onError: (error) => {
            console.error("Sign out API error:", error)
          }
        },
      })
      
      console.log("Sign out result:", result)
      
      // Wait a bit for the server to process
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Clear any local storage/session storage
      localStorage.clear()
      sessionStorage.clear()
      
      // Force redirect to index
      console.log("Redirecting to index page...")
      window.location.href = "/"
      
    } catch (error) {
      console.error("Sign out failed:", error)
    }
  }


  return (
    <>
      <Button
        onClick={handleClick}
        variant={isAuthenticated ? "destructive" : "ghost"}
        className={`${isAuthenticated ? "cursor-pointer" : "cursor-not-allowed"} `}
      >
        Sign Out
      </Button>
    </>


  );
}
