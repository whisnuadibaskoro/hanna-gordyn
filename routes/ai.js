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
    limits: { fileSize: 5 * 1024 * 1024 }
});

// ========================
// INISIALISASI GEMINI
// ========================
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",   // Model yang valid
    systemInstruction: "Kamu adalah konsultan interior profesional untuk Hanna Gordyn."
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
    res.render("rekomendasi", { hasil: null, error: null });
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
Analisis foto ruangan berikut dan berikan rekomendasi produk Hanna Gordyn.

Pilih produk HANYA dari daftar ini:
${produkHanna}

Jawab dengan format yang rapi dan mudah dibaca:
1. Warna dominan ruangan
2. Gaya interior
3. 3 Rekomendasi produk terbaik
4. Skor kecocokan (1-100)
5. Alasan pemilihan
`;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: req.file.buffer.toString("base64"),
                    mimeType: req.file.mimetype
                }
            }
        ]);

        const hasil = result.response.text();

        res.render("rekomendasi", { hasil, error: null });

    } catch (err) {
        console.error("GEMINI ERROR:", err);
        res.render("rekomendasi", {
            hasil: null,
            error: err.message || "Terjadi kesalahan saat menganalisis gambar."
        });
    }
});

module.exports = router;