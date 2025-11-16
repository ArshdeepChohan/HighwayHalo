const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create database connection
const dbPath = path.join(__dirname, 'highway_halo.db');
const db = new sqlite3.Database(dbPath);

// Initialize database tables
const initializeDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Create users table
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          email TEXT UNIQUE NOT NULL,
          phone TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          vehicleType TEXT,
          preferences TEXT DEFAULT '{}',
          isActive BOOLEAN DEFAULT 1,
          lastLogin DATETIME,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create alert_points table
      db.run(`
        CREATE TABLE IF NOT EXISTS alert_points (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          type TEXT NOT NULL,
          lat REAL NOT NULL,
          lng REAL NOT NULL,
          speedLimit INTEGER,
          alertDistance INTEGER DEFAULT 100,
          severity TEXT DEFAULT 'Medium',
          description TEXT,
          isActive BOOLEAN DEFAULT 1,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          console.error('Error creating tables:', err);
          reject(err);
        } else {
          console.log('✅ Database tables created successfully');
          insertSampleData();
          resolve();
        }
      });
    });
  });
};

// Insert sample alert points
const insertSampleData = () => {
  const samplePoints = [
    {
      name: "Speed Camera",
      type: "Speed Camera",
      lat: 30.8600959,
      lng: 75.8610409,
      speedLimit: 40,
      alertDistance: 150,
      severity: "High",
      description: "Speed camera enforcement zone"
    },
    {
      name: "Speed Breaker",
      type: "Speed Breaker",
      lat: 30.8611150,
      lng: 75.8610131,
      speedLimit: 20,
      alertDistance: 100,
      severity: "High",
      description: "High accident zone with speed breaker"
    },
    {
      name: "Red Light",
      type: "Red Light",
      lat: 30.8630000,
      lng: 75.8600000,
      speedLimit: 0,
      alertDistance: 200,
      severity: "Critical",
      description: "Traffic signal intersection"
    },
    {
      name: "School Zone",
      type: "School Zone",
      lat: 30.8615000,
      lng: 75.8615000,
      speedLimit: 20,
      alertDistance: 150,
      severity: "High",
      description: "School zone with reduced speed limit"
    }
  ];

  // Check if data already exists
  db.get("SELECT COUNT(*) as count FROM alert_points", (err, row) => {
    if (err) {
      console.error('Error checking data:', err);
      return;
    }

    if (row.count === 0) {
      console.log('📊 Inserting sample alert points...');
      const stmt = db.prepare(`
        INSERT INTO alert_points (name, type, lat, lng, speedLimit, alertDistance, severity, description)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      samplePoints.forEach(point => {
        stmt.run([
          point.name,
          point.type,
          point.lat,
          point.lng,
          point.speedLimit,
          point.alertDistance,
          point.severity,
          point.description
        ]);
      });

      stmt.finalize();
      console.log('✅ Sample data inserted successfully');
    } else {
      console.log('📊 Sample data already exists');
    }
  });
};

// User operations
const userOperations = {
  // Create user
  createUser: (userData) => {
    return new Promise((resolve, reject) => {
      const { username, email, phone, password } = userData;
      const preferences = JSON.stringify({
        speedUnit: 'km/h',
        alertDistance: 100,
        enableSpeedAlerts: true,
        enableProximityAlerts: true
      });

      db.run(
        `INSERT INTO users (username, email, phone, password, preferences) 
         VALUES (?, ?, ?, ?, ?)`,
        [username, email, phone, password, preferences],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id: this.lastID, ...userData });
          }
        }
      );
    });
  },

  // Find user by identifier (username, email, or phone)
  findUserByIdentifier: (identifier) => {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT * FROM users WHERE username = ? OR email = ? OR phone = ?`,
        [identifier, identifier, identifier],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row);
          }
        }
      );
    });
  },

  // Find user by ID
  findUserById: (id) => {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT * FROM users WHERE id = ?`,
        [id],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row);
          }
        }
      );
    });
  },

  // Update user preferences
  updateUserPreferences: (id, preferences) => {
    return new Promise((resolve, reject) => {
      const preferencesJson = JSON.stringify(preferences);
      db.run(
        `UPDATE users SET preferences = ? WHERE id = ?`,
        [preferencesJson, id],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ changes: this.changes });
          }
        }
      );
    });
  },

  // Update last login
  updateLastLogin: (id) => {
    return new Promise((resolve, reject) => {
      db.run(
        `UPDATE users SET lastLogin = CURRENT_TIMESTAMP WHERE id = ?`,
        [id],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ changes: this.changes });
          }
        }
      );
    });
  }
};

// Alert points operations
const alertPointsOperations = {
  // Get all alert points
  getAllPoints: () => {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT * FROM alert_points WHERE isActive = 1`,
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            // Parse preferences JSON
            const points = rows.map(row => ({
              ...row,
              preferences: row.preferences ? JSON.parse(row.preferences) : {}
            }));
            resolve(points);
          }
        }
      );
    });
  }
};

module.exports = {
  db,
  initializeDatabase,
  userOperations,
  alertPointsOperations
};



