const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

// POST endpoint to save responses
app.post('/submit', async (req, res) => {
    const responseData = req.body;
    try {
        const filePath = path.join(__dirname, 'responses.json');
        let data = [];
        try {
            const fileData = await fs.readFile(filePath, 'utf8');
            data = JSON.parse(fileData);
        } catch (error) {
            // File doesn’t exist yet, start with empty array
        }

        data.push(responseData);
        await fs.writeFile(filePath, JSON.stringify(data, null, 2));
        res.status(200).json({ message: 'Data saved successfully' });
    } catch (error) {
        console.error('Error saving data:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET endpoint to retrieve responses
app.get('/responses', async (req, res) => {
    try {
        const filePath = path.join(__dirname, 'responses.json');
        let data = [];
        try {
            const fileData = await fs.readFile(filePath, 'utf8');
            data = JSON.parse(fileData);
        } catch (error) {
            // File doesn’t exist yet, return empty array
        }
        res.status(200).json(data);
    } catch (error) {
        console.error('Error reading responses:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
