
const { GoogleGenAI } = require('@google/genai');
const dns = require('node:dns');
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cors = require('cors');

require('dotenv').config();

dns.setServers(['1.1.1.1', '8.8.8.8']);

const app = express();

app.use(express.json());
app.use(cors());

// -------------------- MongoDB --------------------

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) =>
    console.error('MongoDB connection error:', err.message)
  );

// -------------------- User Schema --------------------

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

// -------------------- Signup Route --------------------

app.post('/api/signup', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (
      typeof username !== 'string' ||
      !username.trim() ||
      typeof password !== 'string' ||
      !password
    ) {
      return res.status(400).json({
        message: 'Username and password are required.'
      });
    }

    const existingUser = await User.findOne({
      username: username.trim()
    });

    if (existingUser) {
      return res.status(400).json({
        message: 'Username already taken'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username: username.trim(),
      password: hashedPassword
    });

    await newUser.save();

    return res.status(201).json({
      message: 'User created successfully!'
    });
  } catch (err) {
    console.error('Signup error:', err.message);

    if (err.code === 11000) {
      return res.status(400).json({
        message: 'Username already taken'
      });
    }

    return res.status(500).json({
      message: 'Server error'
    });
  }
});

// -------------------- Login Route --------------------

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (
      typeof username !== 'string' ||
      typeof password !== 'string' ||
      !username.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: 'Username and password are required.'
      });
    }

    const user = await User.findOne({
      username: username.trim()
    });

    if (!user) {
      return res.status(400).json({
        message: 'Invalid username or password'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: 'Invalid username or password'
      });
    }

    return res.status(200).json({
      message: 'Login successful!'
    });
  } catch (err) {
    console.error('Login error:', err.message);

    return res.status(500).json({
      message: 'Server error'
    });
  }
});

// -------------------- AI Business Analysis --------------------

