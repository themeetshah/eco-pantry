import express from 'express';
import cors from 'cors';
import db from './database.js'; // Your SQLite database module

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Add or update inventory item
app.put('/api/inventory/add/:name', (req, res) => {
    const itemName = req.params.name; // Getting item name from URL
    const { cost, expiry, status, quantity } = req.body;

    // Check if the required data is provided
    if (!cost || !expiry || !status || quantity === undefined) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    // Step 1: Check if the item already exists
    const checkQuery = `SELECT * FROM inventory WHERE name = ?`;
    db.get(checkQuery, [itemName], (err, row) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (row) {
            // Step 2: If item exists, update quantity
            const updateQuery = `
                UPDATE inventory
                SET quantity = quantity + ?, cost = ?, expiry = ?, status = ?
                WHERE name = ?
            `;

            db.run(updateQuery, [quantity, cost, expiry, status, itemName], function (err) {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ error: 'Failed to update item' });
                }
                res.status(200).json({ message: 'Item quantity updated successfully' });
            });
        } else {
            // Step 3: If item doesn't exist, insert new item
            const insertQuery = `
                INSERT INTO inventory (name, quantity, cost, expiry, status)
                VALUES (?, ?, ?, ?, ?)
            `;

            db.run(insertQuery, [itemName, quantity, cost, expiry, status], function (err) {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ error: 'Failed to add new item' });
                }
                res.status(201).json({ message: 'New item added successfully' });
            });
        }
    });
});

// Endpoint to update an item by id
app.put('/api/inventory/update/:id', (req, res) => {
    const itemId = parseInt(req.params.id);
    const { cost, expiry, status } = req.body;

    // Check if the required data is provided
    if (!cost || !expiry || !status) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    // Update the item in the database
    const query = `
        UPDATE inventory
        SET cost = ?, expiry = ?, status = ?
        WHERE id = ?
    `;

    db.run(query, [cost, expiry, status, itemId], function (err) {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to update item' });
        }

        if (this.changes === 0) {
            return res.status(404).json({ error: 'Item not found' });
        }

        res.status(200).json({ message: 'Item updated successfully' });
    });
});

// Get all inventory items
app.get('/api/inventory', (req, res) => {
    db.all('SELECT * FROM inventory', [], (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to fetch data' });
        }
        res.json(rows); // Return all items
    });
});

// Get stats
app.get('/api/stats', (req, res) => {
    const stats = {
        totalInventoryItems: 156,
        wasteReduction: '24%',
        costSavings: '₹1,240',
        optimizedRecipes: 156,
    };
    res.json(stats);
});

const API_KEY = "a98bbf28eb024fef9e8f265dd50f424c";  // Make sure to store the API key in .env

// Endpoint to fetch recipes based on ingredients
app.get('/api/recipes', async (req, res) => {
    const { ingredients } = req.query;

    if (!ingredients) {
        return res.status(400).json({ error: 'Ingredients parameter is required' });
    }

    const ingredientList = ingredients.split(',').join('%2C');  // URL encode the ingredients
    const url = `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${ingredientList}&number=3&apiKey=${API_KEY}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to fetch recipes');
        }

        const recipes = await response.json();
        res.json(recipes);  // Return recipes to frontend
    } catch (error) {
        console.error('Error fetching recipes:', error);
        res.status(500).json({ error: 'Failed to fetch recipes' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
