#!/bin/bash

# Script to copy necessary files from current project to new project

echo "This script will help you copy files to create a schedule-only app"
echo "Make sure you run this script in the NEW project directory"
echo "Use the paths from your ORIGINAL project to copy into the NEW one"

# Create necessary directories
mkdir -p client/src/components/ui
mkdir -p client/src/contexts
mkdir -p client/src/data
mkdir -p client/src/lib
mkdir -p client/src/pages
mkdir -p client/public/activity-cards
mkdir -p server
mkdir -p attached_assets

echo "Created directory structure"

# Copy all simplified files
cp ../original-project/simplified-app.tsx client/src/App.tsx
cp ../original-project/simplified-server-index.ts server/index.ts
cp ../original-project/simplified-server-vite.ts server/vite.ts
cp ../original-project/simplified-index.html index.html
cp ../original-project/simplified-main.tsx client/src/main.tsx

# Copy original files that need to be preserved
echo "Now you need to manually copy these files from your original project:"
echo "1. client/src/index.css"
echo "2. client/src/contexts/app-context.tsx"
echo "3. client/src/data/activityCardData.ts"
echo "4. client/src/data/scheduleData.ts"
echo "5. client/src/lib/tts.ts"
echo "6. client/src/lib/sounds.ts (if used)"
echo "7. client/src/pages/schedule.tsx"
echo "8. client/src/components/ui/activity-card.tsx"
echo "9. All image files from attached_assets/ to your new attached_assets/"

echo "Script complete. After copying the files, run 'npm install' and then 'npm run dev'"