# Setup Instructions for SpeakMyWay-Schedule

Follow these steps to set up your new project with just the Schedule functionality.

## Step 1: Setup Package.json

Replace the contents of your new project's `package.json` with this:

```json
{
  "name": "speakmyway-schedule",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "NODE_ENV=development tsx server/index.ts",
    "build": "vite build",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview"
  },
  "dependencies": {
    "@hookform/resolvers": "^3.3.2",
    "@tailwindcss/typography": "^0.5.10",
    "@tanstack/react-query": "^5.0.5",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "cmdk": "^0.2.0",
    "date-fns": "^2.30.0",
    "express": "^4.18.2",
    "framer-motion": "^10.16.4",
    "lucide-react": "^0.292.0",
    "react": "^18.2.0",
    "react-beautiful-dnd": "^13.1.1",
    "react-day-picker": "^8.9.1",
    "react-dom": "^18.2.0",
    "react-hook-form": "^7.47.0",
    "react-hot-toast": "^2.4.1",
    "react-icons": "^4.11.0",
    "tailwind-merge": "^1.14.0",
    "tailwindcss-animate": "^1.0.7",
    "uuid": "^9.0.1",
    "wouter": "^2.12.1",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@types/express": "^4.17.20",
    "@types/node": "^20.8.10",
    "@types/react": "^18.2.15",
    "@types/react-beautiful-dnd": "^13.1.6",
    "@types/react-dom": "^18.2.7",
    "@types/uuid": "^9.0.6",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "@vitejs/plugin-react": "^4.0.3",
    "autoprefixer": "^10.4.16",
    "eslint": "^8.45.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.3",
    "postcss": "^8.4.31",
    "tailwindcss": "^3.3.5",
    "tsx": "^3.14.0",
    "typescript": "^5.0.2",
    "vite": "^4.4.5"
  }
}
```

## Step 2: Install Dependencies

Run this command in your Replit shell:

```bash
npm install
```

## Step 3: Create Project Structure

Create the following directory structure in your new project:

```
/client
  /src
    /components
      /ui
    /contexts
    /data
    /lib
    /pages
  /public
    /activity-cards
/server
```

## Step 4: Configuration Files

### Create tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./client/src/*"],
      "@assets/*": ["./attached_assets/*"],
      "@components/*": ["./client/src/components/*"],
      "@lib/*": ["./client/src/lib/*"],
      "@shared/*": ["./shared/*"]
    }
  },
  "include": ["client/src", "server", "shared"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### Create vite.config.ts

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client/src'),
      '@assets': path.resolve(__dirname, './attached_assets'),
      '@components': path.resolve(__dirname, './client/src/components'),
      '@lib': path.resolve(__dirname, './client/src/lib'),
      '@shared': path.resolve(__dirname, './shared')
    }
  }
});
```

### Create tailwind.config.ts

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './client/src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './client/src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './client/src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    screens: {
      'xs': '480px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require('@tailwindcss/typography')],
}

export default config;
```

### Create postcss.config.js

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

## Step 5: Copy Essential Files

### These files need to be copied from your current project to the new one:

1. **Server Files**:
   - `server/index.ts`
   - `server/vite.ts`
   - `server/routes.ts` (simplified version)

2. **Client Files**:
   - `client/src/index.css`
   - `client/src/main.tsx`
   - `client/src/App.tsx` (simplified)
   - `client/src/contexts/app-context.tsx`
   - `client/src/data/activityCardData.ts`
   - `client/src/data/scheduleData.ts`
   - `client/src/lib/tts.ts`
   - `client/src/lib/sounds.ts`
   - `client/src/pages/schedule.tsx`
   - `client/src/components/ui/activity-card.tsx`

3. **Asset Files**:
   - All images from `attached_assets` folder (especially the activity card images)

## Step 6: Start the Development Server

After completing the above steps, run:

```bash
npm run dev
```

The app should now be running with just the Schedule page functionality.