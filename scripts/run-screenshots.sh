#!/bin/bash

echo "🚀 Starting comprehensive screenshot capture for all modules..."
echo "📸 Capturing: Desktop, Tablet, and Mobile viewports"
echo "🏛️ Pages: Landing, Admin, Trainer, Student dashboards + all sub-pages"

# Install dependencies if needed
npm install

# Compile TypeScript script
npx tsc scripts/capture-screenshots.ts --outDir scripts --moduleResolution node --target es2020 --lib es2020 --allowSyntheticDefaultImports

# Run the screenshot capture
node scripts/capture-screenshots.js

echo "✅ Screenshot capture completed!"
echo "📁 Screenshots saved in: ./screenshots/"
echo "📱 Viewports: desktop/, tablet/, mobile/"