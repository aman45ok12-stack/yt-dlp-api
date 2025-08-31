const express = require("express");
const YTDlpWrap = require("yt-dlp-wrap").default;

const app = express();
const port = process.env.PORT || 3000;

const ytDlpWrap = new YTDlpWrap();

app.get("/", (req, res) => {
  res.send("yt-dlp API is running ✅");
});

app.get("/info", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: "Missing url parameter" });

  try {
    let data = "";
    const ytProcess = ytDlpWrap.exec([url, "-J"]); // JSON metadata only

    ytProcess.stdout.on("data", (chunk) => {
      data += chunk.toString();
    });

    ytProcess.on("close", () => {
      try {
        const parsed = JSON.parse(data);
        res.json(parsed);
      } catch (err) {
        res.status(500).json({ error: "Failed to parse yt-dlp output", raw: data });
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`yt-dlp-api running on port ${port}`);
});
