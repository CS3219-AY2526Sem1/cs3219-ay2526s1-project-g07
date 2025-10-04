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
  trustedOrigins: ["http://127.0.0.1:3000", "http://localhost:3000"], // your client URL
  plugins: [ 
    jwt({
      jwks: {
        keyPairConfig: {
          alg: "EdDSA",
          crv: "Ed25519"
        }
      }
    }),
  ],
})