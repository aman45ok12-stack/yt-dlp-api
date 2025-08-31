const express = require("express");
const YTDlpWrap = require("yt-dlp-wrap").default;
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;

const ytDlpWrap = new YTDlpWrap();

app.get("/download", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: "Missing url parameter" });

  try {
    let output = "";
    ytDlpWrap
      .exec([url, "-f", "bestaudio", "-x", "--audio-format", "mp3", "-o", "-"])
      .on("data", (data) => {
        output += data.toString();
      })
      .on("close", () => {
        res.send(output);
      });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`yt-dlp-api running on ${port}`);
});

