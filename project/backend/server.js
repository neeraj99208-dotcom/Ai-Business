import { xai } from '@ai-sdk/xai';
import { generateText } from 'ai';
const dns = require("node:dns");
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const cors = require("cors");

require("dotenv").config();

dns.setServers(["1.1.1.1", "8.8.8.8"]);

const app = express();

app.use(express.json());
app.use(cors());

// MongoDB connection cache
const cached =
  global.mongooseCache ||
  (global.mongooseCache = { conn: null, promise: null });

async function connectDB() {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI environment variable is missing.");
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 10000,
      })
      .then((connection) => {
        console.log("Connected to MongoDB");
        return connection;
      })
      .catch((err) => {
        cached.promise = null;
        console.error("MongoDB connection error:", err.message);
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

// User schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

const User =
  mongoose.models.User || mongoose.model("User", userSchema);

// POST /api/signup
app.post("/api/signup", async (req, res) => {
  try {
    await connectDB();

    const { username, password } = req.body || {};

    if (
      typeof username !== "string" ||
      typeof password !== "string" ||
      !username.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "Username and password are required.",
      });
    }

    const cleanUsername = username.trim();

    const existingUser = await User.findOne({
      username: cleanUsername,
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Username already taken",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      username: cleanUsername,
      password: hashedPassword,
    });

    return res.status(201).json({
      message: "User created successfully!",
    });
  } catch (err) {
    console.error("Signup error:", err.message);

    if (err.code === 11000) {
      return res.status(400).json({
        message: "Username already taken",
      });
    }

    return res.status(500).json({
      message: "Server error during signup.",
    });
  }
});

// POST /api/login
app.post("/api/login", async (req, res) => {
  try {
    await connectDB();

    const { username, password } = req.body || {};

    if (
      typeof username !== "string" ||
      typeof password !== "string" ||
      !username.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "Username and password are required.",
      });
    }

    const user = await User.findOne({
      username: username.trim(),
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid username or password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid username or password",
      });
    }

    return res.status(200).json({
      message: "Login successful!",
    });
  } catch (err) {
    console.error("Login error:", err.message);

    return res.status(500).json({
      message: "Server error during login.",
    });
  }
});

