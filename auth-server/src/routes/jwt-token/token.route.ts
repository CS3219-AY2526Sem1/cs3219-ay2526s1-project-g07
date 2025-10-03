import { Hono } from "hono";
import jwt from "jsonwebtoken";
import type { Context } from "hono";

const app = new Hono();
const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production";

// Generate JWT token endpoint
app.get("/api/auth/token", async (c: Context) => {
  try {
    // 1. Validate existing session first
    const cookieHeader = c.req.header('cookie') || '';
    
    const sessionResponse = await fetch('http://localhost:5000/api/auth/get-session', {
      headers: { Cookie: cookieHeader }
    });
    
    if (!sessionResponse.ok) {
      return c.json({ error: 'Not authenticated' }, 401);
    }
    
    const session = await sessionResponse.json();
    
    if (!session.user) {
      return c.json({ error: 'No user session' }, 401);
    }
    
    // 2. Generate JWT token
    const tokenPayload = {
      userId: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: session.user.role || 'user',
      // Standard JWT claims
      iat: Math.floor(Date.now() / 1000), // Issued at
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7), // (60 * 60) = Expires in 1 hour
      iss: 'auth-server', // Issuer
      sub: session.user.id // Subject
    };
    
    const token = jwt.sign(tokenPayload, JWT_SECRET);
    
    return c.json({ 
      token,
      expires_in: (60 * 60 * 24 * 7), // 1 hour in seconds
      token_type: 'Bearer'
    });
    
  } catch (error) {
    console.error('Token generation error:', error);
    return c.json({ error: 'Failed to generate token' }, 500);
  }
});

// Refresh token
app.post("/api/auth/refresh-token", async (c: Context) => {
  try {
    const { token } = await c.req.json();
    
    // Verify the old token (even if expired)
    const decoded = jwt.verify(token, JWT_SECRET, { ignoreExpiration: true });
    
    // Generate new token
    const newTokenPayload = {
      userId: decoded.userId,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (60 * 60),
      iss: 'your-app-name',
      sub: decoded.userId
    };
    
    const newToken = jwt.sign(newTokenPayload, JWT_SECRET);
    
    return c.json({
      token: newToken,
      expires_in: 3600,
      token_type: 'Bearer'
    });
    
  } catch (error) {
    return c.json({ error: 'Invalid token for refresh' }, 401);
  }
});
