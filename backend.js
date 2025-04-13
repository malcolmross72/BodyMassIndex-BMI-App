const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;
const dataFile = path.join(__dirname, 'bmiData.json');

// Allow Live Server (5500) access
app.use(cors({
  origin: ['http://127.0.0.1:5500', 'http://localhost:5500'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

app.use(bodyParser.json());

// Ensure file exists
function ensureFile() {
  if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, JSON.stringify({ users: [], entries: [] }, null, 2));
  }
}

function readData() {
  ensureFile();
  return JSON.parse(fs.readFileSync(dataFile));
}

function writeData(data) {
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
}

// Register
app.post('/api/register', (req, res) => {
  const { userId, passcode } = req.body;
  const data = readData();
  if (data.users.find(u => u.userId === userId)) {
    return res.json({ success: false, message: "ID already exists." });
  }
  data.users.push({ userId, passcode });
  writeData(data);
  res.json({ success: true, message: "New ID created!" });
});

// Login
app.post('/api/login', (req, res) => {
  const { userId, passcode } = req.body;
  const data = readData();
  const user = data.users.find(u => u.userId === userId && u.passcode === passcode);
  res.json({ success: !!user, message: user ? "Login successful" : "Invalid credentials" });
});

// Save BMI Entry
app.post('/api/saveEntry', (req, res) => {
  const { userId, date, weight } = req.body;
  const data = readData();
  data.entries.push({ userId, date, weight });
  writeData(data);
  res.json({ success: true });
});

// Get BMI Entries
app.get('/api/getEntries', (req, res) => {
  const { userId } = req.query;
  const data = readData();
  const entries = data.entries.filter(e => e.userId === userId);
  res.json({ entries });
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));