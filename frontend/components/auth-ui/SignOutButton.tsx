
import { useEffect, useState } from "react";
import { signOut, useSession } from "../../lib/auth-client";
import { Button } from "../ui/button";

export default function SignOutButton() {


  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const session = useSession()

  useEffect(() => {
    // console.log(session)
    if (session.data?.user) {
      setIsAuthenticated(true)
    } else {
      setIsAuthenticated(false)
    }
  }, [session]);

  const handleClick = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          console.log("Successfully signed out")
        },
      },
    })
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
