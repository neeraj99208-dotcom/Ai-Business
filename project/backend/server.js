const { GoogleGenAI } = require('@google/genai');
const dns = require("node:dns");
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cors = require('cors');//

require('dotenv').config();



dns.setServers([

    "1.1.1.1",

    "8.8.8.8"

]);



const app = express();



// Middleware

app.use(express.json());

app.use(cors());



// Connect to MongoDB

mongoose.connect(process.env.MONGO_URI)

  .then(() => console.log("Connected to MongoDB"))

  .catch((err) => console.error("MongoDB connection error:", err));



// Define User Schema & Model

const userSchema = new mongoose.Schema({

  username: { type: String, required: true, unique: true },

  password: { type: String, required: true }

});



const User = mongoose.model('User', userSchema);



// Signup Route

app.post('/api/signup', async (req, res) => {

  try {

    const { username, password } = req.body;
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already taken" });
    }

    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(password, salt);



    const newUser = new User({ username, password: hashedPassword });

    await newUser.save();



    res.status(201).json({ message: "User created successfully!" });

  } catch (err) {

    console.error(err);

    res.status(500).json({ message: "Server error" });

  }

});



// Login Route

app.post('/api/login', async (req, res) => {

  try {

    const { username, password } = req.body;



    const user = await User.findOne({ username });

    if (!user) {

      return res.status(400).json({ message: "Invalid username or password" });

    }



    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {

      return res.status(400).json({ message: "Invalid username or password" });

    }



    res.status(200).json({ message: "Login successful!" });

  } catch (err) {

    console.error(err);

    res.status(500).json({ message: "Server error" });

  }

});



// AI Business Analysis Route (Ye wahi route hai jo 404 error de raha tha agar server restart na ho)

// Real Gemini AI Business Analysis Route