// POST /api/analyze — Grok Responses API
app.post("/api/analyze", async (req, res) => {
  try {
    const { topic } = req.body || {};

    if (typeof topic !== "string" || !topic.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please enter a business idea.",
      });
    }

    const apiKey = process.env.XAI_API_KEY;
    const model = process.env.XAI_MODEL || "grok-4.7";

    // Check environment configuration safely
    if (!apiKey || !model) {
      console.error("Grok configuration check:", {
        hasApiKey: Boolean(apiKey),
        hasModel: Boolean(model),
      });

      return res.status(500).json({
        success: false,
        message: "AI service configuration is missing.",
      });
    }

    const prompt = `
You are a business validation consultant for the Indian market.

Analyze this business idea:
${topic.trim()}

Use practical assumptions and Indian market context.
Do not guarantee business success.

Return a valid JSON object only, with these exact fields:

{
  "demand": "Concise market demand explanation",
  "scope": "Business potential and growth",
  "budget": "Estimated startup budget in INR",
  "competition": "Competitors and differentiation",
  "metrics": {
    "demandScore": 50,
    "probabilityOfSuccess": 50,
    "competitionScore": 50,
    "estimatedBudgetINR": 100000
  }
}

Requirements:
- demandScore: number from 0 to 100
- probabilityOfSuccess: number from 0 to 100
- competitionScore: number from 0 to 100
- estimatedBudgetINR: nonnegative number in INR
- Use realistic estimates, not guaranteed predictions.
- Do not include Markdown code fences.
`;

    let grokData;
    const maxAttempts = 3;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      let grokResponse;

      try {
        grokResponse = await fetch(
          "https://api.x.ai/v1/responses",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model,
              input: [
                {
                  role: "user",
                  content: prompt,
                },
              ],
            }),
          }
        );
      } catch (err) {
        // Network or connection failure
        if (attempt === maxAttempts) {
          console.error("Grok connection failed:", err.message);

          return res.status(502).json({
            success: false,
            message: "Could not connect to the Grok API.",
          });
        }

        await new Promise((resolve) =>
          setTimeout(resolve, 1000 * attempt)
        );

        continue;
      }

      if (grokResponse.ok) {
        grokData = await grokResponse.json();
        break;
      }

      const details = await grokResponse.text();
      const status = grokResponse.status;

      // Log the actual upstream error, never the API key
      console.error("Grok API error:", {
        status,
        details: details.slice(0, 1200),
      });

      if (status === 401 || status === 403) {
        return res.status(status).json({
          success: false,
          message:
            "Grok authentication failed. Check your XAI_API_KEY and API access.",
        });
      }

      if (status === 429) {
        return res.status(429).json({
          success: false,
          message:
            "Grok rate limit or usage limit reached. Check your xAI API account.",
        });
      }

      if (status === 400) {
        return res.status(400).json({
          success: false,
          message:
            "Grok rejected the request. Check the Grok API error in Vercel Logs.",
        });
      }

      if (![500, 502, 503, 504].includes(status)) {
        return res.status(502).json({
          success: false,
          message: "The Grok API returned an unexpected error.",
        });
      }

      if (attempt === maxAttempts) {
        return res.status(503).json({
          success: false,
          message: "Grok is temporarily unavailable. Please try again.",
        });
      }

      await new Promise((resolve) =>
        setTimeout(resolve, 1000 * Math.pow(2, attempt - 1))
      );
    }

    if (!grokData) {
      return res.status(502).json({
        success: false,
        message: "Grok did not return a response.",
      });
    }

    // Extract text from the Responses API output
    const outputText = (grokData.output || [])
      .filter((item) => item.type === "message")
      .flatMap((item) => item.content || [])
      .filter((item) => item.type === "output_text")
      .map((item) => item.text || "")
      .join("\n")
      .trim();

    if (!outputText) {
      console.error(
        "Grok returned no output text:",
        JSON.stringify(grokData).slice(0, 1200)
      );

      return res.status(502).json({
        success: false,
        message: "Grok returned an empty analysis.",
      });
    }

    // Parse JSON returned by Grok
    let data;

    try {
      const cleanedText = outputText
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/, "")
        .trim();

      data = JSON.parse(cleanedText);
    } catch (err) {
      console.error("Grok returned invalid JSON:", outputText.slice(0, 500));

      return res.status(502).json({
        success: false,
        message: "Grok returned an invalid analysis format. Please retry.",
      });
    }

    // Validate required text fields
    const requiredFields = [
      "demand",
      "scope",
      "budget",
      "competition",
    ];

    for (const field of requiredFields) {
      if (
        typeof data[field] !== "string" ||
        !data[field].trim()
      ) {
        return res.status(502).json({
          success: false,
          message: `Grok returned incomplete analysis: ${field}. Please retry.`,
        });
      }
    }

    // Validate numeric metrics
    const metricFields = [
      "demandScore",
      "probabilityOfSuccess",
      "competitionScore",
      "estimatedBudgetINR",
    ];

    if (
      !data.metrics ||
      !metricFields.every(
        (field) =>
          typeof data.metrics[field] === "number" &&
          Number.isFinite(data.metrics[field])
      )
    ) {
      return res.status(502).json({
        success: false,
        message: "Grok returned invalid dashboard metrics. Please retry.",
      });
    }

    for (const field of [
      "demandScore",
      "probabilityOfSuccess",
      "competitionScore",
    ]) {
      if (data.metrics[field] < 0 || data.metrics[field] > 100) {
        return res.status(502).json({
          success: false,
          message: `Grok returned an invalid ${field}. Please retry.`,
        });
      }
    }

    if (data.metrics.estimatedBudgetINR < 0) {
      return res.status(502).json({
        success: false,
        message: "Grok returned an invalid estimated budget.",
      });
    }

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    console.error("Analysis route error:", err.message);

    return res.status(500).json({
      success: false,
      message: "Business analysis failed. Please try again later.",
    });
  }
});

// Health check
app.get("/", (req, res) => {
  res.status(200).send(
    "AI Business Validator Backend is running!"
  );
});

// Export for Vercel
module.exports = app;

// Local development only
if (require.main === module) {
  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}