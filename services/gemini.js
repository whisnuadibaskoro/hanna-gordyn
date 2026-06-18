// services/gemini.js
console.log("✅ GEMINI SERVICE LOADED");

const { GoogleGenAI } = require("@google/genai");

// Inisialisasi Google GenAI
const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    // Optional: tambahkan konfigurasi lain jika diperlukan
    // vertexai: false, // default untuk Gemini API biasa
});

module.exports = ai;