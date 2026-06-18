// routes/ai.js
console.log("✅ AI ROUTES LOADED");

const express = require("express");
const router = express.Router();
const multer = require("multer");
const ai = require("../services/gemini");

// ========================
// MULTER CONFIG
// ========================
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(new Error("Hanya file gambar yang diizinkan (JPG, PNG, WEBP)"), false);
        }
    }
});

// ========================
// DATA PRODUK HANNA GORDYN
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
// HALAMAN REKOMENDASI
// ========================
router.get("/", (req, res) => {
    res.render("rekomendasi", {
        hasil: null,
        error: null
    });
});

// ========================
// ANALISIS FOTO DENGAN GEMINI
// ========================
router.post("/", upload.single("foto"), async (req, res) => {
    try {
        if (!req.file) {
            return res.render("rekomendasi", {
                hasil: null,
                error: "Silakan upload foto ruangan terlebih dahulu."
            });
        }

        const prompt = `
Anda adalah konsultan interior profesional dari **Hanna Gordyn**.

Analisis foto ruangan ini dengan teliti.

Pilih **hanya** produk dari daftar berikut ini:

${produkHanna}

Berikan jawaban **persis** dalam format berikut (jangan tambahkan penjelasan di luar format):

**Warna Dominan:** 
**Gaya Interior:** 
**Rekomendasi Produk:**
1. 
2. 
3. 
**Skor Kecocokan:** (/100)
**Alasan:** 
`;

        const response = await ai.models.generateContent({
            model: "gemini-1.5-flash",   // Lebih stabil & cepat
            contents: [
                {
                    role: "user",
                    parts: [
                        {
                            inlineData: {
                                mimeType: req.file.mimetype,
                                data: req.file.buffer.toString("base64")
                            }
                        },
                        { 
                            text: prompt 
                        }
                    ]
                }
            ]
        });

        const hasil = response.text || "Maaf, tidak dapat menghasilkan rekomendasi saat ini.";

        res.render("rekomendasi", {
            hasil,
            error: null
        });

    } catch (err) {
        console.error("❌ GEMINI ERROR:", err);

        let errorMsg = "Terjadi kesalahan saat menganalisis gambar.";

        if (err.message.includes("quota") || err.message.includes("rate")) {
            errorMsg = "Kuota AI sedang penuh. Silakan coba beberapa menit lagi.";
        } else if (err.message.includes("safety") || err.message.includes("blocked")) {
            errorMsg = "Gambar tidak dapat dianalisis karena alasan keamanan.";
        } else if (err.message.includes("invalid")) {
            errorMsg = "Format gambar tidak didukung.";
        }

        res.render("rekomendasi", {
            hasil: null,
            error: errorMsg
        });
    }
});

module.exports = router;