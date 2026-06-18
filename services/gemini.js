// services/gemini.js
const { GoogleGenerativeAI } = require("@google/genai");

if (!process.env.GEMINI_API_KEY) {
    console.error("❌ GEMINI_API_KEY tidak ditemukan!");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

module.exports = genAI;