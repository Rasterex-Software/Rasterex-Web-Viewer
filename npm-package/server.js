#!/usr/bin/env node

const express = require('express');
const path = require('path');

const app = express();

const PORT = process.env.PORT || 3000;

// Serve static Angular build
const viewerPath = path.join(__dirname, 'dist', 'rasterex-viewer');

app.use(express.static(viewerPath));

// Fallback to index.html (SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(viewerPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Rasterex viewer running at http://localhost:${PORT}`);
});