app.post('/api/analyze', async (req, res) => {
  try {
    const { topic } = req.body || {};

    if (typeof topic !== 'string' || !topic.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a business idea.'
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_MODEL;

    if (!apiKey || !model) {
      console.error(
        'Missing configuration:',
        !apiKey ? 'GEMINI_API_KEY' : 'GEMINI_MODEL'
      );

      return res.status(500).json({
        success: false,
        message: 'Gemini API configuration is missing in backend .env.'
      });
    }

    console.log('Starting business analysis...');
    console.log('Gemini model:', model);

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
You are an expert business validation consultant.

Analyze this exact business idea:
${topic.trim()}

Return only a valid JSON object with these fields:

{
  "demand": "Market demand and target customers",
  "scope": "Growth opportunities and business risks",
  "budget": "Estimated startup costs and cost breakdown in INR",
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

Rules:
- Make the analysis specific to the submitted business idea.
- All four text fields must be non-empty strings.
- All scores must be integers between 0 and 100.
- Higher competitionScore means more intense competition.
- Higher riskScore means greater business risk.
- Financial figures must be non-negative numbers in INR.
- Financial figures are estimates, not verified statistics.
- Do not guarantee business success.
- Return JSON only, without Markdown fences.
`;

    const responseSchema = {
      type: 'OBJECT',
      properties: {
        demand: { type: 'STRING' },
        scope: { type: 'STRING' },
        budget: { type: 'STRING' },
        competition: { type: 'STRING' },
        metrics: {
          type: 'OBJECT',
          properties: {
            demandScore: { type: 'INTEGER' },
            scopeScore: { type: 'INTEGER' },
            competitionScore: { type: 'INTEGER' },
            riskScore: { type: 'INTEGER' },
            startupBudget: { type: 'NUMBER' },
            monthlyExpenses: { type: 'NUMBER' },
            expectedMonthlyRevenue: { type: 'NUMBER' }
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
    };

    let response;

    // Retry temporary server failures, not quota/authentication errors.
    const maxAttempts = 3;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            temperature: 0.4,
            responseMimeType: 'application/json',
            responseSchema
          }
        });

        break;
      } catch (err) {
        const status = Number(err.status || err.statusCode || 0);

        console.error('Gemini request error:', {
          attempt,
          status: status || 'unknown',
          message: err.message
        });

        const retryable = [500, 502, 503, 504].includes(status);

        if (!retryable || attempt === maxAttempts) {
          throw err;
        }

        const delay = 1000 * attempt;

        console.log(`Retrying Gemini request in ${delay}ms...`);

        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    const output = response?.text;

    if (!output) {
      throw new Error('Gemini returned an empty response.');
    }

    let result;

    try {
      result = JSON.parse(output);
    } catch (err) {
      console.error('Gemini JSON parsing error:', err.message);

      return res.status(502).json({
        success: false,
        message: 'Gemini returned an invalid JSON response.'
      });
    }

    const textFields = [
      'demand',
      'scope',
      'budget',
      'competition'
    ];

    const validText = textFields.every(
      (field) =>
        typeof result[field] === 'string' &&
        result[field].trim().length > 0
    );

    const metrics = result.metrics;

    const scoreFields = [
      'demandScore',
      'scopeScore',
      'competitionScore',
      'riskScore'
    ];

    const moneyFields = [
      'startupBudget',
      'monthlyExpenses',
      'expectedMonthlyRevenue'
    ];

    const validScores =
      metrics &&
      scoreFields.every(
        (field) =>
          Number.isInteger(metrics[field]) &&
          metrics[field] >= 0 &&
          metrics[field] <= 100
      );

    const validMoney =
      metrics &&
      moneyFields.every(
        (field) =>
          typeof metrics[field] === 'number' &&
          Number.isFinite(metrics[field]) &&
          metrics[field] >= 0
      );

    if (!validText || !validScores || !validMoney) {
      console.error('Gemini returned incomplete or invalid fields.');

      return res.status(502).json({
        success: false,
        message: 'Gemini returned incomplete or invalid analysis data.'
      });
    }

    console.log('Business analysis completed successfully.');

    return res.status(200).json({
      success: true,
      data: {
        demand: result.demand,
        scope: result.scope,
        budget: result.budget,
        competition: result.competition,
        metrics: {
          demandScore: metrics.demandScore,
          scopeScore: metrics.scopeScore,
          competitionScore: metrics.competitionScore,
          riskScore: metrics.riskScore,
          startupBudget: metrics.startupBudget,
          monthlyExpenses: metrics.monthlyExpenses,
          expectedMonthlyRevenue: metrics.expectedMonthlyRevenue
        }
      }
    });
  } catch (err) {
    const status = Number(err.status || err.statusCode || 0);

    console.error('========== GEMINI ERROR ==========');
    console.error('Message:', err.message);
    console.error('Status:', status || 'unknown');
    console.error('==================================');

    if (status === 429) {
      return res.status(429).json({
        success: false,
        message: 'Gemini quota or rate limit exceeded. Check your API quota.'
      });
    }

    if (status === 400) {
      return res.status(502).json({
        success: false,
        message: 'Gemini rejected the request. Check the model and request configuration.'
      });
    }

    if (status === 401 || status === 403) {
      return res.status(502).json({
        success: false,
        message: 'Gemini API authentication or permission failed.'
      });
    }

    if (status === 404) {
      return res.status(502).json({
        success: false,
        message: 'Gemini model not found. Check GEMINI_MODEL.'
      });
    }

    if ([503, 504].includes(status)) {
      return res.status(503).json({
        success: false,
        message: 'Gemini is temporarily unavailable. Try again later.'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Gemini analysis failed. Check the backend terminal.'
    });
  }
});

// -------------------- Health Check --------------------

app.get('/', (req, res) => {
  res.status(200).send('AI Business Validator backend is running.');
});

// -------------------- Start Server --------------------

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
