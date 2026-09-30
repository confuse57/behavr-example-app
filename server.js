require("dotenv").config();

const path = require("path");
const express = require("express");
const multer = require("multer");
const { BehavrClient, BehavrApiError } = require("behavr-sdk");

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.BEHAVR_API_KEY;

if (!API_KEY || API_KEY === "your_api_key_here") {
  console.error("Missing BEHAVR_API_KEY. Set it in .env (see README.md).");
  process.exit(1);
}

// The API key stays on the server — the browser only talks to /api/*.
const behavr = new BehavrClient({ apiKey: API_KEY });

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Upload a file and remember it for a customer.
app.post("/api/remember", upload.single("file"), async (req, res, next) => {
  try {
    const customerId = (req.body.customerId || req.query.customerId || "").trim();
    if (!customerId) return res.status(400).json({ error: "customerId is required." });
    if (!req.file) return res.status(400).json({ error: "Please choose a file to upload." });

    const file = new File([req.file.buffer], req.file.originalname, {
      type: req.file.mimetype,
    });

    const result = await behavr.remember({ file, externalUserId: customerId });
    res.json({
      memory_id: result.memoryId,
      status: result.status,
      summary: result.summary,
    });
  } catch (err) {
    next(err);
  }
});

// Ask a question scoped to a single customer's memories.
app.post("/api/ask", async (req, res, next) => {
  try {
    const customerId = (req.body.customerId || "").trim();
    const question = (req.body.question || "").trim();
    if (!customerId) return res.status(400).json({ error: "customerId is required." });
    if (!question) return res.status(400).json({ error: "question is required." });

    const result = await behavr.ask({ question, externalUserId: customerId });
    res.json({ answer: result.answer, sources: result.sources || [] });
  } catch (err) {
    next(err);
  }
});

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.message });
  }
  if (err instanceof BehavrApiError) {
    console.error("BEHAVR API error:", err.status, err.payload);
    const detail = (err.payload && err.payload.detail) || err.message;
    return res.status(502).json({ error: `BEHAVR API error (${err.status}): ${detail}` });
  }
  console.error(err);
  res.status(500).json({ error: "Something went wrong. Check the server logs." });
});

app.listen(PORT, () => {
  console.log(`BEHAVR support demo running at http://localhost:${PORT}`);
});
