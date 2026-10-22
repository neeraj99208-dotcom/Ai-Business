const { GoogleGenAI, Type } = require("@google/genai");
const dns = require("node:dns");
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const cors = require("cors");

require("dotenv").config();

// DNS configuration retained from your existing project
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const app = express();

app.use(express.json());
app.use(cors());

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) =>
    console.error("MongoDB connection error:", err.message)
  );

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

const User = mongoose.model("User", userSchema);

// POST /api/signup
app.post("/api/signup", async (req, res) => {
  try {
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

    const existingUser = await User.findOne({
      username: username.trim(),
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Username already taken",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username: username.trim(),
      password: hashedPassword,
    });

    await newUser.save();

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

    const apiKey = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_MODEL;

    if (!apiKey || !model) {
      console.error(
        "GEMINI_API_KEY or GEMINI_MODEL is missing."
      );

      return res.status(500).json({
        success: false,
        message: "AI service configuration is missing.",
      });
    }

    const ai = new GoogleGenAI({
      apiKey: apiKey,
    });

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

    // Retry only temporary server errors.
    // Do not repeatedly retry exhausted quota errors.
    const maxAttempts = 3;
    let response;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        response = await ai.models.generateContent({
          model: model,
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                demand: {
                  type: Type.STRING,
                },
                scope: {
                  type: Type.STRING,
                },
                budget: {
                  type: Type.STRING,
                },
                competition: {
                  type: Type.STRING,
                },
                metrics: {
                  type: Type.OBJECT,
                  properties: {
                    demandScore: {
                      type: Type.NUMBER,
                    },
                    probabilityOfSuccess: {
                      type: Type.NUMBER,
                    },
                    competitionScore: {
                      type: Type.NUMBER,
                    },
                    estimatedBudgetINR: {
                      type: Type.NUMBER,
                    },
                  },
                  required: [
                    "demandScore",
                    "probabilityOfSuccess",
                    "competitionScore",
                    "estimatedBudgetINR",
                  ],
                },
              },
              required: [
                "demand",
                "scope",
                "budget",
                "competition",
                "metrics",
              ],
            },
          },
        });

        break;
      } catch (err) {
        const errorText = String(err.message || "");
        const status = Number(err.status || err.code || 0);

        const quotaExceeded =
          status === 429 ||
          /RESOURCE_EXHAUSTED|quota exceeded/i.test(errorText);

        if (quotaExceeded) {
          console.error("Gemini quota exhausted.");

          return res.status(429).json({
            success: false,
            message:
              "Gemini API quota exhausted. Please try again after your quota resets.",
          });
        }

        const temporaryError =
          [500, 502, 503, 504].includes(status) ||
          /UNAVAILABLE|INTERNAL|overloaded/i.test(errorText);

        if (!temporaryError || attempt === maxAttempts) {
          throw err;
        }

        const delay = 1000 * Math.pow(2, attempt - 1);

        console.log(
          `Gemini temporary error. Retry ${attempt + 1}/${maxAttempts} in ${delay}ms.`
        );

        await new Promise((resolve) =>
          setTimeout(resolve, delay)
        );
      }
    }

    if (!response || !response.text) {
      throw new Error("Gemini returned an empty response.");
    }

    let data;

    try {
      data = JSON.parse(response.text);
    } catch {
      throw new Error("Gemini returned invalid JSON.");
    }

    // Validate the required analysis fields
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
          `Gemini returned incomplete analysis: ${field}`
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
      throw new Error("Gemini returned invalid analysis metrics.");
    }

    for (const field of [
      "demandScore",
      "probabilityOfSuccess",
      "competitionScore",
    ]) {
      if (
        data.metrics[field] < 0 ||
        data.metrics[field] > 100
      ) {
        throw new Error(`Invalid metric: ${field}`);
      }
    }

    if (data.metrics.estimatedBudgetINR < 0) {
      throw new Error("Invalid estimated budget.");
    }

    return res.status(200).json({
      success: true,
      data: data,
    });
  } catch (err) {
    const errorText = String(err.message || "");
    const status = Number(err.status || err.code || 0);

    console.error("Gemini analysis failed:", errorText);

    // Handle quota errors that reach the outer catch
    if (
      status === 429 ||
      /RESOURCE_EXHAUSTED|quota exceeded/i.test(errorText)
    ) {
      return res.status(429).json({
        success: false,
        message:
          "Gemini API quota exhausted. Please try again after your quota resets.",
      });
    }

    if (
      status === 503 ||
      /UNAVAILABLE|overloaded/i.test(errorText)
    ) {
      return res.status(503).json({
        success: false,
        message:
          "Gemini is temporarily unavailable. Please try again later.",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Business analysis failed. Please try again later.",
    });
  }
});

// Basic backend health check
app.get("/", (req, res) => {
  res.status(200).send(
    "AI Business Validator Backend is running!"
  );
});

// Export the app for Vercel
module.exports = app;

// Start the server locally only
if (require.main === module) {
  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
