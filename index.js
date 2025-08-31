const express = require("express");
const { spawn } = require("child_process");

const app = express();
const PORT = process.env.PORT || 10000;

// Endpoint to fetch video info
app.get("/info", (req, res) => {
  const url = req.query.url;
  if (!url) {
    return res.status(400).json({ error: "Missing URL parameter ?url=" });
  }

  // Run yt-dlp via python3
  const ytdlp = spawn("python3", ["-m", "yt_dlp", "-j", url]);

  let data = "";
  let error = "";

  ytdlp.stdout.on("data", (chunk) => {
    data += chunk.toString();
  });

  ytdlp.stderr.on("data", (chunk) => {
    error += chunk.toString();
  });

  ytdlp.on("close", (code) => {
    if (code === 0) {
      try {
        const json = JSON.parse(data);
        res.json(json);
      } catch (err) {
        res.status(500).json({ error: "Failed to parse yt-dlp output", details: err.message });
      }
    } else {
      res.status(500).json({ error: "yt-dlp failed", details: error });
    }
  });
});

// Endpoint to download audio
app.get("/download", (req, res) => {
  const url = req.query.url;
  if (!url) {
    return res.status(400).json({ error: "Missing URL parameter ?url=" });
  }

  // Run yt-dlp via python3 for audio extraction
  const ytdlp = spawn("python3", ["-m", "yt_dlp", "-f", "bestaudio", "-o", "-", url]);

  res.setHeader("Content-Type", "audio/mpeg");

  ytdlp.stdout.pipe(res);

  ytdlp.stderr.on("data", (chunk) => {
    console.error("yt-dlp error:", chunk.toString());
  });

  ytdlp.on("close", (code) => {
    if (code !== 0) {
      res.status(500).json({ error: "yt-dlp failed while downloading audio" });
    }
  });
});

app.listen(PORT, () => {
  console.log(`yt-dlp API running on port ${PORT}`);
});
