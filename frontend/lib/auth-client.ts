import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
  fetchOptions: {
    credentials: "include",
  },
  basePath: "/api/user/auth",
})

export const { signIn, signUp, signOut, useSession, getSession } = authClient
