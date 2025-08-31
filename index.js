import express from "express";
import youtubedl from "yt-dlp-exec";

const app = express();
const PORT = process.env.PORT || 10000;

// Health check
app.get("/", (req, res) => {
  res.json({ status: "yt-dlp API is running 🚀" });
});

// Get video info
app.get("/info", async (req, res) => {
  const url = req.query.url;
  if (!url) {
    return res.status(400).json({ error: "Missing url parameter" });
  }

  try {
    const info = await youtubedl(url, {
      dumpSingleJson: true,
      noCheckCertificates: true,
      noWarnings: true,
      preferFreeFormats: true,
    });

    res.json(info);
  } catch (err) {
    console.error("yt-dlp error:", err);
    res.status(500).json({ error: "yt-dlp failed", details: err.message });
  }
});

// Download audio (mp3)
app.get("/download/audio", async (req, res) => {
  const url = req.query.url;
  if (!url) {
    return res.status(400).json({ error: "Missing url parameter" });
  }

  try {
    const output = await youtubedl(url, {
      extractAudio: true,
      audioFormat: "mp3",
      audioQuality: "192K",
      output: "-",
    });

    res.setHeader("Content-Type", "audio/mpeg");
    res.send(output);
  } catch (err) {
    console.error("yt-dlp error:", err);
    res.status(500).json({ error: "yt-dlp failed", details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`yt-dlp API running on port ${PORT}`);
});
