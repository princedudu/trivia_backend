const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files (your HTML, CSS, JS)
app.use(express.static(path.join(__dirname, './trivia-frontend'))); // Adjust path if needed

// Endpoint to receive trivia responses
app.post('/submit', async (req, res) => {
    const responseData = req.body;
    try {
        // Read existing data
        let data = [];
        const filePath = path.join(__dirname, 'responses.json');
        try {
            const fileData = await fs.readFile(filePath, 'utf8');
            data = JSON.parse(fileData);
        } catch (error) {
            // File doesn’t exist yet, start with empty array
        }

        // Add new response
        data.push(responseData);

        // Write back to file
        await fs.writeFile(filePath, JSON.stringify(data, null, 2));
        res.status(200).send('Data saved successfully');
    } catch (error) {
        console.error('Error saving data:', error);
        res.status(500).send('Server error');
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});