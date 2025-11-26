#!/bin/bash

# Kiala DR God - Development Launch Script
# This script clears cache and starts the development server

echo "🚀 Launching Kiala DR God..."
echo "📍 Current directory: $(pwd)"

# Clear Next.js cache
echo "🧹 Clearing Next.js cache..."
rm -rf .next
rm -rf node_modules/.cache

# Clear npm cache (optional but thorough)
echo "🧹 Clearing npm cache..."
npm cache clean --force

# Install dependencies (in case anything changed)
echo "📦 Installing dependencies..."
npm install

# Clear browser cache instruction
echo "💡 Don't forget to hard refresh your browser (Cmd+Shift+R on Mac, Ctrl+Shift+R on PC)"

# Start development server
echo "🌟 Starting development server..."
echo "📱 The site will be available at:"
echo "   • Main site: http://localhost:3000"
echo "   • Dr. Heart demo: http://localhost:3000/dr-heart"  
echo "   • Admin panel: http://localhost:3000/admin"

# Start the server and open browser
npm run dev &
sleep 3

# Open browser to Dr. Heart demo (the main showcase)
if command -v open > /dev/null; then
    echo "🌐 Opening browser..."
    open http://localhost:3000/dr-heart
elif command -v xdg-open > /dev/null; then
    echo "🌐 Opening browser..."
    xdg-open http://localhost:3000/dr-heart
else
    echo "🌐 Please open http://localhost:3000/dr-heart in your browser"
fi

echo "✨ Kiala DR God is now running!"
echo "📝 Press Ctrl+C to stop the server"