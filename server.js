const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

// Simple hash function to generate a unique ID from IPs
function generateUserId(ip1, ip2) {
    // Combine the two IPs into a single string
    const combined = `${ip1}-${ip2}`;
    // Simple hash: sum character codes and take modulo for a short ID
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
        hash = (hash + combined.charCodeAt(i)) % 1000000; // Keep it 6 digits max
    }
    return `user-${hash.toString().padStart(6, '0')}`; // e.g., user-012345
}

app.use(express.json());
app.use(cors());

// Root route
app.get('/', (req, res) => {
    res.send('Welcome to the Trivia Backend! Use /responses to see data.');
});

// Submit endpoint with IP parsing and User ID
app.post('/submit', async (req, res) => {
    const responseData = req.body; // Data from front-end
    const forwardedFor = req.headers['x-forwarded-for'] || req.ip || 'Unknown IP';
    
    // Parse the first two IPs from X-Forwarded-For
    const ipList = forwardedFor.split(',').map(ip => ip.trim());
    const ip1 = ipList[0] || 'Unknown';
    const ip2 = ipList[1] || 'Unknown';
    const userId = generateUserId(ip1, ip2); // Generate unique User ID

    try {
        const filePath = path.join(__dirname, 'responses.json');
        let data = [];
        try {
            const fileData = await fs.readFile(filePath, 'utf8');
            data = JSON.parse(fileData);
        } catch (error) {
            // File doesn’t exist yet, start with empty array
        }

        // Create response object with User ID as the first key
        const responseWithId = {
            userId, // First property
            ...responseData, // Spread existing data (timestamp, answers, score)
            ip: forwardedFor, // Keep full IP string for reference
            receivedAt: new Date().toISOString()
        };
        data.push(responseWithId);

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
        } catch (error) {}
        res.status(200).json(data);
    } catch (error) {
        console.error('Error reading responses:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
