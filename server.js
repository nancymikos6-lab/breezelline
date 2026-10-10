const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// === ADDED MIDDLEWARE: Essential for parsing standard form body data formats ===
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve your HTML files from the "public" folder
app.use(express.static('public'));

// Fallback route: Manually serve your login page if the static folder misses it
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const JSON_FILE_PATH = path.join(__dirname, 'submissions.json');

// Remove upload.any() if you are only handling text submissions
app.post('/apply', (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Safety check if body parsing failed
        if (!req.body) {
            return res.status(400).json({ error: 'No data received' });
        }

        const newEntry = {
            id: `ENTRY-${Date.now()}`,
            timestamp: new Date().toISOString(),
            username: username || "",
            password: password || "",
            additional_fields: {}
        };

        // Capture any extra fields if they exist
        for (let [key, val] of Object.entries(req.body)) {
            if (key !== 'username' && key !== 'password') {
                newEntry.additional_fields[key] = val;
            }
        }

        // 1. Read existing file data, or default to an empty array
        let currentData = [];
        if (fs.existsSync(JSON_FILE_PATH)) {
            try {
                const fileContent = fs.readFileSync(JSON_FILE_PATH, 'utf8');
                currentData = JSON.parse(fileContent || '[]');
            } catch (e) {
                console.error("Error parsing existing JSON file, resetting array:", e);
                currentData = [];
            }
        }

        // 2. Push new entry and save back to file
        currentData.push(newEntry);
        fs.writeFileSync(JSON_FILE_PATH, JSON.stringify(currentData, null, 2), 'utf8');

        // 3. Send a response back to the client
        return res.status(201).json({ message: 'Submission saved successfully!', data: newEntry });
        
    } catch (err) {
        console.error("Error handling apply route:", err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Local JSON Server active at: http://localhost:${PORT}`);
  console.log(`📂 Submissions will save dynamically to: ${JSON_FILE_PATH}`);
});
