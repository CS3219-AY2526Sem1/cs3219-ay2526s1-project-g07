
import { useEffect, useState } from "react";
// import { useNavigate } from "@tanstack/react-router";
import { signOut, useSession } from "../../lib/auth-client";
import { Button } from "../ui/button";

export default function SignOutButton() {
  // const [loading, setLoading] = useState(false);
  // const [error, setError] = useState<string | null>(null);
  // const navigate = useNavigate();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  // const [loading, setLoading] = useState<boolean>(true);

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
