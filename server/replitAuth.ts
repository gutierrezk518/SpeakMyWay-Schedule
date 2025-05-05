import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

if (!process.env.REPLIT_DOMAINS) {
  console.warn("Environment variable REPLIT_DOMAINS not provided. Authentication may only work partially in development.");
}

const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET || "speakmyway-session-secret",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // Set to false to work in development
      maxAge: sessionTtl,
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(
  claims: any,
) {
  // Create a random password for Replit Auth users
  const randomPassword = Math.random().toString(36).slice(-10) + 
                         Math.random().toString(36).slice(-10);
  
  // Map Replit claims to our user schema
  const userData = {
    // Use random ID if sub can't be parsed
    id: parseInt(claims["sub"]) || Math.floor(Math.random() * 1000000),
    username: claims["username"],
    password: randomPassword, // Required by our schema
    email: claims["email"],
    displayName: claims["username"],
    emailVerified: true, // Replit users are already verified
    language: "en", // Default language
    isAdmin: false,
    isPremium: false,
    isEnterprise: false,
    isGuest: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    // Our schema doesn't have these fields, but we'll keep them in comments
    // firstName: claims["first_name"],
    // lastName: claims["last_name"],
    // bio: claims["bio"],
    // profileImage: claims["profile_image_url"],
  };

  const existingUser = await storage.getUserById(parseInt(claims["sub"]));
  
  if (existingUser) {
    // Update existing user with new Replit info
    await storage.updateUser(parseInt(claims["sub"]), {
      username: userData.username,
      email: userData.email,
      displayName: userData.displayName,
      emailVerified: true,
      // updatedAt is handled automatically in the database storage layer
    });
    return existingUser;
  } else {
    // Create new user with consent (required for GDPR)
    return await storage.createUser({
      ...userData,
      consentGiven: true,
      consentDate: new Date().toISOString(),
      marketingConsent: false,
      dataRetentionConsent: true
    });
  }
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  const config = await getOidcConfig().catch(err => {
    console.error("Failed to get OIDC config:", err);
    return null;
  });

  if (!config) {
    console.warn("OIDC configuration failed. Authentication will not work properly.");
    return;
  }

  const verify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    try {
      // Create an object that will store OAuth data
      const authData: any = {};
      updateUserSession(authData, tokens);
      
      // Get or create the actual user in our database
      const dbUser = await upsertUser(tokens.claims());
      
      // Combine them - dbUser has all our application user data
      // authData has the tokens and auth info
      const user = { 
        ...dbUser,
        auth: authData
      };
      
      verified(null, user);
    } catch (error) {
      console.error("Error during authentication:", error);
      verified(error as Error);
    }
  };

  // Set up authentication for all domains
  const domains = process.env.REPLIT_DOMAINS 
    ? process.env.REPLIT_DOMAINS.split(",") 
    : ["localhost:5000"];

  for (const domain of domains) {
    const strategy = new Strategy(
      {
        name: `replitauth:${domain}`,
        config,
        scope: "openid email profile offline_access",
        callbackURL: `https://${domain}/api/callback`,
      },
      verify,
    );
    passport.use(strategy);
  }

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  app.get("/api/login", (req, res, next) => {
    const hostname = req.hostname || "localhost:5000";
    const strategyName = `replitauth:${hostname}`;
    
    passport.authenticate(strategyName, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  app.get("/api/callback", (req, res, next) => {
    const hostname = req.hostname || "localhost:5000";
    const strategyName = `replitauth:${hostname}`;
    
    passport.authenticate(strategyName, {
      successReturnToOrRedirect: "/",
      failureRedirect: "/auth",
    })(req, res, next);
  });

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      if (config) {
        res.redirect(
          client.buildEndSessionUrl(config, {
            client_id: process.env.REPL_ID!,
            post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
          }).href
        );
      } else {
        res.redirect("/");
      }
    });
  });

  // User info endpoints - supporting both paths
  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    // Just return the user directly, as we've combined the DB user with auth info
    return res.json(req.user);
  });

  // Alternative path for user info - this is what our frontend is looking for
  app.get("/api/auth/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const user = req.user as any;
    
    // Return a formatted user object that matches our frontend expectations
    return res.json({
      id: user.id.toString(),
      username: user.username,
      email: user.email,
      firstName: user.auth?.claims?.first_name,
      lastName: user.auth?.claims?.last_name,
      bio: user.auth?.claims?.bio,
      profileImageUrl: user.auth?.claims?.profile_image_url
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  // If user is already authenticated, proceed
  if (req.isAuthenticated()) {
    const user = req.user as any;
    
    // Check if we need to refresh the token
    if (user.auth && user.auth.expires_at) {
      const now = Math.floor(Date.now() / 1000);
      
      // Token is still valid
      if (now <= user.auth.expires_at) {
        return next();
      }
      
      // Token expired, try to refresh
      if (user.auth.refresh_token) {
        try {
          const config = await getOidcConfig();
          const tokenResponse = await client.refreshTokenGrant(config, user.auth.refresh_token);
          updateUserSession(user.auth, tokenResponse);
          return next();
        } catch (error) {
          console.error("Token refresh failed:", error);
          // Continue to authentication failure
        }
      }
    }
  }
  
  // All authentication checks failed
  return res.status(401).json({ message: "Unauthorized" });
};