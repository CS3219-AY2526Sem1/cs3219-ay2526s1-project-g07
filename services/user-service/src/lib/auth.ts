import { betterAuth } from "better-auth"
import { jwt } from "better-auth/plugins"
import { db } from "../db/connection";

export const auth = betterAuth({
  database: db,
  emailAndPassword: {
    enabled: true,
    autoSignIn: true //defaults to true
    // requireEmailVerification: true // defaults to false
  },
  basePath: "/api/user/auth",
  trustedOrigins: ["http://127.0.0.1:3000", "http://127.0.0.1:80", "http://localhost:3000", "http://localhost:80", "https://pp.kirara.dev"], // your client URL
  // plugins: [
  //   jwt({
  //     jwks: {
  //       encryptPrivateKey: false, // DEV ONLY

  //       keyPairConfig: {
  //         alg: "EdDSA",
  //         crv: "Ed25519"
  //       }
  //     }
  //   }),
  // ],
})