const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./inventory.db');
const bcrypt = require('bcrypt');

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS gadgets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        quantity INTEGER NOT NULL,
        secretInfo TEXT
    )`);
    
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
    )`);
    console.log("Database and tables created");
    
  
  
    // Check if the `users` table already has entries
    db.get(`SELECT COUNT(*) AS count FROM users`, (err, row) => {
      if (err) {
        return console.error('❌ Error checking users table:', err.message);
      }
  
      if (row.count === 0) {
        const username = 'admin';
        const plainPassword = 'admin123';
        // If no users exist, insert the default admin user
        bcrypt.hash(plainPassword, 10, (err, hashedPassword) => {
          if (err) return console.error(err.message);
  
          db.run(
            `INSERT INTO users (username, password) VALUES (?, ?)`,
            [username, hashedPassword],
            function (err) {
              if (err) return console.error('❌ User creation failed:', err.message);
              console.log('✅ Default admin user registered!');
            }
          );
        });
      } else {
        console.log('✅ Users already exist. Skipping default user creation.');
      }
    });

});

module.exports = db;