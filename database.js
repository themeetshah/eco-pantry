import sqlite3 from 'sqlite3';

// Since sqlite3 is a constructor, we need to initialize it with the verbose() method
const db = new sqlite3.Database('./kitchen_dashboard.db', (err) => {
    if (err) {
        console.error('Could not open database:', err);
        return;
    }
    console.log('Connected to the SQLite database.');
});

// Create tables for inventory, orders, etc.
db.serialize(() => {
    // Create Inventory Table
    db.run(`
    CREATE TABLE IF NOT EXISTS inventory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      quantity INTEGER,
      status TEXT,
      expiry TEXT,
      cost TEXT
    )
  `);

    // Insert some initial data into the inventory table
    // const stmt = db.prepare(`
    //     INSERT INTO inventory (name, quantity, status, expiry, cost) VALUES
    //     ('Tomatoes', 3, 'Warning', '2025-04-15', '120'),
    //     ('Lettuce', 5, 'Good', '2025-05-01', '80'),
    //     ('Cheese', 1, 'Danger', '2025-03-30', '200')
    //   `);
    // stmt.run(() => {
    //     console.log('Initial inventory data inserted.');
    // });

    // stmt.finalize();
});

export default db; // Export the database connection to be used in your server
