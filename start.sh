#!/bin/bash

echo "🚗 Highway Halo - Smart Driving Companion Setup"
echo "=============================================="
echo ""

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB is not running. Please start MongoDB first."
    echo "   On macOS: brew services start mongodb-community"
    echo "   On Ubuntu: sudo systemctl start mongod"
    echo ""
fi

# Start Backend Server
echo "🔧 Starting Backend Server..."
cd backend
npm run dev &
BACKEND_PID=$!
echo "   Backend server started with PID: $BACKEND_PID"
echo "   Server running on: http://localhost:5000"
echo ""

# Wait a moment for backend to start
sleep 3

# Start Mobile App
echo "📱 Starting Mobile App..."
cd ../mobile
echo "   Starting Expo development server..."
echo "   Scan the QR code with Expo Go app on your mobile device"
echo ""

# Start Expo with tunnel for QR code
npx expo start --tunnel

# Cleanup function
cleanup() {
    echo ""
    echo "🛑 Shutting down servers..."
    kill $BACKEND_PID 2>/dev/null
    echo "   Backend server stopped"
    echo "   Mobile app stopped"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Keep script running
wait



