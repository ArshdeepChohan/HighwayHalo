# 🚗 Highway Halo - Quick Start Guide

## Prerequisites
- Node.js (v16 or higher)
- MongoDB (running locally)
- Expo Go app on your mobile device

## Quick Setup (3 Steps)

### 1. Start MongoDB
```bash
# macOS (with Homebrew)
brew services start mongodb-community

# Ubuntu/Debian
sudo systemctl start mongod

# Windows
# Start MongoDB service from Services panel
```

### 2. Run the Setup Script
```bash
cd /Users/jasmeetkaur/HighwayHalo-Prototype-
./start.sh
```

### 3. Scan QR Code
- Install **Expo Go** app on your mobile device
- Scan the QR code displayed in terminal
- The Highway Halo app will load on your device

## Manual Setup (Alternative)

### Backend
```bash
cd backend
npm install
npm run dev
```

### Mobile App
```bash
cd mobile
npm install
npx expo start --tunnel
```

## Testing the App

1. **Home Screen** - Beautiful welcome screen with Highway Halo branding
2. **Sign Up** - Create account with username, email, phone, password
3. **Vehicle Selection** - Choose 2-wheeler or 4-wheeler
4. **Location Permission** - Grant GPS access when prompted
5. **Map Screen** - See real-time location and alerts

## Features to Test

### ✅ Authentication
- [ ] Sign up with new account
- [ ] Login with credentials
- [ ] Persistent login session

### ✅ Vehicle Selection
- [ ] Choose 2-wheeler
- [ ] Choose 4-wheeler
- [ ] Preference saved

### ✅ Map & Location
- [ ] GPS permission granted
- [ ] Current location displayed
- [ ] Map centers on user location
- [ ] Speed monitoring active

### ✅ Alert System
- [ ] Speed camera alerts (150m)
- [ ] Speed breaker alerts (100m)
- [ ] Red light alerts (200m)
- [ ] School zone alerts (150m)
- [ ] Hospital zone alerts (100m)
- [ ] Construction alerts (100m)

### ✅ Speed Monitoring
- [ ] Current speed displayed
- [ ] Speed limit shown
- [ ] Speed violation warnings
- [ ] Real-time updates

## Sample Data

The app comes with sample alert points:
- **Speed Camera** at Lipton area (40 km/h limit)
- **Speed Breaker** at accident-prone area (20 km/h limit)
- **Red Light** at main gate (0 km/h limit)
- **School Zone** entrance (20 km/h limit)
- **Hospital Zone** emergency area (15 km/h limit)
- **Construction** area at MBA block (25 km/h limit)

## Troubleshooting

### Location Not Working
- Ensure GPS is enabled on device
- Test outdoors for better GPS signal
- Check location permissions in device settings

### Backend Connection Issues
- Verify MongoDB is running
- Check if backend server started on port 5000
- Ensure no firewall blocking connections

### Mobile App Issues
- Clear Expo Go app cache
- Restart Expo development server
- Check network connection

## Next Steps

1. **Test all features** on your mobile device
2. **Customize alert points** in `backend/data/campusPoints.json`
3. **Modify speed limits** for different areas
4. **Add new alert types** as needed
5. **Deploy to app stores** when ready

## Support

If you encounter any issues:
1. Check the console logs for errors
2. Verify all prerequisites are installed
3. Ensure MongoDB is running
4. Test with a fresh Expo Go app installation

---

**Happy Driving with Highway Halo! 🛡️**



