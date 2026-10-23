const dns = require("node:dns");
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const cors = require("cors");

require("dotenv").config();

// Retain existing DNS configuration
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const app = express();

app.use(express.json());
app.use(cors());

// Reuse the MongoDB connection across Vercel invocations
const cached = global.mongooseCache ||
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
      .then((mongooseInstance) => {
        console.log("Connected to MongoDB");
        return mongooseInstance;
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

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

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

// POST /api/analyze
app.post("/api/analyze", async (req, res) => {
  try {
    const { topic } = req.body || {};

    if (typeof topic !== "string" || !topic.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please enter a business idea.",
      });
    }

    // Read Grok API configuration from environment variables
    const apiKey = process.env.XAI_API_KEY;
    const model = process.env.XAI_MODEL;

    // Safe diagnostic: never log the actual API key
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
You are a business validation consultant.

Analyze the following business idea:
"${topic.trim()}"

Use practical assumptions and Indian market context where relevant.
Do not claim that estimates guarantee business success.

Return ONLY valid JSON with these fields:

1. demand: A concise explanation of market demand.
2. scope: A concise explanation of business potential and growth.
3. budget: A concise estimated startup budget in INR.
4. competition: A concise explanation of competitors and differentiation.
5. metrics: Numeric scores for the dashboard.

For metrics:
- demandScore: number from 0 to 100
- probabilityOfSuccess: number from 0 to 100
- competitionScore: number from 0 to 100
- estimatedBudgetINR: estimated budget as a number in INR

Scores are estimates, not guarantees.
`;

    let response;
    const maxAttempts = 3;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const grokResponse = await fetch(
          "https://api.x.ai/v1/chat/completions",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model,
              messages: [
                {
                  role: "system",
                  content:
                    'You are a business validation consultant. Return ONLY valid JSON with the fields "demand", "scope", "budget", "competition", and "metrics". The metrics object must contain numeric demandScore, probabilityOfSuccess, competitionScore, and estimatedBudgetINR. The first three metrics must be between 0 and 100. estimatedBudgetINR must be nonnegative. Do not use Markdown code fences.',
                },
                {
                  role: "user",
                  content: prompt,
                },
              ],
              temperature: 0.3,
              max_tokens: 1200,
            }),
          }
        );

        if (!grokResponse.ok) {
          const details = await grokResponse.text();
          const error = new Error(details);
          error.status = grokResponse.status;

          console.error("Grok API error:", {
            status: grokResponse.status,
            details: details.slice(0, 1500),
          });

          throw error;
        }

        const grokData = await grokResponse.json();
        const grokText =
          grokData.choices?.[0]?.message?.content;

        if (
          typeof grokText !== "string" ||
          !grokText.trim()
        ) {
          throw new Error("Grok returned an empty response.");
        }

        response = { text: grokText.trim() };
        break;
      } catch (err) {
        const errorText = String(err.message || "");
        const status = Number(err.status || err.code || 0);

        if (status === 401 || status === 403) {
          return res.status(status).json({
            success: false,
            message:
              "Grok authentication failed. Check your XAI_API_KEY and xAI API access.",
          });
        }

        if (status === 400) {
          return res.status(400).json({
            success: false,
            message:
              "Grok rejected the request. Check XAI_MODEL and the API request settings.",
          });
        }

        if (
          status === 429 ||
          /RESOURCE_EXHAUSTED|quota exceeded/i.test(errorText)
        ) {
          return res.status(429).json({
            success: false,
            message:
              "Grok API quota or rate limit reached. Check your xAI API usage and billing.",
          });
        }

        const temporaryError =
          [500, 502, 503, 504].includes(status) ||
          /UNAVAILABLE|INTERNAL|overloaded|temporarily unavailable/i.test(
            errorText
          );

        if (!temporaryError || attempt === maxAttempts) {
          throw err;
        }

        const delay = 1000 * Math.pow(2, attempt - 1);

        console.log(
          `Grok temporary error. Retry ${attempt + 1}/${maxAttempts} in ${delay}ms.`
        );

        await new Promise((resolve) =>
          setTimeout(resolve, delay)
        );
      }
    }

    if (!response || !response.text) {
      throw new Error("Grok returned an empty response.");
    }

    let data;

    try {
      const cleanedText = response.text
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/, "")
        .trim();

      data = JSON.parse(cleanedText);
    } catch {
      throw new Error("Grok returned invalid JSON.");
    }

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
        throw new Error(
          `Grok returned incomplete analysis: ${field}`
        );
      }
    }

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
      throw new Error("Grok returned invalid analysis metrics.");
    }

    for (const field of [
      "demandScore",
      "probabilityOfSuccess",
      "competitionScore",
    ]) {
      if (data.metrics[field] < 0 || data.metrics[field] > 100) {
        throw new Error(`Invalid metric: ${field}`);
      }
    }

    if (data.metrics.estimatedBudgetINR < 0) {
      throw new Error("Invalid estimated budget.");
    }

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    const errorText = String(err.message || "");
    const status = Number(err.status || err.code || 0);

    console.error("Grok analysis failed:", {
      status: status || "unknown",
      message: errorText.slice(0, 1500),
    });

    if (status === 401 || status === 403) {
      return res.status(status).json({
        success: false,
        message: "Grok authentication failed. Check your API configuration.",
      });
    }

    if (
      status === 429 ||
      /RESOURCE_EXHAUSTED|quota exceeded/i.test(errorText)
    ) {
      return res.status(429).json({
        success: false,
        message:
          "Grok API quota or rate limit reached. Check your xAI API usage and billing.",
      });
    }

    if (
      status === 503 ||
      /UNAVAILABLE|overloaded/i.test(errorText)
    ) {
      return res.status(503).json({
        success: false,
        message: "Grok is temporarily unavailable. Please try again later.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Business analysis failed. Check backend logs for details.",
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

// Start server locally
if (require.main === module) {
  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
