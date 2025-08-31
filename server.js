import express from "express";
import { exec } from "child_process";
import cors from "cors";

const app = express();
app.use(cors());

app.get("/download", (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: "No URL provided" });

  const command = `yt-dlp -x --audio-format mp3 --get-url "${url}"`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ error: stderr || error.message });
    }
    res.json({ audioUrl: stdout.trim() });
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`yt-dlp API running on port ${port}`);
});
