import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as UserType } from "@shared/schema";
import connectPg from "connect-pg-simple";
import { pool } from "./db";
import { sendEmail, generateWelcomeEmailTemplate } from "./utils/email-service";

declare global {
  namespace Express {
    interface User extends UserType {}
  }
}

const scryptAsync = promisify(scrypt);

// Create PostgreSQL session store
const PostgresSessionStore = connectPg(session);

// Configure session store
export const sessionStore = new PostgresSessionStore({ 
  pool, 
  createTableIfMissing: true 
});

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || 'speakmyway-session-secret',
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
      httpOnly: true,
      sameSite: 'lax'
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false, { message: "Invalid username or password" });
        } else {
          return done(null, user);
        }
      } catch (error) {
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password),
      });

      // Send welcome email if user has provided an email
      if (user.email) {
        try {
          const { html, text } = generateWelcomeEmailTemplate(user.username, user.id);
          
          const isDev = process.env.NODE_ENV === 'development' && !process.env.VERIFIED_EMAIL;
          
          if (isDev) {
            console.log('=== DEV MODE: Welcome email would be sent on registration ===');
            console.log(`User: ${user.username} (ID: ${user.id})`);
            console.log(`Email: ${user.email}`);
            console.log(`Subject: Welcome to SpeakMyWay, ${user.username}!`);
            console.log('=== Set VERIFIED_EMAIL env var to enable sending real emails ===');
          } else {
            // Only attempt to send email if not in dev mode
            sendEmail({
              to: user.email,
              subject: `Welcome to SpeakMyWay, ${user.username}!`,
              htmlBody: html,
              textBody: text
            }).catch(err => {
              console.error('Failed to send welcome email:', err);
              // Don't reject registration if email fails
            });
          }
          
          console.log(`Welcome email queued for ${user.username} at ${user.email}`);
        } catch (emailError) {
          console.error('Error preparing welcome email:', emailError);
          // Continue with registration even if email preparation fails
        }
      }

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", async (err: any, user: UserType | false, info: any) => {
      if (err) return next(err);
      
      // Record login attempt
      if (user) {
        try {
          // Get client IP address
          const ip = req.headers['x-forwarded-for'] as string || 
                    req.socket.remoteAddress || 
                    'unknown';
                    
          // Get user agent info
          const userAgent = req.headers['user-agent'] || 'unknown';
          
          // Extract browser and device info from user agent (simplified)
          const browser = userAgent.match(/(chrome|safari|firefox|edge|msie|trident(?=\/))\/?\s*(\d+)/i)?.[1] || 'unknown';
          const device = userAgent.match(/(mobile|tablet|android|iphone|ipad)/i)?.[1] || 'desktop';
          
          // Record successful login
          await storage.recordLogin({
            userId: user.id,
            ipAddress: ip,
            userAgent,
            browser,
            device,
            success: true
          });
          
          // Update user's last login info
          await storage.updateUserLoginInfo(user.id, ip);
        } catch (error) {
          console.error('Failed to record login:', error);
          // Continue with login even if recording fails
        }
      } else {
        try {
          // Record failed login attempt if username was provided
          const username = req.body.username;
          if (username) {
            const existingUser = await storage.getUserByUsername(username);
            if (existingUser) {
              // If username exists but login failed, record the attempt
              const ip = req.headers['x-forwarded-for'] as string || 
                        req.socket.remoteAddress || 
                        'unknown';
              const userAgent = req.headers['user-agent'] || 'unknown';
              
              await storage.recordLogin({
                userId: existingUser.id,
                ipAddress: ip,
                userAgent,
                browser: 'unknown',
                device: 'unknown',
                success: false
              });
            }
          }
        } catch (error) {
          console.error('Failed to record failed login:', error);
        }
        
        return res.status(401).json(info || { message: "Authentication failed" });
      }
      
      req.login(user, (err: any) => {
        if (err) return next(err);
        res.status(200).json(user);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    res.json(req.user);
  });
}