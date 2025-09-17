const express = require('express');
const path = require('path');
const serveIndex = require('serve-index');
const app = express();
const PORT = 3000;

// Serve everything in the Website folder at /Website
app.use('/Website', express.static(path.join(__dirname, 'Website')));
app.use('/Website/songs', serveIndex(path.join(__dirname, 'Website/songs'), { icons: true }));

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/Website/musicweb.html`);
});
