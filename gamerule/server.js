const express = require("express");
const path = require("path");
const http = require("http");

const app = express();

// Serve static files from the same directory
app.use(express.static(__dirname));

// Serve index.html for root and any subpaths (simple SPA-like routing)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

const PORT = process.env.PORT || 8081;
const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`Game Rules server listening on port ${PORT}`);
  console.log(`Access at http://localhost:${PORT}`);
});