app.post('/api/analyze', async (req, res) => {
  try {
    const { topic } = req.body;

    if (
      typeof topic !== 'string' ||
      !topic.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a business idea.'
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_MODEL;

    if (!apiKey || !model) {
      return res.status(500).json({
        success: false,
        message:
          'Check GEMINI_API_KEY and GEMINI_MODEL in .env.'
      });
    }

    const ai = new GoogleGenAI({
      apiKey: apiKey
    });

    const prompt = `
You are an expert business validation consultant.

Analyze this exact business idea:
"${topic.trim()}"

Return ONLY a valid JSON object with these fields:

{
  "demand": "Market demand and target customers",
  "scope": "Growth opportunities and business risks",
  "budget": "Estimated startup costs and cost breakdown",
  "competition": "Relevant competitors and differentiation strategy",
  "metrics": {
    "demandScore": 0,
    "scopeScore": 0,
    "competitionScore": 0,
    "riskScore": 0,
    "startupBudget": 0,
    "monthlyExpenses": 0,
    "expectedMonthlyRevenue": 0
  }
}

Instructions:
- Make each section specific to this business idea.
- Do not return generic template answers.
- State assumptions and label budget figures as estimates.
- Do not invent verified market statistics.
- Return demand, scope, budget, and competition as strings.
- All scores must be integers from 0 to 100.
- demandScore: estimated strength of market demand.
- scopeScore: estimated business growth potential.
- competitionScore: 100 means extremely intense competition.
- riskScore: 100 means extremely high business risk.
- Financial figures must be non-negative numbers in INR.
- startupBudget: estimated initial investment required.
- monthlyExpenses: estimated monthly operating expenses.
- expectedMonthlyRevenue: estimated monthly revenue after launch.
- Base estimates on reasonable assumptions for this business idea.
- Do not present estimates as verified facts or guaranteed outcomes.
- Return all required metrics.
`;

    // Retry temporary Gemini API errors.
    let response;
    const maxAttempts = 3;

    for (
      let attempt = 1;
      attempt <= maxAttempts;
      attempt++
    ) {
      try {
        response = await ai.models.generateContent({
          model: model,
          contents: prompt,
          config: {
            temperature: 0.7,
            responseMimeType: 'application/json',
            responseSchema: {
              type: 'OBJECT',
              properties: {
                demand: {
                  type: 'STRING'
                },
                scope: {
                  type: 'STRING'
                },
                budget: {
                  type: 'STRING'
                },
                competition: {
                  type: 'STRING'
                },
                metrics: {
                  type: 'OBJECT',
                  properties: {
                    demandScore: {
                      type: 'INTEGER'
                    },
                    scopeScore: {
                      type: 'INTEGER'
                    },
                    competitionScore: {
                      type: 'INTEGER'
                    },
                    riskScore: {
                      type: 'INTEGER'
                    },
                    startupBudget: {
                      type: 'NUMBER'
                    },
                    monthlyExpenses: {
                      type: 'NUMBER'
                    },
                    expectedMonthlyRevenue: {
                      type: 'NUMBER'
                    }
                  },
                  required: [
                    'demandScore',
                    'scopeScore',
                    'competitionScore',
                    'riskScore',
                    'startupBudget',
                    'monthlyExpenses',
                    'expectedMonthlyRevenue'
                  ]
                }
              },
              required: [
                'demand',
                'scope',
                'budget',
                'competition',
                'metrics'
              ]
            }
          }
        });

        // Successful request: exit the retry loop.
        break;

      } catch (err) {
        const status = Number(err.status || err.code);
        const message = String(err.message || err);

        const retryable =
          [429, 500, 502, 503, 504].includes(status) ||
          /\b(429|500|502|503|504)\b/.test(message);

        if (!retryable || attempt === maxAttempts) {
          throw err;
        }

        // Wait 1 second, then 2 seconds.
        const delay = 1000 * Math.pow(2, attempt - 1);

        console.warn(
          `Gemini temporary error. Retrying in ${delay}ms ` +
          `(attempt ${attempt + 1}/${maxAttempts}).`
        );

        await new Promise(resolve =>
          setTimeout(resolve, delay)
        );
      }
    }

    const aiOutput = response?.text;

    if (!aiOutput) {
      return res.status(502).json({
        success: false,
        message: 'Gemini returned an empty response.'
      });
    }

    let result;

    try {
      result = JSON.parse(aiOutput);
    } catch (err) {
      console.error(
        'Gemini JSON parsing error:',
        err.message
      );

      return res.status(502).json({
        success: false,
        message: 'Gemini returned an invalid response.'
      });
    }

    // Validate the original four text fields.
    const fields = [
      'demand',
      'scope',
      'budget',
      'competition'
    ];

    const valid = fields.every(
      field =>
        typeof result[field] === 'string' &&
        result[field].trim().length > 0
    );

    if (!valid) {
      return res.status(502).json({
        success: false,
        message:
          'Gemini response is missing required sections.'
      });
    }

    // Validate numerical metrics.
    const m = result.metrics;

    const validMetrics =
      m &&
      [
        'demandScore',
        'scopeScore',
        'competitionScore',
        'riskScore'
      ].every(
        key =>
          Number.isInteger(m[key]) &&
          m[key] >= 0 &&
          m[key] <= 100
      ) &&
      [
        'startupBudget',
        'monthlyExpenses',
        'expectedMonthlyRevenue'
      ].every(
        key =>
          typeof m[key] === 'number' &&
          Number.isFinite(m[key]) &&
          m[key] >= 0
      );

    if (!validMetrics) {
      return res.status(502).json({
        success: false,
        message:
          'Gemini returned invalid business metrics.'
      });
    }

    // Return the original fields plus the metrics.
    return res.status(200).json({
      success: true,
      data: {
        demand: result.demand,
        scope: result.scope,
        budget: result.budget,
        competition: result.competition,
        metrics: result.metrics
      }
    });

  } catch (err) {
    console.error('Gemini API error:', err);
    console.error('Error message:', err.message);
    console.error('Error status:', err.status);

    return res.status(500).json({
      success: false,
      message:
        'Gemini analysis failed. Check the backend terminal.'
    });
  }
});

// Start Server

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {

  console.log(`Server running on port ${PORT}`);

});