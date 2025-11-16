# Highway Halo - Smart Driving Companion

A comprehensive mobile application that provides real-time safety alerts, speed monitoring, and hazard detection for drivers.

## Features

### 🏠 Home Screen
- Beautiful welcome screen with Highway Halo branding
- Feature highlights and call-to-action buttons
- Smooth navigation to authentication

### 🔐 Authentication
- **Login/Signup** with username, email, or phone number
- Secure password storage with bcrypt hashing
- JWT token-based authentication
- Form validation and error handling

### 🚗 Vehicle Selection
- Choose between 2-wheeler and 4-wheeler
- Personalized alerts based on vehicle type
- Persistent preference storage

### 🗺️ Advanced Map Screen
- **Real-time location tracking** with GPS
- **Speed monitoring** with current speed display
- **Speed limit detection** and display
- **Proximity alerts** for:
  - Speed cameras (150m alert distance)
  - Speed breakers (100m alert distance)
  - Red lights (200m alert distance)
  - School zones (150m alert distance)
  - Hospital zones (100m alert distance)
  - Construction areas (100m alert distance)

### ⚠️ Smart Alert System
- **100m+ advance warnings** for all hazards
- **Speed violation alerts** when exceeding limits
- **Visual and animated notifications**
- **Severity-based color coding** (Critical, High, Medium, Low)
- **Real-time distance calculation**

### 📱 Mobile-First Design
- Responsive UI optimized for mobile devices
- Touch-friendly interface
- Dark theme with Highway Halo branding
- Smooth animations and transitions

## Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **CORS** enabled for mobile app communication

### Mobile App
- **React Native** with Expo
- **React Navigation** for screen navigation
- **React Native Maps** for map functionality
- **Expo Location** for GPS tracking
- **AsyncStorage** for local data persistence
- **Axios** for API communication

## Setup Instructions

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the backend directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/highway-halo
   JWT_SECRET=your-super-secret-jwt-key
   PORT=5000
   ```

4. **Start MongoDB:**
   Make sure MongoDB is running on your system

5. **Start the backend server:**
   ```bash
   npm run dev
   ```
   The server will start on `http://localhost:5000`

### Mobile App Setup

1. **Navigate to mobile directory:**
   ```bash
   cd mobile
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the Expo development server:**
   ```bash
   npx expo start
   ```

4. **Generate QR code for mobile testing:**
   ```bash
   npx expo start --tunnel
   ```

5. **Scan QR code** with Expo Go app on your mobile device

### Database Models

#### User Model
- `username`: Unique username
- `email`: Unique email address
- `phone`: Unique phone number
- `password`: Hashed password
- `vehicleType`: '2-wheeler' or '4-wheeler'
- `preferences`: User settings and preferences
- `isActive`: Account status
- `lastLogin`: Last login timestamp

#### CampusPoint Model (Alert Points)
- `name`: Point name/description
- `type`: Alert type (Speed Camera, Speed Breaker, etc.)
- `lat/lng`: GPS coordinates
- `speedLimit`: Speed limit for the area
- `alertDistance`: Alert trigger distance in meters
- `severity`: Alert severity level
- `description`: Additional details
- `isActive`: Point status

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/preferences` - Update user preferences
- `GET /api/auth/verify` - Verify JWT token

### Alert Points
- `GET /api/points` - Get all alert points

## Usage Flow

1. **Launch App** → Home Screen with Highway Halo branding
2. **Authentication** → Login or Signup with credentials
3. **Vehicle Selection** → Choose 2-wheeler or 4-wheeler
4. **Location Permission** → Grant GPS access
5. **Map Screen** → Real-time tracking with alerts
6. **Safety Alerts** → Receive warnings for hazards and speed violations

## Key Features Implementation

### Speed Monitoring
- Real-time GPS speed calculation
- Speed limit display for current area
- Speed violation warnings
- Vehicle-specific speed limits

### Proximity Alerts
- 100m+ advance warning system
- Multiple alert types (cameras, speed breakers, etc.)
- Distance-based trigger system
- Visual and animated notifications

### Location Services
- High-accuracy GPS tracking
- Background location updates
- Map centering on user location
- Real-time coordinate updates

### User Experience
- Persistent login sessions
- Vehicle type preferences
- Smooth navigation flow
- Mobile-optimized interface

## Development Commands

### Backend
```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
```

### Mobile App
```bash
npx expo start              # Start development server
npx expo start --tunnel     # Start with tunnel for QR code
npx expo start --web        # Start web version
```

## Testing

1. **Backend Testing:**
   - Test API endpoints with Postman or similar tool
   - Verify database connections
   - Check authentication flow

2. **Mobile Testing:**
   - Use Expo Go app for real device testing
   - Test on both iOS and Android
   - Verify GPS functionality
   - Test alert system with sample data

## Future Enhancements

- Voice alerts and notifications
- Offline map support
- Social features (report hazards)
- Integration with traffic APIs
- Machine learning for personalized alerts
- Wearable device integration

## Troubleshooting

### Common Issues

1. **Location not working:**
   - Check device location permissions
   - Ensure GPS is enabled
   - Test in outdoor environment

2. **Backend connection failed:**
   - Verify backend server is running
   - Check API_BASE_URL in authService.js
   - Ensure CORS is properly configured

3. **Authentication issues:**
   - Check JWT secret configuration
   - Verify database connection
   - Check user registration/login flow

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team.