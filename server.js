// server.js
//
// Simple Express server that:
// 1.  On each visit, looks up the visitor’s IP → location via ipapi.co
// 2.  Reads the “previous” location from lastVisitor.json
// 3.  Sends back the previous location, then overwrites lastVisitor.json with current
// 4.  Serves your static files (index.html, paradox.html, etc.)

const express = require("express");
const fetch = require("node-fetch");
const fs = require("fs").promises;
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const STORAGE_FILE = path.join(__dirname, "lastVisitor.json");

// Serve your static site from a "public" folder
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/last-location", async (req, res) => {
  try {
    // 1) Read the previous visitor’s location from disk (if it exists).
    let previous = { city: "unknown", region: "", country_name: "" };
    try {
      const data = await fs.readFile(STORAGE_FILE, "utf8");
      previous = JSON.parse(data);
    } catch (err) {
      // If file doesn’t exist, we’ll just return "unknown"
    }

    // 2) Get the requester’s IP. In a production environment behind a load
    //    balancer or reverse proxy, you may need req.headers["x-forwarded-for"]
    const visitorIp = req.headers["x-forwarded-for"] || req.ip;
    // 3) Call ipapi.co to look up the location for that IP
    const response = await fetch(`https://ipapi.co/${visitorIp}/json/`);
    const current = await response.json();
    // 4) Store the “current” visitor’s location as JSON for next time
    await fs.writeFile(STORAGE_FILE, JSON.stringify(current), "utf8");

    // 5) Return the “previous” location to the client
    res.json(previous);
  } catch (err) {
    console.error("Error in /api/last-location:", err);
    res.status(500).json({ city: "unknown", region: "", country_name: "" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});