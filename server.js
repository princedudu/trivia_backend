const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');
const crypto = require('crypto'); // Built-in Node.js module for hashing
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

// Function to generate a unique User ID from an IP
function generateUserId(ip) {
    // Create a short, unique ID by hashing the IP with MD5 and taking the first 8 characters
    return crypto.createHash('md5').update(ip).digest('hex').slice(0, 8);
}

// Root route (optional)
app.get('/', (req, res) => {
    res.send('Welcome to the Trivia Backend! Use /responses to see data.');
});

// Submit endpoint with IP mapping to User ID
app.post('/submit', async (req, res) => {
    const responseData = req.body; // Data from front-end (timestamp, answers, score)
    // Get the x-forwarded-for header or req.ip
    const ipHeader = req.headers['x-forwarded-for'] || req.ip || 'Unknown IP';
    
    // Parse the IP list and extract the third IP
    const ipList = ipHeader.split(',').map(ip => ip.trim());
    const thirdIp = ipList[2] || ipList[0] || 'Unknown IP'; // Fallback to first IP or 'Unknown IP'
    const userId = generateUserId(thirdIp); // Generate User ID from third IP

    try {
        const filePath = path.join(__dirname, 'responses.json');
        let data = [];
        try {
            const fileData = await fs.readFile(filePath, 'utf8');
            data = JSON.parse(fileData);
        } catch (error) {
            // File doesn’t exist yet, start with empty array
        }

        // Create response object with userId as the first property
        const responseWithId = {
            userId, // First item, hashed ID
            ...responseData, // Spread original data (timestamp, answers, score)
            ip: ipHeader, // Full IP list for reference
            receivedAt: new Date().toISOString() // Server receipt time
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
