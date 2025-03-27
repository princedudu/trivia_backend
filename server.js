const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

// Root route (optional, avoids "Cannot GET /")
app.get('/', (req, res) => {
    res.send('Welcome to the Trivia Backend! Use /responses to see data.');
});

// Submit endpoint with IP tracking
app.post('/submit', async (req, res) => {
    const responseData = req.body; // Data sent from front-end (timestamp, answers, score)
    // Capture the client's IP address
    const clientIp = req.headers['x-forwarded-for'] || req.ip || 'Unknown IP';
    
    try {
        const filePath = path.join(__dirname, 'responses.json');
        let data = [];
        try {
            const fileData = await fs.readFile(filePath, 'utf8');
            data = JSON.parse(fileData);
        } catch (error) {
            // File doesn’t exist yet, start with empty array
        }

        // Combine response data with IP
        const responseWithIp = {
            ...responseData,
            ip: clientIp,
            receivedAt: new Date().toISOString() // Optional: when the server received it
        };
        data.push(responseWithIp);

        await fs.writeFile(filePath, JSON.stringify(data, null, 2));
        res.status(200).json({ message: 'Data saved successfully' });
    } catch (error) {
        console.error('Error saving data:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Responses endpoint
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
