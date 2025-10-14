# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev          # Vite dev server on port 3000

# Build the application
npm run build

# Preview production build
npm run preview

# Type checking
npm run check
```

## Project Architecture

This is a modern full-stack web application for an AAC (Augmentative and Alternative Communication) platform called "SpeakMyWay". The app helps users create visual schedules and communicate using activity cards with text-to-speech functionality.

### Technology Stack
- **Frontend**: React 18 + TypeScript + Vite (port 3000)
- **Database**: Supabase (PostgreSQL with built-in auth)
- **Authentication**: Supabase Auth
- **Routing**: Wouter (client-side)
- **UI Framework**: Tailwind CSS + Radix UI components
- **State Management**: React Context + TanStack Query
- **Deployment**: Vercel (Static deployment)

### Directory Structure

```
├── client/src/           # React frontend application
│   ├── components/       # Reusable UI components
│   │   ├── ui/          # Radix UI components
│   │   ├── navigation-bar.tsx
│   │   └── protected-route.tsx
│   ├── contexts/        # React contexts
│   │   └── app-context.tsx  # Main app state
│   ├── data/            # Static data files
│   │   ├── scheduleData.ts
│   │   └── vocabulary.ts
│   ├── hooks/           # Custom React hooks
│   │   ├── use-auth.tsx         # Supabase authentication
│   │   ├── use-categories.tsx   # Database categories hook
│   │   ├── use-activity-cards.tsx # Database activity cards hook
│   │   └── use-*.tsx            # Other utility hooks
│   ├── lib/             # Utility libraries
│   │   ├── supabase.ts  # Supabase client configuration
│   │   ├── tts.ts       # Text-to-speech functionality
│   │   └── utils.ts     # General utilities
│   └── pages/           # Route components
└── public/             # Static assets
    └── activity-cards/ # Activity card images (legacy)
```

### Key Features

1. **Visual Schedule Builder**: Users can create daily schedules using drag-and-drop activity cards
2. **Communication Board**: Text-to-speech enabled communication interface
3. **Multi-language Support**: English and Spanish text/speech support
4. **User Authentication**: Supabase authentication with email/password
5. **Activity Timer**: Built-in timing functionality for scheduled activities

### Database & Authentication

- **Database**: Supabase PostgreSQL database with Row Level Security (RLS)
  - `schedule_vocabulary` table: Activity cards with multilingual support
  - `schedulecategories` table: Categories for organizing activity cards
- **Authentication**: Supabase Auth handles user registration, login, password reset
- **Data Access**: Direct client-to-Supabase communication using `@supabase/supabase-js`
- **Images**: Stored in Supabase Storage in `scheduleicons` bucket

### Environment Setup

1. **Create `.env` file** from `.env.example`:
   ```bash
   cp .env.example .env
   ```

2. **Add your Supabase credentials**:
   ```
   SUPABASE_URL=https://your-project-ref.supabase.co
   SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

3. **Get credentials from Supabase Dashboard**:
   - Go to Settings > API in your Supabase project
   - Copy the Project URL and anon/public key

### Development Workflow

1. **Frontend Development**:
   - Run `npm run dev` for Vite dev server on port 3000
   - Hot reload enabled for React components
   - Direct Supabase client integration

2. **Database Changes**:
   - Make schema changes directly in Supabase Dashboard
   - Update TypeScript types as needed in client code
   - Activity cards and categories managed entirely in Supabase

3. **Deployment**:
   - Push to main branch triggers Vercel deployment
   - Pure static site deployment (no server required)

### Text-to-Speech Integration

- Uses Web Speech API for browser-based TTS
- Supports both English and Spanish speech
- Custom speech text separate from display text
- Fallback audio files for consistent pronunciation

### Development Notes

- **Port Configuration**: Frontend (3000) - No backend server
- **Build Process**: Vite handles static site generation
- **Image Storage**: Activity card images in Supabase Storage
- **Type Safety**: Full TypeScript coverage
- **Authentication Flow**: Handled entirely by Supabase
- **Data Fetching**: TanStack Query with direct Supabase queries

### Deployment

- **Platform**: Vercel (configured with `vercel.json`)
- **Type**: Static site deployment
- **Database**: Hosted by Supabase
- **Images**: Supabase Storage

### Common Patterns

- React components use TypeScript with proper typing
- Database queries use TanStack Query + Supabase client
- Error handling with try-catch blocks and toast notifications
- Client-side routing with Wouter for SPA experience
- Responsive design with Tailwind CSS utilities
- Loading states for async database operations