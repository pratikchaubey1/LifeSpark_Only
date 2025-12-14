const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const router = express.Router();

const apiKey = process.env.GEMINI_API_KEY;
let model = null;

if (apiKey) {
  const genAI = new GoogleGenerativeAI(apiKey);
  model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
} else {
  console.warn('[Gemini] GEMINI_API_KEY is not set. /api/test will return error.');
}

async function evaluateTest(answers) {
  if (!model) {
    const err = new Error('GEMINI_API_KEY is not configured on the server');
    err.status = 500;
    throw err;
  }

  const prompt = [
    'You are an exam evaluator.',
    'Evaluate the following user answers and respond in JSON only, with this shape:',
    '{ "score": number (0-100), "feedback": string }.',
    'User answers data:\n',
    JSON.stringify(answers, null, 2),
  ].join('\n');

  const result = await model.generateContent({
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }],
      },
    ],
  });

  const text = result.response.text();

  try {
    return JSON.parse(text);
  } catch (_) {
    // If model did not return pure JSON, wrap the raw text
    return { score: null, feedback: text };
  }
}

router.post('/', async (req, res) => {
  try {
    const { answers } = req.body || {};

    if (!answers) {
      return res.status(400).json({
        ok: false,
        error: 'answers field is required in request body',
      });
    }

    const result = await evaluateTest(answers);

    return res.json({ ok: true, result });
  } catch (err) {
    console.error('[Gemini] /api/test error:', err);

    const status = err.response?.status || err.status;
    const code = err.code || err.error?.code;
    const msg = err.message || 'Unknown Gemini error';

    // Handle overloaded / 503 from model
    if (status === 503 || code === 503 || /overloaded/i.test(msg)) {
      return res.status(503).json({
        ok: false,
        error: 'The AI model is overloaded. Please try again in a few minutes.',
      });
    }

    return res.status(status && typeof status === 'number' ? status : 500).json({
      ok: false,
      error: 'Failed to evaluate test. Please try again later.',
      details: process.env.NODE_ENV === 'development' ? msg : undefined,
    });
  }
});

module.exports = router;
