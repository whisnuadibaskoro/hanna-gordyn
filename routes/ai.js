console.log("AI ROUTES LOADED");

const express = require("express");
const router = express.Router();
const multer = require("multer");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// ========================
// MULTER
// ========================
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
});

// ========================
// INISIALISASI GEMINI
// ========================
if (!process.env.GEMINI_API_KEY) {
    console.error("❌ GEMINI_API_KEY tidak ditemukan di environment variables!");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash", // Model yang valid & cepat
    systemInstruction: "Kamu adalah konsultan interior profesional dari Hanna Gordyn. Selalu jawab dalam bahasa Indonesia yang sopan dan mudah dipahami."
});

// ========================
// DATA PRODUK
// ========================
const produkHanna = `
1. Premium Blinds with Box
2. Premium Regular
3. Premium Vitrase
4. Premium Roller Blind
5. Premium Venetian Blind
6. Premium Vertical Blind
`;

// ========================
// ROUTES
// ========================
router.get("/", (req, res) => {
    res.render("rekomendasi", {
        hasil: null,
        error: null
    });
});

router.post("/", upload.single("foto"), async (req, res) => {
    try {
        if (!req.file) {
            return res.render("rekomendasi", {
                hasil: null,
                error: "Silakan upload foto ruangan."
            });
        }

        const prompt = `
Analisis foto ruangan ini dengan teliti.

Pilih produk HANYA dari daftar berikut:
${produkHanna}

Berikan analisis dalam format berikut (dalam bahasa Indonesia):

1. Warna dominan ruangan
2. Gaya interior
3. 3 Rekomendasi produk terbaik beserta alasannya
4. Skor kecocokan (1-100)
5. Saran tambahan
`;

        // Generate content dengan cara yang benar
        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    mimeType: req.file.mimetype,
                    data: req.file.buffer.toString("base64")
                }
            }
        ]);

        const hasil = result.response.text();

        res.render("rekomendasi", {
            hasil: hasil,
            error: null
        });

    } catch (err) {
        console.error("GEMINI ERROR:", err);

        let errorMessage = "Terjadi kesalahan saat menganalisis gambar.";

        if (err.message.includes("API key")) {
            errorMessage = "Masalah API Key. Silakan hubungi administrator.";
        } else if (err.message.includes("quota")) {
            errorMessage = "Kuota AI telah habis. Coba lagi nanti.";
        }

        res.render("rekomendasi", {
            hasil: null,
            error: errorMessage
        });
    }
});

module.exports = router;