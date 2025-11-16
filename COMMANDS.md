# 🚗 Highway Halo - Command Guide

## Quick Commands

### Start Everything (Recommended)
```bash
cd /Users/jasmeetkaur/HighwayHalo-Prototype-
./start.sh
```

### Manual Start (Step by Step)

#### 1. Start Backend Server
```bash
cd /Users/jasmeetkaur/HighwayHalo-Prototype-/backend
npm run dev
```

#### 2. Start Mobile App (in a new terminal)
```bash
cd /Users/jasmeetkaur/HighwayHalo-Prototype-/mobile
npx expo start --tunnel
```

## Important Notes

### ❌ Don't Run These Commands from Root Directory:
```bash
# WRONG - This will cause errors
cd /Users/jasmeetkaur/HighwayHalo-Prototype-
npx expo start --tunnel  # ❌ Error: package.json not found
```

### ✅ Correct Commands:
```bash
# RIGHT - Run from mobile directory
cd /Users/jasmeetkaur/HighwayHalo-Prototype-/mobile
npx expo start --tunnel  # ✅ Works correctly
```

## Troubleshooting

### Error: "package.json does not exist"
- **Cause**: Running Expo commands from wrong directory
- **Solution**: Always run `npx expo start` from the `mobile` directory

### Error: "unknown or unexpected option: --c"
- **Cause**: Invalid Expo flag
- **Solution**: Use `--tunnel` instead of `--c`

### Deprecated Package Warnings
- These are just warnings and don't affect functionality
- They come from Expo's dependencies
- The app will work fine despite these warnings

## Directory Structure
```
HighwayHalo-Prototype-/
├── backend/          # Node.js backend server
│   ├── package.json  # Backend dependencies
│   └── server.js     # Main server file
├── mobile/           # React Native mobile app
│   ├── package.json  # Mobile app dependencies
│   └── App.js        # Main app file
└── start.sh          # Quick start script
```

## Next Steps

1. **Make sure MongoDB is running:**
   ```bash
   # macOS
   brew services start mongodb-community
   
   # Ubuntu
   sudo systemctl start mongod
   ```

2. **Run the start script:**
   ```bash
   cd /Users/jasmeetkaur/HighwayHalo-Prototype-
   ./start.sh
   ```

3. **Scan QR code** with Expo Go app on your mobile device

4. **Test the app:**
   - Sign up for a new account
   - Select your vehicle type
   - Grant location permission
   - See the map with alerts

## Alternative: Manual Start

If the script doesn't work, start manually:

**Terminal 1 (Backend):**
```bash
cd /Users/jasmeetkaur/HighwayHalo-Prototype-/backend
npm run dev
```

**Terminal 2 (Mobile App):**
```bash
cd /Users/jasmeetkaur/HighwayHalo-Prototype-/mobile
npx expo start --tunnel
```

The QR code will appear in Terminal 2. Scan it with Expo Go app!



