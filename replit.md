# SpeakMyWay - AAC Communication Application

## Overview

SpeakMyWay is an Augmentative and Alternative Communication (AAC) frontend web application designed to help users with communication needs. The application features a comprehensive communication board, quick mode for frequently used phrases, schedule management, and customization options. It's now a pure frontend React/TypeScript application using Supabase as the backend service for authentication and data storage.

## Recent Changes (July 28, 2025)

✓ **Converted to Frontend-Only Application**
- Removed all Express.js backend code and server directory
- Removed shared directory and database schemas
- Removed backend dependencies (drizzle-orm, express, passport, etc.)
- Updated to use Vite dev server (port 5173) instead of Express server

✓ **Simplified Architecture**
- Pure React frontend with Supabase backend
- Removed admin panel functionality (now shows informational page)
- Simplified email verification (now handled by Supabase Auth)
- Updated queryClient to remove server-side API calls

✓ **Environment Configuration**
- Created .env.local with Supabase configuration placeholders
- Updated package.json to use ESM modules
- Fixed Vite configuration to work with frontend-only setup

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: React Context API for global app state
- **UI Framework**: Radix UI components with Tailwind CSS for styling
- **Data Fetching**: TanStack Query (React Query) for server state management
- **Authentication**: Supabase Auth integration

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ESM modules
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Supabase integration with session management
- **Development**: Custom Vite integration for SPA serving

### Database Design
- **ORM**: Drizzle ORM with schema-first approach
- **Database**: PostgreSQL (configured for Neon serverless)
- **Migrations**: Drizzle Kit for schema migrations
- **Schema Location**: `shared/schema.ts` for type safety across frontend/backend

## Key Components

### Communication Features
- **Communication Board**: Category-based vocabulary with core words and phrases
- **Quick Mode**: Rapid access to frequently used phrases
- **Text-to-Speech**: Browser-based TTS with voice customization
- **Activity Cards**: Visual schedule management with drag-and-drop functionality

### User Management
- **Authentication**: Supabase-based auth with email/password and Google OAuth
- **User Profiles**: Customizable settings including language preferences
- **Admin Panel**: User management and analytics dashboard
- **Guest Mode**: Anonymous usage capability

### Customization System
- **Voice Settings**: Configurable TTS preferences (rate, volume, voice type)
- **Display Settings**: Theme and appearance customization
- **Language Support**: English and Spanish localization
- **Activity Management**: Custom activity cards and schedule organization

## Data Flow

### Client-Side Flow
1. **App Initialization**: Context providers wrap the application providing global state
2. **Authentication**: Supabase client handles auth state and token management
3. **Data Fetching**: React Query manages server state with automatic caching
4. **Local Storage**: Preferences and settings persist in browser storage
5. **Real-time Updates**: Context updates trigger re-renders across components

### Server-Side Flow
1. **Request Processing**: Express middleware handles CORS, body parsing, and logging
2. **Authentication**: Session validation through Supabase integration
3. **Database Operations**: Drizzle ORM provides type-safe database interactions
4. **Response Generation**: JSON responses with appropriate error handling

### Development Flow
1. **Vite Dev Server**: Integrated with Express for seamless development
2. **Hot Module Replacement**: Real-time updates during development
3. **TypeScript Compilation**: Shared types between frontend and backend
4. **Database Sync**: Drizzle push for schema synchronization

## External Dependencies

### Authentication & Database
- **Supabase**: Authentication provider and database hosting
- **Neon Database**: PostgreSQL hosting with serverless capabilities
- **AWS SES**: Email service for verification and notifications (optional)

### Development & Build Tools
- **Replit**: Primary development environment with integrated PostgreSQL
- **Vite**: Frontend build tool and development server
- **ESBuild**: Backend bundling for production builds
- **Drizzle Kit**: Database schema management and migrations

### UI & Functionality
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first styling framework
- **React Beautiful DND**: Drag and drop functionality for schedules
- **Web Speech API**: Browser-based text-to-speech functionality

## Deployment Strategy

### Replit Deployment
- **Environment**: Configured for Replit autoscale deployment
- **Build Process**: Vite builds frontend, ESBuild bundles backend
- **Database**: PostgreSQL provisioned through Replit modules
- **Port Configuration**: Internal port 5000, external port 80

### Production Setup
1. **Frontend Build**: Static assets compiled to `dist/public`
2. **Backend Bundle**: Server code bundled to `dist/index.js`
3. **Database Migrations**: Automated schema deployment
4. **Environment Variables**: Supabase credentials and service configurations

### Environment Configuration
- **Development**: Vite dev server with Express API integration
- **Production**: Static file serving with Express API backend
- **Database**: Connection via DATABASE_URL environment variable
- **Services**: Optional AWS SES and Supabase configuration

## Changelog

- July 28, 2025: Enhanced Spanish voice support for better pronunciation
  - Added language-aware voice selection for Spanish mode
  - Implemented proper male/female voice mapping for Spanish pronunciation
  - Fixed voice selection logic to prioritize Spanish voices when language is set to Español
  - Male voice uses main "Google español" (es-ES), female voice uses US Spanish variant (es-US)
  - Voice preferences now automatically sync with app language changes

- January 3, 2025: Enhanced session persistence and authentication flow
  - Fixed session logout issues on page refresh
  - Improved Supabase client initialization with proper auth persistence
  - Category filtering working correctly with 100 vocabulary cards from database
  - All data sourced from Supabase tables with no hardcoded content

- June 18, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.